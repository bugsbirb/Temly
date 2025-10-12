import React, { useState, useEffect } from "react";

export function useErlcComplete(key: string) {
  const [server, setServer] = useState<any>(null);
  console.log(server)

  useEffect(() => {
    if (key == null || key == "") {
      setServer(null);
      return;
    }
    const timeout = setTimeout(() => {
      fetch(`${process.env.NEXT_PUBLIC_BackendURL}/check`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(key),
      })
        .then((res) => res.json())
        .then((data) => setServer(data))
        .catch(() => setServer(null));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [key]);

  return [server, setServer];
}
