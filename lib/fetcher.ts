export async function authFetcher<T = unknown>(url: string): Promise<T> {
  const res = await fetch(url);
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    throw new Error(`Fetch error: ${res.status}`);
  }
  return res.json() as Promise<T>;
}
