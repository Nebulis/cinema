var express = require("express");
var router = express.Router();

/*
 * GET
 */
router.get("/", function(req, res) {
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

module.exports = router;
