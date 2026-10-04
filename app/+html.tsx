import { ScrollViewStyleReset } from 'expo-router/html';
import type { ReactNode } from 'react';
import appConfig from '../app.json';

// Web-only root HTML, rendered at build time in Node.
// It sets the page up to install on an iPhone home screen: name, icon,
// full-screen launch, and room for the notch and home bar.
const BASE: string = (appConfig.expo as { experiments?: { baseUrl?: string } }).experiments?.baseUrl ?? '';

export default function Root({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="Sahani" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#FAF8F4" />
        <link rel="apple-touch-icon" href={`${BASE}/apple-touch-icon.png`} />
        <link rel="manifest" href={`${BASE}/manifest.json`} />
        <ScrollViewStyleReset />
        <style dangerouslySetInnerHTML={{ __html: css }} />
      </head>
      <body>{children}</body>
    </html>
  );
}

const css = `
html, body, #root { min-height: 100%; }
html, body { background: #FAF8F4; overscroll-behavior: none; -webkit-tap-highlight-color: transparent; }
@media (min-width: 520px) {
  body { background: #15120E; }
}`;
