import eoc from "express-openid-connect";
import crypto from "crypto";
import dotenv from "dotenv";

dotenv.config();

const { auth: oidcAuth, requiresAuth } = eoc;

export const msalConfig = {
  authRequired: false,
  issuerBaseURL: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0`,
  baseURL: process.env.BASE_URL || "http://localhost:3000",
  clientID: process.env.AZURE_CLIENT_ID,
  clientSecret: process.env.AZURE_CLIENT_SECRET,
  secret:
    process.env.SESSION_SECRET ||
    "une_chaine_secrete_tres_longue_et_aleatoire_pour_le_dev_12345",
  idpLogout: true,
  authorizationParams: {
    scope: "openid profile email",
    response_type: "code",
  },
  routes: {
    login: "/ms-login",
    logout: "/ms-logout",
    callback: "/callback",
  },
};

export const msalAuthMiddleware = oidcAuth(msalConfig);

// Helper to convert OIDC sub to integer
function subToInt(sub) {
  const hex = crypto
    .createHash("sha1")
    .update(String(sub))
    .digest("hex")
    .slice(0, 8);
  const asInt = parseInt(hex, 16);
  return asInt % 2147483647 || 1;
}

// Middleware to bind OIDC user to session
export function bindOidcToSession(req, _res, next) {
  if (req.oidc && req.oidc.isAuthenticated() && req.oidc.user) {
    const u = req.oidc.user;
    const numericId = subToInt(u.sub);
    req.session.user = {
      user_id: numericId,
      username: u.name || u.preferred_username || u.email || "User",
      email: u.email || u.preferred_username || null,
      oidc_sub: u.sub,
    };
  }
  next();
}

// Middleware to expose auth state to views
export function exposeAuthState(req, res, next) {
  res.locals.isAuthenticated = !!(req.oidc && req.oidc.isAuthenticated());
  res.locals.sessionUser = req.session?.user || null;
  next();
}

export { requiresAuth };
