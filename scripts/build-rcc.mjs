import {spawnSync} from 'node:child_process';
import {readdir,writeFile} from 'node:fs/promises';
import path from 'node:path';
const build=spawnSync(process.execPath,['scripts/run-framework.mjs','build'],{stdio:'inherit'});
if(build.status!==0)process.exit(build.status||1);
async function collect(folder){const result=[];for(const entry of await readdir(folder,{withFileTypes:true})){const full=path.join(folder,entry.name);if(entry.isDirectory())result.push(...await collect(full));else if(/\.(js|css|ttf|woff2)$/.test(entry.name))result.push('/'+path.relative('dist/client',full).split(path.sep).join('/'));}return result;}
const assets=[...await collect('dist/client/_next/static'),...await collect('dist/client/fonts')];
await writeFile('dist/client/precache.json',JSON.stringify({assets}));console.log('Offline first-visit precache:',assets.length,'public build/font assets.');
