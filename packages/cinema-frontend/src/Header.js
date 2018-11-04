import { Fetch } from "./Common/Fetch";
import React from "react";
import { withRouter } from "react-router-dom";

export const Header = withRouter(({ history }) => {
  return (
    <div
      className="text-center"
      style={{
        backgroundColor: "var(--movie-secondary)",
        color: "var(--movie-primary)",
        padding: "4px"
      }}
    >
      <h1
        onClick={() => history.push("/")}
        style={{
          cursor: "pointer"
        }}
      >
        Cinematheque
      </h1>
      <Fetch endpoint="/api/movies?limit=0">
        {({ data }) =>
          data ? <h6>{data.count} movies/tvshows</h6> : undefined
        }
      </Fetch>
      <i
        onClick={() => history.push("/stats")}
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
    </div>
  );
});
