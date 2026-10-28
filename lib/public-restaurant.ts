import {catalog,settings} from './server';
import referenceCatalog from './catalog.json';
import {defaultSettings,type MenuItem} from './order';
export async function publicRestaurant() {
  // Independent reads: fall back to the supplied reference menu if D1 is unavailable.
  const [menu,config]=await Promise.allSettled([catalog(),settings()]);
  return {items:menu.status==='fulfilled'?menu.value:referenceCatalog as MenuItem[],config:config.status==='fulfilled'?config.value:defaultSettings};
}
