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
      <Fetch endpoint="/api/movies?limit=0">
        {({ data }) =>
          data ? <h6>{data.count} movies/tvshows</h6> : undefined
        }
      </Fetch>
      <Link to="/stats">
        <i
          className="fas fa-chart-bar fa-3x"
          style={{
            top: "22px",
            right: "22px",
            position: "absolute",
            color: "#F1F7EE",
            cursor: "pointer"
          }}
          title="Show statistics"
        />
      </Link>
    </div>
  );
};
