import {notFound} from 'next/navigation';
import Storefront from '../../components/Storefront';
import StructuredData from '../../components/StructuredData';
import {publicRestaurant} from '../../../lib/public-restaurant';
import {categoryBySlug,pageMetadata,menuGraph,breadcrumbGraph} from '../../../lib/seo';
export const dynamic='force-dynamic';
type Props={params:Promise<{category:string}>};
export async function generateMetadata({params}:Props){const {category}=await params;return categoryBySlug(category)?pageMetadata('/menu/'+category):{title:'Menu category not found | RCC',robots:{index:false,follow:false}};}
export default async function CategoryPage({params}:Props){
  const {category:slug}=await params;const category=categoryBySlug(slug);if(!category)notFound();
  const data=await publicRestaurant();const path='/menu/'+slug;
  return <><StructuredData data={menuGraph(data.items.filter(i=>i.category===category.category),path)}/><StructuredData data={breadcrumbGraph(path,category.label)}/><Storefront view="menu" initialItems={data.items} initialConfig={data.config} menuCategory={category.category}/></>;
}
