import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {groupMenu} from '../lib/menu-presentation.ts';
const menu=JSON.parse(readFileSync(new URL('../lib/catalog.json',import.meta.url),'utf8'));
test('standalone menu groups every meal once under its original category',()=>{
 const sections=groupMenu(menu,'','');
 assert.equal(sections.length,37);
 assert.equal(sections.flatMap(s=>s.items).length,300);
 for(const section of sections)assert.ok(section.items.every(i=>i.category===section.category));
 assert.equal(new Set(sections.flatMap(s=>s.items.map(i=>i.id))).size,300);
});
test('category and search preserve meal grouping without including unrelated dishes',()=>{
 const sections=groupMenu(menu,'','Pizzas');assert.equal(sections.length,1);assert.equal(sections[0].items.length,6);
 const pizza=groupMenu(menu,'signature pizza','');assert.equal(pizza.length,1);assert.equal(pizza[0].items[0].name,'RCC Signature Pizza');
 assert.equal(groupMenu(menu,'no-such-dish','').length,0);
});
