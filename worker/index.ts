import handler from "vinext/server/fetch-handler";
import { runWithConnectorBinding } from "../lib/connector-context";
import type { ConnectorBinding } from "../lib/connector-contract.mjs";
import {seoPolicy} from '../lib/seo-policy';

const worker = {
  async fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext<{ CONNECTORS?: ConnectorBinding }>) {
    const url=new URL(request.url);
    const policy=seoPolicy(url,request.method);
    let binding = ctx.props?.CONNECTORS;
    // Local preview emulates the same request-scoped capability. This branch and
    // the auxiliary service binding are absent from production builds.
    if (import.meta.env.DEV && !binding && env.CONNECTORS) {
      const preview = env.CONNECTORS;
      const expiresAt = Date.now() + 60_000;
      binding = {
        async getContext() {
          if (Date.now() >= expiresAt) return { status: "request_context_expired" };
          return preview.getContext?.() ?? { status: "binding_unavailable" };
        },
        async invoke(connectorId, actionName, args) {
          if (Date.now() >= expiresAt) {
            return { status: "request_context_expired", message: "This request has expired. Please try again." };
          }
          return preview.invoke(connectorId, actionName, args);
        },
      };
    }
    // Keep the Cloudflare-generated alternate hostname from bypassing the
    // intended rcc.co.ke entry point. Local development hosts remain usable.
    const response=policy.redirect
      ?Response.redirect(policy.redirect,308)
      :url.hostname.endsWith('.workers.dev')
        ?new Response('Not found.',{status:404})
        :await runWithConnectorBinding(binding, () => handler.fetch(request, env, ctx));
    const headers=new Headers(response.headers);
    // Apply browser-facing protections at the outermost layer so they cover
    // framework pages, API responses, and static assets alike.
    if(url.protocol==='https:')headers.set('Strict-Transport-Security','max-age=31536000');
    headers.set('X-Content-Type-Options','nosniff');
    headers.set('X-Frame-Options','DENY');
    headers.set('Referrer-Policy','strict-origin-when-cross-origin');
    headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=(self)');
    headers.set('Content-Security-Policy',"frame-ancestors 'none'; object-src 'none'; base-uri 'self'");
    const pathname=url.pathname;
    if(pathname==='/admin'||pathname.startsWith('/admin/')||pathname.startsWith('/api/'))headers.set('Cache-Control','no-store');
    if(policy.noindex||response.status>=400)headers.set('X-Robots-Tag','noindex, nofollow');
    return new Response(response.body,{status:response.status,statusText:response.statusText,headers});
  },
};

export default worker;
