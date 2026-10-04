import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

export interface VisibleArea {
  /** Height of the part of the screen not covered by the keyboard (web only). */
  height: number | null;
  /** How far the browser has scrolled the page to reveal a field (iOS Safari). */
  offsetTop: number;
  keyboardOpen: boolean;
}

// On a phone browser the on-screen keyboard doesn't shrink the page; Safari instead
// scrolls the whole page up to reveal the field, which pushes the top of the screen out
// of view. This tracks the area that is actually visible, so a screen can size itself to
// it and stay put. Native apps handle this themselves, so it only runs on the web.
export function useVisualViewport(): VisibleArea {
  const [area, setArea] = useState<VisibleArea>({ height: null, offsetTop: 0, keyboardOpen: false });

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    let tallest = Math.max(window.innerHeight, vv.height);
    const update = () => {
      tallest = Math.max(tallest, window.innerHeight, vv.height);
      const open = vv.height < tallest * 0.78;
      setArea({ height: vv.height, offsetTop: vv.offsetTop, keyboardOpen: open });
      // Undo the page scroll Safari adds when a field is focused.
      if (open && window.scrollY !== 0) window.scrollTo(0, 0);
    };
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', update);
    window.addEventListener('scroll', update);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', update);
      window.removeEventListener('scroll', update);
    };
  }, []);

  return area;
}
