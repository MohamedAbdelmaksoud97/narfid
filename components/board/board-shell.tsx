"use client";

import { type CSSProperties, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft,
  ExternalLink,
  FileText,
  LayoutDashboard,
  LogOut,
  Palette,
  ShieldCheck,
  X,
} from "lucide-react";
import { logoutAction } from "@/app/login/actions";
import { useConfirmNavigation } from "@/components/articles/navigation-guard-provider";
import { Button, buttonVariants } from "@/components/ui/button";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const sections = [
  { label: "نظرة عامة", href: "/board", icon: LayoutDashboard },
  { label: "هوية نرفد", href: "/board/brand", icon: Palette },
  { label: "المقالات", href: "/board/articles", icon: FileText },
] as const;
type Props = {
  member: { name: string; email: string };
  children: ReactNode;
  defaultOpen: boolean;
};

function Workspace({ member, children }: Omit<Props, "defaultOpen">) {
  const pathname = usePathname();
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar();
  const confirmNavigation = useConfirmNavigation();
  const editing = pathname.startsWith("/board/articles/");
  const current = sections.find((section) =>
    section.href === "/board"
      ? pathname === section.href
      : pathname.startsWith(section.href),
  );
  const title = editing ? "محرر المقالات" : (current?.label ?? "لوحة الإدارة");
  return (
    <>
      <a href="#board-content" className="board-skip-link">
        انتقل إلى المحتوى
      </a>
      <Sidebar
        side="right"
        dir="rtl"
        collapsible="icon"
        className="board-sidebar"
      >
        <SidebarHeader className="board-sidebar-header">
          <Link
            href="/board"
            className="board-sidebar-brand"
            aria-label="نرفد — نظرة عامة"
            onClick={(event) => {
              if (!event.defaultPrevented && isMobile) setOpenMobile(false);
            }}
          >
            <Image
              className="board-brand-full"
              src="/logo.png"
              alt="نرفد"
              width={1672}
              height={941}
              sizes="190px"
            />
            <Image
              className="board-brand-symbol"
              src="/logo%20symbol.png"
              alt="نرفد"
              width={1254}
              height={1254}
              sizes="44px"
            />
          </Link>
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="board-mobile-close"
              aria-label="إغلاق القائمة"
              onClick={() => setOpenMobile(false)}
            >
              <X data-icon="inline-start" />
            </Button>
          )}
        </SidebarHeader>
        <SidebarSeparator />
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>مساحة نرفد الداخلية</SidebarGroupLabel>
            <SidebarGroupContent>
              <nav aria-label="أقسام لوحة الإدارة">
                <SidebarMenu className="board-sidebar-menu">
                  {sections.map((section) => (
                    <SidebarMenuItem key={section.href}>
                      <SidebarMenuButton
                        size="lg"
                        isActive={current?.href === section.href}
                        tooltip={{ children: section.label, side: "left" }}
                        aria-label={section.label}
                        aria-current={
                          current?.href === section.href ? "page" : undefined
                        }
                        render={<Link href={section.href} />}
                        onClick={(event) => {
                          if (!event.defaultPrevented && isMobile)
                            setOpenMobile(false);
                        }}
                      >
                        <section.icon aria-hidden="true" />
                        <span>{section.label}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </nav>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarSeparator />
        <SidebarFooter className="board-sidebar-footer">
          <div className="board-sidebar-member">
            <ShieldCheck aria-hidden="true" />
            <div>
              <p>{member.name}</p>
              <span dir="ltr">{member.email}</span>
            </div>
          </div>
          <p className="board-sidebar-caption">مجلس إدارة نرفد</p>
        </SidebarFooter>
      </Sidebar>
      <div className="board-main">
        <header className="board-topbar" aria-label="شريط لوحة الإدارة">
          <div className="board-topbar-location">
            <SidebarTrigger
              aria-label="إظهار أو إخفاء القائمة"
              title="إظهار أو إخفاء القائمة"
              aria-expanded={isMobile ? openMobile : open}
            />
            <nav aria-label="مسار التنقل" className="board-breadcrumb">
              <Link href="/board" className="board-breadcrumb-parent">
                لوحة الإدارة
              </Link>
              <ChevronLeft
                aria-hidden="true"
                className="board-breadcrumb-parent"
              />
              {editing && (
                <>
                  <Link
                    href="/board/articles"
                    className="board-breadcrumb-parent"
                  >
                    المقالات
                  </Link>
                  <ChevronLeft
                    aria-hidden="true"
                    className="board-breadcrumb-parent"
                  />
                </>
              )}
              <span aria-current="page">{title}</span>
            </nav>
          </div>
          <div className="board-topbar-actions">
            <span className="board-topbar-account">
              <ShieldCheck aria-hidden="true" />
              {member.name}
            </span>
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="زيارة موقع نرفد"
              title="زيارة موقع نرفد"
              className={buttonVariants({
                variant: "outline",
                size: "navigation",
              })}
            >
              <ExternalLink data-icon="inline-start" />
              <span className="board-action-label">زيارة الموقع</span>
            </Link>
            <form
              action={logoutAction}
              onSubmit={(event) => {
                if (!confirmNavigation()) event.preventDefault();
              }}
            >
              <Button
                type="submit"
                variant="ghost"
                size="navigation"
                aria-label="تسجيل الخروج"
                title="تسجيل الخروج"
              >
                <LogOut data-icon="inline-start" />
                <span className="board-action-label">تسجيل الخروج</span>
              </Button>
            </form>
          </div>
        </header>
        <div id="board-content" className="board-page-content" tabIndex={-1}>
          {children}
        </div>
      </div>
    </>
  );
}

export function BoardShell({ member, children, defaultOpen }: Props) {
  return (
    <TooltipProvider delay={200}>
      <SidebarProvider
        defaultOpen={defaultOpen}
        className="board-shell"
        style={
          {
            "--sidebar-width": "15.5rem",
            "--sidebar-width-icon": "4.5rem",
          } as CSSProperties
        }
      >
        <Workspace member={member}>{children}</Workspace>
      </SidebarProvider>
    </TooltipProvider>
  );
}
