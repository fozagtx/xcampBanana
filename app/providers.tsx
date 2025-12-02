"use client";

import { CampProvider } from "@campnetwork/origin/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CampProvider
        clientId={process.env.NEXT_PUBLIC_CAMP_CLIENT_ID || "fce77d7a-8085-47ca-adff-306a933e76aa"}
      >
        {children}
      </CampProvider>
    </QueryClientProvider>
  );
}