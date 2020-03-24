import {
  getMovie,
  getMovieFromSearch,
  getTvShowFromSearch
} from "./getMovieFromSearch";

describe("getMovieFromSearch", () => {
  it("should return correct data", async () => {
    const response = await getMovieFromSearch(
      "Confessions d'une accro du shopping"
    );
    expect(response).toStrictEqual([
      {
        code: "130604",
        image:
          "http://fr.web.img5.acsta.net/c_300_424/medias/nmedia/18/67/65/78/19067933.jpg",
        link: "http://www.allocine.fr/film/fichefilm_gen_cfilm=130604.html",
        title: "Confessions d'une accro du shopping",
        year: "Date de sortie inconnue"
      }
    ]);
  });
});
describe("getTvShowFromSearch", () => {
  it("should return correct data", async () => {
    const response = await getTvShowFromSearch("Dexter");
    expect(response).toStrictEqual([
      {
        code: "3004",
        image:
          "http://fr.web.img5.acsta.net/c_216_288/pictures/210/032/21003280_20130504002100017.jpg",
        link: "http://www.allocine.fr/series/ficheserie_gen_cserie=3004.html",
        title: "Dexter",
        year: ""
      },
      {
        code: "7595",
        image:
          "http://fr.web.img4.acsta.net/c_216_288/medias/nmedia/18/72/87/88/19181752.jpg",
        link: "http://www.allocine.fr/series/ficheserie_gen_cserie=7595.html",
        title: "Dexter: Early Cuts",
        year: ""
      },

      {
        code: "4447",
        image:
          "http://fr.web.img4.acsta.net/c_216_288/pictures/15/09/01/14/51/314868.jpg",
        link: "http://www.allocine.fr/series/ficheserie_gen_cserie=4447.html",
        title: "Le Laboratoire de Dexter",
        year: ""
      }
    ]);
  });
});
describe("getMovie", () => {
  it("should return correct data", async () => {
    const response = await getMovie("270371");
    expect(response).toStrictEqual({
      code: "270371",
      genres: ["Epouvante-horreur"],
      image:
        "http://fr.web.img3.acsta.net/c_300_424/pictures/19/01/30/12/27/2442965.jpg",
      link: "http://www.allocine.fr/film/fichefilm_gen_cfilm=270371.html",
      synopsis:
        "Une mère et son fils viennent d'emménager dans une nouvelle maison près des bois. Au cours d'une balade en forêt, le fils disparaît un petit moment. La mère parvient à remettre la main sur lui et découvre, en même temps, un énorme gouffre au coeur du bois. Quelques temps après, elle remarque que son petit garçon a un comportement étrange. Est-ce bien son fils qui est revenu vers elle ?",
      title: "The Hole In The Ground",
      year: undefined
    });
  });
});
