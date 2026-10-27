import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createLocalJWKSet,exportJWK,generateKeyPair,SignJWT} from 'jose';
import {authenticateStaff} from '../lib/staff-auth.ts';

const issuer='https://rcc-test.cloudflareaccess.com';
const config={CF_ACCESS_TEAM_DOMAIN:issuer,CF_ACCESS_AUD:'staff-app-audience',STAFF_EMAILS:'manager@rcc.co.ke'};
const pair=await generateKeyPair('RS256');
const jwk={...await exportJWK(pair.publicKey),kid:'test-key',alg:'RS256',use:'sig'};
const keys=createLocalJWKSet({keys:[jwk]});
async function token(overrides:Record<string,unknown>={},privateKey=pair.privateKey){return new SignJWT({email:'manager@rcc.co.ke',...overrides}).setProtectedHeader({alg:'RS256',kid:'test-key'}).setIssuer(issuer).setAudience(config.CF_ACCESS_AUD).setSubject('staff-123').setIssuedAt().setExpirationTime('5m').sign(privateKey);}
const request=(value:string)=>new Request('https://rcc.co.ke/api/staff/overview',{headers:{'cf-access-jwt-assertion':value}});

test('staff authentication rejects raw identity headers and missing configuration',async()=>{
 const forged=new Request('https://rcc.co.ke/api/staff/overview',{headers:{'oai-authenticated-user-id':'manager','cf-access-authenticated-user-email':'manager@rcc.co.ke'}});
 assert.equal(await authenticateStaff(forged,config,keys),null);
 assert.equal(await authenticateStaff(request(await token()),{},keys),null);
 assert.equal(await authenticateStaff(request(await token()),{...config,STAFF_EMAILS:''},keys),null);
 assert.equal(await authenticateStaff(request(await token()),{...config,CF_ACCESS_TEAM_DOMAIN:'http://localhost'},keys),null);
});
test('only a correctly signed token with an allowed staff email is accepted',async()=>{
 assert.equal(await authenticateStaff(request(await token()),config,keys),'manager@rcc.co.ke');
 assert.equal(await authenticateStaff(request(await token({email:'visitor@example.com'})),config,keys),null);
 assert.equal(await authenticateStaff(request(await token({email:'manager@rcc.co.ke.evil.example'})),config,keys),null);
 const wrong=await generateKeyPair('RS256');
 assert.equal(await authenticateStaff(request(await token({},wrong.privateKey)),config,keys),null);
});
test('wrong audience, issuer, expired and malformed tokens are rejected',async()=>{
 const base=()=>new SignJWT({email:'manager@rcc.co.ke'}).setProtectedHeader({alg:'RS256',kid:'test-key'}).setSubject('staff-123').setIssuedAt();
 for(const jwt of [
  await base().setIssuer(issuer).setAudience('another-app').setExpirationTime('5m').sign(pair.privateKey),
  await base().setIssuer('https://other.cloudflareaccess.com').setAudience(config.CF_ACCESS_AUD).setExpirationTime('5m').sign(pair.privateKey),
  await base().setIssuer(issuer).setAudience(config.CF_ACCESS_AUD).setExpirationTime(Math.floor(Date.now()/1000)-60).sign(pair.privateKey),
  'not-a-token',
 ])assert.equal(await authenticateStaff(request(jwt),config,keys),null);
});
