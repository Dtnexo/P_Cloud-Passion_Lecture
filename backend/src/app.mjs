import express from "express";
import cors from "cors";
import { auth } from "./auth/auth.mjs";
import swaggerUi from "swagger-ui-express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import dotenv from "dotenv";
dotenv.config();

import session from "express-session";
import flash from "connect-flash";
import cookie from "cookie-parser";

// Imports MSAL Auth
import {
  msalAuthMiddleware,
  bindOidcToSession,
  exposeAuthState,
} from "./auth/MSAL.mjs";

const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const app = express();
// Recréer __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const port = process.env.PORT || 3000;

app.use(cors(corsOptions));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookie());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "secret_dev_key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 8 },
  })
);

app.use(flash());

// Microsoft Auth Middleware
app.use(msalAuthMiddleware);

// Helpers & Bridge Middlewares
app.use(bindOidcToSession);
app.use(exposeAuthState);

app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "public/images"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "Aucun fichier téléchargé." });
  }

  res.json({ filePath: `/images/${req.file.filename}` });
});

app.use("/images", express.static(path.join(__dirname, "public/images")));

// --- Importation des Routes API ---
import { loginRouter } from "./routes/login.mjs";
app.use("/api/login", loginRouter);

import { booksRouter } from "./routes/books.mjs";
app.use("/api/books", booksRouter);

import { userRouter } from "./routes/users.mjs";
app.use("/api/users", auth, userRouter);

import { msalRouter } from "./routes/MSAL.mjs";
app.use("/api/msal", msalRouter);

import { categoriesRouter } from "./routes/categories.mjs";
app.use("/api/categories", categoriesRouter);

import { authorsRouter } from "./routes/authors.mjs";
app.use("/api/authors", authorsRouter);

import { evaluerRouter } from "./routes/evaluer.mjs";
app.use("/api/evaluations", auth, evaluerRouter);

import { swaggerSpec } from "./swagger.mjs";
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, { explorer: true })
);

import { sequelize, initDb } from "./db/sequelize.mjs";

app.listen(port, () => {
  console.log(`Le serveur a démarré et écoute sur le port : ${port}`);

  sequelize
    .authenticate()
    .then((_) => {
      console.log("La connexion à la base de données a bien été établie");
      initDb();
    })
    .catch((error) =>
      console.error("Impossible de se connecter à la DB", error)
    );
});
app.get("*", (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ message: "Ressource API introuvable" });
  }
  res.status(404).send("Page introuvable (Backend running).");
});

// bindOidcToSession moved to top

// subToInt moved to top
