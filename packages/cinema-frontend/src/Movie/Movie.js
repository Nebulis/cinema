import React, { Fragment, useContext, useEffect, useState, useRef } from "react";
import { withRouter } from "react-router-dom";
import * as MovieAPI from "../Common/MovieAPI";
import { UserContext } from "../Login/UserContext";
import { MovieSeen } from "../Common/MovieSeen";
import { MoviesContext } from "../Common/MoviesContext";
import { produce } from "immer";
import { Season } from "./Season/Season";
import { EditableInput, EditableTextarea, EditableMultiSelect } from "../Common/EditableField";
import { useToggle } from "../Common/hooks";
import "./Movie.css";
import { ApplicationContext } from "../ApplicationContext";
import { Tag } from "../Admin/Tag";
import find from "lodash/find";
import { NotificationContext } from "../Notifications/NotificationContext";
import { createNotification, handleError, seasonTag } from "./Movie.util";
import { Loader } from "../Common/Loader";

export const MovieContext = React.createContext({});

const MovieTag = ({ tag, selected, onAdd, onDelete, lock }) =>
  !lock ? (
    <div onClick={selected ? onDelete : onAdd} className={`movie-tag ${selected ? "selected" : ""}`}>
      <Tag {...tag} className={`d-inline-block`} />
    </div>
  ) : selected ? (
    <div className="movie-tag selected">
      <Tag {...tag} className={`d-inline-block`} />
    </div>
  ) : null;

export const Movie = withRouter(({ match, history }) => {
  // get contexts
  const user = useContext(UserContext);
  const {
    state: { movies },
    dispatch: moviesDispatch
  } = useContext(MoviesContext);
  const [seasons, setSeasons] = useState(1);
  const { tags, genres } = useContext(ApplicationContext);
  const { dispatch } = useContext(NotificationContext);
  // create state
  const [drag, setDrag] = useState();
  const [lock, toggle] = useToggle(true);
  const [loadImage, setLoadImage] = useState(false);

  const fileRef = useRef();

  // create effects
  let movie = find(movies, ["_id", match.params.id]);
  useEffect(
    () => {
      if (!movie) {
        MovieAPI.getMovie(match.params.id, user)
          .then(movie => {
            moviesDispatch({ type: "ADD", payload: { movie } });
          })
          .catch(handleError(dispatch));
      }
    },
    [match.params.id]
  );

  // create actions

  const transformMovie = transform => {
    moviesDispatch({
      type: "UPDATE_WITH_TRANSFORM",
      payload: {
        id: movie._id,
        transform
      }
    });
  };
  const updateSeason = (season, seasonIndex, transform = value => value) => {
    return MovieAPI.updateSeason(movie, produce(season, transform), user)
      .then(season =>
        transformMovie(draft => {
          draft.seasons[seasonIndex] = season;
        })
      )
      .catch(handleError(dispatch));
  };
  const updateMovie = (transform = value => value) => {
    return MovieAPI.updateMovie(produce(movie, transform), user)
      .then(movie => {
        moviesDispatch({ type: "UPDATE", payload: { id: movie._id, movie } });
      })
      .catch(handleError(dispatch));
  };
  const handleFiles = files => {
    if (files.length === 1) {
      setLoadImage(true);
      MovieAPI.updateMoviePoster(movie, files[0], user)
        .then(movie => {
          fileRef.current.value = "";
          moviesDispatch({ type: "UPDATE", payload: { id: movie._id, movie } });
          createNotification(dispatch, `${movie.title} - Image uploaded`);
          setLoadImage(false);
        })
        .catch(error => {
          fileRef.current.value = "";
          handleError(dispatch)(error);
          setLoadImage(false);
        });
    }
  };
  const addSeasons = async () => {
    const times = seasons || 1;
    for (let i = 0; i < times; i++) {
      const newSeason = await MovieAPI.addSeason(movie, user).catch(handleError(dispatch));
      transformMovie(draft => {
        draft.seasons.push(newSeason);
      });
    }
    createNotification(dispatch, `${movie.title} - Added ${times} seasons`);
    setSeasons(1);
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
                <div>
                  <span
                    className={`d-inline-block ${!lock ? "editable-field" : ""}`}
                    onClick={() => !lock && fileRef.current.click()}
                    style={{ position: "relative" }}
                  >
                    {loadImage ? <Loader /> : null}
                    <img
                      src={movie.fileUrl ? movie.fileUrl.replace("http:", "https:") : "/no-image.png"}
                      style={{
                        height: "300px",
                        width: "225px",
                        cursor: lock ? "auto" : "pointer",
                        opacity: lock ? 1 : 0.3
                      }}
                      alt="movie poster"
                    />
                    {!lock && movie.fileUrl && (
                      <i
                        className="fas fa-times delete-poster"
                        title="Delete movie poster"
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          if (window.confirm("Delete poster ?")) {
                            updateMovie(movie => {
                              movie.fileUrl = "";
                            }).then(() => createNotification(dispatch, `${movie.title} - Poster deleted`));
                          }
                        }}
                      />
                    )}
                  </span>
                </div>
                <div className="d-flex flex-wrap mt-1 mb-1">
                  {tags.map(tag => (
                    <MovieTag
                      key={tag._id}
                      tag={tag}
                      lock={lock}
                      selected={movie.tags.find(movieTag => movieTag === tag._id)}
                      onAdd={() =>
                        updateMovie(movie => {
                          movie.tags.push(tag._id);
                        }).then(() => createNotification(dispatch, `${movie.title} - Tag ${tag.label} added`))
                      }
                      onDelete={() =>
                        updateMovie(movie => {
                          movie.tags = movie.tags.filter(movieTag => movieTag !== tag._id);
                        }).then(() => createNotification(dispatch, `${movie.title} - Tag ${tag.label} deleted`))
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
                      }).then(() => createNotification(dispatch, `${title} - Title updated`))
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
                      }).then(() => createNotification(dispatch, `${movie.title} - Production year updated`))
                    }
                  />
                </h1>
                <div className="text-center single-movie-subtitle mb-2">
                  <EditableMultiSelect
                    lock={lock}
                    value={movie.genre}
                    placeholder="Genre"
                    items={genres}
                    onChange={genres =>
                      updateMovie(movie => {
                        movie.genre = genres;
                      }).then(() => createNotification(dispatch, `${movie.title} - Genre updated`))
                    }
                  />
                </div>
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
                      }).then(() => createNotification(dispatch, `${movie.title} - Summary updated`))
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
                    }).then(() => createNotification(dispatch, `${movie.title} - Seen updated`))
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
                            updateMovie().then(() =>
                              createNotification(dispatch, `${seasonTag(seasonIndex)} - Reordered`)
                            );
                            setDrag();
                          }}
                          onProductionYearUpdate={async productionYear => {
                            const promises = [];
                            for (let i = seasonIndex; i < movie.seasons.length; i++) {
                              promises.push(
                                updateSeason(movie.seasons[i], i, draft => {
                                  draft.productionYear = productionYear + (i - seasonIndex);
                                  // remove episodes so that we update only the production year
                                  // backend expect no episodes to update specific field
                                  draft.episodes = null;
                                })
                              );
                            }
                            await Promise.all(promises);
                            createNotification(dispatch, "Seasons production years updated");
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
                        onKeyDown={event => {
                          if (event.key === "Enter") {
                            addSeasons();
                          }
                        }}
                        value={seasons}
                      />
                      <button className=" ml-1 btn btn-primary" onClick={addSeasons}>
                        <i className="fas fa-plus" title="Add seasons" />
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
