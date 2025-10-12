import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, UserRoundCogIcon } from "lucide-react";
import Image from "next/image";
import { Button } from "../ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User } from "@/models/user";

export default function NavigationMenu({ session }: { session: User }) {
  "use client";

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 py-0.5  transition-colors z-50
      ${
        scrolled
          ? "bg-neutral-900/30 shadow-md backdrop-blur-md border-neutral-800"
          : "bg-transparent"
      }
      `}
    >
      <div className="flex items-center justify-between max-w-screen-xl  px-6 mx-auto h-14 w-full">
        <Branding />
        <NavUser session={session} />
      </div>
    </div>
  );
}

export function Branding() {
  return (
    <a className="flex flex-row items-center" href="/">
      <Image
        className="rounded-full"
        src="/Temly.png"
        height={36}
        width={36}
        alt="Logo"
      />
      <div className="flex flex-row items-center">
        <span className="pl-3 font-bold text-xl text-neutral-200">Temly</span>
        <span className="ml-4 h-8 w-[1.5px] bg-neutral-500/60 transform rotate-15"></span>
      </div>
      <span className="pl-4">
        <NavItems />
      </span>
    </a>
  );
}

export function NavItems() {
  const router = useRouter();
  return (
    <nav className="flex gap-6 ">
      <button
        onClick={() => router.push("/profile")}
        className="text-neutral-300 hover:text-white transition-colors font-medium"
      >
        Dashboard
      </button>
      <button
        onClick={() => router.push("/news")}
        className="text-neutral-300 hover:text-white transition-colors font-medium"
      >
        News
      </button>
    </nav>
  );
}

export function NavUser({ session }: { session: User }) {
  const router = useRouter();

  return (
    <a>
      {session ? (
        <div className="flex items-center gap-4 hover:bg-neutral-600/30 p-2 transition-colors rounded-3xl ease-in-out">
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 cursor-pointer focus:outline-none">
              <Image
                className="rounded-full"
                src={session.url}
                height={32}
                width={32}
                alt="User Avatar"
              />
              <span className="text-neutral-300 font-semibold hidden sm:inline">
                {session.name}
              </span>
              <ChevronDown size={16} className="text-neutral-300" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                className="flex items-center gap-2"
              >
                <UserRoundCogIcon className="w-4 h-4 text-neutral-300" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await fetch(`${process.env.NEXT_PUBLIC_BackendURL}/signout`, {
                    credentials: "include",
                  });
                  window.location.reload();
                }}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-neutral-300" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <Button
          variant="outline"
          onClick={() =>
            router.push(`${process.env.NEXT_PUBLIC_BackendURL}/login`)
          }
        >
          Log in
        </Button>
      )}
    </a>
  );
}
