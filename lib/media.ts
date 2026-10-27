import type {MenuItem} from './order';

// Curated by meal ID after visually reviewing the supplied RCC photographs.
// A missing entry means that meal was not identifiable in the supplied set.
// Never fall back to a category photo: it can depict a completely different dish.
const mealPhotos:Readonly<Record<string,number>>={
 'p2-english-breakfast':16,
 'p2-shakshuka-sunrise':45,
 'p2-somali-breakfast':48,
 'p2-esbesso':22,
 'p2-camel-suqaar':42,
 'p3-sweet-potatoes-ngwaci':13,
 'p3-samosa-portion-3pcs-chicken-beef-fish':39,
 'p3-arrow-roots-nduma':14,
 'p3-butternut-soup-vegan':46,
 'p3-cream-of-chicken-soup-non-vegan':47,
 'p3-house-cobb-salad':18,
 'p4-camel-suqaar':42,
 'p4-biryani-chicken':23,
 'p4-grilled-fish-fillet':25,
 'p4-whole-fish-wet-or-dry-fry':4,
 'p4-grilled-chicken-breast':31,
 'p5-full-platter-for-3-pax-5-pax':35,
 'p6-chicken-alfredo':32,
 'p6-grilled-bbq-burger-chicken-or-beef':50,
 'p6-fish-fingers-5pcs':33,
 'p8-capuccino-single':12,
 'p8-espresso-single':9,
 'p8-expresso-double':10,
 'p9-mango':7,
 'p9-apple-carrot':11,
 'p10-sunrise':6,
 'p10-blue-lagoon':78,
 'p10-blueberry-mojito':58,
 'p10-raspberry-mojito':73,
 'p10-virgin-mojito':44,
 'p10-vanilla-shake':1,
 'p10-strawberry-shake':80,
 'p12-chocolate-donut':71,
 'p13-white-forest-1-kg':64,
 'p13-white-forest-2-kg':66,
 'p14-crispy-chicken':37,
 'p14-kfc-chicken-3pcs':60,
 'p14-half-chicken':36,
 'p14-shawarma-chicken':24,
 'p4-grilled-camel-steak':27,
 'p4-bbq-chicken':36,
 'p14-samosa-chicken-fish':38,
};
export function foodImage(item:MenuItem):string|null{
 const number=mealPhotos[item.id];
 return number?'/photos/rcc-'+String(number).padStart(3,'0')+'.webp':null;
}
