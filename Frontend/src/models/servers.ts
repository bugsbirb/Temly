interface Server {
  id: string;
  name: string;
  isDashboardUser?: boolean;
  isModpanelUser?: boolean;
  guild?: {
    serverIcon?: string;
    name?: string;
  };
}

interface Request {
  server: {
    name: string;
  };
  request: {
    status: number;
    Created: string;
  };
}

interface ProfileProps {
  servers: Server[];
  discordServers: any[];
  requests: Request[];
}

type CreateServerDTO = {
  name: string;
  apiKey: string;
  discordServer: string;
};

type ServerCodeDTO = {
  serverCode: string;
};
