import React, { useContext } from "react";
import "./MovieList.css";
import { Link } from "react-router-dom";
import { MovieSeen } from "../Common/MovieSeen";
import { deleteMovie, updateMovie } from "../Common/MovieAPI";
import every from "lodash/every";
import some from "lodash/some";
import { UserContext } from "../Login/UserContext";
import { ApplicationContext } from "../ApplicationContext";
import { Tag } from "../Admin/Tag";

export const MovieCard = ({ movie, onEdit, onChange, onDelete }) => {
  const user = useContext(UserContext);
  const { tags } = useContext(ApplicationContext);
  const update = (field, value) => () => updateMovie({ ...movie, [field]: value }, user).then(onChange);

  const title = `${movie.title}`;
  const subtitle = `${movie.productionYear} - ${movie.genre.join(",")}`;

  return (
    <div className="card movie-card">
      <div className="card-body">
        <h5 className="card-title">
          <Link to={`movie/${movie._id}`}>
            <div className="ellipsis" title={title}>
              {title}
            </div>
          </Link>
        </h5>
        <h6 className="card-subtitle mb-2 text-muted ellipsis" title={subtitle}>
          {subtitle}
        </h6>
        <div className="movie-card-actions" style={{ position: "absolute", top: 2, right: 4 }}>
          <i
            className="fas fa-hippo"
            style={{
              cursor: "pointer",
              color: movie.lala ? "#9932cc" : "black"
            }}
            onClick={update("lala", !movie.lala)}
            title={movie.lala ? "Mark as not hippo " : "Mark as hippo"}
          />
          <i
            className="fas fa-film"
            style={{
              cursor: "pointer",
              color: movie.done ? "var(--success)" : "black"
            }}
            onClick={update("done", !movie.done)}
            title={movie.done ? "Mark as not done" : "Mark as done"}
          />
          {movie.type !== "Film" && (
            <i
              className="fas fa-ban"
              style={{
                cursor: "pointer",
                color: movie.finished ? "var(--danger)" : "black"
              }}
              onClick={update("finished", !movie.finished)}
              title={movie.finished ? "Mark tv show as in progress" : "Mark tv show as finished"}
            />
          )}
          {movie.type === "Film" ? (
            <MovieSeen seen={movie.seen} onClick={update("seen", !movie.seen)} />
          ) : (
            <MovieSeen
              seen={
                every(movie.seasons.map(season => every(season.episodes, "seen") && season.episodes.length > 0)) &&
                movie.seasons.length > 0
              }
              partial={
                some(movie.seasons.map(season => some(season.episodes, "seen") && season.episodes.length > 0)) &&
                movie.seasons.length > 0
              }
            />
          )}
          <i title="Edit" className="fas fa-pencil-alt" onClick={onEdit} style={{ cursor: "pointer" }} />
          <i
            className="fas fa-trash"
            onClick={() => {
              if (window.confirm()) {
                deleteMovie(movie, user).then(onDelete);
              }
            }}
            style={{ cursor: "pointer" }}
            title="Delete"
          />
        </div>
        <div className="poster text-center">
          <img src={movie.fileUrl ? movie.fileUrl.replace("http:", "https:") : "/no-image.png"} alt="movie poster" />
        </div>
        <div className="mt-2 text-center">
          {movie.tags.map(movieTag => (
            <Tag
              key={movieTag}
              {...tags.find(tag => tag._id === movieTag)}
              className="mr-2"
              onClick={() => {
                const tag = tags.find(tag => tag._id === movieTag);
                if (tag && tag.label.toLowerCase() === "netflix") {
                  window.open(`https://www.netflix.com/search?q=${movie.title}`, "_blank");
                }
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
