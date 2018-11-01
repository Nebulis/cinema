import express from "express";
import { Movie } from "../models/movie";
import { Season } from "../models/season";
import { throwMe } from "./util";

export const router = express.Router();

// create movie
router.post("/:id/seasons", (req, res, next) => {
  Movie.findById(req.params.id)
    .then(
      movie => movie || throwMe(new Error(`Movie ${req.params.id} not found`))
    )
    .then(movie => {
      movie.seasons.push(new Season({}));
      return movie.save();
    })
    .then(movie => {
      res.json(movie);
    })
    .catch(next);
});

// update season
router.put("/:movieId/seasons/:seasonId", (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then(
      movie =>
        movie || throwMe(new Error(`Movie ${req.params.seasonId} not found`))
    )
    .then(movie => {
      const season = movie.seasons.id(req.params.seasonId);
      season.productionYear = req.body.productionYear;
      return movie.save();
    })
    .then(movie => {
      res.json(movie);
    })
    .catch(next);
});
