import Storefront from '../components/Storefront';
import StructuredData from '../components/StructuredData';
import {publicRestaurant} from '../../lib/public-restaurant';
import {pageMetadata,menuGraph,breadcrumbGraph} from '../../lib/seo';
export const metadata=pageMetadata('/menu');
export const dynamic='force-dynamic';
export default async function MenuPage(){const data=await publicRestaurant();return <><StructuredData data={menuGraph(data.items,'/menu')}/><StructuredData data={breadcrumbGraph('/menu','Menu & prices')}/><Storefront view="menu" initialItems={data.items} initialConfig={data.config}/></>;}
