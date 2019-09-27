import allocine from "allocine-api";
import cheerio from "cheerio";
import express from "express";
import zipWith from "lodash/zipWith";
import fetch from "node-fetch";
import { logger } from "../logger";
import { Movie } from "../models/movie";

// tslint:disable:no-console
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

const getAllocineMovie = async (id: string) => {
  console.log("Fetch movie with id", id);
  console.time(`fetch${id}`);
  return fetch(`http://www.allocine.fr/film/fichefilm_gen_cfilm=${id}.html`)
    .then(response => response.text())
    .then(async body => {
      console.timeEnd(`fetch${id}`);
      console.time("parse");
      const $ = cheerio.load(body);
      const root = $.root();
      const productionYear = root
        .find(".movie-card-overview .meta-body-item .date")
        .text()
        .split(" ");
      const poster = root.find(".thumbnail-img").attr("src");
      const title = root
        .find(".titlebar-title")
        .first()
        .text();
      const genre = root
        .find(".meta-body-item span:contains(Genre)")
        .siblings()
        .map(function() {
          // @ts-ignore
          return $(this).text();
        })
        .get();
      const synopsis = root
        .find("#synopsis-details .content-txt")
        .text()
        .trim();
      console.timeEnd("parse");

      return {
        code: id,
        genre: genre.map(g => ({ $: g })),
        poster: {
          href: poster
        },
        productionYear: productionYear && parseInt(productionYear[2], 10),
        synopsis,
        title
      };
    });
};

// let's assume that
// - if it's ~ 5 years (from production date)
// then it's the correct year, because allocine dates are weird
const hasBeenReleaseThisYear = (allocineMovie: any, year: string) =>
  Math.abs(allocineMovie.productionYear - Number(year)) < 5;

router.get("/find", async (req, res) => {
  console.log(`Find movies for ${req.query.month}/${req.query.year}`);
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
  console.log(`Found ${movieIds.length} movies`, movieIds);
  try {
    const allocineMovies = [];
    const localMoviesPromises = [];
    let index = req.query.bookmark
      ? movieIds.findIndex(id => id === req.query.bookmark)
      : 0;
    while (allocineMovies.length < 15 && index < movieIds.length) {
      const id = movieIds[index];
      const allocineMovie = await getAllocineMovie(id).catch(error =>
        console.error(error)
      );
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
