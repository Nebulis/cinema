import React, { useContext, useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import { getMovie, updateMovie } from "./MovieAPI";
import { UserContext } from "../Login/UserContext";
import { MovieSeen } from "./MovieSeen";
import { MoviesContext } from "./MoviesContext";

export const Movie = withRouter(({ match, history }) => {
  // get contexts
  const user = useContext(UserContext);
  const movies = useContext(MoviesContext);

  // create state
  const [movie, setMovie] = useState();

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

  const renderSeen = ({ type, seen }) => {
    if (type === "Film") {
      return <MovieSeen seen={seen} onClick={update("seen", !seen)} />;
    } else {
      return seen.map((season, index) => (
        <div key={index}>
          <span> Season {index + 1} &nbsp;</span>
          <MovieSeen
            seen={season}
            onClick={update("seen", [
              ...seen.slice(0, index),
              !seen[index],
              ...seen.slice(index + 1)
            ])}
          />
        </div>
      ));
    }
  };

  return (
    <div className="p-2">
      {!movie ? (
        <span>Loading ....</span>
      ) : (
        <div>
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
          <div>{renderSeen(movie)}</div>
          <button type="button" onClick={() => history.goBack()}>
            Back
          </button>
        </div>
      )}
    </div>
  );
});
