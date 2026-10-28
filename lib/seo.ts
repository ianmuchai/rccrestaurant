import type {Metadata} from 'next';
import {business} from './business.ts';
import {foodImage} from './media.ts';
import type {MenuItem,Settings} from './order.ts';

export const menuCategories = [
  {slug:'breakfast',category:'Breakfast',label:'Breakfast',description:'Explore RCC breakfast in Kitengela, from the RCC Combo and English breakfast to Somali breakfast. Browse dishes and prices before your visit.'},
  {slug:'coffee',category:'Coffee',label:'Coffee',description:'Browse the RCC coffee menu in Kitengela. Explore espresso, cappuccino and other coffee favourites, with sizes and prices from the restaurant menu.'},
  {slug:'grills',category:'RCC Grills',label:'Grills',description:'Explore the RCC grills menu in Kitengela, including chicken, fish and steak dishes. See the available choices and restaurant prices in one place.'},
  {slug:'pizza',category:'Pizzas',label:'Pizza',description:'Discover the RCC pizza menu in Kitengela. Compare pizza choices, sizes and prices, and add your favourites to your RCC cart.'},
  {slug:'burgers',category:'Gourmet Burgers',label:'Burgers',description:'Browse gourmet burgers at RCC Restaurant in Kitengela. Explore the burger selection, meal details and prices from the RCC menu.'},
  {slug:'platters',category:'Platters',label:'Platters',description:'Explore RCC sharing platters in Kitengela. Browse platter choices and prices for your next meal together at RCC Restaurant.'},
  {slug:'somali-arab',category:'Somali And Arab Cuisine',label:'Somali & Arab cuisine',description:'Explore Somali and Arab cuisine at RCC Restaurant in Kitengela. Browse the menu, read dish details and see prices before choosing your meal.'},
  {slug:'pasta',category:'Pasta Corner',label:'Pasta',description:'Browse the Pasta Corner at RCC Restaurant in Kitengela. Discover pasta dishes, read the menu details and compare prices.'},
  {slug:'desserts',category:'Desserts',label:'Desserts',description:'Find a sweet finish at RCC Restaurant in Kitengela. Browse the dessert menu, explore your choices and see restaurant prices.'},
] as const;
export const categoryBySlug=(slug:string)=>menuCategories.find(c=>c.slug===slug);
export const categoryHref=(category:string)=>{
  const match=menuCategories.find(c=>c.category===category);
  return !category?'/menu':match?'/menu/'+match.slug:'/menu?category='+encodeURIComponent(category);
};
const pages:Record<string,{title:string;description:string}>={
  '/':{title:'RCC Restaurant Kitengela | Breakfast, Coffee & Dining',description:'Discover RCC Restaurant on Namanga Road, next to Equity Afya in Kitengela. Explore breakfast, coffee, grills, pizza and more. Open daily, 5 a.m. to midnight.'},
  '/menu':{title:'RCC Menu & Prices | Restaurant in Kitengela',description:'Browse the RCC Restaurant menu and prices in Kenyan shillings. Explore breakfast, Somali and Arab cuisine, grills, pizza, coffee and desserts in Kitengela.'},
  '/moments':{title:'Food, Coffee & Sharing Platters | RCC Kitengela',description:'Explore RCC moments: sharing platters, coffee and sweet treats from RCC Restaurant in Kitengela. Discover the menu and plan your next visit.'},
  '/visit':{title:'Find RCC Restaurant | Namanga Road, Kitengela',description:'Visit RCC Restaurant on Namanga Road next to Equity Afya, Kitengela. Open daily from 5 a.m. to midnight. Call +254 722 862575 or get Google Maps directions.'},
};
export function pageMetadata(path:string):Metadata {
  const category=categoryBySlug(path.replace('/menu/',''));
  const page=pages[path]||(category?{title:category.label+' Menu & Prices | RCC Kitengela',description:category.description}:pages['/']);
  const url=business.site+path;
  return {
    title:page.title,description:page.description,
    alternates:{canonical:url},
    openGraph:{type:'website',locale:'en_KE',siteName:business.name,url,title:page.title,description:page.description,images:[{url:business.site+'/brand/rcc-share.jpg',width:1200,height:630,alt:'RCC Restaurant in Kitengela — food, coffee and good company'}]},
    twitter:{card:'summary_large_image',title:page.title,description:page.description,images:[business.site+'/brand/rcc-share.jpg']},
    robots:{index:true,follow:true,googleBot:{index:true,follow:true,'max-image-preview':'large','max-snippet':-1,'max-video-preview':-1}},
  };
}
export function restaurantGraph(config:Settings) {
  const restaurant:Record<string,unknown>={
    '@type':'Restaurant','@id':business.site+'/#restaurant',name:business.name,url:business.site+'/',
    logo:business.site+'/brand/icon-512.png',image:[business.site+'/photos/rcc-035.webp',business.site+'/photos/rcc-025.webp',business.site+'/photos/rcc-012.webp'],
    telephone:config.phone||business.phone,
    address:{'@type':'PostalAddress',streetAddress:config.address&&config.address!=='Kitengela, Kenya'&&config.address!==business.address?config.address:business.street,addressLocality:business.locality,addressRegion:business.region,addressCountry:business.country},
    hasMenu:business.site+'/menu',hasMap:business.maps,sameAs:[business.maps],
    // Omit structured hours if staff has replaced the confirmed schedule with free text.
    ...(!config.hours||config.hours===business.hours?{openingHoursSpecification:[{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],opens:'05:00',closes:'00:00'}]}:{}),
  };
  if(config.restaurantPoint)restaurant.geo={'@type':'GeoCoordinates',latitude:config.restaurantPoint.lat,longitude:config.restaurantPoint.lng};
  return {'@context':'https://schema.org','@graph':[
    restaurant,
    {'@type':'WebSite','@id':business.site+'/#website',url:business.site+'/',name:business.name,inLanguage:'en-KE',publisher:{'@id':business.site+'/#restaurant'}},
  ]};
}
export function menuGraph(items:MenuItem[],path:string) {
  const categories=[...new Set(items.map(item=>item.category))];
  return {'@context':'https://schema.org','@type':'Menu','@id':business.site+path+'#menu',name:'RCC Restaurant menu',url:business.site+path,inLanguage:'en-KE',
    hasMenuSection:categories.map(category=>({'@type':'MenuSection',name:category,hasMenuItem:items.filter(i=>i.category===category).map(item=>({
      '@type':'MenuItem','@id':business.site+'/menu#dish-'+item.id,name:item.name,...(item.description?{description:item.description}:{}),
      ...(foodImage(item)?{image:business.site+foodImage(item)}:{}),
      ...(item.available&&!item.needsReview?{offers:item.options.filter(o=>Number.isSafeInteger(o.price)&&o.price>=0).map(option=>({'@type':'Offer',name:option.label,price:option.price.toFixed(2),priceCurrency:'KES'}))}:{}),
    }))})),
  };
}
export function breadcrumbGraph(path:string,label:string) {
  const crumbs=[{name:'RCC Restaurant',path:'/'}];
  if(path.startsWith('/menu/'))crumbs.push({name:'Menu',path:'/menu'});
  crumbs.push({name:label,path});
  return {'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:crumbs.map((crumb,index)=>({'@type':'ListItem',position:index+1,name:crumb.name,item:business.site+crumb.path}))};
}
export const serializeJsonLd=(value:unknown)=>JSON.stringify(value).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
