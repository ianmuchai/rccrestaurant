import {business} from './business.ts';
export function seoPolicy(url:URL,method:string) {
  const privatePath=/^\/(admin|api)(\/|$)/.test(url.pathname);
  const preview=url.hostname!=='rcc.co.ke'&&url.hostname!=='www.rcc.co.ke';
  return {noindex:privatePath||preview,
    redirect:!privatePath&&url.hostname==='www.rcc.co.ke'&&['GET','HEAD'].includes(method)?business.site+url.pathname+url.search:undefined,
  };
}
