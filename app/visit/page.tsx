import Storefront from '../components/Storefront';
import StructuredData from '../components/StructuredData';
import {publicRestaurant} from '../../lib/public-restaurant';
import {pageMetadata,restaurantGraph,breadcrumbGraph} from '../../lib/seo';
export const metadata=pageMetadata('/visit');
export const dynamic='force-dynamic';
export default async function VisitPage(){const data=await publicRestaurant();return <><StructuredData data={restaurantGraph(data.config)}/><StructuredData data={breadcrumbGraph('/visit','Visit RCC')}/><Storefront view="visit" initialItems={data.items} initialConfig={data.config}/></>;}
