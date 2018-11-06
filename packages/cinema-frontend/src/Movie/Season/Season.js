import { useContext, useState } from "react";
import { EditableInput } from "../../Common/EditableField";
import * as MovieAPI from "../MovieAPI";
import React from "react";
import { produce } from "immer";
import { UserContext } from "../../Login/UserContext";
import "./Season.css";
import { MovieSeen } from "../MovieSeen";
import { Episode } from "./Episode";
import every from "lodash/every";

const useAccordion = (initialValue = false) => {
  const [open, setOpen] = useState(initialValue);
  const toggle = () => setOpen(!open);
  return [open, toggle];
};

export const Season = ({ movie, season, index, onMovieChanged }) => {
  // get contexts
  const user = useContext(UserContext);
  const [open, toggle] = useAccordion();

  // actions
  const updateSeason = transform => {
    const newMovie = produce(movie, transform);
    const season = newMovie.seasons[index];
    MovieAPI.updateSeason(newMovie, season, user).then(onMovieChanged);
  };

  const seen = every(season.episodes, "seen") && season.episodes.length > 0;

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
            <MovieSeen seen={seen} />
          </div>
          Season {index + 1}
          &nbsp;-&nbsp;
          <EditableInput
            placeholder="YYYY"
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
        {open &&
          season.episodes.map((episode, episodeIndex) => (
            <Episode
              key={episode._id}
              movie={movie}
              episode={episode}
              seasonIndex={index}
              index={episodeIndex}
              onEpisodeChanged={onMovieChanged}
            />
          ))}
      </div>

      {open && (
        <button
          className="btn btn-primary"
          onClick={() =>
            MovieAPI.addEpisode(movie, season, user).then(onMovieChanged)
          }
        >
          <i className="fas fa-plus" />
          &nbsp;Add episode
        </button>
      )}
    </div>
  );
};
