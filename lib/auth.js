import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

const JWT_ISSUER = "lab07-web-service";
const JWT_AUDIENCE = "graphql-api";

export function createSessionToken(githubUser) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET belum dikonfigurasi");
  }

  return jwt.sign(
    { username: githubUser.login },
    process.env.JWT_SECRET,
    {
      algorithm: "HS256",
      subject: String(githubUser.id),
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
      expiresIn: "1h",
    },
  );
}

export function getAuthUser(req) {
  const header = req.headers.authorization;
  const match = typeof header === "string" && /^Bearer ([^\s]+)$/i.exec(header);
  if (!match || !process.env.JWT_SECRET) {
    return null;
  }

  try {
    const user = jwt.verify(match[1], process.env.JWT_SECRET, {
      algorithms: ["HS256"],
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    return user && typeof user === "object" && user.sub && user.username
      ? user
      : null;
  } catch {
    return null;
  }
}

export function requireAuth(context) {
  if (!context.user) {
    throw new GraphQLError("Unauthorized: silakan login terlebih dahulu", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }
}
