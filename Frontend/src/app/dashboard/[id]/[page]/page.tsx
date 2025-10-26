import { redirect } from "next/navigation";
import Dashboard from "../../Dashboard";
import { Get, getSessionServerSide } from "@/lib/backend";


export default async function DashboardPage({
  params,
}: {
  params: { id: string; page: string };
}) {
  const { id, page } = await params;


  const [discordRes, requestsRes, ErlcRes, serverRes, mutualRes,  session] = await Promise.all([
    page === "discord" ? Get(`/discord/servers`) : Promise.resolve({ ok: false, data: null }),
    page === "members" ? Get(`/Request/${id}/all`) : Promise.resolve({ ok: false, data: null }),
    page === "erlc" ? Get(`/Erlc/server/${id}`) : Promise.resolve(null),
    Get(`/Servers/${id}`),
    Get("/Servers/mutual"),
    getSessionServerSide(),
  ]);
  if (!serverRes.ok || !serverRes.data || !session) {
    redirect("/");
  }

  return (
    <Dashboard
      server={serverRes.data}
      page={page}
      servers={mutualRes.ok ? mutualRes.data : []}
      session={session}
      request={requestsRes.ok ? requestsRes.data : []}
      discord={discordRes.ok ? discordRes.data : []}
      erlc = {ErlcRes}
    />
  );
}
