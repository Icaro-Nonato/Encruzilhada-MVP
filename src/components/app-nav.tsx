"use client";

import { ListChecks, UserRound } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import { cn } from "cn";

const NAV_ITEMS = [
  { href: "/problemas", label: "Problemas", icon: ListChecks },
  { href: "/perfil", label: "Perfil", icon: UserRound },
] as const;

type IsActive = (href: string) => boolean;

// usePathname() lê a URL, que só existe na hora da requisição. Por isso os
// links destacados ficam dentro de <Suspense>: enquanto a URL não chega,
// mostramos o mesmo menu sem nenhum item destacado.
function WithActive({ render }: { render: (isActive: IsActive) => React.ReactNode }) {
  return (
    <Suspense fallback={render(() => false)}>
      <ActiveFromPathname render={render} />
    </Suspense>
  );
}

function ActiveFromPathname({ render }: { render: (isActive: IsActive) => React.ReactNode }) {
  const pathname = usePathname();
  return render((href) => pathname === href || pathname.startsWith(`${href}/`));
}

// Menu simples no topo, visível só no desktop.
export function DesktopNav() {
  return (
    <nav className="hidden items-center gap-1 md:flex">
      <WithActive
        render={(isActive) =>
          NAV_ITEMS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground",
                isActive(href) && "bg-muted text-foreground",
              )}
            >
              {label}
            </Link>
          ))
        }
      />
    </nav>
  );
}

// Barra inferior fixa, visível só no mobile.
export function MobileNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-10 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <ul className="grid grid-cols-2">
        <WithActive
          render={(isActive) =>
            NAV_ITEMS.map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center gap-1 py-2 text-xs font-medium text-muted-foreground",
                    isActive(href) && "text-foreground",
                  )}
                >
                  <Icon className="size-5" aria-hidden />
                  {label}
                </Link>
              </li>
            ))
          }
        />
      </ul>
    </nav>
  );
}
