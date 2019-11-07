import cheerio from "cheerio";
import express from "express";
import zipWith from "lodash/zipWith";
import fetch from "node-fetch";
import { Movie } from "../models/movie";

// tslint:disable:no-console
export const router = express.Router();

const extractData = (body: string) => {
  const $ = cheerio.load(body);
  const root = $.root();
  return root
    .find(".totalwidth.noborder.purehtml tr")
    .map(function() {
      // @ts-ignore
      const thisElement = $(this);
      const cols = thisElement.find("td");
      if (cols.length === 1) {
        return null;
      }
      const image = cols
        .first()
        .find("img")
        .attr("src")
        .replace("75_106", "300_424");

      const link = cols
        .first()
        .find("a")
        .attr("href");

      const titleAndYear = cols
        .last()
        .find("div div")
        .first()
        .text()
        .split("\n");
      const title = titleAndYear[2];
      const year = titleAndYear[5] || titleAndYear[6];
      return { title, year, image, link };
    })
    .get();
};
/*
 * GET
 */
router.get("/", (req, res, _next) => {
  if (req.query.type === "Film") {
    return fetch(`http://www.allocine.fr/recherche/1/?q=${req.query.title}`)
      .then(response => response.text())
      .then(async body => {
        return extractData(body);
      })
      .then(movies => {
        res.json(
          movies.map(movie => {
            const id = movie.link.match(
              /\/film\/fichefilm_gen_cfilm=(.*).html/
            );
            return {
              ...movie,
              code: id ? id[1] : ""
            };
          })
        );
      })
      .catch(error => {
        console.error(error);
      });
  } else {
    return fetch(`http://www.allocine.fr/recherche/6/?q=${req.query.title}`)
      .then(response => response.text())
      .then(async body => {
        return extractData(body);
      })
      .then(movies => {
        res.json(
          movies.map(movie => {
            const id = movie.link.match(
              /\/series\/ficheserie_gen_cserie=(.*).html/
            );
            return {
              ...movie,
              code: id ? id[1] : ""
            };
          })
        );
      })
      .catch(error => {
        console.error(error);
      });
  }
});

/*
 * GET
 */
router.get("/movie/:id", (req, res) => {
  return fetch(
    `http://www.allocine.fr/film/fichefilm_gen_cfilm=${req.params.id}.html`
  )
    .then(response => response.text())
    .then(async body => {
      const $ = cheerio.load(body);
      const root = $.root();
      const title = root
        .find(".titlebar-title")
        .first()
        .text();
      const year = root
        .find(".date")
        .text()
        .split(" ")[2];
      const synopsis = root
        .find(".content-txt")
        .first()
        .text()
        .trim();

      const image = root
        .find(".thumbnail-img")
        .attr("src")
        .replace("215_290", "300_424");

      const genres = root
        .find(".meta-body-item")
        .map(function() {
          // @ts-ignore
          const thisElement = $(this);
          const genresSection = thisElement.find("span").first();
          if (
            genresSection.text() === "Genres" ||
            genresSection.text() === "Genre"
          ) {
            return thisElement
              .find("span:not(:first-child)")
              .map(function() {
                // @ts-ignore
                return $(this).text();
              })
              .get();
          }
          return null;
        })
        .get();
      // year, image, link
      return {
        code: req.params.id,
        genres,
        image,
        link: `http://www.allocine.fr/film/fichefilm_gen_cfilm=${
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
      const year = root
        .find(".meta-body-info")
        .text()
        .split("-")[0]
        .trim();
      const synopsis = root
        .find(".content-txt")
        .first()
        .text()
        .trim();

      const image = root
        .find(".thumbnail-img")
        .attr("src")
        .replace("215_290", "300_424");

      const genres = root
        .find(".meta-body-info")
        .text()
        .split("/")[2]
        .split(",")
        .map(g => g.trim());
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
