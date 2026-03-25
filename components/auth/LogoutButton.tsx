"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

type LogoutButtonProps = {
  className?: string;
};

export default function LogoutButton({ className }: LogoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  async function handleLogout() {
    await fetch("/api/auth/logout", {
      method: "POST",
    });

    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={isPending}
      className={
        className ??
        "inline-flex items-center justify-center rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-70"
      }
    >
      {isPending ? "Signing out..." : "Log Out"}
    </button>
  );
}
