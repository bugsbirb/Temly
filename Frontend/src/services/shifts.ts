import { toast } from "sonner";

export async function StartShift(serverId: string, shiftType: string) {
  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_BackendURL}/Shift/Start?shiftType=${shiftType}`,
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(serverId),
      headers: { "Content-Type": "application/json" },
    }
  );

  const text = await resp.text();
  if (!resp.ok) {
    toast.error(text);
    return text;
  }
  toast.success("Shift started succesfully.")

  return text;
}

export async function EndShift(serverId: string) {
  const resp = await fetch(`${process.env.NEXT_PUBLIC_BackendURL}/Shift/End`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(serverId),
    headers: { "Content-Type": "application/json" },
  });

  const text = await resp.text();
  if (!resp.ok) {
    toast.error(text);
    return text;
  }
  toast.success("Shift ended successfully.");

  return text;
}

export async function StartShiftBreak(serverId: string) {
  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_BackendURL}/Shift/StartBreak`,
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(serverId),
      headers: { "Content-Type": "application/json" },
    }
  );
  const text = await resp.text();
  if (!resp.ok) {
    toast.error(text);
    return text;
  }
  toast.success("Break started successfully.");

  return text;
}

export async function EndShiftBreak(serverId: string) {
  const resp = await fetch(
    `${process.env.NEXT_PUBLIC_BackendURL}/Shift/StopBreak`,
    {
      method: "POST",
      credentials: "include",
      body: JSON.stringify(serverId),
      headers: { "Content-Type": "application/json" },
    }
  );
  const text = await resp.text();
  if (!resp.ok) {
    toast.error(text);
    return text;
  }
  toast.success("Break ended successfully.");

  return text;
}
