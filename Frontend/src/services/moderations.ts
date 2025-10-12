export async function loadMore(
  setModerations: React.Dispatch<React.SetStateAction<any[]>>,
  setPage: React.Dispatch<React.SetStateAction<number>>,
  setHasMore: React.Dispatch<React.SetStateAction<boolean>>,
  Server: any,
  page: number
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BackendURL}/Moderations/list/${Server.id}?pageNumber=${page}`,
      { credentials: "include" }
    );
    const data = await res.json();

    if (Array.isArray(data.items) && data.items.length > 0) {
      setModerations((prev) => {
        const newItems = data.items.filter(
          (item: { id: any }) =>
            !prev.some((prevItem) => prevItem.id === item.id)
        );
        return [...prev, ...newItems];
      });
      setPage(page + 1);
      if (data.items.length === 0 || data.items.length < 20) {
        setHasMore(false);
      }
    } else {
      setHasMore(false);
    }
  } catch (err) {
    console.error(err);
    setHasMore(false);
  }
}

export async function DeleteModeration(serverId: string, ModerationId: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BackendURL}/Moderations/${serverId}/delete/${ModerationId}`,
    { credentials: "include", method: "DELETE" }
  );

  return res;
}

export async function EditModeration(
  serverId: string,
  ModerationId: string,
  body: ModerationDTO
) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_BackendURL}/Moderations/${serverId}/edit/${ModerationId}`,
    {
      credentials: "include",
      method: "PUT",
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    }
  );
  return res;
}
