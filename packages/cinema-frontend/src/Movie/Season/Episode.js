import { EditableInput, EditableTextarea } from "../../Common/EditableField";
import React, { useContext, useState } from "react";
import { UserContext } from "../../Login/UserContext";
import { produce } from "immer";
import * as MovieAPI from "../MovieAPI";
import { MovieContext } from "../Movie";
import { SeasonContext } from "./Season";

export const Episode = ({ episode, index, onEpisodeChanged }) => {
  // get contexts
  const user = useContext(UserContext);
  const { movie, lock } = useContext(MovieContext);
  const { season, index: seasonIndex } = useContext(SeasonContext);
  const [ellipsis, setEllipsis] = useState("ellipsis");

  // actions
  const updateSeason = transform => {
    const newMovie = produce(movie, transform);
    const season = newMovie.seasons[seasonIndex];
    // onEpisodeChanged(newMovie);
    MovieAPI.updateSeason(newMovie, season, user).then(onEpisodeChanged);
  };
  const updateEpisode = transform => {
    const newMovie = produce(movie, transform);
    const season = newMovie.seasons[seasonIndex];
    const episode = season.episodes[index];
    MovieAPI.updateEpisode(newMovie, season, episode, user).then(
      onEpisodeChanged
    );
  };

  return (
    <div className="row episode mr-0 ml-0">
      <div className=" col-md-12 col-xl-2 align-items-center d-flex p-0">
        {!lock && (
          <i
            className="fas fa-times delete-episode"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              if (window.confirm("Delete episode ?")) {
                MovieAPI.deleteEpisode(movie, season, episode, user).then(
                  onEpisodeChanged
                );
              }
            }}
          />
        )}
        <div
          className="text-center col-1"
          style={{
            color: episode.seen ? "var(--success)" : "",
            fontWeight: episode.seen ? "bold" : "",
            cursor: "pointer"
          }}
          onClick={() =>
            updateSeason(movie => {
              if (!movie.seasons[seasonIndex].episodes[index].seen) {
                for (let i = 0; i <= index; i++) {
                  movie.seasons[seasonIndex].episodes[i].seen = true;
                }
              } else {
                // eslint-disable-next-line prettier/prettier
                for (let i = index; i < movie.seasons[seasonIndex].episodes.length; i++) {
                  movie.seasons[seasonIndex].episodes[i].seen = false;
                }
              }
            })
          }
        >
          {index + 1}
        </div>
        <div className="text-center col-11">
          <EditableInput
            lock={lock}
            className={`font-weight-bold episode-title ${
              episode.seen ? "seen" : ""
            }`}
            value={episode.title}
            placeholder="Title"
            onChange={title =>
              updateEpisode(movie => {
                movie.seasons[seasonIndex].episodes[index].title = title;
              })
            }
          />
        </div>
      </div>
      <div className="col-md-12 col-xl-10 align-items-center d-flex">
        <EditableTextarea
          lock={lock}
          style={{ width: "100%" }}
          rows={4}
          value={episode.summary}
          placeholder="Summary"
          className={`${ellipsis} d-block episode-summary w-100 text-left`}
          onChange={summary =>
            updateEpisode(movie => {
              movie.seasons[seasonIndex].episodes[index].summary = summary;
            })
          }
        />
        {ellipsis && (
          <span style={{ cursor: "pointer" }} onClick={() => setEllipsis("")}>
            <i className="fas fa-question-circle" />
          </span>
        )}
      </div>
    </div>
  );
};
