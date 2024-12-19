"use client";
import { useAuth } from "@/hooks/use-auth";
import { useIsClient } from "@/hooks/use-is-client";
import { Provider } from "@/types/auth";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthCallback({
  params,
}: {
  params: { provider: Provider };
}) {
  const searchParams = useSearchParams();
  const { handleCallback } = useAuth();
  const code = searchParams.get("code");
  const isClient = useIsClient();

  useEffect(() => {
    if (!isClient) return;
    const handleAuth = async () => {
      if (!code) return;
      await handleCallback(params.provider, code);
    };

    handleAuth();
  }, [isClient]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col items-center justify-center">
      <div className="space-y-8 text-center">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-primary/30 animate-[spin_3s_linear_infinite]" />
          <div className="absolute top-0 h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-[spin_1.5s_linear_infinite]" />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-semibold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent animate-pulse">
            Authenticating with {params.provider}...
          </h1>
          <p className="text-gray-600 animate-[fadeIn_1s_ease-in]">
            Please wait while we complete the authentication process
          </p>
        </div>
      </div>
    </div>
  );
}
