import React, { Fragment, useContext, useEffect, useState, useRef } from "react";
import { withRouter } from "react-router-dom";
import * as MovieAPI from "../Common/MovieAPI";
import { UserContext } from "../Login/UserContext";
import { MovieSeen } from "../Common/MovieSeen";
import { MoviesContext } from "../Common/MoviesContext";
import { produce } from "immer";
import { Season } from "./Season/Season";
import { EditableInput, EditableTextarea } from "../Common/EditableField";
import { useToggle } from "../Common/hooks";
import "./Movie.css";
import { ApplicationContext } from "../ApplicationContext";
import { Tag } from "../Admin/Tag";
import { NotificationContext } from "../Notifications/NotificationContext";

export const MovieContext = React.createContext({});

const MovieTag = ({ tag, selected, onAdd, onDelete, lock }) =>
  !lock ? (
    <span onClick={selected ? onDelete : onAdd} className="mt-1">
      <Tag {...tag} className={`movie-tag mr-1 ${selected ? "selected" : ""}`} />
    </span>
  ) : selected ? (
    <span className="mt-1">
      <Tag {...tag} className={`mr-1 selected`} />
    </span>
  ) : null;
export const Movie = withRouter(({ match, history }) => {
  // get contexts
  const user = useContext(UserContext);
  const movies = useContext(MoviesContext);
  const [seasons, setSeasons] = useState(1);
  const { tags } = useContext(ApplicationContext);
  const { dispatch } = useContext(NotificationContext);
  // create state
  const [drag, setDrag] = useState();
  const [movie, setMovie] = useState();
  const [lock, toggle] = useToggle(true);

  const fileRef = useRef();

  // create effects
  useEffect(() => MovieAPI.getMovie(match.params.id, user).then(setMovie), [match.params.id]);

  // create actions
  const seasonTag = seasonIndex => {
    return `S${(seasonIndex + 1).toString().padStart(2, "0")}`;
  };
  const handleError = error => {
    createNotification(error.message, "error");
    throw error;
  };
  const createNotification = (content, type = "success") => {
    dispatch({
      type: "ADD",
      payload: {
        content,
        type
      }
    });
  };
  const updateMovie = (transform = value => value) => {
    return MovieAPI.updateMovie(produce(movie, transform), user)
      .then(mergeContext)
      .catch(handleError);
  };
  const handleFiles = files => {
    if (files.length === 1) {
      MovieAPI.updateMoviePoster(movie, files[0], user)
        .then(mergeContext)
        .then(() => createNotification(`${movie.title} - Image uploaded`))
        .catch(handleError);
    }
  };

  // helper
  const mergeContext = updatedMovie => {
    setMovie(updatedMovie);
    movies.update(updatedMovie._id, updatedMovie);
  };

  return (
    <div className="container movie-container">
      {!movie ? (
        <h2 className="text-center mt-2">
          <i className="fas fa-spinner fa-spin fa-2x" />
        </h2>
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
          <div className="p-5 mt-3 single-movie-card" style={{ position: "relative" }}>
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
              title={`Click to ${lock ? "open" : "close"} movie for modifications`}
            />
            <div className="d-flex">
              <div className="d-flex" style={{ flex: "0 0 250px", flexDirection: "column" }}>
                <input
                  accept=".jpg, .jpeg, .png"
                  type="file"
                  ref={fileRef}
                  style={{ display: "none" }}
                  onChange={event => handleFiles(event.target.files)}
                />
                <img
                  src={movie.fileUrl ? movie.fileUrl.replace("http:", "https:") : "/no-image.png"}
                  style={{
                    height: "300px",
                    width: "225px",
                    cursor: lock ? "auto" : "pointer"
                  }}
                  alt="movie poster"
                  onClick={() => !lock && fileRef.current.click()}
                />
                <div className="d-flex flex-wrap">
                  {tags.map(tag => (
                    <MovieTag
                      key={tag._id}
                      tag={tag}
                      lock={lock}
                      selected={movie.tags.find(movieTag => movieTag === tag._id)}
                      onAdd={() =>
                        updateMovie(movie => {
                          movie.tags.push(tag._id);
                        }).then(() => createNotification(`${movie.title} - Tag ${tag.label} added`))
                      }
                      onDelete={() =>
                        updateMovie(movie => {
                          movie.tags = movie.tags.filter(movieTag => movieTag !== tag._id);
                        }).then(() => createNotification(`${movie.title} - Tag ${tag.label} deleted`))
                      }
                    />
                  ))}
                </div>
              </div>
              <div className="pl-4 d-flex flex-column" style={{ flexGrow: 1 }}>
                <h1 className="text-center">
                  <EditableInput
                    lock={lock}
                    value={movie.title}
                    placeholder="Title"
                    onChange={title =>
                      updateMovie(movie => {
                        movie.title = title;
                      }).then(() => createNotification(`${title} - Title updated`))
                    }
                  />{" "}
                  -{" "}
                  <EditableInput
                    lock={lock}
                    value={movie.productionYear}
                    placeholder="YYYY"
                    type="number"
                    transform={value => parseInt(value, 10)}
                    onChange={productionYear =>
                      updateMovie(movie => {
                        movie.productionYear = productionYear;
                      }).then(() => createNotification(`${movie.title} - Production year updated`))
                    }
                  />
                </h1>
                <h6 className="text-center single-movie-subtitle">{movie.genre.join(",")}</h6>
                <div>
                  <EditableTextarea
                    split={true}
                    lock={lock}
                    value={movie.summary}
                    style={{ width: "100%" }}
                    placeholder="Summary"
                    rows="7"
                    onChange={summary =>
                      updateMovie(movie => {
                        movie.summary = summary;
                      }).then(() => createNotification(`${movie.title} - Summary updated`))
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              {movie.type === "Film" ? (
                <MovieSeen
                  seen={movie.seen}
                  onClick={() =>
                    updateMovie(movie => {
                      movie.seen = !movie.seen;
                    }).then(() => createNotification(`${movie.title} - Seen updated`))
                  }
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
                          key={season._id}
                          season={season}
                          index={seasonIndex}
                          onMovieChanged={mergeContext}
                          dragging={drag !== undefined}
                          onDragStart={() => setDrag(seasonIndex)}
                          onDragOver={() => {
                            if (seasonIndex !== drag) {
                              setDrag(seasonIndex);
                              movie.seasons = produce(movie.seasons, draft => {
                                const tmp = draft[seasonIndex];
                                draft[seasonIndex] = draft[drag];
                                draft[drag] = tmp;
                              });
                            }
                          }}
                          onDragEnd={() => {
                            updateMovie().then(() => createNotification(`${seasonTag(seasonIndex)} - Reordered`));
                            setDrag();
                          }}
                        />
                      ))}
                    </div>
                  </MovieContext.Provider>
                  {!lock ? (
                    <div className="form-inline d-block mt-1 mb-1">
                      <input
                        type="number"
                        className="form-control"
                        style={{ width: "80px" }}
                        onChange={event => setSeasons(parseInt(event.target.value, 10))}
                        value={seasons}
                      />
                      <button
                        className=" ml-1 btn btn-primary"
                        onClick={async () => {
                          const initialTimes = seasons || 1;
                          let times = seasons || 1;
                          while (times > 0) {
                            await MovieAPI.addSeason(movie, user);
                            times--;
                          }
                          setSeasons(1);
                          MovieAPI.getMovie(movie._id, user)
                            .then(mergeContext)
                            .then(() => createNotification(`${movie.title} - Added ${initialTimes} seasons`));
                        }}
                      >
                        <i className="fas fa-plus" />
                        &nbsp;Add season
                      </button>
                    </div>
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
