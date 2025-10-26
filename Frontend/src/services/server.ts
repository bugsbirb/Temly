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

export async function EditRole(
  serverId: string,
  memberId: string,
  role: string[]
) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BackendURL}/Servers/${serverId}/role/${memberId}/roles`, {
    credentials: "include",
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(role),
  });

  return response;
}
