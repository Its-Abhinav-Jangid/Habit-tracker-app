import { getCookie } from "./getCookie";

export async function getAuthCookies() {
  const authCookiesName = ["__session", "__client_uat", "__clerk_db_jwt"];
  let cookies = [];

  for (let i = 0; i < authCookiesName.length; i++) {
    const cookie = await getCookie(authCookiesName[i]);
    cookies.push(`${cookie.name}=${cookie.value}`);
  }

  cookies = cookies.join("; ");
  return cookies;
}
