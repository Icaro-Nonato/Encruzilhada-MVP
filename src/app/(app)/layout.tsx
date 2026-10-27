import { LogOut } from "lucide-react";
import Link from "next/link";
import { logout } from "@/app/(auth)/actions";
import { DesktopNav, MobileNav } from "@/components/app-nav";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/config";

// Layout das rotas protegidas. O proxy (src/proxy.ts) já redireciona
// para /login quem não está logado.
export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-6">
            <Link href="/problemas" className="font-semibold">
              {APP_NAME}
            </Link>
            <DesktopNav />
          </div>
          <form action={logout}>
            <Button type="submit" variant="ghost" size="sm">
              <LogOut aria-hidden />
              Sair
            </Button>
          </form>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6 pb-24 md:pb-6">
        {children}
      </main>

      <MobileNav />
    </div>
  );
}
