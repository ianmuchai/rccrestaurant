import { authorizedOrder,catalog,database,hash,HttpError,json,limited,readBody,requireStaff,sameOrigin,secrets,settings } from '../../../lib/server';
import { normalizePhone,priceOrder,reconcilePayment,validPoint,validateSettings } from '../../../lib/order';
import { initiatePayment,paymentReady,queryPayment } from '../../../lib/mpesa';
export const dynamic='force-dynamic';
const now=()=>new Date().toISOString();
function text(v:unknown,max:number,required=false){if(typeof v!=='string'||v.length>max||(required&&!v.trim()))throw new HttpError(400,'Please check your contact and address details.');return v.trim();}
async function handle(request:Request) {
 const url=new URL(request.url),path=url.pathname.replace(/^\/api\//,'');const method=request.method;
 if(path==='catalog'&&method==='GET')return json({items:await catalog()});
 if(path==='config'&&method==='GET')return json({...await settings(),paymentsReady:paymentReady(secrets()),paymentMode:secrets().MPESA_ENV==='production'?'production':'sandbox'});
 if(path==='orders'&&method==='POST'){
  sameOrigin(request);await limited(request,'order',8);const b=await readBody(request);
  if(!paymentReady(secrets()))throw new HttpError(503,'Online M-Pesa payments are being connected. Please check back soon.');
  const s=await settings();const priced=priceOrder(b.lines,await catalog());
  const name=text(b.name,100,true),phone=normalizePhone(b.phone),notes=text(b.notes||'',500),address=text(b.address||'',500);
  if(!['pickup','delivery'].includes(b.fulfillment))throw new HttpError(400,'Choose delivery or pickup.');
  if(b.fulfillment==='pickup'&&!s.pickupEnabled)throw new HttpError(409,'Pickup ordering is not available yet.');
  let fee=0,zone=null;
  if(b.fulfillment==='delivery'){
   zone=s.zones.find(z=>z.id===b.zone);
   if(!s.deliveryEnabled||!zone)throw new HttpError(409,'Choose an available delivery area.');
   if(!address||!validPoint(b.point))throw new HttpError(400,'Add your delivery address and a map pin.');fee=zone.fee;
  }
  if(!Number.isSafeInteger(b.expectedTotal)||b.expectedTotal!==priced.subtotal+fee)throw new HttpError(409,'Prices or delivery fees have changed. Refresh the menu and review your total before paying.');
  const key=text(b.idempotency,80,true),token=text(b.accessToken,80,true);
  if(!/^[a-f0-9-]{60,80}$/i.test(token)||!/^[a-f0-9-]{30,80}$/i.test(key))throw new HttpError(400,'Refresh checkout and try again.');
  const tokenHash=await hash(token);const existing=await database().prepare('SELECT id,reference,token_hash FROM orders WHERE idempotency=?').bind(key).first<any>();
  if(existing){if(existing.token_hash!==tokenHash)throw new HttpError(409,'Checkout reference is already used.');return json({id:existing.id,reference:existing.reference});}
  const id=crypto.randomUUID(),reference='RCC'+id.replaceAll('-','').slice(0,9).toUpperCase();
  await database().prepare('INSERT INTO orders (id,reference,token_hash,idempotency,name,phone,fulfillment,address,point,zone,notes,lines,subtotal,fee,total,status,payment,created,updated) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(id,reference,tokenHash,key,name,phone,b.fulfillment,address,b.fulfillment==='delivery'?JSON.stringify(b.point):null,zone?.name||null,notes,JSON.stringify(priced.lines),priced.subtotal,fee,priced.subtotal+fee,'pending','unpaid',now(),now()).run();
  return json({id,reference},201);
 }
 const orderMatch=path.match(/^orders\/([a-f0-9-]+)(\/pay)?$/);
 if(orderMatch){
  const order=await authorizedOrder(request,orderMatch[1]);
  if(method==='GET'&&!orderMatch[2]){
   const attempt=await database().prepare('SELECT * FROM payments WHERE order_id=? ORDER BY created DESC LIMIT 1').bind(order.id).first<any>();
   if(attempt&&attempt.event&&attempt.state==='pending'&&Date.now()-Date.parse(attempt.updated)>15000){
    const claimed=await database().prepare('UPDATE payments SET updated=? WHERE id=? AND updated=? RETURNING id').bind(now(),attempt.id,attempt.updated).first();
    if(claimed)try{const event=JSON.parse(attempt.event);const query=await queryPayment(secrets(),attempt.checkout_id);
     if(reconcilePayment({checkoutId:attempt.checkout_id,amount:attempt.amount,phone:attempt.phone},event,query)){await database().batch([database().prepare("UPDATE payments SET state='paid',receipt=?,updated=? WHERE id=? AND state!='paid'").bind(event.receipt,now(),attempt.id),database().prepare("UPDATE orders SET payment='paid',updated=? WHERE id=? AND payment!='paid'").bind(now(),order.id)]);order.payment='paid';attempt.receipt=event.receipt;}
     else if(event.resultCode!==0&&String(query.ResponseCode)==='0'&&String(query.ResultCode)===String(event.resultCode)){await database().batch([database().prepare("UPDATE payments SET state='failed',updated=? WHERE id=?").bind(now(),attempt.id),database().prepare("UPDATE orders SET payment='failed',updated=? WHERE id=? AND active_payment_id=? AND payment!='paid'").bind(now(),order.id,attempt.id)]);if(order.active_payment_id===attempt.id&&order.payment!=='paid')order.payment='failed';}
    }catch{}
   }
   return json({id:order.id,reference:order.reference,payment:order.payment,status:order.status,total:order.total,fulfillment:order.fulfillment,receipt:attempt?.receipt||null,attemptState:attempt?.state||null});
  }
  if(method==='POST'&&orderMatch[2]){
   sameOrigin(request);await limited(request,'payment',5);
   if(!paymentReady(secrets()))throw new HttpError(503,'M-Pesa is unavailable.');
   if(order.status!=='pending')throw new HttpError(409,'This order can no longer start a payment.');
   if(order.payment==='paid')return json({paid:true});
   // Atomic lock prevents concurrent requests from sending duplicate STK prompts.
   const attemptId=crypto.randomUUID();
   const locked=await database().prepare("UPDATE orders SET payment='initiating',active_payment_id=?,updated=? WHERE id=? AND status='pending' AND payment IN ('unpaid','failed') RETURNING id").bind(attemptId,now(),order.id).first();
   if(!locked)throw new HttpError(409,'A payment is already in progress. Wait for its result before retrying.');
   await database().prepare('INSERT INTO payments (id,order_id,phone,amount,state,created,updated) VALUES (?,?,?,?,?,?,?)').bind(attemptId,order.id,order.phone,order.total,'initiating',now(),now()).run();
   try{
    const checkout=await initiatePayment(secrets(),{phone:order.phone,amount:order.total,reference:order.reference});
    await database().batch([database().prepare("UPDATE payments SET checkout_id=?,state='pending',updated=? WHERE id=?").bind(checkout,now(),attemptId),database().prepare("UPDATE orders SET payment='pending',updated=? WHERE id=? AND payment='initiating'").bind(now(),order.id)]);
    return json({message:'Check your phone for the M-Pesa prompt.',mode:secrets().MPESA_ENV});
   }catch(error){
    // A timeout may mean the provider accepted the request: keep it uncertain, do not trigger another charge.
    await database().batch([database().prepare("UPDATE payments SET state='uncertain',updated=? WHERE id=?").bind(now(),attemptId),database().prepare("UPDATE orders SET payment='uncertain',updated=? WHERE id=? AND payment='initiating'").bind(now(),order.id)]);
    throw new HttpError(502,'The payment request could not be confirmed. Please contact RCC before retrying to avoid a duplicate payment.');
   }
  }
 }
 if(path==='mpesa/callback'&&method==='POST'){
  const e=secrets();if(!paymentReady(e)||url.searchParams.get('key')!==e.MPESA_CALLBACK_SECRET)throw new HttpError(403,'Invalid callback.');
  await limited(request,'callback',120);const b=await readBody(request);const cb=b?.Body?.stkCallback;
  if(!cb||typeof cb.CheckoutRequestID!=='string')throw new HttpError(400,'Invalid payment event.');
  const attempt=await database().prepare('SELECT * FROM payments WHERE checkout_id=?').bind(cb.CheckoutRequestID).first<any>();
  if(!attempt)throw new HttpError(409,'Payment reference not ready.');
  if(attempt.state==='paid')return json({ResultCode:0,ResultDesc:'Already processed'});
  const metadata=Object.fromEntries((cb.CallbackMetadata?.Item||[]).map((i:any)=>[i.Name,i.Value]));
  const storedEvent={checkoutId:cb.CheckoutRequestID,resultCode:Number(cb.ResultCode),amount:Number(metadata.Amount)||0,phone:String(metadata.PhoneNumber||''),receipt:String(metadata.MpesaReceiptNumber||'')};
  await database().prepare('UPDATE payments SET event=?,updated=? WHERE id=? AND state!=?').bind(JSON.stringify(storedEvent),now(),attempt.id,'paid').run();
  const query=await queryPayment(e,attempt.checkout_id);
  if(Number(cb.ResultCode)!==0){
   if(String(query.ResponseCode)==='0'&&String(query.ResultCode)===String(cb.ResultCode))await database().batch([
    database().prepare("UPDATE payments SET state='failed',updated=? WHERE id=? AND state!='paid'").bind(now(),attempt.id),
    database().prepare("UPDATE orders SET payment='failed',updated=? WHERE id=? AND active_payment_id=? AND payment!='paid'").bind(now(),attempt.order_id,attempt.id)
   ]);
   return json({ResultCode:0,ResultDesc:'Received'});
  }
  const data=Object.fromEntries((cb.CallbackMetadata?.Item||[]).map((i:any)=>[i.Name,i.Value]));
  const receipt=String(data.MpesaReceiptNumber||'');
  if(!reconcilePayment({checkoutId:attempt.checkout_id,amount:attempt.amount,phone:attempt.phone},{checkoutId:cb.CheckoutRequestID,amount:Number(data.Amount),phone:String(data.PhoneNumber),receipt,resultCode:Number(cb.ResultCode)},query))throw new HttpError(409,'Payment needs reconciliation.');
  await database().batch([
   database().prepare("UPDATE payments SET state='paid',receipt=?,event=?,updated=? WHERE id=? AND state!='paid'").bind(receipt,JSON.stringify(storedEvent),now(),attempt.id),
   database().prepare("UPDATE orders SET payment='paid',updated=? WHERE id=? AND payment!='paid'").bind(now(),attempt.order_id)
  ]);
  return json({ResultCode:0,ResultDesc:'Accepted'});
 }
 if(path.startsWith('staff/')){
  const actor=await requireStaff(request);if(method!=='GET')sameOrigin(request);
  if(path==='staff/overview'&&method==='GET'){
   const orders=await database().prepare('SELECT * FROM orders ORDER BY created DESC LIMIT 100').all();
   return json({orders:orders.results,items:await catalog(),settings:await settings(),paymentReady:paymentReady(secrets())});
  }
  if(path==='staff/settings'&&method==='PUT'){
   const s=validateSettings(await readBody(request));await database().prepare("INSERT INTO settings (key,value) VALUES ('restaurant',?) ON CONFLICT(key) DO UPDATE SET value=excluded.value").bind(JSON.stringify(s)).run();return json({ok:true});
  }
  if(path==='staff/menu'&&method==='PUT'){
   const b=await readBody(request);const current=(await catalog()).find(i=>i.id===b.id);if(!current)throw new HttpError(404,'Item not found.');
   if(typeof b.available!=='boolean'||typeof b.needsReview!=='boolean'||!Array.isArray(b.options)||b.options.length!==current.options.length)throw new HttpError(400,'Invalid menu update.');
   const options=current.options.map(o=>{const update=b.options.find((p:any)=>p.id===o.id);if(!update||!Number.isSafeInteger(update.price)||update.price<1||update.price>100000)throw new HttpError(400,'Enter valid whole-shilling prices.');return {...o,price:update.price};});
   const value={available:b.available,needsReview:b.needsReview,price:options[0].price,options};
   await database().prepare('INSERT INTO menu_overrides (id,value) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET value=excluded.value').bind(current.id,JSON.stringify(value)).run();return json({ok:true});
  }
  if(path==='staff/order'&&method==='PUT'){
   const b=await readBody(request);const order=await database().prepare('SELECT * FROM orders WHERE id=?').bind(b.id).first<any>();if(!order)throw new HttpError(404,'Order not found.');
   const next:Record<string,string[]>={pending:['accepted','cancelled'],accepted:['preparing','cancelled'],preparing:[order.fulfillment==='pickup'?'ready':'out-for-delivery','cancelled'],ready:['completed'],'out-for-delivery':['completed']};
   if(!next[order.status]?.includes(b.status)||(b.status!=='cancelled'&&order.payment!=='paid'))throw new HttpError(409,'This status change is not allowed.');
   const changed=await database().prepare('UPDATE orders SET status=?,updated=? WHERE id=? AND status=? RETURNING id').bind(b.status,now(),order.id,order.status).first();
   if(!changed)throw new HttpError(409,'Order changed. Refresh and try again.');
   await database().prepare('INSERT INTO order_history (id,order_id,status,actor,created) VALUES (?,?,?,?,?)').bind(crypto.randomUUID(),order.id,b.status,actor,now()).run();return json({ok:true});
  }
 }
 throw new HttpError(404,'Not found.');
}
async function route(request:Request){try{return await handle(request);}catch(e){return json({error:e instanceof HttpError?e.message:e instanceof Error&& !/SQL|D1|database|table/i.test(e.message)?e.message:'The service is being prepared. Please try again shortly.'},e instanceof HttpError?e.status:400);}}
export const GET=route;export const POST=route;export const PUT=route;
