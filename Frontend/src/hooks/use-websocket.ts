import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { toast } from "sonner";

export function useSignalR(serverId: string) {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_BackendURL}/hub`, {
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    conn
      .start()
      .then(() => {
        conn.invoke("JoinGroup", serverId);
        setConnected(true);
        toast.success("Websocket Connected");
      })
      .catch((err) => {
        toast.error("[signalR] Failed to connect, contact support.", err);
      });

    setConnection(conn);
    return () => {
      conn.stop();
      setConnected(false);
    };
  }, [serverId]);

  return { connection, connected };
}
