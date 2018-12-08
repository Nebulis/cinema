import { EditableInput, EditableTextarea } from "../../Common/EditableField";
import React, { useContext, useState } from "react";
import { UserContext } from "../../Login/UserContext";
import { produce } from "immer";
import * as MovieAPI from "../../Common/MovieAPI";
import { MovieContext } from "../Movie";
import { SeasonContext } from "./Season";
import { NotificationContext } from "../../Notifications/NotificationContext";
import { MoviesContext } from "../../Common/MoviesContext";
import { createNotification, episodeTag } from "../Movie.util";

export const Episode = ({ episode, index, onDragStart, onDragOver, onDragEnd, dragging, onSeen }) => {
  // get contexts
  const user = useContext(UserContext);
  const { movie, lock } = useContext(MovieContext);
  const { season, index: seasonIndex } = useContext(SeasonContext);
  const { dispatch } = useContext(NotificationContext);
  const { dispatch: moviesDispatch } = useContext(MoviesContext);

  // local state
  const [ellipsis, setEllipsis] = useState("ellipsis");
  const [style, setStyle] = useState({});

  // actions
  const transformEpisode = transform => {
    moviesDispatch({
      type: "UPDATE_WITH_TRANSFORM",
      payload: {
        id: movie._id,
        transform
      }
    });
  };
  const updateEpisode = transform => {
    const transformedEpisode = produce(episode, transform); // optimistic update
    transformEpisode(draft => {
      draft.seasons[seasonIndex].episodes[index] = transformedEpisode;
    });
    return MovieAPI.updateEpisode(movie, season, transformedEpisode, user).catch(_ => {
      //revert on error
      transformEpisode(draft => {
        draft.seasons[seasonIndex].episodes[index] = episode;
      });
    });
  };

  return (
    <div
      className="row episode mr-0 ml-0"
      draggable={!lock}
      onDragStart={event => {
        setStyle({
          backgroundColor: "var(--movie-secondary-lighter)",
          opacity: "0.4",
          color: "var(--movie-primary)"
        });
        event.dataTransfer.dropEffect = "move";
        event.stopPropagation();
        onDragStart();
      }}
      onDragOver={() => {
        dragging && onDragOver();
      }}
      onDragEnd={event => {
        event.stopPropagation();
        onDragEnd();
        setStyle({});
      }}
      style={style}
    >
      <div className=" col-md-12 col-xl-2 align-items-center d-flex p-0">
        {!lock && (
          <i
            className="fas fa-times delete-episode"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              if (window.confirm("Delete episode ?")) {
                MovieAPI.deleteEpisode(movie, season, episode, user)
                  .then(() =>
                    transformEpisode(draft => {
                      draft.seasons[seasonIndex].episodes = draft.seasons[seasonIndex].episodes.filter(
                        e => e._id !== episode._id
                      );
                    })
                  )
                  .then(() => createNotification(dispatch, `${episodeTag(seasonIndex, index)} - Deleted`));
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
          onClick={() => onSeen(!episode.seen)}
        >
          {index + 1}
        </div>
        <div className="text-center col-11">
          <EditableInput
            lock={lock}
            className={`font-weight-bold episode-title ${episode.seen ? "seen" : ""}`}
            value={episode.title}
            placeholder="Title"
            onChange={title =>
              updateEpisode(episode => {
                episode.title = title;
              }).then(() => createNotification(dispatch, `${episodeTag(seasonIndex, index)} - Title updated`))
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
            updateEpisode(episode => {
              episode.summary = summary;
            }).then(() => createNotification(dispatch, `${episodeTag(seasonIndex, index)} - Summary updated`))
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
