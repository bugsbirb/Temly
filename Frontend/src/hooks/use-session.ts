"use client";

import { User } from "@/models/user";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function useSession(redirect: boolean = true) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const useSesh = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BackendURL}/auth/session/@me`,
        {
          credentials: "include",
          headers: { Accept: "application/json" },
        }
      );

      if (!response.ok) {
        if (redirect == true) {
          router.push(`${process.env.NEXT_PUBLIC_BackendURL}/login`);
        }

        return;
      }

      const data = await response.json();
      setUser(data);
    };

    useSesh();
  }, [router]);

  return user as User;
}
