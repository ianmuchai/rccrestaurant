# rcc.co.ke DNS check - 27 October 2026

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

## Required registrar action

In the registrar's **Manage Nameservers** section, replace the four HostAfrica entries with only the assigned Cloudflare pair. Adding NS records in a DNS record editor is not the same operation. Save, reopen the nameserver settings, and confirm the pair remains saved. If it fails, ask the registrar to update the registry delegation.

After the registry reports the Cloudflare pair, allow resolver caches to expire and check Cloudflare's zone status. Both `rcc.co.ke` and `www.rcc.co.ke` are now attached to the deployed RCC Worker as Custom Domains. Do not point them to the local `127.0.0.1` address. Preserve any required email DNS records when moving the zone.

No registrar nameservers were changed by the deployment work. Cloudflare's imported four HostAfrica NS records and the two obsolete website A records were removed during setup; the other five imported records were preserved. Cloudflare then successfully attached both official hostnames to the RCC Worker. These Cloudflare changes do not update registry delegation.

The subsequent direct registry check still returned the old four nameservers. HostAfrica's domain-management window requires a sign-in before its registrar settings can be inspected. The nameserver replacement must be saved at the registrar before waiting for propagation will help.
