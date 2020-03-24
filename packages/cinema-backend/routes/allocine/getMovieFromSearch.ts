import cheerio from "cheerio";
import fetch from "node-fetch";

const extractData = (body: string) => {
  const $ = cheerio.load(body);
  const root = $.root();
  return root
    .find(".card.entity-card.entity-card-list.cf")
    .map(function() {
      // @ts-ignore
      const thisElement = $(this);
      const image = thisElement
        .find(".thumbnail-img")
        .attr("data-src")
        .replace("215_290", "300_424");

      const link =
        "http://www.allocine.fr" +
        new Buffer(
          thisElement
            .find(".meta-title-link")
            .attr("class")
            .split(" ")[0]
            .replace(/ACr/g, ""),
          "base64"
        ).toString("ascii");
      const title = thisElement.find(".meta-title-link").text();
      const year = thisElement
        .find(".meta-body-info")
        .text()
        .trim()
        .split("/")[0]
        .trim();

      const id = link.match(
        /(\/film\/fichefilm_gen_cfilm|\/series\/ficheserie_gen_cserie)=(.*).html/
      );
      const code = id ? id[2] : "";
      return { title, year, image, link, code };
    })
    .get();
};

export const getMovieFromSearch = (
  title: string
): Promise<
  Array<{ title: string; year: string; image: string; link: string }>
> => {
  return fetch(`http://www.allocine.fr/recherche/movie/?q=${title}`)
    .then(response => response.text())
    .then(async body => {
      return extractData(body);
    });
};
export const getTvShowFromSearch = (
  title: string
): Promise<
  Array<{ title: string; year: string; image: string; link: string }>
> => {
  return fetch(`http://www.allocine.fr/recherche/series/?q=${title}`)
    .then(response => response.text())
    .then(async body => {
      return extractData(body);
    });
};

export const getMovie = (id: string) => {
  return fetch(`http://www.allocine.fr/film/fichefilm_gen_cfilm=${id}.html`)
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
        .trim()
        .replace(/\n/g, "")
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

      const tmp = root
        .find(".meta-body-info")
        .text()
        .trim()
        .split("/");
      const genres = tmp[tmp.length - 1].split(",").map(g => g.trim());
      // year, image, link
      return {
        code: id,
        genres,
        image,
        link: `http://www.allocine.fr/film/fichefilm_gen_cfilm=${id}.html`,
        synopsis,
        title,
        year
      };
    });
};
