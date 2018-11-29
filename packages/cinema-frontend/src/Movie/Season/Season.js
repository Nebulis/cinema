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

export const SeasonContext = React.createContext({});

export const Season = ({
  season,
  index,
  onMovieChanged, // TODO this is a design flow ... it should be onSeasonChanged and update the season only
  onDragStart,
  onDragOver,
  onDragEnd,
  dragging
}) => {
  // get contexts
  const user = useContext(UserContext);
  const { movie, lock } = useContext(MovieContext);
  const { dispatch } = useContext(NotificationContext);

  const [open, toggle] = useToggle();
  const [episodes, setEpisodes] = useState(1);
  const [opacity, setOpacity] = useState("1");
  const [drag, setDrag] = useState();

  // actions
  const episodeTag = episodeIndex => {
    return `${seasonTag()}E${(episodeIndex + 1).toString().padStart(2, "0")}`;
  };
  const seasonTag = () => {
    return `S${(index + 1).toString().padStart(2, "0")}`;
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
  const updateSeason = (transform = value => value) => {
    return MovieAPI.updateSeason(movie, produce(season, transform), user)
      .then(onMovieChanged)
      .catch(handleError);
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
          <div
            className="season-header-view"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              updateSeason(season => {
                season.seen = !seen;
              }).then(() => createNotification(`${seasonTag()} - Seen updated`));
            }}
          >
            <MovieSeen seen={seen} partial={oneSeen} />
          </div>
          {!lock && (
            <i
              className="fas fa-times delete-season"
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                if (window.confirm("Delete season ?")) {
                  MovieAPI.deleteSeason(movie, season, user)
                    .then(onMovieChanged)
                    .then(() => createNotification(`${seasonTag()} - Deleted`))
                    .catch(handleError);
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
            onChange={productionYear =>
              updateSeason(season => {
                season.productionYear = productionYear;
              }).then(() => createNotification(`${seasonTag()} - Production year updated`))
            }
          />
        </div>
        <div className="season-header-arrow">
          {open ? <i className="fas fa-chevron-up" /> : <i className="fas fa-chevron-down" />}
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
                onEpisodeChanged={onMovieChanged}
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
                  updateSeason().then(() => createNotification(`${episodeTag(index)} - Reordered`));
                  setDrag();
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
                value={episodes}
              />
              <button
                className=" ml-1 btn btn-primary"
                onClick={async () => {
                  const initialTimes = episodes || 1;
                  let times = episodes || 1;
                  while (times > 0) {
                    await MovieAPI.addEpisode(movie, season, user);
                    times--;
                  }
                  setEpisodes(1);
                  MovieAPI.getMovie(movie._id, user)
                    .then(onMovieChanged)
                    .then(() => createNotification(`${seasonTag()} - Added ${initialTimes} episodes`));
                }}
              >
                <i className="fas fa-plus" />
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
