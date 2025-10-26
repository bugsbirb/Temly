"use client";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import NavigationMenu from "@/components/Main/NavMenu";
import { useSession } from "@/hooks/use-session";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Book, EggFried, Hammer, Link, Rocket } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useEffect, useState } from "react";
import MainPage from "@/components/Dialogs/MainPage";

export default function Home() {
  const session = useSession(false);
  const router = useRouter();
  const mobile = useIsMobile();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem("hasSeenDialog");
    if (!hasSeen) {
      setOpen(true);
    }
  }, []);

  return (
    <div>
      <MainPage open={open} onOpenChange={setOpen}/>
      <NavigationMenu session={session} />
      <div className="min-h-screen w-full font-sans flex flex-col items-center pt-10 px-4">
        <div>
          <section>
            <div className="flex flex-row pb-4">
              <div className="text-blue-300/60 font-extrabold py-0 px-4 text-center rounded-2xl bg-blue-800/60 hover:bg-blue-700/60 transition-all">
                What's new
              </div>
              <div className="flex items-center justify-center">
                <div className="text-center pl-1.5 font-light text-sm">
                  • v0.1
                </div>
              </div>
            </div>
          </section>
          <section>
            <h1 className="text-4xl sm:text-5xl font-bold">
              Transform{" "}
              <span className="bg-gradient-to-br from-blue-400 to-blue-700 bg-clip-text text-transparent font-extrabold hover:from-blue-500 hover:bg-gradient-to-l hover:to-blue-800 transition-all">
                moderation
              </span>{" "}
              into a fun experience
            </h1>
            <div className="text-lg font-light">
              Meet temly, an open source moderation bot that gives you a sense
              of ownership
            </div>
            <div className="flex gap-4 mt-6">
              <Button size="lg" variant="blue" onClick={() => router.push("/")}>
                Get Started
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push("/profile")}
              >
                Servers
              </Button>
            </div>
            <div className="mt-6">
              <Image
                src="/Modpanel.png"
                width={1200}
                height={1200}
                alt="Moderation Panel"
                className="rounded-lg bg-gradient-to-br from-blue-600/80 to-blue-600/40 p-0.5 select-none"
                quality={100}
                priority
              />
            </div>
          </section>
          <section className="mt-10 mb-10">
            <div className="grid gap-4  md:grid-cols-3 sm:grid-cols-2 grid-cols-1">
              <Card className="border-0 shadow-s hover:bg-gradient-to-tl hover:from-neutral-800 transition-colors ease-in-out duration-200 sm:col-span-2 sm:rounded-3xl md:col-span-2 md:rounded-3xl lg:col-span-2 lg:rounded-3xl">
                <CardContent>
                  <div className="flex flex-row">
                    <div className="p-4 h-14 w-14 bg-gradient-to-br from-blue-600/90 to-blue-700/90 flex items-center justify-center rounded-2xl shadow-s">
                      <Hammer className="w-10 h-10" />
                    </div>
                    <div className="pl-4">
                      <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                        Powerful Moderation Tools
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Automate and customize moderation with advanced filters,
                        role management, and real-time alerts.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-s transition-colors ease-in-out duration-200 hover:bg-gradient-to-tl hover:from-neutral-800 sm:col-span-1 sm:rounded-3xl md:col-span-1 md:rounded-3xl lg:col-span-1 lg:rounded-3xl">
                <CardContent>
                  <div className="flex flex-row">
                    <div className="p-4 h-14 w-14 bg-gradient-to-br from-indigo-600/90 to-indigo-700/90 flex items-center justify-center rounded-2xl shadow-s">
                      <EggFried className="w-10 h-10" />
                    </div>
                    <div className="pl-4">
                      <h2 className="text-2xl font-semibold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                        Free
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        No subscriptions required.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-s transition-colors ease-in-out duration-200 hover:bg-gradient-to-br hover:from-neutral-800 sm:col-span-1 sm:hover:bg-gradient-to-tl sm:rounded-3xl md:col-span-1 md:hover:bg-gradient-to-tl md:rounded-3xl lg:col-span-1 lg:hover:bg-gradient-to-tl lg:rounded-3xl">
                <CardContent>
                  <div className="flex flex-row">
                    <div className="p-4 h-14 w-14 bg-gradient-to-br from-pink-600/90 to-pink-700/90 flex items-center justify-center rounded-2xl shadow-s">
                      <Book className="w-10 h-10" />
                    </div>
                    <div className="pl-4">
                      <h2 className="text-2xl font-semibold bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                        Open Source
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        MIT License
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-0 shadow-s hover:bg-gradient-to-tl hover:from-neutral-800 transition-colors ease-in-out duration-200 sm:col-span-2 sm:rounded-3xl">
                <CardContent>
                  <div className="flex flex-row">
                    <div className="p-4 h-14 w-14 bg-gradient-to-br from-green-600/90 to-green-700/90 flex items-center justify-center rounded-2xl shadow-s">
                      <Link className="w-10 h-10" />
                    </div>
                    <div className="pl-4">
                      <h2 className="text-2xl font-semibold mb-2 bg-gradient-to-br from-white to-gray-300 bg-clip-text text-transparent">
                        Powerful Intergrations
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        Link Roblox & Discord to your{" "}
                        <span className="text-blue-600 font-bold">Temly</span>{" "}
                        server.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
