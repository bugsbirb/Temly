import { cookies } from "next/headers";
import { User } from "@/models/user";
export async function Get(
  url: string,
  options?: {
    body?: any;
    headers?: Record<string, string>;
    method?: string;
    cache?: RequestCache;
  }
) {
  const cookieStore = cookies();
  const allCookies = (await cookieStore).getAll();
  const cookieHeader = allCookies.map((c) => `${c.name}=${c.value}`).join("; ");

  const fetchOptions: RequestInit = {
    credentials: "include",
    cache: options?.cache ?? "no-store",
    method: options?.method ?? "GET",
    headers: {
      Cookie: cookieHeader,
      ...(options?.headers || {}),
    } as Record<string, string>,
  };

  if (options?.body) {
    fetchOptions.body =
      typeof options.body === "string"
        ? options.body
        : JSON.stringify(options.body);
    if (
      typeof fetchOptions.headers === "object" &&
      !("Content-Type" in fetchOptions.headers)
    ) {
      (fetchOptions.headers as Record<string, string>)["Content-Type"] =
        "application/json";
    }
  }
  // console.log(
  //   `[Request] ${process.env.NEXT_PUBLIC_BackendURL}${url} - ${cookieHeader}`
  // );

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BackendURL}${url}`, fetchOptions);
    if (!res.ok) {
      return { ok: false, data: null, error: await res.text() };
    }
    return { ok: true, data: await res.json() };
  } catch (err: any) {
    return { ok: false, data: null, error: err.message };
  }
}

export async function getSessionServerSide() {
  const cookieStore = await cookies();
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BackendURL}/auth/session/@me`,
    {
      credentials: "include",
      headers: {
        Accept: "application/json",
        Cookie: cookieStore
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join("; "),
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data as User;
}
