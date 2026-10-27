import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { getPostLoginPath } from "@/lib/profile";
import { createClient } from "@/lib/supabase/server";

// Destino do link de confirmação enviado por e-mail.
// Aceita tanto o fluxo PKCE (?code=) quanto o de token (?token_hash=&type=).
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  const result = code
    ? await supabase.auth.exchangeCodeForSession(code)
    : tokenHash && type
      ? await supabase.auth.verifyOtp({ token_hash: tokenHash, type })
      : null;
  const user = result?.data.user;

  if (!result || result.error || !user) {
    return NextResponse.redirect(`${origin}/login?erro=confirmacao`);
  }
  const path = await getPostLoginPath(supabase, user.id);
  return NextResponse.redirect(`${origin}${path}`);
}
