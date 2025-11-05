import dotenv from "dotenv";
dotenv.config();
import { ConfidentialClientApplication } from "@azure/msal-node";
import express from "express";
import jwt from "jsonwebtoken";
import { privateKey } from "../auth/private_key.mjs";

const msalRouter = express.Router();

const cca = new ConfidentialClientApplication({ 
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  },
});

// Redirect URI registered in Azure AD (must point to this backend callback).
// Par défaut on utilise l'endpoint backend monté sur le port 3000.
const redirectUri = process.env.AZURE_REDIRECT_URI || "http://localhost:3000/api/msal/microsoft/redirect"; // ex: http://localhost:3000/api/msal/microsoft/redirect

msalRouter.get("/microsoft/login", (req, res) => {
  cca.getAuthCodeUrl({ scopes: ["openid","profile","email"], redirectUri })
    .then((url) => res.redirect(url))
    .catch((err) => res.status(500).json({ error: err.message }));
});

msalRouter.get("/microsoft/redirect", async (req, res) => {
  try {
    const response = await cca.acquireTokenByCode({
      code: req.query.code,
      scopes: ["openid","profile","email"],
      redirectUri,
    });
    const account = response.account;
    // Créer un JWT local pour votre API (facultatif)
    const token = jwt.sign({ userId: account.homeAccountId, username: account.username }, privateKey, { expiresIn: "24h" });
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
   
    const redirectTo = `${frontendUrl}/msal-callback?token=${token}`;
    return res.redirect(redirectTo);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

export {msalRouter};