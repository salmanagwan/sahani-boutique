import { Image, Platform } from 'react-native';

export type LinkResult = { ok: true; uri: string } | { ok: false; reason: string };

const TIMEOUT_MS = 8000;

/** Loads a URL as an image. Resolves true if it is a picture the device can show. */
function loadsAsImage(uri: string): Promise<boolean> {
  return new Promise((resolve) => {
    const done = (v: boolean) => {
      clearTimeout(timer);
      resolve(v);
    };
    const timer = setTimeout(() => resolve(false), TIMEOUT_MS);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const img = new window.Image();
      img.onload = () => done(img.naturalWidth > 0);
      img.onerror = () => done(false);
      img.src = uri;
    } else {
      Image.getSize(
        uri,
        (w) => done(w > 0),
        () => done(false)
      );
    }
  });
}

/** Finds the share image a product page declares (og:image, twitter:image), or its first large image. */
function findImageInPage(html: string, pageUrl: string): string | null {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
    /<meta[^>]+name=["']twitter:image(?::src)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image(?::src)?["']/i,
    /<link[^>]+rel=["']image_src["'][^>]+href=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m?.[1]) {
      try {
        return new URL(m[1].replace(/&amp;/g, '&'), pageUrl).toString();
      } catch {
        // try the next pattern
      }
    }
  }
  return null;
}

/**
 * Turns a pasted link into a photo of the piece.
 * 1. If the link is itself an image, use it.
 * 2. Otherwise read the page and use the image it declares for sharing.
 * Many shop sites block step 2 from a browser, so the reason says what to do instead.
 */
export async function resolveImageLink(raw: string): Promise<LinkResult> {
  const url = raw.trim();
  if (!/^https?:\/\/\S+$/i.test(url)) {
    return { ok: false, reason: 'That doesn’t look like a web link. It should start with https://' };
  }

  if (await loadsAsImage(url)) return { ok: true, uri: url };

  try {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = setTimeout(() => controller?.abort(), TIMEOUT_MS);
    const res = await fetch(url, { signal: controller?.signal });
    clearTimeout(timer);
    if (res.ok) {
      const html = await res.text();
      const found = findImageInPage(html, url);
      if (found && (await loadsAsImage(found))) return { ok: true, uri: found };
    }
  } catch {
    // Blocked or offline; fall through to the guidance below.
  }

  return {
    ok: false,
    reason:
      'Couldn’t get a photo from that page. Some shop sites block this. Open the page, press and hold the photo, choose “Copy image address”, and paste that link here.',
  };
}
