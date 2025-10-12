"use client";
import CreateServer from "@/components/Dialogs/CreateServer";
import NavigationMenu from "@/components/Main/NavMenu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSession } from "@/hooks/use-session";
import { Clock, Frown, RefreshCcw, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ServersClient({
  servers,
  discordServers,
  requests,
}: ProfileProps) {
  const [open, setOpen] = useState(false);
  const [queriedServers, setQueriedServers] = useState(
    Array.isArray(servers) ? servers : []
  );
  const session = useSession(true);
  const router = useRouter();

  function handleSearch(term: string) {
    if (!term) return setQueriedServers(Array.isArray(servers) ? servers : []);
    setQueriedServers(
      (Array.isArray(servers) ? servers : []).filter((s: any) =>
        s.name?.toLowerCase().includes(term.toLowerCase())
      )
    );
  }

  return (
    <main className="bg-gradient-to-br from-neutral-900 min-h-screen">
      <NavigationMenu session={session} />

      <div className="flex justify-center items-center pt-[2rem] px-4">
        <div className="w-[77rem]">
          <div className="flex flex-row">
            {session?.url && (
              <Image
                src={session.url}
                alt="Profile Image"
                height={64}
                width={64}
                className="rounded-full border-4 border-blue-600/50"
              />
            )}
            <span className="flex flex-col pl-2 pt-2">
              <span className="text-lg font-semibold">{session?.name}</span>
              <Badge variant="outline">
                {(servers ?? []).length} servers
              </Badge>{" "}
            </span>
          </div>

          <hr className="my-3" />
          <Tabs defaultValue="servers">
            <TabsList className="flex flex-wrap gap-2 w-full lg:w-75 sm:w-full self-start">
              <TabsTrigger value="servers">Servers</TabsTrigger>
              <TabsTrigger value="requests">
                Requests (
                {(Array.isArray(requests) ? requests : []).length}
                )
              </TabsTrigger>
              <TabsTrigger value="Preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="servers">
              <div className="flex flex-row gap-2 items-center mb-2">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search servers..."
                    onChange={(e) => handleSearch(e.target.value)}
                  />
                  <Search
                    width={16}
                    height={16}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-300"
                  />
                </div>

                <Button variant="blue" onClick={() => setOpen(true)}>
                  Add Server
                </Button>
                <Button variant="secondary" onClick={() => router.refresh()}>
                  <RefreshCcw />
                </Button>
                <CreateServer
                  open={open}
                  onOpenChange={setOpen}
                  servers={discordServers}
                />
              </div>

              <Card className="overflow-auto max-h-4xl">
                <CardContent>
                  <div className="grid grid-rows-1 lg:grid-cols-3  gap-2">
                    {(queriedServers ?? []).length > 0 ? (
                      (queriedServers ?? []).map(
                        (server: any, index: number) => (
                          <Card key={index}>
                            <CardContent>
                              <div className="flex flex-row">
                                {server?.guild?.serverIcon ? (
                                  <Image
                                    src={server.guild.serverIcon}
                                    alt={server.guild.name || "Server Icon"}
                                    width={48}
                                    height={48}
                                  />
                                ) : (
                                  <div className="w-12 h-12 flex items-center justify-center bg-neutral-800 border-2 rounded-2xl">
                                    {server?.name?.charAt(0) || "?"}
                                  </div>
                                )}
                                <span className="flex flex-col mx-2">
                                  <span>{server.name}</span>
                                  <span className="flex gap-1">
                                    {server.isDashboardUser && (
                                      <Button
                                        size="ssm"
                                        variant="blue"
                                        onClick={() =>
                                          router.push(`/modpanel/${server.id}`)
                                        }
                                      >
                                        Modpanel
                                      </Button>
                                    )}
                                    {server.isModpanelUser && (
                                      <Button
                                        size="ssm"
                                        variant="purple"
                                        onClick={() =>
                                          router.push(
                                            `/dashboard/${server.id}/overview`
                                          )
                                        }
                                      >
                                        Dashboard
                                      </Button>
                                    )}
                                  </span>
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      )
                    ) : (
                      <div className="col-span-full flex flex-col items-center justify-center w-full h-full text-center py-2 gap-3 text-neutral-400">
                        <Frown width={48} height={48} />
                        <span>No servers found.</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="requests">
              <Card className="overflow-auto max-h-170 mb-6">
                <CardContent>
                  {(Array.isArray(requests) ? requests : []).length > 0 ? (
                    (Array.isArray(requests) ? requests : []).map(
                      (item: any, index: number) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle>
                              <span className="flex flex-row gap-2 items-center relative">
                                {item.server.name}
                                {item.request.status === 0 && (
                                  <Badge>Pending</Badge>
                                )}
                                {item.request.status === 1 && (
                                  <Badge variant="destructive">Denied</Badge>
                                )}
                                {item.request.status === 2 && (
                                  <Badge variant="secondary">Accepted</Badge>
                                )}
                              </span>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <span className="flex flex-row text-neutral-500 gap-1 text-xs">
                              <Clock width={16} height={16} />
                              <span>
                                {new Date(
                                  item.request.Created
                                ).toLocaleString()}
                              </span>
                            </span>
                          </CardContent>
                        </Card>
                      )
                    )
                  ) : (
                    <div className="text-neutral-400 flex justify-center items-center py-4">
                      <div className="flex flex-col items-center text-center gap-3">
                        <Frown width={48} height={48} />
                        No requests found.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
