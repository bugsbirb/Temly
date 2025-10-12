import React from "react";

export function useLoadScroll(ref: React.RefObject<HTMLDivElement>, loadMore: () => void, hasMore: boolean, loading: boolean) {
  React.useEffect(() => {
    const container = ref.current;
    if (!container) return;

    const handleScroll = () => {
      if (
        container.scrollTop + container.clientHeight >=
        container.scrollHeight - 50
      ) {
        if (!loading && hasMore) {
          loadMore();
        }
      }
    };
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [ref, loadMore, hasMore, loading]);
}
