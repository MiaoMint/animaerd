"use client";
import { useAuth } from "@/hooks/use-auth";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function Login() {
  const searchParams = useSearchParams();
  const { handleLogin } = useAuth();
  const token = searchParams.get("token");

  useEffect(() => {
    if (!token) {
      window.location.href = process.env.NEXT_PUBLIC_HOME_PAGE_URL!;
      return;
    }
    handleLogin(token);
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col items-center justify-center">
      <div className="space-y-8">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/30 animate-[spin_3s_linear_infinite]" />
          <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-[spin_1.5s_linear_infinite]" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-pulse">
            Log in...
          </h1>
          <p className="text-gray-600 animate-[fadeIn_1s_ease-in]">
            Please wait while we complete the authentication process
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Login />
    </Suspense>
  );
}
