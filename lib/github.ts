export type GitHubProfile = { name?: string; bio?: string; website?: string; url: string };

export type GitHubLookup =
  | { ok: true; profile: GitHubProfile }
  | { ok: false; reason: "not-found" | "unavailable" | "network" };

/** Profil public GitHub (sans authentification : 60 requêtes / heure / IP). */
export async function fetchGitHubProfile(username: string): Promise<GitHubLookup> {
  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`);
    if (res.status === 404) return { ok: false, reason: "not-found" };
    if (!res.ok) return { ok: false, reason: "unavailable" };
    const user: { name?: string | null; bio?: string | null; blog?: string | null; html_url: string } = await res.json();
    const blog = user.blog?.trim();
    return {
      ok: true,
      profile: {
        name: user.name?.trim() || undefined,
        bio: user.bio?.trim() || undefined,
        website: blog ? (/^https?:\/\//.test(blog) ? blog : `https://${blog}`) : undefined,
        url: user.html_url,
      },
    };
  } catch {
    return { ok: false, reason: "network" };
  }
}
