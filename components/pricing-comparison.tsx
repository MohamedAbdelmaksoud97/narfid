import { ArrowUpLeft, GitBranch, SaudiRiyal, UsersRound } from "lucide-react";
import Link from "next/link";
import { plans, pricingFeatures } from "@/lib/landing-content";
import { LandingDemo, DemoButton } from "@/components/landing-demo";
import {
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const number = new Intl.NumberFormat("en-US", { useGrouping: false });

export function PricingComparison({ contactLinks = false }: { contactLinks?: boolean }) {
  const comparison = (
      <div className="pricing-grid pricing-comparison">
        {plans.map((plan, index) => (
          <Card key={plan.name} className={cn("comparison-card", plan.recommended && "comparison-recommended")}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                {plan.memberLimit === null ? "عدد أعضاء غير محدود" : `يشمل ${number.format(plan.memberLimit)} عضو`}
              </CardDescription>
              <p className="comparison-price" aria-label={`${plan.monthly} ريال شهريًا`}>
                <strong>{number.format(plan.monthly)}</strong>
                <SaudiRiyal aria-hidden="true" />
                <span>شهريًا</span>
              </p>
              <p className="comparison-annual">
                الدفع سنويًا {number.format(plan.annual)} <SaudiRiyal aria-hidden="true" />
              </p>
            </CardHeader>
            <CardContent>
              <ul>
                <li>
                  <span className="comparison-feature-icon"><UsersRound aria-hidden="true" /></span>
                  <span>{plan.userLimit === null ? "عدد مستخدمين غير محدود" : `يشمل ${number.format(plan.userLimit)} مستخدم`}</span>
                </li>
                <li>
                  <span className="comparison-feature-icon"><GitBranch aria-hidden="true" /></span>
                  <span>{plan.branches}</span>
                </li>
                {pricingFeatures.map(({ label, icon: Icon, from }) => {
                  const included = index >= from;
                  return (
                    <li key={label} data-included={included}>
                      <span className="comparison-feature-icon"><Icon aria-hidden="true" /></span>
                      <span>
                        {!included && <span className="sr-only">غير مشمول: </span>}
                        <span className="comparison-feature-label">{label}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
            <CardFooter>
              {contactLinks ? (
                <Link href="/contact" data-analytics="demo_request_start" className={buttonVariants({ variant: "outline" })}>
                  {plan.cta}
                </Link>
              ) : (
                <DemoButton plan={plan.name} variant={index === 1 ? "default" : "outline"} size="marketing" className="w-full">
                  {plan.cta}
                  <ArrowUpLeft data-icon="inline-end" />
                </DemoButton>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
  );
  return contactLinks ? comparison : <LandingDemo>{comparison}</LandingDemo>;
}
