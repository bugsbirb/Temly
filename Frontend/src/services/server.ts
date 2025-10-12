export async function createServer(values: CreateServerDTO) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BackendURL}/Servers/create`,
    {
      credentials: "include",
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    }
  );
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

export async function RequestServer(serverCode: ServerCodeDTO) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BackendURL}/Request/${serverCode}`,
    { credentials: "include", method: "POST" }
  );
  if (!response.ok) throw new Error(await response.text());
  return response.text();
}