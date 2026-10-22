type Secrets=Record<string,any>;
export function paymentReady(e:Secrets) {
 try{const url=new URL(e.PUBLIC_SITE_URL);return url.protocol==='https:'&&!!url.hostname&&!url.username&&!url.password&&['MPESA_CONSUMER_KEY','MPESA_CONSUMER_SECRET','MPESA_SHORTCODE','MPESA_PASSKEY','PUBLIC_SITE_URL','MPESA_CALLBACK_SECRET'].every(k=>typeof e[k]==='string'&&e[k].length>0)&&e.MPESA_CALLBACK_SECRET.length>=32&&['sandbox','production'].includes(e.MPESA_ENV);}catch{return false;}
}
async function provider(e:Secrets,path:string,body?:unknown) {
 if(!paymentReady(e))throw new Error('M-Pesa is not connected yet.');
 const host=e.MPESA_ENV==='production'?'https://api.safaricom.co.ke':'https://sandbox.safaricom.co.ke';
 const auth=await fetch(host+'/oauth/v1/generate?grant_type=client_credentials',{headers:{Authorization:'Basic '+btoa(e.MPESA_CONSUMER_KEY+':'+e.MPESA_CONSUMER_SECRET)},signal:AbortSignal.timeout(15000)});
 if(!auth.ok)throw new Error('M-Pesa connection could not be authenticated.');
 const token=await auth.json() as any;
 const response=await fetch(host+path,{method:'POST',headers:{Authorization:'Bearer '+token.access_token,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(20000)});
 const result=await response.json() as any;
 if(!response.ok)throw new Error('M-Pesa is temporarily unavailable.');
 return result;
}
function credentials(e:Secrets) {
 const Timestamp=new Date().toISOString().replace(/\D/g,'').slice(0,14);
 return {BusinessShortCode:e.MPESA_SHORTCODE,Password:btoa(e.MPESA_SHORTCODE+e.MPESA_PASSKEY+Timestamp),Timestamp};
}
export async function initiatePayment(e:Secrets,{phone,amount,reference}:{phone:string;amount:number;reference:string}) {
 if(!paymentReady(e))throw new Error('M-Pesa is not connected yet.');
 const callback=new URL('/api/mpesa/callback',e.PUBLIC_SITE_URL);callback.searchParams.set('key',e.MPESA_CALLBACK_SECRET);
 const result=await provider(e,'/mpesa/stkpush/v1/processrequest',{
  ...credentials(e),TransactionType:e.MPESA_TRANSACTION_TYPE==='CustomerBuyGoodsOnline'?'CustomerBuyGoodsOnline':'CustomerPayBillOnline',Amount:amount,PartyA:phone,PartyB:e.MPESA_SHORTCODE,PhoneNumber:phone,CallBackURL:callback.href,AccountReference:reference.slice(0,12),TransactionDesc:'RCC restaurant order'
 });
 if(String(result.ResponseCode)!=='0'||!result.CheckoutRequestID)throw new Error('The payment prompt could not be sent. Please retry.');
 return String(result.CheckoutRequestID);
}
export async function queryPayment(e:Secrets,checkoutId:string) {
 return provider(e,'/mpesa/stkpushquery/v1/query',{...credentials(e),CheckoutRequestID:checkoutId});
}
