import express from "express";
import mongoose from "mongoose";
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
      const season = new Season();
      movie.seasons.push(season);
      return movie.save().then(_ => res.json(season));
    })
    .catch(next);
});

// update season
router.put("/:movieId/seasons/:seasonId", (req, res, next) => {
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
});

// delete season
router.delete("/:movieId/seasons/:seasonId", (req, res, next) => {
  Movie.findById(req.params.movieId)
    .then(
      movie =>
        movie || throwMe(new Error(`Movie ${req.params.movieId} not found`))
    )
    .then(movie => {
      movie.seasons.id(req.params.seasonId).remove();
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
    .then(
      movie =>
        movie || throwMe(new Error(`Movie ${req.params.movieId} not found`))
    )
    .then(movie => {
      const episode = new Episode();
      const season: ISeason = movie.seasons.id(req.params.seasonId);
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
            "e._id": mongoose.Types.ObjectId(req.params.episodeId)
          },
          {
            // use ObjectId otherwise it doesn't work ....
            "s._id": mongoose.Types.ObjectId(req.params.seasonId)
          }
        ]
      }
    )
      .then(() =>
        Movie.findById(req.params.movieId)
          .then(
            movie =>
              movie ||
              throwMe(new Error(`Movie ${req.params.movieId} not found`))
          )
          .then(movie =>
            res.json(
              movie.seasons
                .id(req.params.seasonId)
                .episodes.id(req.params.episodeId)
            )
          )
      )
      .catch(next);
  }
);

// delete episode
router.delete(
  "/:movieId/seasons/:seasonId/episodes/:episodeId",
  (req, res, next) => {
    Movie.findById(req.params.movieId)
      .then(
        movie =>
          movie || throwMe(new Error(`Movie ${req.params.seasonId} not found`))
      )
      .then(movie => {
        movie.seasons
          .id(req.params.seasonId)
          .episodes.id(req.params.episodeId)
          .remove();
        return movie.save();
      })
      .then(_ => {
        res.sendStatus(204);
      })
      .catch(next);
  }
);
