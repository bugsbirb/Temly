import { Get } from "@/lib/backend";
import ServersClient from "./client";

export default async function ServersPage() {
  const servers = await Get("/Servers/mutual");
  const discordServers = await Get("/discord/servers");
  const requests = await Get("/Request/@me");

  return (
    <ServersClient
      servers={servers.ok ? servers.data : []}
      discordServers={discordServers.ok ? discordServers.data : []}
      requests={requests.ok ? requests.data : []}
    />
  );
}
