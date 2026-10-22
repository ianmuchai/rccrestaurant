import type {MenuItem} from './order.ts';
export function groupMenu(items:MenuItem[],query:string,category:string){
 const search=query.trim().toLocaleLowerCase();const grouped=new Map<string,MenuItem[]>();
 for(const item of items){if(category&&item.category!==category)continue;if(search&&![item.name,item.category,item.description].join(' ').toLocaleLowerCase().includes(search))continue;const meals=grouped.get(item.category)||[];meals.push(item);grouped.set(item.category,meals);}
 return [...grouped].map(([category,items])=>({category,items}));
}
