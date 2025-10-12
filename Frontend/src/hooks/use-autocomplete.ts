import React from "react";

export function useUserAutocomplete(query: string) {
  const [users, setUsers] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (!query) {
      setUsers([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetch(
        `${process.env.NEXT_PUBLIC_BackendURL}/autocomplete/user?query=${encodeURIComponent(
          query
        )}`,
        { credentials: "include" }
      )
        .then((res) => res.json())
        .then((data) => setUsers(data.searchResults?.[0]?.contents ?? []))
        .catch(() => setUsers([]));
    }, 100);

    return () => clearTimeout(timeout);
  }, [query]);

  return [users, setUsers] as const;
}
