import React, { useContext, useEffect, useState } from "react";
import { withRouter } from "react-router-dom";
import { getMovie } from "./MovieAPI";
import { UserContext } from "../Login/UserContext";

export const Movie = withRouter(({ match, history }) => {
  const [movie, setMovie] = useState();
  const user = useContext(UserContext);
  useEffect(() => getMovie(match.params.id, user).then(setMovie), [
    match.params.id
  ]);
  return (
    <div className="p-2">
      {!movie ? (
        <span>Loading ....</span>
      ) : (
        <div>
          <h1>
            {movie.title} - {movie.productionYear}
          </h1>
          <div className="d-flex">
            <div className="pr-2">
              <img
                src={movie.fileUrl}
                style={{ maxHeight: "300px" }}
                alt="movie poster"
              />
            </div>
            <div className="pl-2">{movie.summary}</div>
          </div>
          <div>
            {movie.seen.length
              ? movie.seen.map((value, index) => (
                  <div>
                    Season {index + 1} {value}
                  </div>
                ))
              : undefined}
          </div>
          <button type="button" onClick={() => history.goBack()}>
            Back
          </button>
        </div>
      )}
    </div>
  );
});
