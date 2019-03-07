import React, { useContext, Fragment, useState } from "react";
import { EditableInput } from "../../Common/EditableField";
import * as MovieAPI from "../../Common/MovieAPI";
import { produce } from "immer";
import { UserContext } from "../../Login/UserContext";
import { MovieSeen } from "../../Common/MovieSeen";
import { Episode } from "./Episode";
import every from "lodash/every";
import some from "lodash/some";
import { useToggle } from "../../Common/hooks";
import { MovieContext } from "../../Movie/Movie";
import { NotificationContext } from "../../Notifications/NotificationContext";
import "./Season.css";
import { MoviesContext } from "../../Common/MoviesContext";
import { createNotification, episodeTag, handleError, seasonTag } from "../Movie.util";

export const SeasonContext = React.createContext({});

export const Season = ({ season, index, onDragStart, onDragOver, onDragEnd, dragging, onProductionYearUpdate }) => {
  // get contexts
  const user = useContext(UserContext);
  const { movie, lock } = useContext(MovieContext);
  const { dispatch } = useContext(NotificationContext);
  const { dispatch: moviesDispatch } = useContext(MoviesContext);

  const [open, toggle] = useToggle();
  const [episodes, setEpisodes] = useState(1);
  const [opacity, setOpacity] = useState("1");
  const [drag, setDrag] = useState();

  // actions
  const transformSeason = transform => {
    moviesDispatch({
      type: "UPDATE_WITH_TRANSFORM",
      payload: {
        id: movie._id,
        transform
      }
    });
  };
  const updateSeason = (transform = value => value) => {
    return MovieAPI.updateSeason(movie, produce(season, transform), user)
      .then(season =>
        transformSeason(draft => {
          draft.seasons[index] = season;
        })
      )
      .catch(handleError(dispatch));
  };
  const updateEpisode = (episode, episodeIndex, transform = value => value) => {
    const transformedEpisode = produce(episode, transform); // optimistic update
    transformSeason(draft => {
      draft.seasons[index].episodes[episodeIndex] = transformedEpisode;
    });
    return MovieAPI.updateEpisode(movie, season, transformedEpisode, user).catch(error => {
      //revert on error
      transformSeason(draft => {
        draft.seasons[index].episodes[episodeIndex] = episode;
      });
      handleError(dispatch)(error);
    });
  };
  const addEpisodes = async () => {
    const times = episodes || 1;
    for (let i = 0; i < times; i++) {
      const newEpisode = await MovieAPI.addEpisode(movie, season, user).catch(handleError(dispatch));
      transformSeason(draft => {
        draft.seasons[index].episodes.push(newEpisode);
      });
    }
    createNotification(dispatch, `${seasonTag(index)} - Added ${times} episodes`);
    setEpisodes(1);
  };

  const seen = every(season.episodes, "seen") && season.episodes.length > 0;
  const oneSeen = some(season.episodes, "seen") && season.episodes.length > 0;

  return (
    <div
      className="season"
      draggable={!lock}
      onDragStart={event => {
        setOpacity("0.5");
        event.dataTransfer.dropEffect = "move";
        event.stopPropagation();
        onDragStart();
      }}
      onDragEnd={event => {
        event.stopPropagation();
        onDragEnd();
        setOpacity("1.5");
      }}
      onDragOver={() => {
        dragging && onDragOver();
      }}
      style={{
        opacity
      }}
    >
      <div className="season-header" onClick={toggle}>
        <div>
          <MovieSeen
            seen={seen}
            partial={oneSeen}
            onClick={async event => {
              event.preventDefault();
              event.stopPropagation();
              const promises = [];
              for (let i = 0; i < season.episodes.length; i++) {
                // only update episodes for which seen value is different
                if (season.episodes[i].seen !== !seen) {
                  promises.push(
                    updateEpisode(season.episodes[i], i, draft => {
                      draft.seen = !seen;
                    })
                  );
                }
              }
              await Promise.all(promises);
              createNotification(dispatch, `${seasonTag(index)} - ${seen ? "unseen" : "seen"}`);
            }}
          />
        </div>
        <div>
          {!lock && (
            <i
              title={`Delete season ${index + 1}`}
              className="fas fa-times delete-season"
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                if (window.confirm("Delete season ?")) {
                  MovieAPI.deleteSeason(movie, season, user)
                    .then(() =>
                      transformSeason(draft => {
                        draft.seasons = draft.seasons.filter(s => s._id !== season._id);
                      })
                    )
                    .then(() => createNotification(dispatch, `${seasonTag(index)} - Deleted`))
                    .catch(handleError(dispatch));
                }
              }}
            />
          )}
          &nbsp;Season {index + 1}
          &nbsp;-&nbsp;
          <EditableInput
            lock={lock}
            placeholder="YYYY"
            type="number"
            value={season.productionYear}
            transform={value => parseInt(value, 10)}
            onChange={productionYear => onProductionYearUpdate(productionYear)}
          />
        </div>
        <div className="season-header-arrow">
          {open ? <i className="fas fa-chevron-up" title="Hide" /> : <i className="fas fa-chevron-down" title="Show" />}
        </div>
      </div>
      <div className="episodes">
        <SeasonContext.Provider value={{ season, index }}>
          {open &&
            season.episodes.map((episode, episodeIndex) => (
              <Episode
                key={episode._id}
                episode={episode}
                index={episodeIndex}
                dragging={drag !== undefined}
                onDragStart={() => {
                  setDrag(episodeIndex);
                }}
                onDragOver={() => {
                  if (episodeIndex !== drag) {
                    setDrag(episodeIndex);
                    season.episodes = produce(season.episodes, draft => {
                      const tmp = draft[episodeIndex];
                      draft[episodeIndex] = draft[drag];
                      draft[drag] = tmp;
                    });
                  }
                }}
                onDragEnd={() => {
                  updateSeason().then(() =>
                    createNotification(dispatch, `${episodeTag(index, episodeIndex)} - Reordered`)
                  );
                  setDrag();
                }}
                onSeen={async seen => {
                  const promises = [];
                  if (!seen) {
                    promises.push(
                      updateEpisode(season.episodes[episodeIndex], episodeIndex, draft => {
                        draft.seen = false;
                      })
                    );
                  } else {
                    for (let i = 0; i <= episodeIndex; i++) {
                      // only update episodes that are not seen
                      if (!season.episodes[i].seen) {
                        promises.push(
                          updateEpisode(season.episodes[i], i, draft => {
                            draft.seen = true;
                          })
                        );
                      }
                    }
                  }
                  await Promise.all(promises);
                  createNotification(dispatch, `Episodes set to ${seen ? "seen" : "unseen"}`);
                }}
              />
            ))}
        </SeasonContext.Provider>
      </div>

      {!lock ? (
        <Fragment>
          {open && (
            <div
              className="form-inline d-block mt-1 mb-1"
              draggable={true}
              onDragStart={event => {
                // disable drag and drop for this element
                event.preventDefault();
                event.stopPropagation();
              }}
            >
              <input
                type="number"
                className="form-control"
                style={{ width: "80px" }}
                onChange={event => setEpisodes(parseInt(event.target.value, 10))}
                onKeyDown={event => {
                  if (event.key === "Enter") {
                    addEpisodes();
                  }
                }}
                value={episodes}
              />
              <button className=" ml-1 btn btn-primary" onClick={addEpisodes}>
                <i className="fas fa-plus" title="Add episode" />
                &nbsp;Add episode
              </button>
            </div>
          )}
        </Fragment>
      ) : (
        undefined
      )}
    </div>
  );
};
