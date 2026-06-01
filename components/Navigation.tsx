"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ThemeToggle from "@/app/theme-toggle";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setCurrentUser(session?.user ?? null);
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();
        setIsAdmin(data?.role === "admin");
      } else {
        setIsAdmin(false);
      }
    });
  }, [pathname]);

  async function handleAbmelden() {
    await supabase.auth.signOut();
    setCurrentUser(null);
    setIsAdmin(false);
    router.push("/login");
  }

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/pipeline", label: "Pipeline" },
    { href: "/berichte", label: "Berichte" },
    { href: "/kunden/neu", label: "Neuer Kunde" },
    ...(isAdmin ? [{ href: "/admin/users", label: "Benutzerverwaltung" }] : []),
  ];

  return (
    <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Solarwerk Sued &middot; Sales-Hub
        </Link>

        {currentUser && (
          <nav className="flex gap-6">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium ${
                  pathname === link.href
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-3">
          {currentUser ? (
            <>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Eingeloggt als {currentUser.email?.split("@")[0].replace(/^./, (c) => c.toUpperCase())}
              </span>
              <button
                onClick={handleAbmelden}
                className="text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400"
              >
                Abmelden
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              Anmelden
            </Link>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
