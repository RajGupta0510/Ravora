import { useEffect } from 'react';

/** Public origin used for canonical and social URLs. Override with VITE_SITE_URL when the domain changes. */
export const SITE_URL = ((import.meta as any).env?.VITE_SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://ravoraa.vercel.app';
export const SITE_NAME = 'Ravora';

type PageMeta = {
  /** Full document title. Keep it under about 60 characters. */
  title: string;
  /** Meta description. Keep it under about 160 characters. */
  description: string;
  /** Path used for the canonical URL, for example "/auth/login". Defaults to the current path. */
  path?: string;
  /** Keep the page out of search results (private, transient or error pages). */
  noindex?: boolean;
};

function setMeta(attr: 'name' | 'property', key: string, value: string) {
  let el = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', value);
}

function setCanonical(href: string) {
  let el = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/** Sets the title, description, canonical URL, robots and social tags for the current page. */
export function usePageMeta({ title, description, path, noindex = false }: PageMeta) {
  useEffect(() => {
    const url = `${SITE_URL}${path ?? window.location.pathname}`;
    document.title = title;
    setMeta('name', 'description', description);
    setMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    setCanonical(url);
    setMeta('property', 'og:title', title);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:url', url);
    setMeta('name', 'twitter:title', title);
    setMeta('name', 'twitter:description', description);
  }, [title, description, path, noindex]);
}
