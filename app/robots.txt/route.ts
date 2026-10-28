import {business} from '../../lib/business';
export function GET(){return new Response('User-agent: *\nAllow: /\nDisallow: /api/\n\nSitemap: '+business.site+'/sitemap.xml\n',{headers:{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=3600'}});}
