import allocine from "allocine-api";
import cheerio from "cheerio";
import express from "express";
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

router.get("/find", async (req, res) => {
  if (!req.query.year || !req.query.month) {
    res.sendStatus(400);
    return;
  }
  const page = Number(req.query.page) || 0;
  const offset = Number(req.query.offset) || 20;
  const movieIds = await fetch(
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
        .filter(Boolean); // remove null values
    });
  try {
    const results = [];
    for (const id of movieIds.slice(page * offset, page * offset + offset)) {
      const [allocineMovie, cinemaMovie] = await Promise.all([
        getAllocineMovie(id!),
        Movie.findOne({
          idAllocine: Number(id)
        }).select({ filedata: 0 })
      ]);

      results.push({ allocine: allocineMovie, cinema: cinemaMovie });
    }
    res.json(results);
  } catch (error) {
    res.status(500).json(error);
  }
});
