"use client";
import Script from "next/script";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/* Pixels publicitaires : Meta (Facebook / Instagram), TikTok, Google (GA4 + Google Ads).
   - Les identifiants viennent des variables d'environnement NEXT_PUBLIC_*. Sans identifiant : rien n'est chargé, aucune bannière.
   - Aucun script publicitaire n'est chargé avant le consentement du visiteur. */

const clean = (v?: string) => (v && /^[A-Za-z0-9_-]{5,40}$/.test(v.trim()) ? v.trim() : "");
const META = clean(process.env.NEXT_PUBLIC_META_PIXEL_ID);
const TIKTOK = clean(process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID);
const GA = clean(process.env.NEXT_PUBLIC_GA_ID);
const GADS = clean(process.env.NEXT_PUBLIC_GADS_ID);
export const HAS_TRACKING = Boolean(META || TIKTOK || GA || GADS);

const KEY = "bg_cookie_consent";
export const OPEN_EVENT = "bg-consent-open";
type Consent = "granted" | "denied" | null;

function readConsent(): Consent {
  try {
    const v = localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : null;
  } catch {
    return null;
  }
}

export function Tracking() {
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState<Consent>(null);
  const [showBanner, setShowBanner] = useState(false);
  const path = usePathname();

  useEffect(() => {
    const c = readConsent();
    setConsent(c);
    setShowBanner(c === null);
    setMounted(true);
    const reopen = () => setShowBanner(true);
    window.addEventListener(OPEN_EVENT, reopen);
    return () => window.removeEventListener(OPEN_EVENT, reopen);
  }, []);

  // TikTok ne détecte pas les changements de page internes : on les signale à la main.
  useEffect(() => {
    const w = window as unknown as { ttq?: { page?: () => void } };
    if (consent === "granted" && TIKTOK && w.ttq?.page) w.ttq.page();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  if (!HAS_TRACKING || !mounted) return null;

  const choose = (c: "granted" | "denied") => {
    const wasGranted = consent === "granted";
    try {
      localStorage.setItem(KEY, c);
    } catch {}
    setConsent(c);
    setShowBanner(false);
    // Un refus après acceptation : on recharge pour que les scripts déjà chargés disparaissent.
    if (c === "denied" && wasGranted) window.location.reload();
  };

  return (
    <>
      {consent === "granted" && (
        <>
          {META && (
            <Script id="meta-pixel" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${META}');fbq('track','PageView');`}</Script>
          )}
          {TIKTOK && (
            <Script id="tiktok-pixel" strategy="afterInteractive">{`!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var r="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=r+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};ttq.load('${TIKTOK}');ttq.page();}(window,document,'ttq');`}</Script>
          )}
          {(GA || GADS) && (
            <>
              <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA || GADS}`} strategy="afterInteractive" />
              <Script id="google-tag" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}window.gtag=gtag;gtag('js',new Date());${GA ? `gtag('config','${GA}');` : ""}${GADS ? `gtag('config','${GADS}');` : ""}`}</Script>
            </>
          )}
        </>
      )}

      {showBanner && (
        <div role="dialog" aria-label="Choix concernant les cookies" className="fixed inset-x-3 bottom-3 z-40 mx-auto max-w-2xl rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-navy/15 sm:bottom-5 sm:p-5">
          <p className="text-sm leading-relaxed text-navy/85">
            Nous utilisons des cookies de mesure d&apos;audience et de publicité (Meta, TikTok, Google) pour améliorer le site et diffuser nos annonces. Vous pouvez accepter ou refuser, et changer d&apos;avis à tout moment.{" "}
            <a href="/confidentialite" className="font-semibold text-orange-700 underline">En savoir plus</a>
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button type="button" onClick={() => choose("denied")} className="btn-ghost btn-sm">Refuser</button>
            <button type="button" onClick={() => choose("granted")} className="btn-primary btn-sm">Accepter</button>
          </div>
        </div>
      )}
    </>
  );
}
