import React, { Fragment, useContext, useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import * as MovieAPI from "./MovieAPI";
import { UserContext } from "../Login/UserContext";
import { MovieSeen } from "./MovieSeen";
import { MoviesContext } from "./MoviesContext";
import { EditableField } from "../Common/EditableField";
import { produce } from "immer";

export const Movie = withRouter(({ match, history }) => {
  // get contexts
  const user = useContext(UserContext);
  const movies = useContext(MoviesContext);

  // create state
  const [movie, setMovie] = useState();

  // crate effects
  useEffect(() => MovieAPI.getMovie(match.params.id, user).then(setMovie), [
    match.params.id
  ]);

  // create actions
  const updateMovie = transform => () => {
    MovieAPI.updateMovie(produce(movie, transform), user).then(mergeContext);
  };
  const updateSeason = transform => seasonIndex => {
    const newMovie = produce(movie, transform);
    const season = newMovie.seasons[seasonIndex];
    MovieAPI.updateSeason(newMovie, season, user).then(mergeContext);
  };
  const updateEpisode = transform => seasonIndex => episodeIndex => {
    const newMovie = produce(movie, transform);
    const season = newMovie.seasons[seasonIndex];
    const episode = season.episodes[episodeIndex];
    console.log(season, episode);
    MovieAPI.updateEpisode(newMovie, season, episode, user).then(mergeContext);
  };

  // helper
  const mergeContext = updatedMovie => {
    setMovie(updatedMovie);
    movies.update(updatedMovie._id, updatedMovie);
  };

  return (
    <div className="p-2 mb-10">
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
                <div>
                  {movie.seasons.map((season, seasonIndex) => (
                    <Fragment key={season._id}>
                      <div>
                        Season {seasonIndex + 1}
                        &nbsp;-&nbsp;
                        <EditableField
                          placeholder="YYYY"
                          value={season.productionYear}
                          transform={value => parseInt(value, 10)}
                          onChange={productionYear =>
                            updateSeason(movie => {
                              movie.seasons[
                                seasonIndex
                              ].productionYear = productionYear;
                            })(seasonIndex)
                          }
                        />
                      </div>
                      {season.episodes.map((episode, episodeIndex) => (
                        <div key={episode._id}>
                          <div className="d-inline">
                            <EditableField
                              bold={true}
                              value={episode.title}
                              placeholder="Title"
                              onChange={title =>
                                updateEpisode(movie => {
                                  movie.seasons[seasonIndex].episodes[
                                    episodeIndex
                                  ].title = title;
                                })(seasonIndex)(episodeIndex)
                              }
                            />
                          </div>
                          &nbsp;-&nbsp;
                          <div className="d-inline">
                            <EditableField
                              value={episode.summary}
                              placeholder="Summary"
                              onChange={summary =>
                                updateEpisode(movie => {
                                  movie.seasons[seasonIndex].episodes[
                                    episodeIndex
                                  ].summary = summary;
                                })(seasonIndex)(episodeIndex)
                              }
                            />
                          </div>
                        </div>
                      ))}

                      <button
                        className="btn btn-primary"
                        onClick={() =>
                          MovieAPI.addEpisode(movie, season, user).then(
                            mergeContext
                          )
                        }
                      >
                        <i className="fas fa-plus" />
                        &nbsp;Add episode
                      </button>
                    </Fragment>
                  ))}
                </div>
                <button
                  className="btn btn-primary"
                  onClick={() =>
                    MovieAPI.addSeason(movie, user).then(mergeContext)
                  }
                >
                  <i className="fas fa-plus" />
                  &nbsp;Add season
                </button>
              </Fragment>
            ) : (
              undefined
            )}
          </div>
        </div>
      )}
    </div>
  );
});
