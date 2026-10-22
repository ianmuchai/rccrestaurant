import sharp from 'sharp';
import {readdir,writeFile} from 'node:fs/promises';
await sharp('artwork/mandi-poster.png').resize({width:1600,withoutEnlargement:true}).webp({quality:85}).toFile('public/assets/mandi-poster.webp');
for(const n of await readdir('public/assets'))if(n.endsWith('.png'))await sharp('public/assets/'+n).resize({width:1600,withoutEnlargement:true}).webp({quality:85}).toFile('public/assets/'+n.replace('.png','.webp'));
for(const size of [192,512])await sharp('public/brand/logo-white.png').resize(Math.round(size*.8),Math.round(size*.8),{fit:'contain',background:'#ef111d'}).extend({top:Math.round(size*.1),bottom:size-Math.round(size*.8)-Math.round(size*.1),left:Math.round(size*.1),right:size-Math.round(size*.8)-Math.round(size*.1),background:'#ef111d'}).png().toFile('public/brand/icon-'+size+'.png');
await sharp('public/brand/logo-white.png').resize(330,330,{fit:'contain',background:'#ef111d'}).extend({top:91,bottom:91,left:91,right:91,background:'#ef111d'}).png().toFile('public/brand/icon-maskable.png');
console.log('Optimized food assets and PWA icons prepared.');
