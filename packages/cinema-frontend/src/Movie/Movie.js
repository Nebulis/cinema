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
              undefined
            )}
          </div>
        </div>
      )}
    </div>
  );
});
