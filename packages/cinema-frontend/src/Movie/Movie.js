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
    <div>
      {!movie ? (
        <span>Loading ....</span>
      ) : (
        <div>
          <h1>Great choice {movie.title}</h1>
          <button type="button" onClick={() => history.goBack()}>
            Back
          </button>
        </div>
      )}
    </div>
  );
});
