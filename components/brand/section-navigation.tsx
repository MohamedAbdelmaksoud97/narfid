"use client";

import { useEffect, useRef, useState } from "react";

type Section = { id: string; label: string };

export function BrandSectionNavigation({
  sections,
  label = "أقسام هوية نرفد",
}: {
  sections: readonly Section[];
  label?: string;
}) {
  const navigation = useRef<HTMLElement>(null);
  const [activeSection, setActiveSection] = useState<string | undefined>(
    sections[0]?.id,
  );

  useEffect(() => {
    const guide = navigation.current?.closest(".brand-guide");
    const targets = sections.flatMap((section) => {
      const element = guide?.querySelector<HTMLElement>(`#${section.id}`);
      return element ? [{ id: section.id, element }] : [];
    });
    let frame = 0;
    function update() {
      frame = 0;
      const readingLine = Math.min(window.innerHeight * 0.25, 180);
      let current: string | undefined = targets[0]?.id;
      for (const target of targets) {
        if (target.element.getBoundingClientRect().top <= readingLine)
          current = target.id;
        else break;
      }
      if (
        Math.ceil(window.scrollY + window.innerHeight) >=
        document.documentElement.scrollHeight - 2
      )
        current = targets.at(-1)?.id;
      setActiveSection(current);
    }
    function schedule() {
      if (!frame) frame = window.requestAnimationFrame(update);
    }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, [sections]);

  return (
    <nav ref={navigation} aria-label={label}>
      {sections.map((section, index) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={activeSection === section.id ? "location" : undefined}
        >
          <span dir="ltr">{String(index + 1).padStart(2, "0")}</span>
          {section.label}
        </a>
      ))}
    </nav>
  );
}
