import {test} from 'node:test';
import assert from 'node:assert/strict';
import {databaseConfig,runDeployment,LOCAL_DATABASE_ID} from '../scripts/cloudflare-deployment.mjs';

const id='12345678-1234-4234-8234-123456789abc';
test('deployment database config accepts a real ID, keeps local preview available, and rejects malformed values',()=>{
 assert.equal(databaseConfig({RCC_D1_DATABASE_ID:id}).database_id,id);
 assert.equal(databaseConfig({}).binding,'DB');
 for(const value of ['not-a-uuid','123','https://example.com'])assert.throws(()=>databaseConfig({RCC_D1_DATABASE_ID:value}));
});
test('placeholder database can never be deployed or migrated',()=>{
 const commands:unknown[]=[];
 assert.throws(()=>runDeployment({d1_databases:[databaseConfig({RCC_D1_DATABASE_ID:LOCAL_DATABASE_ID})]},'config.json',args=>{commands.push(args);return 0;}),/database/i);
 assert.equal(commands.length,0);
});
test('database migrations run before publication, once per deployment command, and failures stop publication',()=>{
 const config={d1_databases:[databaseConfig({RCC_D1_DATABASE_ID:id})]};
 const commands:string[][]=[];
 runDeployment(config,'config.json',args=>{commands.push(args);return 0;});
 assert.deepEqual(commands.map(args=>args.slice(0,3)),[['d1','migrations','apply'],['deploy','--config','config.json']]);
 const failed:string[][]=[];
 assert.throws(()=>runDeployment(config,'config.json',args=>{failed.push(args);return 1;}),/migration/i);
 assert.equal(failed.length,1);
});
test('dry-run validates the bundle without modifying a remote database',()=>{
 const commands:string[][]=[];
 runDeployment({d1_databases:[databaseConfig({RCC_D1_DATABASE_ID:id})]},'config.json',args=>{commands.push(args);return 0;},true);
 assert.equal(commands.length,1);assert.ok(commands[0].includes('--dry-run'));assert.equal(commands[0][0],'deploy');
});
