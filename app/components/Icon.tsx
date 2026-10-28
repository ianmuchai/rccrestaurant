import type { CSSProperties } from 'react';
const paths:Record<string,React.ReactNode>={
 whatsapp:<><path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.45L3 20.5l1.55-4.9A8.5 8.5 0 1 1 20.5 11.5Z"/><path d="m8 7 1.5-.5 1.1 2.5-1 1c.8 1.6 1.8 2.6 3.4 3.4l1-1 2.5 1.1L16 15c-.5 1.1-2 1.2-3.7.4C9.8 14.2 7.8 12.2 6.6 9.7 6 8.4 6.9 7.3 8 7Z"/></>,
 android:<><path d="m7 5-2-3m12 3 2-3M5 10a7 7 0 0 1 14 0H5Zm0 3v5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-5M2 12v6m20-6v6M8 19v3m8-3v3"/><circle cx="9" cy="7.5" r=".5"/><circle cx="15" cy="7.5" r=".5"/></>,
 bag:<><path d="M5 7h14l1 14H4L5 7Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></>,
 arrow:<><path d="M5 12h14M13 6l6 6-6 6"/></>,
 arrowUp:<><path d="M6 18 18 6M6 6h12v12"/></>,
 plus:<path d="M12 5v14M5 12h14"/>,minus:<path d="M5 12h14"/>,close:<path d="m6 6 12 12M6 18 18 6"/>,
 search:<><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/></>,
 pin:<><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
 target:<><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 1v4m0 14v4M1 12h4m14 0h4"/></>,
 phone:<><rect x="6" y="2" width="12" height="20" rx="3"/><path d="M10 18h4"/></>,
 download:<><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/></>,
 check:<path d="m5 12 4 4L19 6"/>,chevron:<path d="m9 5 7 7-7 7"/>,
 leaf:<><path d="M5 19C-2 8 12 3 21 3c0 10-3 20-14 15M5 21 16 9"/></>,
 bike:<><circle cx="5" cy="17" r="4"/><circle cx="19" cy="17" r="4"/><path d="m5 17 6-10 8 10M8 7h6M14 3h4"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
 menu:<path d="M4 7h16M4 12h16M4 17h16"/>,spark:<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>,
};
export default function Icon({name,size=20,style}:{name:string;size?:number;style?:CSSProperties}){return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>{paths[name]||paths.arrow}</svg>}
