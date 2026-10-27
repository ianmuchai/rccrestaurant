import {createRemoteJWKSet,jwtVerify,type JWTVerifyGetKey} from 'jose';

type StaffConfiguration={CF_ACCESS_TEAM_DOMAIN?:string;CF_ACCESS_AUD?:string;STAFF_EMAILS?:string};
const keySets=new Map<string,ReturnType<typeof createRemoteJWKSet>>();
function remoteKeys(issuer:string){
 let keys=keySets.get(issuer);
 if(!keys){
  if(keySets.size>=8)keySets.clear();
  keys=createRemoteJWKSet(new URL('/cdn-cgi/access/certs',issuer),{timeoutDuration:5000,cooldownDuration:30000,cacheMaxAge:600000});
  keySets.set(issuer,keys);
 }
 return keys;
}

export async function authenticateStaff(request:Request,configuration:StaffConfiguration,resolveKey?:JWTVerifyGetKey):Promise<string|null>{
 const issuer=configuration.CF_ACCESS_TEAM_DOMAIN?.trim().replace(/\/$/,'');
 const audience=configuration.CF_ACCESS_AUD?.trim();
 const emails=(configuration.STAFF_EMAILS||'').split(/[,\n]/).map(email=>email.trim().toLowerCase()).filter(Boolean);
 const token=request.headers.get('cf-access-jwt-assertion');
 if(!issuer||!/^https:\/\/[a-z0-9][a-z0-9-]*\.cloudflareaccess\.com$/i.test(issuer)||!audience||!emails.length||!token||token.length>16384)return null;
 try{
  const {payload}=await jwtVerify(token,resolveKey||remoteKeys(issuer),{issuer,audience,algorithms:['RS256'],requiredClaims:['exp','iat','sub','email'],clockTolerance:5});
  const email=typeof payload.email==='string'?payload.email.trim().toLowerCase():'';
  return emails.includes(email)?email:null;
 }catch{return null;}
}
