import express from "express";
export const router = express.Router();

/* GET home page. */

router.get("/", (_, res) => {
  res.json({
    title: "Express"
  });
});
