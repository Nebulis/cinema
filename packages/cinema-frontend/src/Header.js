import { Fetch } from "./Common/Fetch";
import React from "react";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <div
      className="text-center"
      style={{
        backgroundColor: "var(--movie-secondary)",
        color: "var(--movie-primary)",
        padding: "4px"
      }}
    >
      <h1 className="header">
        <Link to="/">Cinematheque</Link>
      </h1>
      <Fetch endpoint="/api/movies?limit=0">{({ data }) => <h6>{data ? data.count : 0} movies/tvshows</h6>}</Fetch>
      <Link to="/admin">
        <i
          className="fas fa-cog fa-3x"
          style={{
            top: "22px",
            right: "22px",
            position: "absolute",
            color: "#F1F7EE",
            cursor: "pointer"
          }}
          title="Admin"
        />
      </Link>
    </div>
  );
};
