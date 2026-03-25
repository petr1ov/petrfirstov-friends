import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot } from "lucide-react";

const Login = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
            <Bot className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl">Админ-панель</CardTitle>
          <p className="text-sm text-muted-foreground">Партнёрская программа</p>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            Вход осуществляется через Telegram-бота.
          </p>
          <p className="text-sm text-muted-foreground">
            Отправьте команду <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-foreground">/admin</code> боту, чтобы получить ссылку для входа.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
