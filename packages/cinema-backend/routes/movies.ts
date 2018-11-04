import express from "express";
import identity from "lodash/identity";
import { DocumentQuery } from "mongoose";
import { logger } from "../logger";
import { Movie } from "../models/movie";
import { throwMe } from "./util";

export const router = express.Router();

interface IListQueryParams {
  title: string;
  genres: string; // ; separated genres
  notGenres: string; // ; separated genres
  types: string; // ; separated types
  seen: string; // merge with seen and transform to boolean
  netflix: string; // merge with netflix and transform to boolean
  productionYear: string;
  limit?: string;
  offset?: string;
}
const buildQuery = ({
  title,
  netflix,
  productionYear,
  seen,
  notGenres,
  genres,
  types
}: IListQueryParams) => {
  let query: DocumentQuery<any[], any>; // fixme

  const titleFilter = title
    ? // escape regex special chars to be able to search them
      {
        title: {
          $options: "i",
          $regex: (title || "").replace(/[()]/g, "\\$&")
        }
      }
    : {};
  query = Movie.find({
    ...titleFilter
  });
  if (netflix !== null && netflix !== undefined) {
    query = query.and([{ netflix: !!netflix }]);
  }
  if (productionYear) {
    query = query.and([{ productionYear }]);
  }
  if (seen !== null && seen !== undefined) {
    // todo => handle seen for tv shows
    query = query.and([{ seen: !!seen }]);
  }

  if (genres) {
    query = query.and([{ $or: genres.split(",").map(genre => ({ genre })) }]);
  }

  if (notGenres) {
    // make sure that none of the unwanted genres is matched
    notGenres
      .split(",")
      .map(genre => (query = query.and([{ genre: { $ne: genre } }])));
  }

  if (types) {
    query = query.and([{ $or: types.split(",").map(type => ({ type })) }]);
  }
  return query;
};

router.get("/", (req, res, next) => {
  const { limit = "20", offset = "0" }: IListQueryParams = req.query;
  // mongo treat limit = 0 as no limit
  const returnNoResult = limit === "0";
  Promise.all([
    buildQuery(req.query)
      .sort("title season")
      .skip(parseInt(limit, 10) * parseInt(offset, 10))
      .limit(returnNoResult ? -1 : parseInt(limit, 10)) // return -1 if we dont want values, otherwise use the limit
      .select({ filedata: 0 })
      .then(identity),
    buildQuery(req.query)
      .countDocuments()
      .then(identity)
  ])
    .then(([movies, count]) =>
      res.json({ data: returnNoResult ? [] : movies, count })
    )
    .catch(next);
});

// get genres
router.get("/genre", (_, res, next) => {
  Movie.distinct("genre")
    .then(genres => res.json(genres.sort()))
    .catch(next);
});

// get types
router.get("/type", (_, res) => {
  res.json(["Film", "Série"]);
});

// get movie by id
router.get("/:id", (req, res, next) => {
  Movie.findById(req.params.id)
    .then(
      movie => movie || throwMe(new Error(`Movie ${req.params.id} not found`))
    )
    .then(movie => res.json(movie))
    .catch(next);
});

// create movie
router.post("/", (req, res, next) => {
  const movie = new Movie({
    fileUrl: req.body.fileUrl,
    finished: false,
    genre: req.body.genre,
    idAllocine: req.body.idAllocine,
    netflix: false,
    productionYear: req.body.type === "Film" ? req.body.productionYear : null,
    seen: req.body.type === "Film" ? false : null,
    state: req.body.state,
    stateSummary: req.body.stateSummary,
    summary: req.body.summary,
    title: req.body.title,
    type: req.body.type
  });

  movie
    .save()
    .then(insertedMovie => res.json(insertedMovie))
    .catch(next);
});

// update movie
router.put("/:id", (req, res, next) => {
  Movie.findById({ _id: req.params.id })
    .then(
      movie => movie || throwMe(new Error(`Movie ${req.params.id} not found`))
    )
    .then(movie => {
      movie.title = req.body.title;
      movie.type = req.body.type;
      movie.genre = req.body.genre;
      movie.productionYear = req.body.productionYear;
      movie.idAllocine = req.body.idAllocine;
      movie.state = req.body.state;
      movie.stateSummary = req.body.stateSummary;
      movie.seen = req.body.seen;
      movie.finished = req.body.finished;
      movie.summary = req.body.summary;
      movie.fileUrl = req.body.fileUrl;
      movie.netflix = req.body.netflix;

      return movie.save();
    })
    .then(movie => {
      res.json(movie);
    })
    .catch(next);
});

/*
 * DELETE
 */
router.delete("/:id", (req, res, next) => {
  Movie.findByIdAndDelete(req.params.id)
    .then(movie => {
      logger.info(movie || {});
      res.json(204);
    })
    .catch(next);
});
