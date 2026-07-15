"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Breadcrumbs() {
  const pathname = usePathname();

  const parts = pathname.split("/").filter(Boolean);

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500">
        {parts.map((part, index) => {
          const href = "/" + parts.slice(0, index + 1).join("/");

          return (
            <div key={href} className="flex items-center gap-2">
              {index > 0 && <span>/</span>}

              <Link
                href={href}
                className="capitalize hover:text-blue-600"
              >
                {part}
              </Link>
            </div>
          );
        })}
      </div>

      <h1 className="mt-1 text-2xl font-bold capitalize">
        {parts[parts.length - 1]}
      </h1>
    </div>
  );
}