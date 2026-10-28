import {business} from '../../lib/business';
import {menuCategories} from '../../lib/seo';
export function GET(){const paths=['/','/menu','/moments','/visit',...menuCategories.map(c=>'/menu/'+c.slug)];return new Response('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+paths.map(path=>'<url><loc>'+business.site+path+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml; charset=utf-8','Cache-Control':'public, max-age=3600'}});}
