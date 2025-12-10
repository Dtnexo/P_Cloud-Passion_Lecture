import { Sequelize, DataTypes } from "sequelize";
import { OuvrageModel } from "../models/ouvrage.mjs";
import { ouvrages } from "./mock-ouvrages.mjs";
import { users } from "./mock-users.mjs";
import { UserModel } from "../models/User.mjs";
import { categories } from "./mock-categorie.mjs";
import { CategorieModel } from "../models/Categorie.mjs";
import { EcrivainModel } from "../models/ecrivain.mjs";
import { ecrivains } from "./mock-ecrivain.mjs";
import { evaluations } from "./mock-evaluer.mjs";
import { EvaluationModel } from "../models/evaluer.mjs";
import dotenv from "dotenv";
dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    dialect: "mysql",
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    },
  }
);
const Ouvrage = OuvrageModel(sequelize, DataTypes);
const User = UserModel(sequelize, DataTypes);
const Categorie = CategorieModel(sequelize, DataTypes);
const Ecrivain = EcrivainModel(sequelize, DataTypes);
const Evaluer = EvaluationModel(sequelize, DataTypes);
let initDb = () => {
  const isProduction = process.env.NODE_ENV === "production";
  return sequelize.sync({ force: !isProduction }).then((_) => {
    User.count().then((count) => {
      if (count === 0) {
        importOuvrages();
        importUser();
        importCategorie();
        importEcrivain();
        importEvaluer();
        console.log("Les données initiales ont été importées.");
      } else {
        console.log(
          "La base de données contient déjà des données, aucun import nécessaire."
        );
      }
    });
    console.log(
      "La base de données db_gestionnaireLivre a bien été synchronisée"
    );
  });
};

const importOuvrages = () => {
  ouvrages.map((ouvrage) => {
    Ouvrage.create({
      titre: ouvrage.titre,
      nb_pages: ouvrage.nb_pages,
      extrait: ouvrage.extrait,
      categorie_fk: ouvrage.categorie_fk,
      resume: ouvrage.resume,
      annee_edition: ouvrage.annee_edition,
      image: ouvrage.image,
      nom_editeur: ouvrage.nom_editeur,
      user_fk: ouvrage.user_fk,
      ecrivain_fk: ouvrage.ecrivain_fk,
    }).then((ouvrage) => console.log(ouvrage.toJSON()));
  });
};

const importUser = () => {
  users.map((user) => {
    User.create({
      id: user.id,
      pseudo: user.pseudo,
      mdp: user.mdp,
      admin: user.admin,
    }).then((user) => console.log(user.toJSON()));
  });
};

const importEcrivain = () => {
  ecrivains.map((ecrivain) => {
    Ecrivain.create({
      ecrivain_id: ecrivain.id,
      nom: ecrivain.nom,
      prenom: ecrivain.prenom,
    }).then((ecrivain) => console.log(ecrivain.toJSON()));
  });
};

const importCategorie = () => {
  categories.map((categorie) => {
    Categorie.create({
      categorie_id: categorie.categorie_id,
      nom: categorie.nom,
    }).then((categorie) => console.log(categorie.toJSON()));
  });
};

const importEvaluer = () => {
  evaluations.map((evaluation) => {
    Evaluer.create({
      evaluation_id: evaluation.evaluation_id,
      ouvrage_fk: evaluation.ouvrage_fk,
      user_fk: evaluation.user_fk,
      commentaire: evaluation.commentaire,
      note: evaluation.note,
    }).then((categorie) => console.log(categorie.toJSON()));
  });
};

export { sequelize, initDb, Ouvrage, User, Categorie, Ecrivain, Evaluer };
