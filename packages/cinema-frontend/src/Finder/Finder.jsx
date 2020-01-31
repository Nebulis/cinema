import React, { useContext, useEffect, useReducer, useState } from "react";
import { SingleDownshift } from "../Common/SingleDownshift";
import range from "lodash/range";
import { MovieForm } from "../MovieList/MovieForm";
import { UserContext } from "../Login/UserContext";
import { NotificationContext } from "../Notifications/NotificationContext";
import { createNotification } from "../Movie/Movie.util";

const months = [
  { label: "Janvier", value: "1" },
  { label: "Février", value: "2" },
  { label: "Mars", value: "3" },
  { label: "Avril", value: "4" },
  { label: "Mai", value: "5" },
  { label: "Juin", value: "6" },
  { label: "Juillet", value: "7" },
  { label: "Août", value: "8" },
  { label: "Septembre", value: "9" },
  { label: "Octobre", value: "10" },
  { label: "Novembre", value: "11" },
  { label: "Décembre", value: "12" }
];

const movieReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_MOVIES_REQUESTED":
      return { ...state, status: action.type };
    case "FETCH_MOVIES_SUCCEEDED":
      return {
        ...state,
        status: action.type,
        movies: [...state.movies, ...action.payload.results],
        bookmark: action.payload.bookmark
      };
    case "RESET_PAGE":
      return { ...state, bookmark: "" };
    case "RESET_MOVIES":
      return { ...state, bookmark: "", movies: [] };
    case "ADD_MOVIE_SUCCEEDED":
      return {
        ...state,
        movies: state.movies.map(movie => {
          if (`${movie.allocine.code}` === `${action.payload.idAllocine}`) {
            return {
              ...movie,
              cinema: action.payload
            };
          }
          return movie;
        })
      };
    default:
      return state;
  }
};

const getAllocineProductionYear = allocineMovie =>
  allocineMovie.release && allocineMovie.release.releaseDate
    ? new Date(allocineMovie.release.releaseDate).getFullYear()
    : allocineMovie.productionYear;

export const Finder = () => {
  const user = useContext(UserContext);
  const { dispatch } = useContext(NotificationContext);
  const [year, setYear] = useState(new Date().getFullYear());
  const [displayLinked, setDisplayLinked] = useState(false);
  const [month, setMonth] = useState(months.find(m => m.value === String(new Date().getMonth() + 1)).label);
  const [movieState, movieDispatch] = useReducer(movieReducer, { movies: [], bookmark: "" });
  const [movieToAdd, setMovieToAdd] = useState({ idAllocine: 0 });
  const showMovie = () => {
    // eslint-disable-next-line no-undef
    $("#movie-creator-updator").modal("show");
  };
  useEffect(
    () => {
      if (movieState.status === "FETCH_MOVIES_REQUESTED") {
        fetch(
          `/api/allocine/find?month=${months.find(m => m.label === month).value}&year=${year}&&bookmark=${
            movieState.bookmark
          }`,
          {
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`
            }
          }
        )
          .then(response => response.json())
          .then(movies => {
            movieDispatch({ type: "FETCH_MOVIES_SUCCEEDED", payload: movies });
          });
      }
    },
    [movieState.status]
  );
  useEffect(
    () => {
      if (movieToAdd.idAllocine !== 0) {
        showMovie();
      }
    },
    [movieToAdd]
  );

  return (
    <>
      <MovieForm
        // force reinitialisation of movie form
        key={movieToAdd.idAllocine}
        movie={movieToAdd}
        onAdd={movie => {
          movieDispatch({ type: "ADD_MOVIE_SUCCEEDED", payload: movie });
          createNotification(dispatch, `Added ${movie.title}`);
        }}
      />
      <form className="form-inline mt-4 ml-3">
        <div className="form-group mr-3" style={{ minWidth: "150px" }}>
          <SingleDownshift
            items={months.map(month => month.label)}
            placeholder="Month"
            onChange={value => {
              setMonth(value);
              movieDispatch({ type: "RESET_PAGE" });
            }}
            selectedItem={month}
          />
        </div>
        <div className="form-group mr-3" style={{ minWidth: "150px" }}>
          <SingleDownshift
            items={range(new Date().getFullYear() + 3, 2010, -1)}
            placeholder="Year"
            onChange={value => {
              setYear(value);
              movieDispatch({ type: "RESET_PAGE" });
            }}
            selectedItem={year}
          />
        </div>
        <button
          className="mr-2"
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            movieDispatch({ type: "RESET_MOVIES" });
            movieDispatch({ type: "FETCH_MOVIES_REQUESTED" });
          }}
        >
          Goooo
        </button>
        <div className="form-group">
          <i
            className={`fas fa-link`}
            style={{ cursor: "pointer", color: displayLinked ? "#fecc00" : "inherit" }}
            onClick={() => setDisplayLinked(!displayLinked)}
            title="Hide linked movies"
          />
        </div>
      </form>
      <div className="movies mb-4">
        {movieState.movies
          .filter(movie => displayLinked || !movie.cinema)
          .map(movie => {
            return (
              <div className="card movie-card" key={movie.allocine.code}>
                <div
                  className="card-body"
                  onClick={() => {
                    if (movie.cinema) return;
                    setMovieToAdd({
                      idAllocine: movie.allocine.code,
                      title: movie.allocine.title,
                      genre: movie.allocine.genre.map(m => m.$).sort(),
                      type: "Film",
                      productionYear: getAllocineProductionYear(movie.allocine),
                      summary: movie.allocine.synopsisShort || movie.allocine.synopsis,
                      fileUrl: movie.allocine.poster ? movie.allocine.poster.href : ""
                    });
                  }}
                >
                  <h5 className="card-title">
                    <div className="ellipsis" title={movie.allocine.title}>
                      {movie.allocine.title}
                    </div>
                  </h5>
                  <h6
                    className="card-subtitle mb-2 text-muted ellipsis"
                    title={`${getAllocineProductionYear(movie.allocine)} - ${movie.allocine.genre
                      .map(g => g.$)
                      .join(",")}`}
                  >
                    {`${getAllocineProductionYear(movie.allocine)} - ${movie.allocine.genre.map(g => g.$).join(",")}`}
                  </h6>
                  <div className="movie-card-actions" style={{ position: "absolute", top: 2, right: 4 }}>
                    <i
                      title="Add"
                      className="fas fa-link"
                      style={{ cursor: "pointer", color: movie.cinema ? "#fecc00" : "inherit" }}
                    />
                  </div>
                  <div className="poster text-center">
                    <img
                      src={
                        movie.allocine.poster && movie.allocine.poster.href
                          ? movie.allocine.poster.href.replace("http:", "https:")
                          : "/no-image.png"
                      }
                      alt="movie poster"
                    />
                  </div>
                </div>
              </div>
            );
          })}
      </div>
      {movieState.status === "FETCH_MOVIES_REQUESTED" && (
        <h2 className="text-center mt-2">
          <i className="fas fa-spinner fa-spin fa-2x" />
        </h2>
      )}
      {movieState.bookmark && movieState.status === "FETCH_MOVIES_SUCCEEDED" ? (
        <div className="text-center m-3">
          <button onClick={() => movieDispatch({ type: "FETCH_MOVIES_REQUESTED" })} className="btn btn-primary btn-lg">
            Load more
          </button>
        </div>
      ) : (
        undefined
      )}
    </>
  );
};
