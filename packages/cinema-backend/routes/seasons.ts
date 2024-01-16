import express from "express";
import mongoose from "mongoose";
import { Episode } from "../models/episode";
import { Movie } from "../models/movie";
import { Season } from "../models/season";
import { throwMe } from "./util";

export const router = express.Router();

// create season
router.post("/:id/seasons", (req, res, next) => {
  Movie.findById(req.params.id)
    .then(
      movie => movie || throwMe(new Error(`Movie ${req.params.id} not found`))
    )
    .then(movie => {
      const season = new Season();
      movie.seasons.push(season);
      return movie.save().then(_ => res.json(season));
    })
    .catch(next);
});

// update season
router.put("/:movieId/seasons/:seasonId", (req, res, next) => {
  // if episodes is provided, update the array directly. Should only be used to update all episodes at once and is
  // currently used to reorder episodes
  if (req.body.episodes) {
    Movie.findById(req.params.movieId)
      .then(movie => {
        if (!movie) {
          throw new Error(`Movie ${req.params.seasonId} not found`);
        }
        const season = movie.seasons.id(req.params.seasonId);
        if (!season) {
          throw new Error(`Movie ${req.params.seasonId} not found`);
        }
        season.episodes = req.body.episodes;
        return season.save().then(_ => res.json(season));
      })
      .catch(next);
  } else {
    Movie.updateOne(
      {
        _id: req.params.movieId,
        "seasons._id": req.params.seasonId
      },
      {
        $set: {
          "seasons.$.productionYear": req.body.productionYear
        }
      }
    )
      .then(() =>
        Movie.findById(req.params.movieId).then(
          movie =>
            movie || throwMe(new Error(`Movie ${req.params.movieId} not found`))
        )
      )
      .then(movie => res.json(movie.seasons.id(req.params.seasonId)))
      .catch(next);
  }
});

// delete season
router.delete("/:movieId/seasons/:seasonId", (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then(movie => {
      if (!movie) {
        throw new Error(`Movie ${req.params.movieId} not found`);
      }
      const season = movie.seasons.id(req.params.seasonId);
      if (!season) {
        throw new Error(`Movie ${req.params.seasonId} not found`);
      }
      season.remove();
      return movie.save();
    })
    .then(_ => {
      res.sendStatus(204);
    })
    .catch(next);
});

// create episode
router.post("/:movieId/seasons/:seasonId/episodes", (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then(movie => {
      if (!movie) {
        throw new Error(`Movie ${req.params.movieId} not found`);
      }
      const episode = new Episode();
      const season = movie.seasons.id(req.params.seasonId);
      if (!season) {
        throw new Error(`Movie ${req.params.seasonId} not found`);
      }
      season.episodes.push(episode);
      return movie.save().then(_ => res.json(episode));
    })
    .catch(next);
});

// update episode
router.put(
  "/:movieId/seasons/:seasonId/episodes/:episodeId",
  (req, res, next) => {
    Movie.findOneAndUpdate(
      {
        _id: req.params.movieId
      },
      {
        $set: {
          "seasons.$[s].episodes.$[e].seen": req.body.seen,
          "seasons.$[s].episodes.$[e].summary": req.body.summary,
          "seasons.$[s].episodes.$[e].title": req.body.title
        }
      },
      {
        // @ts-ignore
        arrayFilters: [
          {
            // use ObjectId otherwise it doesn't work ....
            // @ts-ignore
            "e._id": new mongoose.Types.ObjectId(req.params.episodeId)
          },
          {
            // use ObjectId otherwise it doesn't work ....
            // @ts-ignore
            "s._id": new mongoose.Types.ObjectId(req.params.seasonId)
          }
        ]
      }
    )
      .then(() =>
        Movie.findById(req.params.movieId).then(movie => {
          if (!movie) {
            throw new Error(`Movie ${req.params.movieId} not found`);
          }
          const season = movie.seasons.id(req.params.seasonId);
          if (!season) {
            throw new Error(`Movie ${req.params.seasonId} not found`);
          }
          return res.json(season.episodes.id(req.params.episodeId));
        })
      )
      .catch(next);
  }
);

// delete episode
router.delete(
  "/:movieId/seasons/:seasonId/episodes/:episodeId",
  (req, res, next) => {
    Movie.findById(req.params.movieId)
      .then(movie => {
        if (!movie) {
          throw new Error(`Movie ${req.params.movieId} not found`);
        }
        const season = movie.seasons.id(req.params.seasonId);
        if (!season) {
          throw new Error(`Movie ${req.params.seasonId} not found`);
        }
        const episode = season.episodes.id(req.params.episodeId);
        if (!episode) {
          throw new Error(`Movie ${req.params.episodeId} not found`);
        }
        episode.remove();
        return movie.save();
      })
      .then(_ => {
        res.sendStatus(204);
      })
      .catch(next);
  }
);
