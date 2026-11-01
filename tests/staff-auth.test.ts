import {test} from 'node:test';
import assert from 'node:assert/strict';
import {authenticateStaff,createStaffSession,STAFF_SESSION_COOKIE,staffAuthConfigured,verifyStaffCredentials} from '../lib/staff-auth.ts';

const config={STAFF_USERNAME:'manager',STAFF_PASSWORD:'strong-password-123',STAFF_SESSION_SECRET:'session-secret-that-is-long-enough-for-tests'};
const request=(cookie?:string)=>new Request('https://rcc.co.ke/api/staff/overview',{headers:cookie?{cookie}:{}});

test('staff login requires complete, strong runtime configuration',()=>{
 assert.equal(staffAuthConfigured(config),true);
 assert.equal(staffAuthConfigured({...config,STAFF_PASSWORD:'short'}),false);
 assert.equal(staffAuthConfigured({...config,STAFF_SESSION_SECRET:'too-short'}),false);
 assert.equal(staffAuthConfigured({}),false);
});

test('staff credentials accept only the configured username and password',async()=>{
 assert.equal(await verifyStaffCredentials('manager','strong-password-123',config),true);
 assert.equal(await verifyStaffCredentials('Manager','strong-password-123',config),false);
 assert.equal(await verifyStaffCredentials('manager','wrong-password',config),false);
 assert.equal(await verifyStaffCredentials('manager','strong-password-123',{}),false);
});

test('staff APIs accept signed staff sessions and reject forged or stale cookies',async()=>{
 const token=await createStaffSession('manager',config);
 assert.equal(await authenticateStaff(request(`${STAFF_SESSION_COOKIE}=${token}`),config),'manager');
 assert.equal(await authenticateStaff(request(),config),null);
 assert.equal(await authenticateStaff(new Request('https://rcc.co.ke/api/staff/overview',{headers:{'oai-authenticated-user-id':'manager'}}),config),null);
 assert.equal(await authenticateStaff(request(`${STAFF_SESSION_COOKIE}=not-a-token`),config),null);
 assert.equal(await authenticateStaff(request(`${STAFF_SESSION_COOKIE}=${token}`),{...config,STAFF_PASSWORD:'rotated-password-123'}),null);
});
