import express from "express";
import { Tag } from "../models/tag";

export const router = express.Router();

router.get("/", (_req, res, next) => {
  Tag.find()
    .then(tags => res.json(tags))
    .catch(next);
});

// create tag
router.post("/", (req, res, next) => {
  const tag = new Tag({
    _id: req.body.label,
    color: req.body.color,
    label: req.body.label
  });

  tag
    .save()
    .then(insertedTag => res.json(insertedTag))
    .catch(next);
});

// create tag
router.delete("/:id", (req, res, next) => {
  Tag.findByIdAndDelete(req.params.id)
    .then(_ => {
      res.json(204);
    })
    .catch(next);
});
