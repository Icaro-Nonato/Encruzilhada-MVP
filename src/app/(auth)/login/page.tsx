import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_NAME } from "@/lib/config";

export default function LoginPage({ searchParams }: PageProps<"/login">) {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl">{APP_NAME}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login">
            <TabsList className="mb-4 w-full">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>
            <TabsContent value="login">
              <Suspense fallback={<AuthForm mode="login" />}>
                <LoginForm searchParams={searchParams} />
              </Suspense>
            </TabsContent>
            <TabsContent value="signup">
              <AuthForm mode="signup" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </main>
  );
}

// Mostra o erro vindo de /auth/confirm (ex.: link de confirmação expirado).
async function LoginForm({
  searchParams,
}: Pick<PageProps<"/login">, "searchParams">) {
  const { erro } = await searchParams;
  const initialError =
    erro === "confirmacao"
      ? "Não foi possível confirmar o e-mail. O link pode ter expirado."
      : undefined;

  return <AuthForm mode="login" initialError={initialError} />;
}
