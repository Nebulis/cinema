import AWS from "aws-sdk";
import express from "express";
import identity from "lodash/identity";
import last from "lodash/last";
import union from "lodash/union";
import { DocumentQuery } from "mongoose";
import multer from "multer";
import uuid from "uuid/v4";
import { logger } from "../logger";
import { Movie } from "../models/movie";
import { throwMe } from "./util";

const s3 = new AWS.S3({});
export const router = express.Router();

interface IListQueryParams {
  title: string;
  genres: string; // ; separated genres
  tags: string; // ; separated tags
  notGenres: string; // ; separated genres
  types: string; // ; separated types
  seen: string; // transform to boolean
  finished: string; // transform to boolean
  productionYear: string;
  sortField: string;
  sortOrder: string;
  limit?: string;
  offset?: string;
}

function buildSeen(seen: string) {
  if (seen === "true") {
    // rules to be seen
    // all episodes must have been seen, at least 1 season, no empty season (with no episodes)
    return [
      {
        $nor: [
          {
            "seasons.episodes.seen": false // it must not contain false (no unseen)
          },
          {
            "seasons.episodes.seen": null // it must not contain null (no unseen)
          },
          {
            "seasons.episodes": { $size: 0 } // it must not have no episodes
          }
        ]
      },
      { "seasons.0": { $exists: true } } // it must have at least one season
    ];
  } else if (seen === "partial") {
    // rules to be partially seen
    // at least one seen episode
    // at least one notseen episode
    return [
      {
        $and: [
          {
            "seasons.episodes.seen": true // it must contain true (seen)
          },
          {
            $or: [
              {
                "seasons.episodes.seen": false // it must contain false (no seen)
              },
              {
                "seasons.episodes.seen": null // it must contain null (no seen)
              },
              {
                "seasons.episodes.seen": { $exists: false } // it must contain null (no seen)
              }
            ]
          }
        ]
      }
    ];
  } else {
    // rules to be not seen
    // no episodes must be seen or there is no season
    return [
      {
        $or: [
          {
            $nor: [
              {
                "seasons.episodes.seen": true // it must not contain true (no seen)
              }
            ]
          },
          // { "seasons.episodes": { $size: 0 } }, // it can have no episodes
          { seasons: { $size: 0 } } // it can have no seasons
        ]
      }
    ];
  }
}

const buildQuery = ({
  title,
  finished,
  productionYear,
  seen,
  notGenres,
  genres,
  tags,
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
  if (finished !== null && finished !== undefined) {
    query = query.and([{ finished: !!finished }]);
  }
  if (productionYear) {
    query = query.and([
      {
        $or: [
          {
            $and: [
              {
                productionYear,
                type: "Film"
              }
            ]
          },
          {
            $and: [
              {
                "seasons.productionYear": productionYear,
                type: "Série"
              }
            ]
          }
        ]
      }
    ]);
  }
  if (seen !== null && seen !== undefined) {
    // todo => handle seen for tv shows
    query = query.and([
      {
        $or: [
          seen === "partial"
            ? null
            : {
                $and: [
                  {
                    type: "Film"
                  },
                  {
                    seen: seen === "true"
                  }
                ]
              },
          {
            $and: [
              {
                type: "Série"
              },
              ...buildSeen(seen)
            ]
          }
        ].filter(Boolean)
      }
    ]);
  }

  if (tags) {
    query = query.and([{ $or: tags.split(",").map(tag => ({ tags: tag })) }]);
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
      .sort({ [req.query.sortField]: req.query.sortOrder })
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

// get genres
router.get("/years", (_, res, next) => {
  Promise.all([
    Movie.distinct("productionYear").then(identity),
    Movie.distinct("seasons.productionYear").then(identity)
  ])
    .then(years => res.json(union(years[0], years[1]).sort()))
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
    productionYear: req.body.productionYear,
    seen: false,
    state: req.body.state,
    stateSummary: req.body.stateSummary,
    summary: req.body.summary,
    title: req.body.title,
    type: req.body.type
  });
  logger.info("Create", movie);

  movie
    .save()
    .then(insertedMovie => res.json(insertedMovie))
    .catch(next);
});

// update poster
const upload = multer({ storage: multer.memoryStorage() });
const Bucket = "cinema-lma";
router.post("/:id/poster", upload.single("file"), (req, res, next) => {
  const params: AWS.S3.PutObjectRequest = {
    ACL: "public-read",
    Body: req.file.buffer,
    Bucket,
    CacheControl: "max-age=63113904",
    ContentType: req.file.mimetype,
    Key: req.params.id + uuid()
  };

  Movie.findById(req.params.id)
    .then(
      movie => movie || throwMe(new Error(`Movie ${req.params.id} not found`))
    )
    .then(movie => {
      // i really dont care about the type of this promise :)
      let promise: Promise<any> = Promise.resolve();
      if (movie.fileUrl && movie.fileUrl.startsWith("https://cinema-lma.s3")) {
        promise = s3
          .deleteObject({
            Bucket,
            Key: last(movie.fileUrl.split("/"))!
          })
          .promise();
      }
      return promise
        .then(() => s3.upload(params).promise())
        .then(data => {
          movie.fileUrl = data.Location;
          return movie.save();
        });
    })
    .then(movie => res.json(movie))
    .catch(next);
});

// update movie
router.put("/:id", (req, res, next) => {
  Movie.findById(req.params.id)
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
      movie.tags = req.body.tags || movie.tags;

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
