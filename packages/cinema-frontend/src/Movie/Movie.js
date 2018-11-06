import React, { Fragment, useContext, useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import * as MovieAPI from "./MovieAPI";
import { UserContext } from "../Login/UserContext";
import { MovieSeen } from "./MovieSeen";
import { MoviesContext } from "./MoviesContext";
import { produce } from "immer";
import { Season } from "./Season/Season";
import { EditableTextarea } from "../Common/EditableField";
import { useToggle } from "../Common/hooks";

export const MovieContext = React.createContext({});

export const Movie = withRouter(({ match, history }) => {
  // get contexts
  const user = useContext(UserContext);
  const movies = useContext(MoviesContext);
  // create state
  const [movie, setMovie] = useState();
  const [lock, toggle] = useToggle(true);

  // create effects
  useEffect(() => MovieAPI.getMovie(match.params.id, user).then(setMovie), [
    match.params.id
  ]);

  // create actions
  const updateMovie = transform => () => {
    MovieAPI.updateMovie(produce(movie, transform), user).then(mergeContext);
  };

  // helper
  const mergeContext = updatedMovie => {
    setMovie(updatedMovie);
    movies.update(updatedMovie._id, updatedMovie);
  };

  return (
    <div className="container movie-container">
      {!movie ? (
        <span>Loading ....</span>
      ) : (
        <Fragment>
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
          <div
            className="p-5 mt-3 single-movie-card"
            style={{ position: "relative" }}
          >
            <i
              onClick={toggle}
              className={`fas ${lock ? "fa-lock" : "fa-lock-open"} fa-2x`}
              style={{
                color: "var(--movie-secondary)",
                position: "absolute",
                top: "5px",
                right: "5px",
                cursor: "pointer"
              }}
              title={`Click to ${
                lock ? "open" : "close"
              } movie for modifications`}
            />
            <div className="d-flex justify-content-center">
              <div>
                <img
                  src={movie.fileUrl}
                  style={{ maxHeight: "300px" }}
                  alt="movie poster"
                />
              </div>
              <div className="pl-2 d-flex flex-column" style={{ flexGrow: 1 }}>
                <h1 className="text-center">
                  {movie.title} - {movie.productionYear}
                </h1>
                <h6 className="text-center single-movie-subtitle">
                  {movie.genre.join(",")}
                </h6>
                <div>
                  <EditableTextarea
                    lock={lock}
                    value={movie.summary}
                    style={{ width: "100%" }}
                    placeholder="Summary"
                    rows="7"
                    onChange={summary =>
                      updateMovie(movie => {
                        movie.summary = summary;
                      })()
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              {movie.type === "Film" ? (
                <MovieSeen
                  seen={movie.seen}
                  onClick={updateMovie(movie => {
                    movie.seen = !movie.seen;
                  })}
                />
              ) : (
                undefined
              )}
            </div>
            <div className="text-center">
              {movie.type !== "Film" ? (
                <Fragment>
                  <MovieContext.Provider value={{ lock, movie }}>
                    <div>
                      {movie.seasons.map((season, seasonIndex) => (
                        <Season
                          key={seasonIndex}
                          season={season}
                          index={seasonIndex}
                          onMovieChanged={mergeContext}
                        />
                      ))}
                    </div>
                  </MovieContext.Provider>
                  {!lock ? (
                    <button
                      className="btn btn-primary"
                      onClick={() =>
                        MovieAPI.addSeason(movie, user).then(mergeContext)
                      }
                    >
                      <i className="fas fa-plus" />
                      &nbsp;Add season
                    </button>
                  ) : (
                    undefined
                  )}
                </Fragment>
              ) : (
                undefined
              )}
            </div>
          </div>
        </Fragment>
      )}
    </div>
  );
});
