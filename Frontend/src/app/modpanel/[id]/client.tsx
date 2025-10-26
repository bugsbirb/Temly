"use client";
import Content from "@/components/modpanel/content";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Clock,
  Frown,
  Hammer,
  ShieldAlertIcon,
  ShieldEllipsis,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSignalR } from "@/hooks/use-websocket";
import { User } from "@/models/user";
import ShiftTimer from "@/components/modpanel/shiftTimer";
import {
  EndShift,
  EndShiftBreak,
  StartShift,
  StartShiftBreak,
} from "@/services/shifts";
import { toast } from "sonner";
import { Branding, NavUser } from "@/components/Main/NavMenu";
import Image from "next/image";
import { DialogTitle } from "@/components/ui/dialog";
import MemberCheck from "@/components/Dialogs/MemberCheck";

const Tabs = [
  { icon: <Clock />, tab: "sidebar1" },
  { icon: <Hammer />, tab: "content" },
  { icon: <ShieldAlertIcon />, tab: "sidebar2" },
];

export default function Modpanel({
  server,
  moderations,
  session,
  activeShifts,
  erlcServer,
  erlcPlayers,
  erlcJoins,
  erlcCommands,
  erlcKills,
}: {
  server: any;
  moderations: any;
  session: User;
  activeShifts: any;
  erlcServer: any;
  erlcPlayers: any;
  erlcJoins: any;
  erlcCommands: any;
  erlcKills: any;
}) {
  const isMobile = useIsMobile();

  const [open, SetOpen] = useState<boolean>(false);

  const [Tab, setTab] = useState("content");
  const [Moderations, setModerations] = useState(moderations?.items ?? []);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [shifts, setActiveShifts] = useState<any[]>(
    Array.isArray(activeShifts) ? activeShifts : []
  );

  const [shift, setCurrentShift] = useState<any>(
    shifts.find((s: any) => s?.shift?.userId === session?.nameidentifier)
  );
  const [Onbreak, setOnBreak] = useState(
    shift?.shift?.breaks?.some((b: any) => b?.startTime && !b?.endTime) ?? false
  );
  const [ShiftType, setType] = useState<string>(
    shift?.shift?.shiftType ?? server?.config?.shifts?.types[0]?.name ?? "none"
  );

  const { connection } = useSignalR(server?.id);

  useEffect(() => {
    if (!connection) return;

    connection.onclose(() => {
      toast.error("Connection closed.");
    });

    connection.on("SendModeration", (moderation) => {
      if (!moderation) return;
      setModerations((prev: any) => [moderation, ...prev]);
    });

    connection.on("DeleteModeration", (moderationId: number) => {
      setModerations((prev: any[]) =>
        prev.filter((m: any) => m?.id !== moderationId)
      );
    });

    connection.on("EditModeration", (moderation) => {
      if (!moderation) return;
      setModerations((prev: any[]) =>
        prev.map((m: any) => (m?.id === moderation?.id ? moderation : m))
      );
    });

    connection.on("ShiftStarted", (newShift) => {
      if (!newShift) return;
      setCurrentShift(newShift);
      setActiveShifts((prev: any[]) => [
        ...prev.filter((s: any) => s?.shift?.id !== newShift?.shift?.id),
        newShift,
      ]);
    });

    connection.on("ShiftEnded", (endedShift) => {
      const endedId = endedShift?.shift?.id ?? endedShift?.id;
      if (!endedId) return;
      setCurrentShift(null);
      setActiveShifts((prev: any[]) =>
        prev.filter((s: any) => (s?.shift?.id ?? s?.id) !== endedId)
      );
    });

    connection.on("ShiftBreakStart", (breakShift) => {
      if (!breakShift) return;
      setCurrentShift(breakShift);
      setActiveShifts((prev: any[]) =>
        prev.map((s: any) =>
          s?.shift?.id === breakShift?.shift?.id ? breakShift : s
        )
      );
    });

    connection.on("ShiftBreakEnd", (breakShift) => {
      if (!breakShift) return;
      setCurrentShift(breakShift);
      setActiveShifts((prev: any[]) =>
        prev.map((s: any) =>
          s?.shift?.id === breakShift?.shift?.id ? breakShift : s
        )
      );
    });

    return () => {
      connection.off("SendModeration");
      connection.off("DeleteModeration");
      connection.off("EditModeration");
      connection.off("ShiftStarted");
      connection.off("ShiftEnded");
      connection.off("ShiftBreakStart");
      connection.off("ShiftBreakEnd");
    };
  }, [connection]);

  return (
    <div className="flex flex-col h-screen">
      <MemberCheck server={server} onOpenChange={SetOpen} open={open} />
      <div className="h-14 bg-neutral-900 border-b px-4">
        <div className="flex items-center justify-between h-full">
          <Branding />
          <NavUser session={session} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {(!isMobile || Tab === "sidebar1") && (
          <div
            className={
              isMobile
                ? "flex-1 bg-neutral-900 overflow-y-auto p-2"
                : "flex-shrink basis-120 min-w-[220px] max-w-[400px] bg-neutral-900 border-r overflow-y-auto"
            }
          >
            <Card className="m-2 px-4 gap-2">
              <div className="w-36 h-36 rounded-full border-4 border-neutral-700 flex justify-center items-center text-xl font-bold bg-neutral-950 mx-auto my-4">
                <ShiftTimer
                  startTime={shift?.shift?.startTime}
                  breaks={shift?.shift?.breaks}
                />
              </div>
              <Select
                defaultValue={ShiftType}
                disabled={!!shift}
                onValueChange={(value) => setType(value)}
              >
                <SelectTrigger className="w-full mt-2">
                  <SelectValue placeholder="Shift Type" />
                </SelectTrigger>
                <SelectContent>
                  {server?.config?.shifts?.types &&
                  server.config.shifts.types.length > 0 ? (
                    server.config.shifts.types.map((type: any, idx: number) => (
                      <SelectItem key={idx} value={type.name}>
                        {type.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="Default">Default</SelectItem>
                  )}
                </SelectContent>
              </Select>
              <div className="flex flex-row gap-2 w-full">
                {!shift ? (
                  <Button
                    className="flex-1"
                    onClick={async () => {
                      await StartShift(server?.id, ShiftType);
                    }}
                    variant={"success"}
                  >
                    Start
                  </Button>
                ) : (
                  <Button
                    className="flex-1"
                    onClick={async () => {
                      if (!Onbreak) {
                        await StartShiftBreak(server?.id);
                        setOnBreak(true);
                      } else {
                        await EndShiftBreak(server?.id);
                        setOnBreak(false);
                      }
                    }}
                    variant={"amber"}
                    disabled={!shift}
                  >
                    {Onbreak ? "Unpause" : "Break"}
                  </Button>
                )}

                <Button
                  className="flex-1"
                  onClick={() => shift && EndShift(server?.id)}
                  variant={"destructive"}
                  disabled={!shift || Onbreak}
                >
                  End
                </Button>
              </div>
            </Card>

            <Card className="max-h-64 m-2 gap-2">
              <CardHeader>
                <CardTitle>Active Staff</CardTitle>
                <CardDescription>
                  There are currently {shifts.length} staff online
                </CardDescription>
              </CardHeader>
              <hr className="my-3" />

              <CardContent className="overflow-auto max-w-92">
                {shifts.map((user: any, index: number) => (
                  <div
                    className="font-semibold flex items-center gap-2 hover:bg-neutral-800 rounded-sm px-2"
                    key={index}
                  >
                    <img
                      src={user?.avatarUrl ?? "/default-avatar.png"}
                      width={32}
                      alt={user?.username ?? "N/A"}
                      className="rounded-lg"
                    />
                    <div className="grid grid-rows-2">
                      <span className="text-lg text-neutral-200">
                        {user?.username ?? "N/A"}
                      </span>
                      <span className="text-sm text-neutral-400 flex flex-row gap-0.5">
                        {user?.shiftType ?? "Default"} •{" "}
                        <ShiftTimer
                          startTime={user?.shift?.startTime}
                          breaks={user?.shift?.breaks}
                        />
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {(!isMobile || Tab === "content") && (
          <div
            className={
              isMobile
                ? "flex-1 overflow-y-auto p-2 mb-20"
                : "flex-1 min-w-[300px] ml-2 mr-2 overflow-y-auto"
            }
          >
            <Content
              Server={server}
              Moderations={Moderations}
              setModerations={setModerations}
              session={session}
              selectedUser={selectedUser}
              setSelectedUser={setSelectedUser}
            />
          </div>
        )}

        {(!isMobile || Tab === "sidebar2") && (
          <div
            className={
              isMobile
                ? "flex-1 bg-neutral-900 overflow-y-auto p-4"
                : "flex-shrink basis-120 min-w-[220px] max-w-[400px] bg-neutral-900 border-l overflow-y-auto"
            }
          >
            <div
              className="content"
              style={{ filter: erlcServer ? "none" : "blur(0px)" }}
            >
              {!erlcServer && (
                <div className="absolute inset-0 z-10 flex items-center justify-center">
                  <Card>
                    <CardHeader className="sm:w-[10rem] md:w-[14rem] lg:w-[20rem]">
                      <CardTitle>ER:LC Module Not Setup</CardTitle>
                      <CardDescription>
                        Please configure the ER:LC module in your server
                        settings.
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Button variant={"blue"}>Setup ER:LC</Button>
                    </CardContent>
                  </Card>
                </div>
              )}
              {selectedUser ? (
                <div>
                  <Card className="max-h-80 m-2 gap-3">
                    <CardHeader>
                      <div className="flex flex-col items-center justify-center w-full">
                        <Image
                          src={"/unknown.webp"}
                          className="rounded-full"
                          alt={selectedUser?.username}
                          width={40}
                          height={40}
                        />
                        <CardTitle className="my-2">
                          {selectedUser?.username}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <hr />
                      <Accordion type="multiple">
                        <AccordionItem value="Roblox">
                          <AccordionTrigger>Roblox Info</AccordionTrigger>
                        </AccordionItem>
                        <AccordionItem value="ERLC">
                          <AccordionTrigger>ERLC Info</AccordionTrigger>
                        </AccordionItem>
                      </Accordion>
                    </CardContent>
                  </Card>
                </div>
              ) : null}

              <Card
                className="max-h-80 m-2 gap-3"
                style={{ filter: erlcServer ? "none" : "blur(6px)" }}
              >
                <CardHeader>
                  <CardTitle>Ingame Players</CardTitle>
                  <CardDescription>
                    There are currently {erlcPlayers?.length ?? 0} people ingame
                  </CardDescription>
                </CardHeader>
                <hr />
                <CardContent className="overflow-auto max-h-80">
                  {erlcPlayers && erlcPlayers.length > 0 ? (
                    erlcPlayers.map((user: any, index: number) => (
                      <div
                        className="font-semibold flex items-center gap-3 hover:bg-neutral-800 transition-all ease-in-out rounded-lg px-3 py-2 cursor-pointer"
                        key={index}
                      >
                        <img
                          src={user?.avatar ?? "/unknown.webp"}
                          width={32}
                          alt={user?.player ?? "Unknown"}
                          className="rounded-lg"
                        />
                        <div className="grid grid-cols-2">
                          <span className="text-lg text-neutral-200">
                            {user?.player?.split(":")[0] ?? "N/A"}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-8 h-8 ms-2 p-0"
                          >
                            <ShieldEllipsis className="w-5 h-5" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-neutral-400 flex justify-center items-center py-4">
                      <div className="flex flex-col items-center text-center gap-3">
                        <Frown width={48} height={48} />
                        No users found.
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card
                className="max-h-128 m-2 gap-3 overflow-auto"
                style={{ filter: erlcServer ? "none" : "blur(6px)" }}
              >
                <CardContent>
                  <Accordion type="single" collapsible>
                    <AccordionItem value="ServerInfo">
                      <AccordionTrigger>Server Info</AccordionTrigger>
                      <AccordionContent>
                        <Card>
                          <CardHeader className="flex items-center justify-between">
                            <div className="flex flex-col flex-1">
                              <CardTitle className="text-lg">
                                {erlcServer?.name ?? "No server"}
                              </CardTitle>
                              <span className="font-semibold mt-1">
                                Players:{" "}
                                <span className="font-light">
                                  {erlcServer?.currentPlayers ?? "0"}/
                                  {erlcServer?.maxPlayers ?? "40"}
                                </span>
                              </span>
                            </div>
                            <img
                              src={server?.guild?.serverIcon ?? "/unknown.webp"}
                              className="w-16 rounded-sm ms-4 flex-shrink-0"
                            />
                          </CardHeader>
                        </Card>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="Actions">
                      <AccordionTrigger>Actions</AccordionTrigger>
                      <AccordionContent>
                        <div className="grid gap-3">
                          <Button variant={"success"}>Run a command</Button>
                          <Button variant={"purple"}>Vehicle Check</Button>
                          <Button
                            variant={"blue"}
                            onClick={() => {
                              SetOpen(true);
                            }}
                          >
                            User Check
                          </Button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="CommandLogs">
                      <AccordionTrigger>Command Logs</AccordionTrigger>
                      <AccordionContent className="overflow-auto max-h-80">
                        {erlcCommands?.map((command: any, index: number) => (
                          <Card className="mb-2" key={index}>
                            <CardHeader>
                              <CardTitle>Command Ran</CardTitle>
                              <div className="py-2">
                                <span className="font-light">
                                  {command?.timestamp
                                    ? new Date(
                                        command.timestamp * 1000
                                      ).toLocaleString()
                                    : "Unknown Date"}{" "}
                                  |{" "}
                                  <span className="font-semibold">
                                    {command?.player?.split(":")[0] ?? "N/A"}
                                  </span>
                                  <span>
                                    {" "}
                                    ran "{command?.command ?? "N/A"}"
                                  </span>
                                </span>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="JoinLogs">
                      <AccordionTrigger>Join/Leave Logs</AccordionTrigger>
                      <AccordionContent>
                        {erlcJoins?.map((command: any, index: number) => (
                          <Card className="mb-2" key={index}>
                            <CardHeader>
                              <CardTitle>
                                User{" "}
                                {command?.join === true
                                  ? "Joined"
                                  : command?.join === false
                                  ? "Left"
                                  : "unknown"}
                              </CardTitle>
                              <div className="py-2">
                                {command?.timestamp
                                  ? new Date(
                                      command.timestamp * 1000
                                    ).toLocaleString()
                                  : "Unknown Date"}{" "}
                                |{" "}
                                <span className="font-semibold">
                                  {command?.player?.split(":")[0] ?? "N/A"}
                                </span>{" "}
                                <span>
                                  {command?.join === true
                                    ? "joined"
                                    : command?.join === false
                                    ? "left"
                                    : "unknown"}
                                </span>
                              </div>
                            </CardHeader>
                          </Card>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {isMobile && (
        <div className="fixed bottom-0 w-full h-20 bg-neutral-900 border-t rounded-t-md pt-2 px-2 py-2">
          <div className="flex h-full">
            {Tabs.map((item, index) => (
              <div
                key={index}
                className={`flex-1 flex items-center justify-center rounded-lg ${
                  Tab === item.tab ? "bg-neutral-800" : "hover:bg-neutral-950"
                }`}
              >
                <button
                  className="w-full h-full flex items-center justify-center"
                  onClick={() => setTab(item.tab)}
                >
                  {item.icon}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
