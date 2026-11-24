import Link from "next/link";
import { Notice } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Notice>
        That page doesn&rsquo;t exist.{" "}
        <Link href="/" className="font-medium text-primary underline">
          Back to all areas
        </Link>
      </Notice>
    </div>
  );
}
