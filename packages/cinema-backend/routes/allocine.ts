import cheerio from "cheerio";
import express, { Response } from "express";
import { ParamsDictionary, Request } from "express-serve-static-core";
import zipWith from "lodash/zipWith";
import fetch from "node-fetch";
import { Movie } from "../models/movie";
import {
  getMovie,
  getMovieFromSearch,
  getTvShowFromSearch
} from "./allocine/getMovieFromSearch";

// tslint:disable:no-console
export const router = express.Router();

/*
 * GET
 */
interface IGetRequest {
  type: string;
  title: string;
}
router.get(
  "/",
  (req: Request<ParamsDictionary, {}, {}, IGetRequest>, res, _next) => {
    if (req.query.type === "Film") {
      return getMovieFromSearch(req.query.title)
        .then(movies => {
          res.json(movies);
        })
        .catch(error => {
          console.error(error);
        });
    } else {
      return getTvShowFromSearch(req.query.title)
        .then(movies => {
          res.json(movies);
        })
        .catch(error => {
          console.error(error);
        });
    }
  }
);

/*
 * GET
 */
router.get("/movie/:id", (req, res) => {
  return getMovie(req.params.id)
    .then(movie => {
      res.json(movie);
    })
    .catch(error => {
      console.error(error);
    });
});

router.get("/serie/:id", (req, res) => {
  return fetch(
    `http://www.allocine.fr/series/ficheserie_gen_cserie=${req.params.id}.html`
  )
    .then(response => response.text())
    .then(async body => {
      const $ = cheerio.load(body);
      const root = $.root();
      const title = root
        .find(".titlebar-title")
        .first()
        .text();
      const yearTmp = root
        .find(".meta-body-info")
        .text()
        .split("/")[0]
        .trim()
        .replace(/\n/g, ""); // there is \n after first date sometimes ...
      const year = yearTmp.startsWith("Depuis")
        ? yearTmp.split(" ")[1] // if depuis a, return a
        : yearTmp.split("-")[0].trim(); // if a-b, return a

      const synopsis = root
        .find(".content-txt")
        .first()
        .text()
        .trim();

      const image = root
        .find(".thumbnail-img")
        .attr("src")
        .replace("215_290", "300_424");

      const tmp = root
        .find(".meta-body-info")
        .text()
        .trim()
        .split("/");
      const genres = tmp[tmp.length - 1].split(",").map(g => g.trim());
      // year, image, link
      return {
        code: req.params.id,
        genres,
        image,
        link: `http://www.allocine.fr/series/ficheserie_gen_cserie=${
          req.params.id
        }.html`,
        synopsis,
        title,
        year
      };
    })
    .then(movie => {
      res.json(movie);
    })
    .catch(error => {
      console.error(error);
    });
});

const mapGenres = {
  Action: 13025,
  Animation: 13026,
  "Arts Martiaux": 13016,
  Aventure: 13001,
  Biopic: 13027,
  Comédie: 13005,
  "Comédie dramatique": 13002,
  "Comédie musicale": 13013,
  Divers: 13017,
  Documentaire: 13007,
  Drama: 13054,
  Drame: 13008,
  "Epouvante-horreur": 13009,
  Espionnage: 13022,
  Famille: 13036,
  Fantastique: 13012,
  Guerre: 13014,
  Historique: 13015,
  Judiciaire: 13031,
  Musical: 13043,
  Médical: 13030,
  Policier: 13018,
  Romance: 13024,
  "Science fiction": 13021,
  Soap: 13032,
  "Sport event": 13050,
  Thriller: 13023,
  Websérie: 13045,
  Western: 13018
};

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
        .find(".meta-body-item .date")
        .text()
        .trim()
        .replace(/\n/g, "")
        .split(" ")[2];
      const poster = root.find(".thumbnail-img").attr("src");
      const title = root
        .find(".titlebar-title")
        .first()
        .text();
      const tmp = root
        .find(".meta-body-info")
        .text()
        .replace(/\n/g, "")
        .split("/");
      const genres = tmp[tmp.length - 1].split(",").map(g => g.trim());
      console.log(genres);
      const synopsis = root
        .find("#synopsis-details .content-txt")
        .text()
        .trim();
      console.timeEnd("parse");

      return {
        code: id,
        genre: genres.map(g => ({ $: g })),
        poster: {
          href: poster
        },
        productionYear: productionYear && parseInt(productionYear, 10),
        synopsis,
        title
      };
    });
};

interface IFindRequest {
  year: string;
  bookmark: string;
  type: string;
  month: string;
  genre: string;
}
const extractMoviesFromMonthlyReleases = async (
  fetchUrl: string,
  res: Response,
  req: Request<ParamsDictionary, {}, {}, IFindRequest>
): Promise<void> => {
  const movieIds: string[] = await fetch(fetchUrl)
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
    while (allocineMovies.length < 5 && index < movieIds.length) {
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
};

// let's assume that
// - if it's ~ 5 years (from production date)
// then it's the correct year, because allocine dates are weird
const hasBeenReleaseThisYear = (allocineMovie: any, year: string) =>
  Math.abs(allocineMovie.productionYear - Number(year)) < 5;

router.get(
  "/find",
  async (req: Request<ParamsDictionary, {}, {}, IFindRequest>, res) => {
    if (req.query.type === "movie") {
      const bookmark = Number(req.query.bookmark) || 1;
      console.log(`Find movies for ${req.query.month}/${req.query.year}`);
      if (!req.query.year) {
        res.sendStatus(400);
        return;
      }
      const fetchUrl = !req.query.month
        ? `http://www.allocine.fr/films//decennie-${req.query.year.replace(
            /.$/,
            "0"
          )}/annee-${req.query.year}/?page=${bookmark}`
        : `http://www.allocine.fr/film/agenda/mois/mois-${
            req.query.year
          }-${req.query.month.padStart(2, "0")}`;
      console.log(fetchUrl);
      if (req.query.month) {
        extractMoviesFromMonthlyReleases(fetchUrl, res, req);
      } else {
        let hasNext = false;
        const allocineMovies = await fetch(fetchUrl)
          .then(response => response.text())
          .then(async body => {
            const $ = cheerio.load(body);
            const root = $.root();
            // it has next if there is a next button in the page and it's not disabled
            hasNext =
              root.find(".button-right").length === 1 &&
              root.find(".button-right.button-disabled").length === 0;
            return root
              .find(".entity-card-list")
              .map(function() {
                // @ts-ignore
                const thisElement = $(this);
                const title = thisElement.find(".meta-title-link").text();
                const link =
                  thisElement.find(".meta-title-link").attr("href") || "";
                const match = link.match(
                  /\/film\/fichefilm_gen_cfilm=(.*).html/
                );
                const poster =
                  thisElement.find(".thumbnail-img").attr("data-src") ||
                  thisElement.find(".thumbnail-img").attr("src");
                const synopsis = thisElement
                  .find(".content-txt")
                  .text()
                  .trim()
                  .replace(/\n/g, "");
                const meta = thisElement
                  .find(".meta-body-info")
                  .text()
                  .split("/");
                const genres = meta[meta.length - 1]
                  .split(",")
                  .map(genre => genre.trim().replace(/\n/g, ""));

                return {
                  code: match && match[1],
                  genre: genres.map(g => ({ $: g })),
                  poster: { href: poster },
                  productionYear: req.query.year,
                  synopsis,
                  title
                };
              })
              .get();
          });

        const localMoviesPromises = [];
        for (const allocineMovie of allocineMovies) {
          localMoviesPromises.push(
            Movie.findOne({
              idAllocine: Number(allocineMovie.code)
            })
              .select({ filedata: 0 })
              .then(x => x)
          );
        }
        const localMovies = await Promise.all(localMoviesPromises);

        res.json({
          bookmark: hasNext ? bookmark + 1 : undefined,
          results: zipWith(
            allocineMovies,
            localMovies,
            (allocineMovie, movie) => ({
              allocine: allocineMovie,
              cinema: movie
            })
          )
        });
      }
    } else {
      console.log(
        `Find tvshows for ${req.query.year} with genre ${req.query.genre}`
      );
      if (!req.query.year) {
        res.sendStatus(400);
        return;
      }
      const bookmark = Number(req.query.bookmark) || 1;
      let hasNext = true;
      const selectedGenre =
        mapGenres[req.query.genre as keyof typeof mapGenres];
      const fetchUrl = `http://www.allocine.fr/series-tv${
        selectedGenre ? `/genre-${selectedGenre}` : ""
      }/decennie-${req.query.year.replace(/.$/, "0")}/annee-${
        req.query.year
      }/?page=${bookmark}`;

      console.log(fetchUrl);
      const allocineMovies = await fetch(fetchUrl)
        .then(response => response.text())
        .then(async body => {
          const $ = cheerio.load(body);
          const root = $.root();
          // it has next if there is a next button in the page and it's not disabled
          hasNext =
            root.find(".button-right").length === 1 &&
            root.find(".button-right.button-disabled").length === 0;
          return root
            .find(".entity-card-list")
            .map(function() {
              // @ts-ignore
              const thisElement = $(this);
              const title = thisElement.find(".meta-title-link").text();
              const link =
                thisElement.find(".meta-title-link").attr("href") || "";
              const match = link.match(
                /\/series\/ficheserie_gen_cserie=(.*).html/
              );
              const poster =
                thisElement.find(".thumbnail-img").attr("data-src") ||
                thisElement.find(".thumbnail-img").attr("src");
              const synopsis = thisElement
                .find(".content-txt")
                .text()
                .trim()
                .replace(/\n/g, "");
              const meta = thisElement
                .find(".meta-body-info")
                .text()
                .split("/");
              const genres = meta[meta.length - 1]
                .split(",")
                .map(genre => genre.trim().replace(/\n/g, ""));

              return {
                code: match && match[1],
                genre: genres.map(g => ({ $: g })),
                poster: { href: poster },
                productionYear: req.query.year,
                synopsis,
                title
              };
            })
            .get();
        });

      const localMoviesPromises = [];
      for (const allocineMovie of allocineMovies) {
        localMoviesPromises.push(
          Movie.findOne({
            idAllocine: Number(allocineMovie.code)
          })
            .select({ filedata: 0 })
            .then(x => x)
        );
      }
      const localMovies = await Promise.all(localMoviesPromises);

      res.json({
        bookmark: hasNext ? bookmark + 1 : undefined,
        results: zipWith(
          allocineMovies,
          localMovies,
          (allocineMovie, movie) => ({
            allocine: allocineMovie,
            cinema: movie
          })
        )
      });
    }
  }
);
