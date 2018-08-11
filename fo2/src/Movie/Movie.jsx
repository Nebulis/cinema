import React from "react";
import "./Movie.css";

export const Movie = ({ movie }) => {
  return (
    <div className="movie">
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{movie.title}</h5>
          <h6 className="card-subtitle mb-2 text-muted">{movie.type}</h6>
          <div>
            {movie.seen ? (
              <i className="fas fa-eye" style={{ color: "var(--success)" }} />
            ) : (
              <i className="fas fa-eye-slash" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
