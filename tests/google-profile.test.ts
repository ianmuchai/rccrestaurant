import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';

test('printed Google-profile URL presents the menu, directions, and review choices',async()=>{
 const pageUrl=new URL('../app/google/page.tsx',import.meta.url);
 assert.ok(existsSync(pageUrl),'the QR destination should render a landing page');
 const page=await readFile(pageUrl,'utf8');
 assert.match(page,/robots:\s*\{\s*index:\s*false/);
 assert.match(page,/href:'\/menu'/);
 assert.equal((page.match(/href:business\.maps/g)||[]).length,2);
 assert.match(page,/Review us on Google/);
 assert.match(page,/Open our profile and choose Write a review\./);
 assert.match(page,/target:'_blank',rel:'noopener noreferrer'/);
});
