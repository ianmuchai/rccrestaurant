import Storefront from './components/Storefront';
import StructuredData from './components/StructuredData';
import {publicRestaurant} from '../lib/public-restaurant';
import {pageMetadata,restaurantGraph} from '../lib/seo';
export const metadata=pageMetadata('/');
export const dynamic='force-dynamic';
export default async function Home(){const data=await publicRestaurant();return <><StructuredData data={restaurantGraph(data.config)}/><Storefront initialItems={data.items} initialConfig={data.config}/></>;}
