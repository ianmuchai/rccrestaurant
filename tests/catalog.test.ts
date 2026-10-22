import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const menu=JSON.parse(readFileSync(new URL('../lib/catalog.json',import.meta.url),'utf8'));
test('single-line PDF descriptions do not swallow following dishes',()=>{
 for(const [name,price] of [['English Breakfast',600],['Strawberry Smoothie',400],['Blueberry Smoothie',450],['Strawberry Lemonade',399],['Pinacolada',350],['Biryani Chicken',900]])assert.ok(menu.some((i:any)=>i.name===name&&i.price===price),String(name)+' must retain its source price');
 for(const item of menu)assert.ok(!/\d+\/-/.test(item.description),'Description swallowed a price for '+item.name);
});
test('full goat takeaway preserves product identity and dine-in price cannot be ordered online',()=>{
 assert.ok(menu.some((i:any)=>i.name==='Full Goat Mandi Platter · Takeaway'&&i.price===18000));
 assert.ok(menu.some((i:any)=>i.name==='Full Goat Mandi Platter · Dine-in'&&i.price===15000&&!i.available));
});
