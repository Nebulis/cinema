import React from "react";
import "./MovieList.css";
import { withUser } from "../Login/UserContext";
import { Link } from "react-router-dom";
import { MovieSeen } from "../Common/MovieSeen";
import { deleteMovie, updateMovie } from "../Common/MovieAPI";
import every from "lodash/every";
import some from "lodash/some";

export const MovieCard = withUser(
  ({ movie, onEdit, user, onChange, onDelete }) => {
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
          <h6
            className="card-subtitle mb-2 text-muted ellipsis"
            title={subtitle}
          >
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
            <span
              className="netflix-small"
              style={{
                color: movie.netflix ? "var(--danger)" : "black"
              }}
              onClick={update("netflix", !movie.netflix)}
            >
              N
            </span>
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
            <img src={movie.fileUrl} alt="movie poster" />
          </div>
        </div>
      </div>
    );
  }
);
