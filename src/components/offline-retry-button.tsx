"use client";

import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function OfflineRetryButton() {
  return (
    <Button
      variant="accent"
      size="md"
      className="w-full font-bold"
      onClick={() => window.location.reload()}
    >
      <RefreshCw className="h-4 w-4" aria-hidden="true" />
      <span>Tentar novamente</span>
    </Button>
  );
}
