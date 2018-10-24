import express from "express";
import identity from "lodash/identity";
import { logger } from "../logger";
import { Movie } from "../models/movieModel";

export const router = express.Router();

interface IListQueryParams {
  title: string;
  genres: string; // ; separated genres
  types: string; // ; separated types
  seen: string;
  unseen: string;
  netflix: string;
  unnetflix: string;
  productionYear: string;
  limit?: string;
  offset?: string;
}

interface IGetMoviesParameters {
  title: string;
  netflix: string;
  unnetflix: string;
  productionYear: string;
  seen: string;
  unseen: string;
  genres: string;
  types: string;
}
const buildQuery = ({
  title,
  netflix,
  unnetflix,
  productionYear,
  seen,
  unseen,
  genres,
  types
}: IGetMoviesParameters) => {
  let query;

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
  if (netflix !== unnetflix) {
    query = query.and([{ netflix: !!netflix }]);
  }
  if (productionYear) {
    query = query.and([{ productionYear }]);
  }

  if (seen !== unseen) {
    query = query.and([
      // must match
      // - film where field.seen = seen
      // - tvshows where seen in field.seen
      { $or: [{ seen: !!seen }, { seen: { $in: [!!seen] } }] }
    ]);
  }

  if (genres) {
    query = query.and([{ $or: genres.split(",").map(genre => ({ genre })) }]);
  }

  if (types) {
    query = query.and([{ $or: types.split(",").map(type => ({ type })) }]);
  }
  return query;
};

router.get("/", (req, res, next) => {
  const { limit = "20", offset = "0" }: IListQueryParams = req.query;
  Promise.all([
    buildQuery(req.query)
      .sort("title season")
      .skip(parseInt(limit, 10) * parseInt(offset, 10))
      .limit(parseInt(limit, 10))
      .select({ filedata: 0 })
      .then(identity),
    buildQuery(req.query)
      .countDocuments()
      .then(identity)
  ])
    .then(([movies, count]) => res.json({ data: movies, count }))
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

function throwMe(error: Error) {
  throw error;
}

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
  const season = parseInt(req.body.season, 10);
  const movie = new Movie({
    fileUrl: req.body.fileUrl,
    finished: false,
    genre: req.body.genre,
    idAllocine: req.body.idAllocine,
    netflix: false,
    productionYear: req.body.productionYear,
    season: req.body.type === "Film" ? null : season,
    seen: req.body.type === "Film" ? false : Array(season).fill(false),
    state: req.body.state,
    stateSummary: req.body.stateSummary,
    summary: req.body.summary,
    title: req.body.title,
    trash: req.body.trash,
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
      const season = parseInt(req.body.season, 10);

      const seenForTvShows = (
        newSeason: number,
        oldSeason: number,
        seen: number[]
      ) => {
        if (newSeason < oldSeason) {
          return seen.slice(0, newSeason); // less season than before, remove extra seen
        }
        return seen.concat(Array(newSeason - oldSeason).fill(false));
      };

      movie.title = req.body.title || movie.title;
      movie.type = req.body.type || movie.type;
      movie.genre = req.body.genre || movie.genre;
      movie.productionYear = req.body.productionYear || movie.productionYear;
      movie.idAllocine = req.body.idAllocine;
      movie.state =
        req.body.state && req.body.state > 0 && req.body.state < 64
          ? req.body.state
          : movie.state;
      movie.stateSummary =
        req.body.stateSummary != null
          ? req.body.stateSummary
          : movie.stateSummary; // != null to handle empty string
      movie.seen =
        req.body.type === "Film"
          ? req.body.seen || false // TODO may reset seen if seen is not passed down
          : seenForTvShows(season, movie.season, req.body.seen);
      movie.season = season || movie.season;
      movie.trash = req.body.trash || false;
      movie.finished = req.body.finished || false;
      movie.summary = req.body.summary || null;
      movie.filedata = req.body.filedata || null;
      movie.fileUrl = req.body.fileUrl || null;
      movie.netflix = !!req.body.netflix;

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
