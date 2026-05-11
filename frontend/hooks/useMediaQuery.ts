'use client';

import { useEffect, useState } from 'react';

// SSR-safe media query hook. Returns false during SSR and on the first client
// render to avoid hydration mismatch, then updates on mount and on subsequent
// matchMedia changes. Caller is responsible for handling the initial-false
// state (e.g., conditionally rendering an attribute that only matters after
// hydration, as Phase 2 does with capture="environment").
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);

    const onChange = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
