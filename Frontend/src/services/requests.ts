  async function RequestAction(id: string, requestId: string, status: string) {
    try {
      const method = status === "accept" ? "PUT" : "DELETE";
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_BackendURL}/Request/${id}/${requestId}/${status}`,
        { method, credentials: "include" }
      );
      if (!resp.ok) throw new Error(await resp.text());

      return resp.text();
    } catch (error) {}
  }

  