"use client";

import Discord from "@/components/dashboard/pages/Discord";
import ERLC from "@/components/dashboard/pages/Erlc";
import Members from "@/components/dashboard/pages/Members";
import Moderations from "@/components/dashboard/pages/Moderations";
import Overview from "@/components/dashboard/pages/Overview";
import Roles from "@/components/dashboard/pages/Roles";
import Shifts from "@/components/dashboard/pages/Shifts";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Kbd } from "@/components/ui/kbd";
import { User } from "@/models/user";
import { SearchIcon } from "lucide-react";

export default function Dashboard({
  server,
  page,
  servers,
  session,
  request,
  discord,
  erlc,
}: {
  server: any;
  page: string;
  servers: any;
  session: User;
  request: any;
  discord: any;
  erlc: any;
}) {
  const pages: Record<string, React.ReactElement> = {
    overview: <Overview server={server} servers={servers} session={session} />,
    shifts: <Shifts server={server} servers={servers} session={session} />,
    moderations: (
      <Moderations server={server} servers={servers} session={session} />
    ),
    discord: (
      <Discord
        server={server}
        servers={servers}
        session={session}
        discordServers={discord}
      />
    ),

    erlc: (
      <ERLC
        server={server}
        servers={servers}
        session={session}
        erlcServer={erlc}
      />
    ),

    members: (
      <Members
        server={server}
        servers={servers}
        session={session}
        requests={request}
      />
    ),
    roles: <Roles server={server} servers={servers} session={session} />,
  };

  return (
    pages[page] || (
      <div className="h-screen">
        <Empty>
          <EmptyHeader>
            <EmptyTitle>404 - Not Found</EmptyTitle>
            <EmptyDescription>
              The page you&apos;re looking for doesn&apos;t exist. Try searching
              for what you need below.
            </EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <InputGroup className="sm:w-3/4">
              <InputGroupInput placeholder="Try searching for pages..." />
              <InputGroupAddon>
                <SearchIcon />
              </InputGroupAddon>
              <InputGroupAddon align="inline-end">
                <Kbd>/</Kbd>
              </InputGroupAddon>
            </InputGroup>
            <EmptyDescription>
              Need help? <a href="#">Contact support</a>
            </EmptyDescription>
          </EmptyContent>
        </Empty>
      </div>
    )
  );
}
