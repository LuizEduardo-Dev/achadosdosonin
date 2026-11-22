import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UI_COPY } from "@/lib/config";
import { buttonClasses } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <div className="w-full max-w-md rounded-lg border border-border bg-surface p-7">
        <p className="text-sm font-semibold text-link">{UI_COPY.notFound.code}</p>
        <h1 className="mt-1.5 text-xl font-semibold text-text">
          {UI_COPY.notFound.title}
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-text-muted">
          {UI_COPY.notFound.description}
        </p>
        <Link
          href="/"
          className={buttonClasses("secondary", "md", "mt-5 w-full")}
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>{UI_COPY.notFound.backHome}</span>
        </Link>
      </div>
    </main>
  );
}
