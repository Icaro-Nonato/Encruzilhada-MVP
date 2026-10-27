import { createServerClient } from "@supabase/ssr";
import type { Database } from "./database.types";
import { NextResponse, type NextRequest } from "next/server";

// Renova a sessão do Supabase Auth a cada requisição e grava os cookies
// atualizados na resposta.
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
          Object.entries(headers ?? {}).forEach(([key, value]) =>
            response.headers.set(key, value),
          );
        },
      },
    },
  );

  // Não coloque código entre createServerClient e getClaims().
  const { data } = await supabase.auth.getClaims();
  const isLoggedIn = Boolean(data?.claims);
  const { pathname } = request.nextUrl;

  const isProtected =
    pathname === "/" || PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));

  if (!isLoggedIn && isProtected) {
    return redirectKeepingCookies(request, response, "/login");
  }
  if (isLoggedIn && (pathname === "/" || AUTH_PAGES.includes(pathname))) {
    return redirectKeepingCookies(request, response, "/problemas");
  }

  return response;
}

// Rotas que exigem login.
const PROTECTED_PREFIXES = ["/problemas", "/perfil"];
// Rotas que não fazem sentido para quem já está logado.
const AUTH_PAGES = ["/login"];

function redirectKeepingCookies(
  request: NextRequest,
  response: NextResponse,
  pathname: string,
) {
  const url = request.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}
