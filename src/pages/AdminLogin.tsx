import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AdminLogin = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "error" | "success">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const token = searchParams.get("token");
    if (!token) {
      setStatus("error");
      setErrorMsg("Токен не найден");
      return;
    }

    const authenticate = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("admin-auth", {
          body: { token },
        });

        if (error || !data?.token_hash) {
          setStatus("error");
          setErrorMsg(data?.error || error?.message || "Ошибка авторизации");
          return;
        }

        // Verify OTP with the token hash
        const { error: otpError } = await supabase.auth.verifyOtp({
          token_hash: data.token_hash,
          type: "magiclink",
        });

        if (otpError) {
          setStatus("error");
          setErrorMsg(otpError.message);
          return;
        }

        setStatus("success");
        const next = sessionStorage.getItem("post_login_redirect");
        if (next && next.startsWith("/") && !next.startsWith("//")) {
          sessionStorage.removeItem("post_login_redirect");
          window.location.replace(next);
        } else {
          navigate("/", { replace: true });
        }
      } catch (e: any) {
        setStatus("error");
        setErrorMsg(e.message || "Ошибка");
      }
    };

    authenticate();
  }, [searchParams, navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <>
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="text-muted-foreground">Вход в админ-панель...</p>
          </>
        )}
        {status === "error" && (
          <>
            <p className="text-destructive text-lg">❌ {errorMsg}</p>
            <p className="text-muted-foreground text-sm">Запросите новую ссылку через /admin в боте</p>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminLogin;
