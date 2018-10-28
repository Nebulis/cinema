import { Fetch } from "./Common/Fetch";
import React from "react";

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
      <h1>Cinematheque</h1>
      <Fetch endpoint="/api/movies?limit=0">
        {({ data }) =>
          data ? <h6>{data.count} movies/tvshows</h6> : undefined
        }
      </Fetch>
    </div>
  );
};
