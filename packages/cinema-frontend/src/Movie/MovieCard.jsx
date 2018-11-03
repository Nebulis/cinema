import React from "react";
import "./Movie.css";
import { withUser } from "../Login/UserContext";
import { Link } from "react-router-dom";
import { MovieSeen } from "./MovieSeen";
import { deleteMovie, updateMovie } from "./MovieAPI";
import every from "lodash/every";

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
            <i
              className="fab fa-neos"
              style={{
                cursor: "pointer",
                color: movie.netflix ? "var(--danger)" : "black"
              }}
              onClick={update("netflix", !movie.netflix)}
            />
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
              />
            )}
            <i
              className="fas fa-pencil-alt"
              onClick={onEdit}
              style={{ cursor: "pointer" }}
            />
            <i
              className="fas fa-ban"
              style={{
                cursor: "pointer",
                color: movie.finished ? "#fecc00" : "black"
              }}
              onClick={update("finished", !movie.finished)}
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
