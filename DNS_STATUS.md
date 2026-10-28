# rcc.co.ke DNS check - 27 October 2026

## Update - 28 October 2026

The registry now publishes only `maleah.ns.cloudflare.com` and `phil.ns.cloudflare.com`. The official website at **https://rcc.co.ke** serves successfully over HTTPS. Both official hostnames are attached to the Worker; public www requests redirect to the apex. Domain activation is complete. The remainder of this document records the initial diagnosis and correction.

Cloudflare zone status at the time of checking: **Pending**.

Assigned Cloudflare nameservers:

```text
maleah.ns.cloudflare.com
phil.ns.cloudflare.com
```

A direct nonrecursive query to the `.ke` registry authority (`mzizi.kenic.or.ke`) still returned these four registrar-level delegated nameservers:

```text
dan1.host-ww.net
dan2.host-ww.net
dan3.host-ww.net
dan4.host-ww.net
```

The old HostAfrica authoritative zone returned all six nameservers. Public resolvers returned the old website address `102.218.215.41` for the apex and www. This indicates the Cloudflare names were added inside the previous DNS zone while registrar-level delegation still points to HostAfrica.

## Registrar correction completed

After the user signed in, opened **Domains > rcc.co.ke > Manage > Nameservers** in HostAfrica. The domain was still using **Default nameservers**, with the four HostAfrica entries. Switched to **Use custom nameservers**, entered only the Cloudflare pair, cleared fields 3-5, and submitted the change. Reloaded the registrar page and confirmed it still shows **Custom**, `maleah.ns.cloudflare.com`, and `phil.ns.cloudflare.com`.

After the registry reports the Cloudflare pair, allow resolver caches to expire and check Cloudflare's zone status. Both `rcc.co.ke` and `www.rcc.co.ke` are now attached to the deployed RCC Worker as Custom Domains. Do not point them to the local `127.0.0.1` address. Preserve any required email DNS records when moving the zone.

Cloudflare's imported four HostAfrica NS records and the two obsolete website A records were removed during setup; the other five imported records were preserved. Cloudflare then successfully attached both official hostnames to the RCC Worker. The registrar-level change was completed separately as described above.

Direct queries to two registry authorities immediately after the save still returned the old four nameservers. Requested **Check nameservers now** in Cloudflare. Its domain overview says verification typically takes 1-2 hours and may take up to 24 hours, depending on the registrar. The registrar settings are now confirmed saved; registry publication, DNS cache expiry, Cloudflare activation and HTTPS provisioning remain pending. Do not repeatedly edit the nameservers while awaiting this update.
