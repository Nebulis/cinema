import { useContext, Fragment, useState } from "react";
import { EditableInput } from "../../Common/EditableField";
import * as MovieAPI from "../../Common/MovieAPI";
import React from "react";
import { produce } from "immer";
import { UserContext } from "../../Login/UserContext";
import "./Season.css";
import { MovieSeen } from "../../Common/MovieSeen";
import { Episode } from "./Episode";
import every from "lodash/every";
import some from "lodash/some";
import { useToggle } from "../../Common/hooks";
import { MovieContext } from "../../Movie/Movie";

export const SeasonContext = React.createContext({});

export const Season = ({ season, index, onMovieChanged }) => {
  // get contexts
  const user = useContext(UserContext);
  const { movie, lock } = useContext(MovieContext);
  const [open, toggle] = useToggle();
  const [episodes, setEpisodes] = useState(1);

  // actions
  const updateSeason = transform => {
    const newMovie = produce(movie, transform);
    const season = newMovie.seasons[index];
    MovieAPI.updateSeason(newMovie, season, user).then(onMovieChanged);
  };

  const seen = every(season.episodes, "seen") && season.episodes.length > 0;
  const oneSeen = some(season.episodes, "seen") && season.episodes.length > 0;

  return (
    <div className="season">
      <div className="season-header" onClick={toggle}>
        <div>
          <div
            className="season-header-view"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              updateSeason(movie => {
                movie.seasons[index].seen = !seen;
              });
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
                  MovieAPI.deleteSeason(movie, season, user).then(
                    onMovieChanged
                  );
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
              updateSeason(movie => {
                movie.seasons[index].productionYear = productionYear;
              })
            }
          />
        </div>
        <div className="season-header-arrow">
          {open ? (
            <i className="fas fa-chevron-up" />
          ) : (
            <i className="fas fa-chevron-down" />
          )}
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
              />
            ))}
        </SeasonContext.Provider>
      </div>

      {!lock ? (
        <Fragment>
          {open && (
            <div className="form-inline d-block mt-1 mb-1">
              <input
                type="number"
                className="form-control"
                style={{ width: "80px" }}
                onChange={event =>
                  setEpisodes(parseInt(event.target.value, 10))
                }
                value={episodes}
              />
              <button
                className=" ml-1 btn btn-primary"
                onClick={async () => {
                  let times = episodes || 1;
                  while (times > 0) {
                    await MovieAPI.addEpisode(movie, season, user);
                    times--;
                  }
                  setEpisodes(1);
                  MovieAPI.getMovie(movie._id, user).then(onMovieChanged);
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
