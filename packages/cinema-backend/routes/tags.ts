import express from "express";
import { Movie } from "../models/movie";
import { Tag } from "../models/tag";
import { throwMe } from "./util";

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

// update tag
router.put("/:id", (req, res, next) => {
  Tag.findById(req.params.id)
    .then(tag => tag || throwMe(new Error(`tag ${req.params.id} not found`)))
    .then(tag => {
      tag.color = req.body.color;
      tag.label = req.body.label;
      return tag.save();
    })
    .then(tag => {
      res.json(tag);
    })
    .catch(next);
});

// create tag
router.delete("/:id", (req, res, next) => {
  Movie.update(
    { tags: req.params.id },
    {
      $pull: { tags: req.params.id }
    },
    { multi: true }
  )
    .then(_ => {
      return Tag.findByIdAndDelete(req.params.id).exec();
    })
    .then(_ => {
      res.json(204);
    })
    .catch(next);
});
