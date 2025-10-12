import { useEffect, useState } from "react";

type FetchResult<T> = {
  ok: boolean;
  data: T | null;
  error: string | null;
};

export function useModerationSearch(serverId: string, query: string) {
  const [results, setResults] = useState<FetchResult<any[]>>({
    ok: false,
    data: null,
    error: null,
  });
  const [loading, setLoading] = useState(false);

  console.log(serverId)
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (query.trim()) {
        setLoading(true);
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_BackendURL}/Moderations/autocomplete/moderations?query=${encodeURIComponent(
              query)}&serverId=${serverId}`,
            { credentials: "include" }
          );

          const text = await res.text();
          let parsed: any;
          try {
            parsed = JSON.parse(text);
          } catch {
            parsed = text;
          }

          if (!res.ok) {
            setResults({ ok: false, data: null, error: parsed });
          } else {
            setResults({ ok: true, data: parsed, error: null });
          }
        } catch (err: any) {
          setResults({ ok: false, data: null, error: err.message });
        } finally {
          setLoading(false);
        }
      } else {
        setResults({ ok: false, data: null, error: null });
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, serverId]);

  return { results, loading };
}
