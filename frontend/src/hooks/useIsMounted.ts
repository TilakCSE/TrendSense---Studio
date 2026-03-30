"use client";
import { useEffect, useState } from "react";

/**
 * Returns true only after the component has mounted on the client.
 * Prevents hydration mismatches by ensuring server/client HTML matches.
 *
 * @example
 * const isMounted = useIsMounted();
 * return isMounted ? <ClientOnlyContent /> : <ServerPlaceholder />;
 */
export function useIsMounted(): boolean {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted;
}
