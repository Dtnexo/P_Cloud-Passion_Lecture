import dotenv from "dotenv";
dotenv.config();
import { ConfidentialClientApplication } from "@azure/msal-node";
import express from "express";
import jwt from "jsonwebtoken";
import { privateKey } from "../auth/private_key.mjs";

const msalRouter = express.Router();

const useLocal = process.env.USE_LOCAL_AUTH === "true";

let cca;
if (!useLocal) {
  const required = [
    "AZURE_CLIENT_ID",
    "AZURE_TENANT_ID",
    "AZURE_CLIENT_SECRET",
  ];
  const missing = required.filter(
    (k) => !process.env[k] || process.env[k].trim() === ""
  );
  if (missing.length) {
    console.warn(
      "Missing env vars for Azure MSAL, switching to local mock mode:",
      missing.join(", ")
    );
    useLocal = true;
  } else {
    cca = new ConfidentialClientApplication({
      auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
      },
    });
  }
} else {
  console.info("MSAL: running in local mock mode (USE_LOCAL_AUTH=true)");
}

const redirectUri =
  process.env.AZURE_REDIRECT_URI ||
  "https://passion-lecture-backend.azurewebsites.net/api//api/msal/microsoft/redirect";

msalRouter.get("/microsoft/login", (req, res) => {
  cca
    .getAuthCodeUrl({ scopes: ["openid", "profile", "email"], redirectUri })
    .then((url) => res.redirect(url))
    .catch((err) => res.status(500).json({ error: err.message }));
});

msalRouter.get("/microsoft/redirect", async (req, res) => {
  try {
    const response = await cca.acquireTokenByCode({
      code: req.query.code,
      scopes: ["openid", "profile", "email"],
      redirectUri,
    });
    const account = response.account;
    // Créer un JWT local pour votre API (facultatif)
    const token = jwt.sign(
      { userId: account.homeAccountId, username: account.username },
      privateKey,
      { expiresIn: "24h" }
    );
    const frontendUrl = process.env.FRONTEND_URL;

    const redirectTo = `${frontendUrl}/msal-callback?token=${token}`;
    return res.redirect(redirectTo);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export { msalRouter };
