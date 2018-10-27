import React from "react";
import "./Movie.css";
import { withUser } from "../Login/UserContext";
import { Link } from "react-router-dom";
import { MovieSeen } from "./MovieSeen";
import { deleteMovie, updateMovie } from "./MovieAPI";

export const MovieCard = withUser(
  ({ movie, onEdit, user, onChange, onDelete }) => {
    const update = (field, value) => () =>
      updateMovie({ ...movie, [field]: value }, user).then(onChange);

    const deleteM = () => {
      if (window.confirm()) {
        deleteMovie(movie, user).then(onDelete);
      }
    };

    return (
      <div className="movie">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">
              <Link to={`movie/${movie._id}`}>
                {movie.title}{" "}
                {movie.season && <span> - {movie.season} saisons</span>}
              </Link>
            </h5>
            <h6 className="card-subtitle mb-2 text-muted">
              {movie.productionYear} - {movie.genre.join(",")}
            </h6>
            <div>
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
                undefined
              )}
              <i
                className="fas fa-pencil-alt"
                onClick={onEdit}
                style={{ cursor: "pointer" }}
              />
              <i
                className="fas fa-trash"
                onClick={deleteM}
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
            </div>
            <div className="poster">
              <img src={movie.fileUrl} alt="movie poster" />
            </div>
          </div>
        </div>
      </div>
    );
  }
);
