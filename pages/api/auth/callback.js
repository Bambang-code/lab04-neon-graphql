import { timingSafeEqual } from "node:crypto";
import { createSessionToken } from "../../../lib/auth";

function getCookie(req, name) {
  const cookie = req.headers.cookie
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return cookie?.slice(name.length + 1) ?? null;
}

function equalState(received, expected) {
  if (!received || !expected) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Referrer-Policy", "no-referrer");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method tidak diizinkan" });
  }

  const secure = process.env.CALLBACK_URL?.startsWith("https://")
    ? "; Secure"
    : "";
  res.setHeader("Set-Cookie", [
    `oauth_state=; HttpOnly; SameSite=Lax; Path=/auth/callback; Max-Age=0${secure}`,
    `oauth_verifier=; HttpOnly; SameSite=Lax; Path=/auth/callback; Max-Age=0${secure}`,
  ]);

  const { code, state, error } = req.query;
  if (
    typeof state !== "string" ||
    !equalState(state, getCookie(req, "oauth_state")) ||
    !getCookie(req, "oauth_verifier")
  ) {
    return res.status(400).json({ error: "OAuth state tidak valid. Ulangi login." });
  }
  if (error) {
    return res.status(400).json({ error: "Login GitHub dibatalkan atau ditolak" });
  }
  if (typeof code !== "string" || !code) {
    return res.status(400).json({ error: "Authorization code tidak tersedia" });
  }

  const { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, CALLBACK_URL, JWT_SECRET } =
    process.env;
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !CALLBACK_URL || !JWT_SECRET) {
    return res.status(500).json({ error: "Konfigurasi OAuth belum lengkap" });
  }

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: CALLBACK_URL,
        code_verifier: getCookie(req, "oauth_verifier"),
      }),
      signal: AbortSignal.timeout(10000),
    });
    if (!tokenRes.ok) throw new Error("GitHub token request failed");
    const tokenData = await tokenRes.json();
    if (!tokenData.access_token) {
      return res.status(401).json({ error: "GitHub menolak authorization code" });
    }

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${tokenData.access_token}`,
        "User-Agent": "lab07-web-service",
      },
      signal: AbortSignal.timeout(10000),
    });
    if (!userRes.ok) throw new Error("GitHub user request failed");
    const githubUser = await userRes.json();
    if (!Number.isInteger(githubUser.id) || !githubUser.login) {
      throw new Error("GitHub user profile invalid");
    }

    return res.status(200).json({
      token: createSessionToken(githubUser),
      tokenType: "Bearer",
      expiresIn: 3600,
      username: githubUser.login,
    });
  } catch (err) {
    console.error("OAuth callback gagal:", err.message);
    return res.status(502).json({ error: "Gagal memproses login GitHub" });
  }
}
