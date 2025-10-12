import { Get, getSessionServerSide } from "@/lib/backend";
import { redirect } from "next/navigation";
import Modpanel from "./client";

export default async function Page({ params }: { params: { id: string } }) {
  const { id } = await params;

  const [serverRes, moderationsRes, activeShiftsRes, erlcRes, playersRes,joinRes, commandRes, killRes, session] = await Promise.all([
    Get(`/Servers/${id}`),
    Get(`/Moderations/list/${id}?pageNumber=1&pageSize=20`),
    Get(`/Shift/ActiveShift?serverId=${id}`),
    Get(`/Erlc/server/${id}`),
    Get(`/Erlc/server/${id}/players`),
    Get(`/Erlc/server/${id}/joins`),
    Get(`/Erlc/server/${id}/commands`),
    Get(`/Erlc/server/${id}/kills`),
    getSessionServerSide(),
  ]);

  if (!serverRes.ok || !serverRes.data || !session) {
    redirect("/");
  }
  const ErlcServer =
    erlcRes.ok && erlcRes.data !== "ERLC server not found."
      ? erlcRes.data
      : null;

  return (
    <div>
      <Modpanel
        server={serverRes.data}
        moderations={moderationsRes.ok ? moderationsRes.data : []}
        session={session}
        activeShifts={activeShiftsRes.ok ? activeShiftsRes.data : []}
        erlcPlayers={playersRes.ok ? playersRes.data : []}
        erlcServer={ErlcServer}
        erlcCommands={commandRes.ok ? commandRes.data : []}
        erlcJoins={joinRes.ok ? joinRes.data : []}
        erlcKills={killRes.ok ? joinRes.data: []}
      />
    </div>
  );
}
