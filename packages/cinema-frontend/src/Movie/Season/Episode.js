import { EditableInput, EditableTextarea } from "../../Common/EditableField";
import React, { useContext, useState } from "react";
import { UserContext } from "../../Login/UserContext";
import { produce } from "immer";
import * as MovieAPI from "../MovieAPI";

export const Episode = ({
  movie,
  episode,
  index,
  onEpisodeChanged,
  seasonIndex
}) => {
  // get contexts
  const user = useContext(UserContext);
  const [ellipsis, setEllipsis] = useState("ellipsis");

  // actions
  const updateEpisode = transform => seasonIndex => {
    const newMovie = produce(movie, transform);
    const season = newMovie.seasons[seasonIndex];
    const episode = season.episodes[index];
    console.log(season, episode);
    MovieAPI.updateEpisode(newMovie, season, episode, user).then(
      onEpisodeChanged
    );
  };

  return (
    <div className="row episode mr-0 ml-0">
      <div className=" col-md-12 col-xl-2 align-items-center d-flex p-0">
        <div
          className="text-center col-1"
          style={{
            color: episode.seen ? "var(--success)" : "",
            fontWeight: episode.seen ? "bold" : "",
            cursor: "pointer"
          }}
          onClick={() =>
            updateEpisode(movie => {
              movie.seasons[seasonIndex].episodes[index].seen = !movie.seasons[
                seasonIndex
              ].episodes[index].seen;
            })(seasonIndex)
          }
        >
          {index + 1}
        </div>
        <div className="text-center col-11">
          <EditableInput
            className="font-weight-bold episode-title"
            value={episode.title}
            placeholder="Title"
            onChange={title =>
              updateEpisode(movie => {
                movie.seasons[seasonIndex].episodes[index].title = title;
              })(seasonIndex)
            }
          />
        </div>
      </div>
      <div className="col-md-12 col-xl-10 align-items-center d-flex">
        <EditableTextarea
          style={{ width: "100%" }}
          rows={4}
          value={episode.summary}
          placeholder="Summary"
          className={`${ellipsis} d-block episode-summary w-100 text-left`}
          onChange={summary =>
            updateEpisode(movie => {
              movie.seasons[seasonIndex].episodes[index].summary = summary;
            })(seasonIndex)
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
