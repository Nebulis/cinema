import allocine from "allocine-api";
import cheerio from "cheerio";
import express from "express";
import zipWith from "lodash/zipWith";
import fetch from "node-fetch";
import { logger } from "../logger";
import { Movie } from "../models/movie";

export const router = express.Router();
/*
 * GET
 */
router.get("/", (req, res, next) => {
  const options = {
    count: 30,
    q: req.query.title
  };
  if (req.query.type === "Film") {
    allocine.api(
      "search",
      {
        ...options,
        filter: "movie"
      },
      (error, results) => {
        if (error) {
          logger.error(error);
          return next(error);
        } else if (results.error) {
          logger.error(results.error);
          return next(new Error(results.error.$));
        }
        res.json(results.feed.movie || {});
      }
    );
  } else {
    allocine.api(
      "search",
      {
        ...options,
        filter: "tvseries"
      },
      (error, results) => {
        if (error) {
          logger.error(error);
          return next(error);
        } else if (results.error) {
          logger.error(results.error);
          return next(new Error(results.error.$));
        }
        res.json(results.feed.tvseries || {});
      }
    );
  }
});

/*
 * GET
 */
router.get("/movie/:id", (req, res) => {
  allocine.api(
    "movie",
    {
      code: req.params.id
    },
    (error, result) => {
      if (error) {
        logger.error(error);
        return;
      }
      res.json(result);
    }
  );
});

router.get("/serie/:id", (req, res) => {
  allocine.api(
    "tvseries",
    {
      code: req.params.id
    },
    (error, result) => {
      if (error) {
        logger.error(error);
        return;
      }

      res.json(result);
    }
  );
});

const getAllocineMovie = (id: string) => {
  return new Promise((resolve, reject) => {
    allocine.api(
      "movie",
      {
        code: id
      },
      (error: any, result: any) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(result.movie);
      }
    );
  });
};

// let's assume that
// - if release date matches provided year
// - and if it's ~ 5 years (from production date)
// then it's the correct year, because allocine dates are weird
const hasBeenReleaseThisYear = (allocineMovie: any, year: string) =>
  new Date(allocineMovie.release.releaseDate).getFullYear() === Number(year) &&
  Math.abs(allocineMovie.productionYear - Number(year)) < 5;

router.get("/find", async (req, res) => {
  if (!req.query.year || !req.query.month) {
    res.sendStatus(400);
    return;
  }
  const movieIds: string[] = await fetch(
    `http://www.allocine.fr/film/agenda/mois/mois-${
      req.query.year
    }-${req.query.month.padStart(2, "0")}`
  )
    .then(response => response.text())
    .then(async body => {
      const $ = cheerio.load(body);
      // find all links
      return $(".month-movies-link")
        .map(function() {
          // @ts-ignore
          return $(this).attr("href");
        })
        .get() // cheerio need this
        .map((link: string) => {
          const match = link.match(/\/film\/fichefilm_gen_cfilm=(.*).html/);
          if (match && match[1]) {
            return match[1];
          }
          return null;
        })
        .filter((value: any): value is string => !!value); // remove null values
    });
  try {
    const allocineMovies = [];
    const localMoviesPromises = [];
    let index = req.query.bookmark
      ? movieIds.findIndex(id => id === req.query.bookmark)
      : 0;
    while (allocineMovies.length < 20 && index < movieIds.length) {
      const id = movieIds[index];
      const allocineMovie = await getAllocineMovie(id);
      index++;
      if (hasBeenReleaseThisYear(allocineMovie, req.query.year)) {
        allocineMovies.push(allocineMovie);
        localMoviesPromises.push(
          Movie.findOne({
            idAllocine: Number(id)
          })
            .select({ filedata: 0 })
            .then(x => x)
        ); // transform into promise ...)
      }
    }
    const localMovies = await Promise.all(localMoviesPromises);
    res.json({
      bookmark: movieIds[index],
      results: zipWith(allocineMovies, localMovies, (allocineMovie, movie) => ({
        allocine: allocineMovie,
        cinema: movie
      }))
    });
  } catch (error) {
    res.status(500).json(error);
  }
});
