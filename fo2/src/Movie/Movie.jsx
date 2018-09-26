import React from "react";
import "./Movie.css";

export const Movie = ({ movie, onEdit }) => {
  return (
    <div className="movie">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{movie.title}</h5>
          <h6 className="card-subtitle mb-2 text-muted">
            {movie.type} {movie.season && <span>Saison {movie.season}</span>}
          </h6>
          <h6 className="card-subtitle mb-2 text-muted">{movie.genre}</h6>
          <div>
            {movie.seen ? (
              <i
                className="fas fa-eye"
                style={{ color: "var(--success)", cursor: "pointer" }}
              />
            ) : (
              <i className="fas fa-eye-slash" style={{ cursor: "pointer" }} />
            )}
            <i
              className="fas fa-pencil-alt"
              onClick={onEdit}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
