"use client";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import {
  Key,
  Table2,
  SidebarClose,
  Clock,
  HammerIcon,
  ShieldAlert,
  Users2,
  VerifiedIcon,
  Plus,
  HomeIcon,
  Server,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useParams, usePathname, useRouter } from "next/navigation";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import { Branding, NavUser } from "../Main/NavMenu";

const pages = {
  groups: [
    {
      name: "Main",
      items: [
        { title: "Overview", href: "/overview", icon: <Table2 /> },
        { title: "Members", href: "/members", icon: <Users2 /> },
        { title: "Roles", href: "/roles", icon: <Key /> },
      ],
    },
    {
      name: "Modules",
      items: [
        { title: "Shifts", href: "/shifts", icon: <Clock /> },
        { title: "Moderations", href: "/moderations", icon: <HammerIcon /> },
        { title: "ER:LC", href: "/erlc", icon: <ShieldAlert /> },
        { title: "Discord", href: "/discord", icon: <Server /> },
        {
          title: "Verification",
          href: "verification",
          icon: <VerifiedIcon />,
        },
        { title: "Communities", href: "/verification", icon: <HomeIcon /> },
      ],
    },
  ],
};

export default function Sidebar({
  children,
  data,
  servers,
  session,
}: {
  children?: ReactNode;
  data: any;
  servers: any;
  session: any;
}) {
  const params = useParams();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const server = data;

  useEffect(() => {
    if (isMobile) setIsOpen(false);
    else setIsOpen(true);
  }, [isMobile]);

  return (
    <div className="flex flex-col h-screen">
      <div className="h-16 bg-neutral-900 border-b flex items-center px-5">
        <Button
          onClick={() => setIsOpen((prev) => !prev)}
          size="icon"
          variant="outline"
          className="cursor-pointer flex justify-center items-center"
        >
          <SidebarClose className="text-neutral-400" />
        </Button>
        <div className="flex items-center justify-between h-full w-full">
          <div className="pl-4">
            <Branding />
          </div>
          <div className="ml-auto">
            <NavUser session={session} />
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        <div
          className={`flex transition-all duration-300 transform
            ${isMobile ? "absolute z-30 left-0 h-screen" : "relative"}
            ${
              isMobile
                ? isOpen
                  ? "translate-x-0"
                  : "-translate-x-full"
                : isOpen
                ? "w-[360px]"
                : "w-[75px]"
            }
          `}
        >
          <div className="px-3 bg-neutral-900 border-r flex-shrink-0">
            <TooltipProvider>
              {servers.map((item: any, index: any) => {
                const active = params.id === item.id;
                return (
                  <div
                    key={index}
                    className="grid grid-cols flex-col justify-center items-center mb-2 mt-2"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <a
                          href={"/dashboard/" + item.id}
                          className={`relative ${
                            active
                              ? "bg-gradient-to-br border-neutral-900 p-1 rounded-xl"
                              : ""
                          }`}
                        >
                          <span
                            className={`absolute -left-2 h-12 w-1 rounded-r-full bg-blue-600 transition-all duration-300
                            ${
                              active
                                ? "opacity-100 scale-y-100"
                                : "opacity-0 scale-y-0 group-hover:opacity-100 group-hover:scale-y-100"
                            }`}
                          />
                          {item?.guild && item.guild.serverIcon ? (
                            <img
                              src={item.guild.serverIcon}
                              alt={item.name.charAt(0)}
                              className="w-10 h-10 flex justify-center items-center text-center font-black bg-zinc-950 rounded-lg"
                            />
                          ) : (
                            <div className="w-10 h-10 flex justify-center items-center text-center font-black bg-zinc-950 rounded-lg">
                              {item.name.charAt(0)}
                            </div>
                          )}
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="right">{item.name}</TooltipContent>
                    </Tooltip>
                  </div>
                );
              })}
            </TooltipProvider>
            <div className="flex justify-center mt-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="w-12 h-12 rounded-lg flex font-black bg-zinc-950 hover:bg-zinc-800 transition-colors items-center justify-center text-center"
                    aria-label="Create server"
                    onClick={() => router.push("/profile")}
                  >
                    <Plus className="text-2xl text-blue-500 flex w-8 h-8" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">Create Server</TooltipContent>
              </Tooltip>
            </div>
          </div>

          <div
            className={`border-r overflow-y-auto bg-neutral-900 transition-all duration-300
              ${isOpen ? "w-72 opacity-100" : "w-0 opacity-0"}
            `}
          >
            <div className={`${isOpen ? "block" : "hidden"}`}>
              <div className="w-full h-32 border-b-2 bg-gradient-to-b from-zinc-900 to-zinc-800" />
              <div className="flex items-center justify-between p-4">
                <span className="text-lg">{server.name}</span>
              </div>
              <hr />
              {pages.groups.map((group) => (
                <div key={group.name}>
                  <div className="px-4 py-1 pt-4 text-xs font-semibold text-neutral-400 uppercase">
                    {group.name}
                  </div>
                  {group.items.map((item) => {
                    const isActive =
                      pathname === `/dashboard/${server.id}${item.href}`;
                    return (
                      <a
                        key={item.title}
                        onClick={() =>
                          router.push(`/dashboard/${server.id}${item.href}`)
                        }
                        className={`flex w-full pl-6 text-[18px] items-center gap-2 py-3 
                          ${
                            isActive
                              ? "bg-neutral-800 text-white"
                              : "text-gray-400 hover:bg-neutral-800"
                          }`}
                      >
                        <span className="text-blue-500">{item.icon}</span>
                        <span className="flex-1 ms-3 whitespace-nowrap font-bold">
                          {item.title}
                        </span>
                      </a>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 transition-all duration-300">
          {children}
        </div>
      </div>
    </div>
  );
}
