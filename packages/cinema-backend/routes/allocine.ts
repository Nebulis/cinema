import allocine from "allocine-api";
import express from "express";
import { logger } from "../logger";

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
