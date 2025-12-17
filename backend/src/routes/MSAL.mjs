import dotenv from "dotenv";
dotenv.config();
import { ConfidentialClientApplication } from "@azure/msal-node";
import express from "express";
import jwt from "jsonwebtoken";
import { privateKey } from "../auth/private_key.mjs";

const msalRouter = express.Router();

const useLocal = process.env.USE_LOCAL_AUTH === "true";

let cca;

function initMsal() {
  const missing = [
    "AZURE_CLIENT_ID",
    "AZURE_TENANT_ID",
    "AZURE_CLIENT_SECRET",
  ].filter((k) => !process.env[k]);

  if (useLocal) {
    console.log(
      "MSAL: Explicitly running in local mock mode (USE_LOCAL_AUTH=true)"
    );
    return null;
  }

  if (missing.length > 0) {
    console.error(
      "MSAL: Missing environment variables for real Azure auth:",
      missing.join(", ")
    );
    return null;
  }

  try {
    return new ConfidentialClientApplication({
      auth: {
        clientId: process.env.AZURE_CLIENT_ID,
        authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
      },
    });
  } catch (error) {
    console.error("MSAL initialization failed:", error);
    return null;
  }
}

cca = initMsal();

const redirectUri =
  process.env.AZURE_REDIRECT_URI ||
  "http://localhost:3000/api/msal/microsoft/redirect";

msalRouter.get("/microsoft/login", (req, res) => {
  if (!cca) {
    // Try one last time to init just in case env vars were lazy loaded
    cca = initMsal();
  }

  if (!cca) {
    const isMock = process.env.USE_LOCAL_AUTH === "true";
    const statusMsg = isMock
      ? "USE_LOCAL_AUTH is set to true."
      : "Missing AZURE environment variables.";

    return res.status(500).json({
      error: `MSAL configuration invalid. ${statusMsg} Check server console/logs.`,
    });
  }

  console.log("MSAL: Using redirectUri:", redirectUri);
  cca
    .getAuthCodeUrl({
      scopes: ["openid", "profile", "email"],
      redirectUri,
      prompt: "select_account",
    })
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
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    console.log("loris");

    const redirectTo = `${frontendUrl}/msal-callback?token=${token}`;
    return res.redirect(redirectTo);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export { msalRouter };
