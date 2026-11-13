"use client";

import { DirectionProvider } from "@base-ui/react/direction-provider";
import {
  createContext,
  lazy,
  Suspense,
  useContext,
  useState,
  type ComponentProps,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/button";

const DemoDialog = lazy(() => import("./landing-demo-dialog"));
const DemoContext = createContext<(plan?: string) => void>(() => {
  throw new Error("Demo controls must be inside LandingDemo.");
});

export function useOpenDemo() {
  return useContext(DemoContext);
}

export function LandingDemo({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<string>();

  function openDemo(nextPlan = "أحتاج مساعدة في الاختيار") {
    setPlan(nextPlan);
    setOpen(true);
  }

  return (
    <DirectionProvider direction="rtl">
      <DemoContext.Provider value={openDemo}>
        {children}
        {plan !== undefined && (
          <Suspense fallback={null}>
            <DemoDialog open={open} onOpenChange={setOpen} initialPlan={plan} />
          </Suspense>
        )}
      </DemoContext.Provider>
    </DirectionProvider>
  );
}

export function DemoButton({
  plan,
  ...props
}: Omit<ComponentProps<typeof Button>, "onClick"> & { plan?: string }) {
  const openDemo = useOpenDemo();
  return <Button {...props} onClick={() => openDemo(plan)} />;
}
