import { createHash, randomBytes } from "node:crypto";

const COOKIE_AGE = 600; // 10 menit, sama dengan masa berlaku authorization code GitHub

export default function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method tidak diizinkan" });
  }

  const { GITHUB_CLIENT_ID, CALLBACK_URL, GITHUB_CLIENT_SECRET, JWT_SECRET } =
    process.env;
  if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET || !CALLBACK_URL || !JWT_SECRET) {
    return res.status(500).json({ error: "Konfigurasi OAuth belum lengkap" });
  }

  let callback;
  try {
    callback = new URL(CALLBACK_URL);
    if (
      !["https:", "http:"].includes(callback.protocol) ||
      callback.pathname !== "/auth/callback"
    ) {
      throw new Error("Callback URL tidak valid");
    }
  } catch {
    return res.status(500).json({ error: "CALLBACK_URL tidak valid" });
  }

  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(32).toString("base64url");
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  const secure = callback.protocol === "https:" ? "; Secure" : "";
  const cookieOptions = `; HttpOnly; SameSite=Lax; Path=/auth/callback; Max-Age=${COOKIE_AGE}${secure}`;
  res.setHeader("Set-Cookie", [
    `oauth_state=${state}${cookieOptions}`,
    `oauth_verifier=${verifier}${cookieOptions}`,
  ]);

  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", GITHUB_CLIENT_ID);
  url.searchParams.set("redirect_uri", CALLBACK_URL);
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", challenge);
  url.searchParams.set("code_challenge_method", "S256");
  return res.redirect(302, url.toString());
}
