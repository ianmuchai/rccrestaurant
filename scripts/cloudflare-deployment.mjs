import {fileURLToPath} from 'node:url';
import {readFileSync} from 'node:fs';

// Cloudflare IDs identify resources but are not credentials. Access still requires authorization.
const project=JSON.parse(readFileSync(new URL('../cloudflare.project.json',import.meta.url),'utf8'));

export const LOCAL_DATABASE_ID='00000000-0000-4000-8000-000000000000';
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** @param {Record<string,string|undefined>} environment */
export function databaseConfig(environment=process.env){
 const database_id=environment.RCC_D1_DATABASE_ID?.trim()||project.database_id||LOCAL_DATABASE_ID;
 if(!uuid.test(database_id))throw new Error('RCC_D1_DATABASE_ID must be the Database ID copied from Cloudflare D1.');
 const database_name=environment.RCC_D1_DATABASE_NAME?.trim()||project.database_name||'rcc-db';
 if(!/^[a-z0-9][a-z0-9_-]{0,62}$/i.test(database_name))throw new Error('RCC_D1_DATABASE_NAME contains invalid characters.');
 return {binding:'DB',database_name,database_id,migrations_dir:fileURLToPath(new URL('../drizzle',import.meta.url))};
}

/**
 * @param {{d1_databases?: Array<{binding:string,database_id:string}>}} config
 * @param {string} configPath
 * @param {(args:string[])=>number} run
 * @param {boolean} dryRun
 */
export function runDeployment(config,configPath,run,dryRun=false){
 const database=config.d1_databases?.find(item=>item.binding==='DB');
 if(!database||!uuid.test(database.database_id)||database.database_id===LOCAL_DATABASE_ID){
  throw new Error('Live database is missing. Set RCC_D1_DATABASE_ID in Cloudflare build variables, rebuild, and retry. No remote changes were made.');
 }
 if(!dryRun&&run(['d1','migrations','apply','DB','--remote','--config',configPath])!==0){
  throw new Error('Database migration failed. Publication stopped; check the database ID and D1 Edit permission on the build token.');
 }
 if(run(['deploy','--config',configPath,'--keep-vars',...(dryRun?['--dry-run']:[])])!==0)throw new Error('Worker deployment failed.');
}
