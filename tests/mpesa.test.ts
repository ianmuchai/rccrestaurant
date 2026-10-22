import {test} from 'node:test';
import assert from 'node:assert/strict';
import {paymentReady,initiatePayment} from '../lib/mpesa.ts';
const configured={MPESA_CONSUMER_KEY:'key',MPESA_CONSUMER_SECRET:'secret',MPESA_SHORTCODE:'123456',MPESA_PASSKEY:'passkey',PUBLIC_SITE_URL:'https://restaurant.example',MPESA_CALLBACK_SECRET:'a'.repeat(48),MPESA_ENV:'sandbox'};
test('missing payment configuration fails closed without sending provider requests',async()=>{
 assert.equal(paymentReady({}),false);
 // initiatePayment must check config before constructing a callback URL.
 await assert.rejects(()=>initiatePayment({}, {phone:'254712345678',amount:600,reference:'RCC123'}),/not connected/);
});
test('requires a real HTTPS origin and sufficiently strong callback secret',()=>{
 assert.equal(paymentReady(configured),true);
 for(const url of ['http://restaurant.example','https://','https://user:pass@restaurant.example'])assert.equal(paymentReady({...configured,PUBLIC_SITE_URL:url}),false);
 assert.equal(paymentReady({...configured,MPESA_CALLBACK_SECRET:'short'}),false);
 assert.equal(paymentReady({...configured,MPESA_ENV:'preview'}),false);
});
