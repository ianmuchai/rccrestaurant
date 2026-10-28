import {test} from 'node:test';
import assert from 'node:assert/strict';
import {pageMetadata,restaurantGraph,menuGraph,serializeJsonLd,menuCategories,categoryBySlug} from '../lib/seo.ts';
import {seoPolicy} from '../lib/seo-policy.ts';
import {defaultSettings,type MenuItem} from '../lib/order.ts';
const item:MenuItem={id:'coffee',name:'Coffee </script>',category:'Coffee',description:'Fresh coffee',price:200,options:[{id:'regular',label:'Regular',price:200}],page:1,available:true,needsReview:false};
test('metadata uses the official canonical and a unique title/description per public page',()=>{
 const pages=['/','/menu','/moments','/visit'].map(p=>pageMetadata(p));
 assert.equal(new Set(pages.map(p=>p.title)).size,4);assert.equal(new Set(pages.map(p=>p.description)).size,4);
 for(const [i,p] of pages.entries()){assert.equal(p.alternates?.canonical,'https://rcc.co.ke'+['/','/menu','/moments','/visit'][i]);assert.ok(p.openGraph);assert.ok(p.twitter);}
});
test('structured data includes confirmed local details without inventing reviews or coordinates',()=>{
 const graph=restaurantGraph(defaultSettings);const restaurant=graph['@graph'].find((n:any)=>n['@type']==='Restaurant') as any;
 assert.equal(restaurant.telephone,'+254722862575');assert.match(restaurant.address.streetAddress,/Equity Afya/);assert.equal(restaurant.openingHoursSpecification[0].opens,'05:00');assert.equal(restaurant.openingHoursSpecification[0].closes,'00:00');
 assert.equal(restaurant.aggregateRating,undefined);assert.equal(restaurant.geo,undefined);assert.equal(restaurant.potentialAction,undefined);
});
test('menu structured data never advertises unresolved or unavailable prices and escapes script injection',()=>{
 const graph=menuGraph([item,{...item,id:'review',needsReview:true},{...item,id:'unavailable',available:false}],'/menu');
 const entries=graph.hasMenuSection[0].hasMenuItem;
 assert.ok(entries[0].offers);assert.equal(entries[0].offers[0].price,'200.00');assert.equal(entries[0].offers[0].priceCurrency,'KES');assert.equal(entries[1].offers,undefined);assert.equal(entries[2].offers,undefined);
 const serialized=serializeJsonLd(graph);assert.ok(!serialized.includes('</script>'));assert.equal(JSON.parse(serialized).hasMenuSection[0].hasMenuItem[0].name,item.name);
});
test('category pages are unique, meaningful and resolvable without generating arbitrary routes',()=>{
 assert.equal(new Set(menuCategories.map(c=>c.slug)).size,menuCategories.length);
 for(const c of menuCategories){assert.equal(categoryBySlug(c.slug)?.category,c.category);assert.ok(c.description.length>60);assert.equal(pageMetadata('/menu/'+c.slug).alternates?.canonical,'https://rcc.co.ke/menu/'+c.slug);}
 assert.equal(categoryBySlug('nonexistent'),undefined);
});
test('host policy excludes preview/private responses and redirects only safe public www requests',()=>{
 assert.equal(seoPolicy(new URL('https://rcc-restaurant.rcc-kitengela.workers.dev/menu'),'GET').noindex,true);
 assert.equal(seoPolicy(new URL('https://rcc.co.ke/menu'),'GET').noindex,false);
 assert.equal(seoPolicy(new URL('https://rcc.co.ke/api/staff/overview'),'GET').noindex,true);
 assert.equal(seoPolicy(new URL('https://rcc.co.ke/admin'),'GET').noindex,true);
 assert.equal(seoPolicy(new URL('https://www.rcc.co.ke/menu?category=Coffee'),'GET').redirect,'https://rcc.co.ke/menu?category=Coffee');
 assert.equal(seoPolicy(new URL('https://www.rcc.co.ke/api/orders'),'POST').redirect,undefined);
 assert.equal(seoPolicy(new URL('https://attacker.example/menu'),'GET').redirect,undefined);
});
