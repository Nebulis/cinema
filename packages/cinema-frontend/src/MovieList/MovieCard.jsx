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
  const update = (field, value) => () =>
    updateMovie({ ...movie, [field]: value }, user).then(onChange);

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
        <div
          className="movie-card-actions"
          style={{ position: "absolute", top: 2, right: 4 }}
        >
          {movie.type !== "Film" && (
            <i
              className="fas fa-ban"
              style={{
                cursor: "pointer",
                color: movie.finished ? "var(--danger)" : "black"
              }}
              onClick={update("finished", !movie.finished)}
            />
          )}
          {movie.type === "Film" ? (
            <MovieSeen
              seen={movie.seen}
              onClick={update("seen", !movie.seen)}
            />
          ) : (
            <MovieSeen
              seen={
                every(
                  movie.seasons.map(
                    season =>
                      every(season.episodes, "seen") &&
                      season.episodes.length > 0
                  )
                ) && movie.seasons.length > 0
              }
              partial={
                some(
                  movie.seasons.map(
                    season =>
                      some(season.episodes, "seen") &&
                      season.episodes.length > 0
                  )
                ) && movie.seasons.length > 0
              }
            />
          )}
          <i
            className="fas fa-pencil-alt"
            onClick={onEdit}
            style={{ cursor: "pointer" }}
          />
          <i
            className="fas fa-trash"
            onClick={() => {
              if (window.confirm()) {
                deleteMovie(movie, user).then(onDelete);
              }
            }}
            style={{ cursor: "pointer" }}
          />
        </div>
        <div className="poster text-center">
          <img
            src={
              movie.fileUrl
                ? movie.fileUrl.replace("http:", "https:")
                : "/no-image.png"
            }
            alt="movie poster"
          />
        </div>
        <div className="mt-2 text-center">
          {movie.tags.map(movieTag => (
            <Tag
              key={movieTag}
              {...tags.find(tag => tag._id === movieTag)}
              className="mr-2"
            />
          ))}
        </div>
      </div>
    </div>
  );
};
