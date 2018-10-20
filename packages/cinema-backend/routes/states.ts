import express from "express";

export const router = express.Router();

router.get("/", (_, res) => {
  res.json([
    {
      id: 1,
      label: "Initial"
    },
    {
      id: 2,
      label: "Téléchargement en cours"
    },
    {
      id: 3,
      label: "Téléchargement terminé"
    },
    {
      id: 4,
      label: "Gravé"
    },
    {
      id: 5,
      label: "En boite"
    }
  ]);
});
