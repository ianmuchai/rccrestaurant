import {readFileSync} from 'node:fs';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {runDeployment} from './cloudflare-deployment.mjs';
import './sites-env.mjs';

const args=process.argv.slice(2);
if(args.some(arg=>arg!=='--dry-run'))throw new Error('Only --dry-run is supported.');
const configPath=fileURLToPath(new URL('../dist/server/wrangler.json',import.meta.url));
const cli=fileURLToPath(new URL('../node_modules/wrangler/bin/wrangler.js',import.meta.url));
try{
 const config=JSON.parse(readFileSync(configPath,'utf8'));
 const expected=process.env.RCC_D1_DATABASE_ID?.trim();
 if(expected&&config.d1_databases?.find(item=>item.binding==='DB')?.database_id!==expected)throw new Error('Database ID changed since the build. Rebuild before deploying.');
 runDeployment(config,configPath,command=>{
  const result=spawnSync(process.execPath,['--import',new URL('./sites-env.mjs',import.meta.url).href,cli,...command],{stdio:'inherit',env:{...process.env,CI:'true'}});
  if(result.error)throw result.error;
  return result.status??1;
 },args.includes('--dry-run'));
}catch(error){console.error(error instanceof Error?error.message:String(error));process.exitCode=1;}
