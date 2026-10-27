import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {foodImage} from '../lib/media.ts';
import type {MenuItem} from '../lib/order.ts';
const menu:MenuItem[]=JSON.parse(readFileSync(new URL('../lib/catalog.json',import.meta.url),'utf8'));
const meal=(id:string)=>{const item=menu.find(i=>i.id===id);assert.ok(item);return item;};
test('unphotographed meals never inherit an unrelated category photo',()=>{
 for(const id of ['p2-oats-porridge','p5-ugali-plain','p11-water-500ml','p12-croisants-plain','p7-chicken-bbq-pizza'])assert.equal(foodImage(meal(id)),null,id);
});
test('visually matched meals use their own photos, including formerly incorrect matches',()=>{
 assert.equal(foodImage(meal('p2-shakshuka-sunrise')),'/photos/rcc-045.webp');
 assert.equal(foodImage(meal('p3-samosa-portion-3pcs-chicken-beef-fish')),'/photos/rcc-039.webp');
 assert.equal(foodImage(meal('p3-sweet-potatoes-ngwaci')),'/photos/rcc-013.webp');
 assert.equal(foodImage(meal('p3-arrow-roots-nduma')),'/photos/rcc-014.webp');
 assert.equal(foodImage(meal('p4-grilled-fish-fillet')),'/photos/rcc-025.webp');
 assert.equal(foodImage(meal('p4-grilled-chicken-breast')),'/photos/rcc-031.webp');
 assert.equal(foodImage(meal('p14-shawarma-chicken')),'/photos/rcc-024.webp');
 assert.equal(foodImage(meal('p10-blueberry-mojito')),'/photos/rcc-058.webp');
 assert.notEqual(foodImage(meal('p3-butternut-soup-vegan')),foodImage(meal('p3-cream-of-chicken-soup-non-vegan')));
 assert.equal(foodImage(meal('p3-american-fluffy-pancakes-3pcs')),null);
});
test('every assigned image exists and new unknown dishes have no photo',()=>{
 for(const item of menu){const image=foodImage(item);if(image)assert.ok(existsSync(new URL('../public'+image,import.meta.url)),item.name);}
 assert.equal(foodImage({...menu[0],id:'new-unknown-meal',name:'New special'}),null);
});
