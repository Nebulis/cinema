import express from "express";
import { Episode } from "../models/episode";
import { Movie } from "../models/movie";
import { ISeason, Season } from "../models/season";
import { throwMe } from "./util";

export const router = express.Router();

// create season
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
      if (req.body.episodes) {
        season.episodes = req.body.episodes;
      }
      if (req.body.seen === false) {
        season.episodes.forEach(episode => (episode.seen = false));
      } else if (req.body.seen === true) {
        season.episodes.forEach(episode => (episode.seen = true));
      }
      return movie.save();
    })
    .then(movie => {
      res.json(movie);
    })
    .catch(next);
});

// delete season
router.delete("/:movieId/seasons/:seasonId", (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then(
      movie =>
        movie || throwMe(new Error(`Movie ${req.params.seasonId} not found`))
    )
    .then(movie => {
      movie.seasons.id(req.params.seasonId).remove();
      return movie.save();
    })
    .then(movie => {
      res.json(movie);
    })
    .catch(next);
});

// create episode
router.post("/:movieId/seasons/:seasonId/episodes", (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then(
      movie =>
        movie || throwMe(new Error(`Movie ${req.params.movieId} not found`))
    )
    .then(movie => {
      const season: ISeason = movie.seasons.id(req.params.seasonId);
      season.episodes.push(new Episode({}));
      return movie.save();
    })
    .then(movie => {
      res.json(movie);
    })
    .catch(next);
});

// update episode
router.put(
  "/:movieId/seasons/:seasonId/episodes/:episodeId",
  (req, res, next) => {
    Movie.findById(req.params.movieId)
      .then(
        movie =>
          movie || throwMe(new Error(`Movie ${req.params.seasonId} not found`))
      )
      .then(movie => {
        const season = movie.seasons.id(req.params.seasonId);
        const episode = season.episodes.id(req.params.episodeId);
        episode.title = req.body.title;
        episode.summary = req.body.summary;
        episode.seen = req.body.seen;
        return movie.save();
      })
      .then(movie => {
        res.json(movie);
      })
      .catch(next);
  }
);
