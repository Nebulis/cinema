import { Fragment, useContext, useState } from "react";
import { EditableField } from "../../Common/EditableField";
import * as MovieAPI from "../MovieAPI";
import React from "react";
import { produce } from "immer";
import { UserContext } from "../../Login/UserContext";
import "./Season.css";

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
  const updateSeason = transform => seasonIndex => {
    const newMovie = produce(movie, transform);
    const season = newMovie.seasons[seasonIndex];
    MovieAPI.updateSeason(newMovie, season, user).then(onMovieChanged);
  };
  const updateEpisode = transform => seasonIndex => episodeIndex => {
    const newMovie = produce(movie, transform);
    const season = newMovie.seasons[seasonIndex];
    const episode = season.episodes[episodeIndex];
    console.log(season, episode);
    MovieAPI.updateEpisode(newMovie, season, episode, user).then(
      onMovieChanged
    );
  };

  return (
    <div className="season">
      <div className="season-header" onClick={toggle}>
        <div>
          Season {index + 1}
          &nbsp;-&nbsp;
          <EditableField
            placeholder="YYYY"
            value={season.productionYear}
            transform={value => parseInt(value, 10)}
            onChange={productionYear =>
              updateSeason(movie => {
                movie.seasons[index].productionYear = productionYear;
              })(index)
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
            <div key={episode._id} className="d-flex episode">
              <div className="col-2 align-items-center d-flex p-0">
                <div className="text-center col-1">{episodeIndex + 1}</div>
                <div className="text-center col-11">
                  <EditableField
                    bold={true}
                    value={episode.title}
                    placeholder="Title"
                    onChange={title =>
                      updateEpisode(movie => {
                        movie.seasons[index].episodes[
                          episodeIndex
                        ].title = title;
                      })(index)(episodeIndex)
                    }
                  />
                </div>
              </div>
              <div className="col-10">
                <EditableField
                  value={episode.summary}
                  placeholder="Summary"
                  onChange={summary =>
                    updateEpisode(movie => {
                      movie.seasons[index].episodes[
                        episodeIndex
                      ].summary = summary;
                    })(index)(episodeIndex)
                  }
                />
              </div>
            </div>
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
