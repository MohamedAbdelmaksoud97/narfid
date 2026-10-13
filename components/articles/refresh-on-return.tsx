"use client";
import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Next's Activity cache preserves old server props when a page is revisited.
// The first mount has fresh SSR data; refresh only when that cached page returns.
export function RefreshOnReturn() {
  const router = useRouter();
  const visited = useRef(false);
  useEffect(() => {
    if (visited.current) router.refresh();
    visited.current = true;
  }, [router]);
  return null;
}
