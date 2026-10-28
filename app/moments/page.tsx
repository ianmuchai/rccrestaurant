import Storefront from '../components/Storefront';
import StructuredData from '../components/StructuredData';
import {publicRestaurant} from '../../lib/public-restaurant';
import {pageMetadata,breadcrumbGraph} from '../../lib/seo';
export const metadata=pageMetadata('/moments');
export const dynamic='force-dynamic';
export default async function MomentsPage(){const data=await publicRestaurant();return <><StructuredData data={breadcrumbGraph('/moments','RCC moments')}/><Storefront view="moments" initialItems={data.items} initialConfig={data.config}/></>;}
