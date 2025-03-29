import { cookies } from "next/headers";
export async function getCookie(name) {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(name);
  return cookie;
}
