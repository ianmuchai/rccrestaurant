import { test } from 'node:test';
import assert from 'node:assert/strict';
import { priceOrder, normalizePhone, validPoint, mapsLink, reconcilePayment, canStaff, validateSettings } from '../lib/order.ts';
const menu:any[]=[{id:'rice',name:'Rice',available:true,needsReview:false,options:[{id:'regular',label:'Regular',price:300}]}];
test('totals use server prices even when client supplies a price',()=>{
 assert.equal(priceOrder([{itemId:'rice',optionId:'regular',quantity:2,price:1} as any],menu).subtotal,600);
});
test('rejects invalid, fractional, excessive and negative quantities',()=>{
 for(const quantity of [-1,0,1.5,51,NaN])assert.throws(()=>priceOrder([{itemId:'rice',optionId:'regular',quantity}],menu));
});
test('rejects unavailable, unknown, unresolved-price and unknown option items',()=>{
 assert.throws(()=>priceOrder([{itemId:'bad',optionId:'regular',quantity:1}],menu));
 assert.throws(()=>priceOrder([{itemId:'rice',optionId:'bad',quantity:1}],menu));
 for(const flags of [{available:false},{needsReview:true}])assert.throws(()=>priceOrder([{itemId:'rice',optionId:'regular',quantity:1}],[{...menu[0],...flags}]));
 assert.throws(()=>priceOrder([],menu));
});
test('normalizes Kenyan M-Pesa phones and rejects other inputs',()=>{
 assert.equal(normalizePhone('0712 345 678'),'254712345678');
 assert.equal(normalizePhone('+254112345678'),'254112345678');
 for(const p of ['123','+15551234567','07123456789'])assert.throws(()=>normalizePhone(p));
});
test('map coordinates reject empty, nonfinite and out-of-range values',()=>{
 assert.equal(validPoint({lat:-1.45,lng:36.96}),true);
 for(const p of [null,{lat:91,lng:0},{lat:0,lng:181},{lat:NaN,lng:0},{lat:'',lng:''}])assert.equal(validPoint(p),false);
 assert.match(mapsLink({lat:-1.45,lng:36.96}),/api=1/);
 assert.match(mapsLink({lat:-1.45,lng:36.96}),/destination=-1.45%2C36.96/);
});
test('provider verification alone cannot substitute for amount and receipt reconciliation',()=>{
 const expected={checkoutId:'checkout',amount:600,phone:'254712345678'};
 const event={checkoutId:'checkout',amount:600,phone:'254712345678',receipt:'ABC123',resultCode:0};
 assert.equal(reconcilePayment(expected,event,{ResultCode:'0',ResponseCode:'0'}),true);
 for(const override of [{amount:1},{phone:'254700000000'},{receipt:''},{checkoutId:'other'},{resultCode:1032}])assert.equal(reconcilePayment(expected,{...event,...override},{ResultCode:'0',ResponseCode:'0'}),false);
 assert.equal(reconcilePayment(expected,event,{ResultCode:'0',ResponseCode:'1'}),false);
 assert.equal(reconcilePayment(expected,event,{ResultCode:'1032',ResponseCode:'0'}),false);
});
test('staff allowlist defaults to deny and uses exact user IDs',()=>{
 assert.equal(canStaff(null,'owner'),false);assert.equal(canStaff('owner',''),false);
 assert.equal(canStaff('owner','owner,second'),true);assert.equal(canStaff('own','owner'),false);
});
test('settings reject invented or malformed monetary and location values',()=>{
 assert.throws(()=>validateSettings({zones:[{id:'x',name:'x',fee:-10}]}));
 assert.throws(()=>validateSettings({zones:[{id:'x',name:'x',fee:1.5}]}));
 const s=validateSettings({pickupEnabled:true,zones:[{id:'x',name:'Central',fee:100}],restaurantPoint:{lat:-1.4,lng:36.9}});
 assert.equal(s.zones[0].fee,100);
});
