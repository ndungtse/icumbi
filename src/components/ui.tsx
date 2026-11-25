import type { ReactNode } from "react";

export const input = "rounded-full bg-surface px-5 py-3 text-ink placeholder:text-muted transition focus:bg-white";

export const pill = (on: boolean) =>
  `rounded-full px-4 py-2 text-sm font-medium transition ${on ? "bg-primary text-white" : "bg-surface text-ink hover:bg-surface-2"}`;
export const button = (kind: "primary" | "soft") =>
  `rounded-full px-5 py-2.5 text-sm font-medium transition ${kind === "primary" ? "bg-primary text-white hover:bg-primary-dark" : "bg-surface text-ink hover:bg-surface-2"}`;

export function Notice({ children }: { children: ReactNode }) {
  return (
    <div role="alert" className="rounded-2xl bg-surface px-5 py-4 text-muted">
      {children}
    </div>
  );
}

export const PROBLEM = "We couldn't load places right now. Please try again in a moment.";
