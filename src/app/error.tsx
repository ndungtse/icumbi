"use client";

import { Notice, PROBLEM } from "@/components/ui";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Notice>
        {PROBLEM}{" "}
        <button type="button" onClick={() => retry()} className="font-medium text-primary underline">
          Try again
        </button>
      </Notice>
    </div>
  );
}
