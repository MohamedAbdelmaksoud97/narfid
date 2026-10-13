"use client";
import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";

type Guard = {
  url: string;
  shouldBlock: () => boolean;
  historyState: () => unknown;
};
const Context = createContext<(guard: Guard) => () => void>(() => () => {});
const LeaveContext = createContext<() => boolean>(() => true);

// Root registration precedes Next's passive popstate listener. A guard installed
// only inside a page can be removed by Activity before the history event reaches it.
export function NavigationGuardProvider({ children }: { children: ReactNode }) {
  const guards = useRef(new Set<Guard>());
  const register = useMemo(
    () => (guard: Guard) => {
      guards.current.add(guard);
      return () => {
        guards.current.delete(guard);
      };
    },
    [],
  );
  const confirmNavigation = useMemo(
    () => () => {
      const unsaved = [...guards.current].some((guard) => guard.shouldBlock());
      return (
        !unsaved ||
        window.confirm("عندك تعديلات لم تُحفظ. هل تريد مغادرة المحرر؟")
      );
    },
    [],
  );
  useLayoutEffect(() => {
    const onHistory = (event: PopStateEvent) => {
      const destination = new URL(window.location.href);
      for (const guard of guards.current) {
        const current = new URL(guard.url);
        if (
          destination.pathname === current.pathname &&
          destination.search === current.search
        )
          continue;
        if (
          guard.shouldBlock() &&
          !window.confirm("عندك تعديلات لم تُحفظ. هل تريد مغادرة المحرر؟")
        ) {
          event.stopImmediatePropagation();
          window.history.pushState(guard.historyState(), " ", guard.url);
          return;
        }
      }
    };
    window.addEventListener("popstate", onHistory, true);
    return () => window.removeEventListener("popstate", onHistory, true);
  }, []);
  return (
    <Context.Provider value={register}>
      <LeaveContext.Provider value={confirmNavigation}>
        {children}
      </LeaveContext.Provider>
    </Context.Provider>
  );
}
export function useNavigationGuard() {
  return useContext(Context);
}
export function useConfirmNavigation() {
  return useContext(LeaveContext);
}
