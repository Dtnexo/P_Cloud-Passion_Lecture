import dotenv from "dotenv";
dotenv.config();
import { ConfidentialClientApplication } from "@azure/msal-node";
import express from "express";
import jwt from "jsonwebtoken";
import { privateKey } from "../auth/private_key.mjs";
import { User } from "../db/sequelize.mjs";

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

const redirectUri = process.env.AZURE_REDIRECT_URI;
console.log("MSAL: Using redirectUri:", redirectUri);

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
    const email = account.username || account.idTokenClaims?.email;
    const name = account.name || email.split("@")[0];

    // Find or Create user in local DB to get an Integer ID
    const [user, created] = await User.findOrCreate({
      where: { pseudo: name },
      defaults: {
        mdp: "MSAL_AUTH_LINKED_ACCOUNT",
        admin: false,
        date_entre: new Date(),
      },
    });

    // Créer un JWT local pour votre API avec l'ID entier de la DB
    const token = jwt.sign(
      { userId: user.id, username: user.pseudo, admin: user.admin },
      privateKey,
      { expiresIn: "24h" }
    );
    const frontendUrl = process.env.FRONTEND_URL;
    console.log("MSAL: Login success for", user.pseudo, "ID:", user.id);

    const redirectTo = `${frontendUrl}/msal-callback?token=${token}`;
    return res.redirect(redirectTo);
  } catch (err) {
    console.error("MSAL Redirect Error:", err);
    return res.status(500).json({ error: err.message });
  }
});

export { msalRouter };
