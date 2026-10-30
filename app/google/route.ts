import {business} from '../../lib/business.ts';

// A permanent printed address with an editable destination and no QR service.
export function GET(){
 return new Response(null,{status:302,headers:{
  Location:business.maps,
  'Cache-Control':'no-store',
  'X-Robots-Tag':'noindex, follow',
 }});
}
export const HEAD=GET;
