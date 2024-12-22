"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "jotai";
import { useAuth } from "@/hooks/use-auth";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

const queryClient = new QueryClient();

export function Providers({ children }: React.PropsWithChildren) {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        <Provider>
          <InitData>{children}</InitData>
        </Provider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

function InitData({ children }: React.PropsWithChildren) {
  const { refetchUser } = useAuth();
  const pathName = usePathname();
  useEffect(() => {
    if (pathName.indexOf("/auth") === -1) {
      refetchUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
}
