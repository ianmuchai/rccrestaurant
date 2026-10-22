import sharp from 'sharp';import {readFile,mkdir,writeFile} from 'node:fs/promises';
const manifest=JSON.parse(await readFile('work/drive/manifest.json','utf8'));
await mkdir('public/photos',{recursive:true});
for(const file of manifest){if(file.error)continue;await sharp(file.local).rotate().resize({width:1400,height:1400,fit:'inside',withoutEnlargement:true}).webp({quality:84}).toFile('public/photos/'+file.key+'.webp');}
await writeFile('lib/photo-provenance.json',JSON.stringify(manifest.filter(f=>!f.error).map(({key,id,name,folder})=>({key,id,name,folder,publicPath:'/photos/'+key+'.webp'})),null,2));
console.log('85 supplied RCC photos optimized and provenance retained.');
