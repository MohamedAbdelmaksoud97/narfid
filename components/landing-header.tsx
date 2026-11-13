"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowUpLeft, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useOpenDemo } from "@/components/landing-demo";
import { navigation } from "@/lib/landing-content";

export function LandingHeader({ brand }: { brand: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuToggleRef = useRef<HTMLButtonElement>(null);
  const openDemo = useOpenDemo();

  useEffect(() => {
    if (!menuOpen) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
        menuToggleRef.current?.focus();
      }
    }
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [menuOpen]);

  return (
    <header className="site-header">
      <div className="container header-inner">
        <a href="#home" className="brand-link" aria-label="نرفد — الرئيسية">
          {brand}
        </a>
        <nav className="desktop-nav" aria-label="القائمة الرئيسية">
          {navigation.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="header-actions">
          <Link href="/login" className="board-login-link">
            دخول الإدارة
          </Link>
          <Button
            size="navigation"
            data-analytics="demo_request_start"
            onClick={() => {
              openDemo();
              setMenuOpen(false);
            }}
          >
            احجز عرضًا توضيحيًا <ArrowUpLeft data-icon="inline-end" />
          </Button>
          <Button
            ref={menuToggleRef}
            variant="ghost"
            size="icon-lg"
            className="menu-toggle"
            aria-label={menuOpen ? "أغلق القائمة" : "افتح القائمة"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      {menuOpen && (
        <nav
          className="mobile-nav container"
          id="mobile-nav"
          aria-label="قائمة الجوال"
        >
          {navigation.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
              <ArrowUpLeft />
            </a>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            دخول الإدارة
            <ArrowUpLeft />
          </Link>
        </nav>
      )}
    </header>
  );
}
