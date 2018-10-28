import React, { useContext, useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import { getMovie, updateMovie } from "./MovieAPI";
import { UserContext } from "../Login/UserContext";
import { MovieSeen } from "./MovieSeen";
import { MoviesContext } from "./MoviesContext";
import { MovieSeasonYear } from "./MovieSeasonYear";

export const Movie = withRouter(({ match, history }) => {
  // get contexts
  const user = useContext(UserContext);
  const movies = useContext(MoviesContext);

  // create state
  const [movie, setMovie] = useState();
  const [editSeasonIndex, setEditSeasonIndex] = useState(); // index to save the current editable season

  // crate effects
  useEffect(() => getMovie(match.params.id, user).then(setMovie), [
    match.params.id
  ]);

  // create actions
  const update = (field, value) => () => {
    updateMovie({ ...movie, [field]: value }, user).then(updatedMovie => {
      setMovie(updatedMovie);
      movies.update(updatedMovie._id, updatedMovie);
    });
  };

  const renderSeasons = ({ type, seen, season, productionYear }) => {
    // tmp while some season may not have years;
    return Array(season)
      .fill(0)
      .map((_, season) => (
        <div key={season}>
          {productionYear[season] && season !== editSeasonIndex ? (
            <span onClick={() => setEditSeasonIndex(season)}>
              {productionYear[season]} -{" "}
            </span>
          ) : (
            <MovieSeasonYear
              year={productionYear[season]}
              onChange={value => {
                update("productionYear", [
                  ...productionYear.slice(0, season),
                  parseInt(value, 10),
                  ...productionYear.slice(season + 1)
                ])();
                setEditSeasonIndex(null);
              }}
            />
          )}
          <span>Season {season + 1} &nbsp;</span>
          <MovieSeen
            seen={seen[season]}
            onClick={update("seen", [
              ...seen.slice(0, season),
              !seen[season],
              ...seen.slice(season + 1)
            ])}
          />
        </div>
      ));
  };

  return (
    <div className="p-2">
      {!movie ? (
        <span>Loading ....</span>
      ) : (
        <div>
          <i
            onClick={() => history.goBack()}
            className="fas fa-arrow-circle-left fa-3x"
            style={{
              top: "22px",
              left: "22px",
              position: "absolute",
              color: "#F1F7EE",
              cursor: "pointer"
            }}
            title="Return to the list of movies"
          />
          <h1>
            {movie.title} - {movie.productionYear}
          </h1>
          <div className="d-flex">
            <div className="pr-2">
              <img
                src={movie.fileUrl}
                style={{ maxHeight: "300px" }}
                alt="movie poster"
              />
            </div>
            <div className="pl-2">{movie.summary}</div>
          </div>
          <div>
            {movie.type === "Film" ? (
              <MovieSeen
                seen={movie.seen}
                onClick={update("seen", !movie.seen)}
              />
            ) : (
              renderSeasons(movie)
            )}
          </div>
        </div>
      )}
    </div>
  );
});
