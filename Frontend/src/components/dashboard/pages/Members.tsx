import Sidebar from "@/components/dashboard/sidebar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Ellipsis, Frown, SettingsIcon} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/models/user";

export default function Members({
  server,
  servers,
  requests,
  session,
}: {
  server: any;
  servers: any;
  requests: any;
  session: User;
}) {
  const data = server;

  async function Action(id: string, requestId: string, status: string) {
    try {
      const method = status === "accept" ? "PUT" : "DELETE";
      const resp = await RequestAction(id, requestId, method)
      requests.remove(requestId);
      return resp
    } catch (error) {}
  }

  return (
    <Sidebar data={server} servers={servers} session={session}>
      <Tabs defaultValue="Members">
        <TabsList>
          <TabsTrigger value="Members">Members</TabsTrigger>
          <TabsTrigger value="requests">
            Requests (
            {
              requests.filter(
                (req: any) =>
                  req.request.status !== 1 && req.request.status !== 2
              ).length
            }
            )
          </TabsTrigger>
        </TabsList>
        <TabsContent value="Members">
          <Card className=" bg-zinc-800/40">
            <CardHeader>
              <CardTitle className="text-2xl">Members</CardTitle>
              <CardDescription className="text-md">
                Configure your preferences and settings.
              </CardDescription>
              <div className="flex m-1 w-full gap-2">
                <Input placeholder="Search members..."  />
                <Button >Refresh</Button>
              </div>
              <Card className="py-0">
                <Table>
                  <thead>
                    <TableRow>
                      <TableHead style={{ paddingLeft: "1rem" }}>
                        Username
                      </TableHead>
                      <TableHead>Roles</TableHead>
                      <TableHead>Join Date</TableHead>
                    </TableRow>
                  </thead>
                  <TableBody>
                    {data?.members &&
                      data.members.map((member: any, idx: any) => (
                        <TableRow key={idx} >
                          <TableCell className="font-semibold p-4 flex items-center gap-2">
                            <img
                              src={member.avatar}
                              width={32}
                              alt={member.name}
                              className="rounded-lg"
                            />
                            <span className="text-lg text-neutral-200">
                              {member.name || "N/A"}
                            </span>
                          </TableCell>
                          <TableCell className="font-semibold">
                            <div className="flex gap-1">
                              {member.roles?.map((role: any, idx: any) => (
                                <Badge
                                  className="bg-blue-500/50 text-neutral-200"
                                  key={idx}
                                >
                                  {role}
                                </Badge>
                              ))}
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Badge variant={"outline"}>
                                    <SettingsIcon />
                                  </Badge>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent>
                                  <DropdownMenuLabel>Roles</DropdownMenuLabel>
                                  <DropdownMenuSeparator />

                                  <DropdownMenuCheckboxItem checked={true}>
                                    Role Name
                                  </DropdownMenuCheckboxItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                          <TableCell>
                            {member.joinDate
                              ? member.joinDate.toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </Card>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="requests">
          <Card className=" bg-zinc-800/50">
            <CardHeader>
              <CardTitle className="text-2xl">Member Requests</CardTitle>
              <CardDescription className="text-md">
                Configure your preferences and settings.
              </CardDescription>
              <div className="flex m-1 w-full gap-2">
                <Input placeholder="Search requests..."  />
                <Button variant={"blue"} >Refresh</Button>
              </div>
              <Card className="p-0">
                <Table>
                  <thead>
                    <TableRow>
                      <TableHead style={{ paddingLeft: "1rem" }}>
                        Username
                      </TableHead>
                      <TableHead>Requested Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </thead>
                  <TableBody>
                    {requests &&
                    requests.filter(
                      (req: any) =>
                        req.request.status !== 1 && req.request.status !== 2
                    ).length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={3}
                          className="text-center py-8 text-neutral-400"
                        >
                          <div className="flex flex-col items-center justify-center">
                            <Frown width={48} height={48} />
                            <span className="mt-2">No requests found.</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      requests
                        .filter(
                          (req: any) =>
                            req.request.status !== 1 && req.request.status !== 2
                        )
                        .map((req: any) => (
                          <TableRow key={req.request.id}>
                            <TableCell className="font-semibold p-4 flex items-center gap-2">
                              <img
                                src={req.member.avatar}
                                width={32}
                                alt={req.member.name}
                                className="rounded-lg"
                              />
                              <span className="text-lg text-neutral-200">
                                {req.member.name || "N/A"}
                              </span>
                            </TableCell>
                            <TableCell>
                              {req.request.created
                                ? new Date(
                                    req.request.created
                                  ).toLocaleDateString()
                                : "N/A"}
                            </TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button className="border-1 bg-white/0 border-neutral-800 hover:bg-neutral-800">
                                    <Ellipsis className="text-white" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  <DropdownMenuGroup>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        Action(
                                          data.id,
                                          req.request.id,
                                          "accept"
                                        )
                                      }
                                    >
                                      Accept
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() =>
                                        Action(data.id, req.request.id, "deny")
                                      }
                                    >
                                      Deny
                                    </DropdownMenuItem>
                                  </DropdownMenuGroup>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </TableCell>
                          </TableRow>
                        ))
                    )}
                  </TableBody>
                </Table>
              </Card>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </Sidebar>
  );
}
