import React, { useState, useReducer, useEffect, useContext } from "react";
import { SingleDownshift } from "../Common/SingleDownshift";
import range from "lodash/range";
import { MovieForm } from "../MovieList/MovieForm";
import { UserContext } from "../Login/UserContext";

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
      return { ...state, status: action.type, movies: [...state.movies, ...action.payload], page: state.page + 1 };
    case "RESET_PAGE":
      return { ...state, page: 0 };
    case "RESET_MOVIES":
      return { ...state, movies: [] };
    case "ADD_MOVIE_SUCCEEDED":
      return {
        ...state,
        movies: state.movies.map(movie => {
          if (movie.allocine.code === action.payload.idAllocine) {
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

export const Finder = () => {
  const user = useContext(UserContext);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(months.find(m => m.value === String(new Date().getMonth() + 1)).label);
  const [movieState, movieDispatch] = useReducer(movieReducer, { movies: [], page: 0, offset: 20 });
  const [movieToAdd, setMovieToAdd] = useState({ idAllocine: 0 });
  const showMovie = () => {
    // eslint-disable-next-line no-undef
    $("#movie-creator-updator").modal("show");
  };
  const fetchMovies = () => {
    movieDispatch({ type: "FETCH_MOVIES_REQUESTED" });
    fetch(
      `/api/allocine/find?month=${months.find(m => m.label === month).value}&year=${year}&page=${
        movieState.page
      }&offset=${movieState.offset}`,
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
  };
  useEffect(showMovie, [movieToAdd]);

  return (
    <>
      <MovieForm
        // force reinitialisation of movie form
        key={movieToAdd.idAllocine}
        movie={movieToAdd}
        onAdd={movie => movieDispatch({ type: "ADD_MOVIE_SUCCEEDED", payload: movie })}
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
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            movieDispatch({ type: "RESET_MOVIES" });
            fetchMovies();
          }}
        >
          Goooo
        </button>
      </form>
      <div className="movies">
        {movieState.movies.map(movie => {
          return (
            <div className="card movie-card" key={movie.allocine.code}>
              <div className="card-body">
                <h5 className="card-title">
                  <div className="ellipsis" title={movie.allocine.title}>
                    {movie.allocine.title}
                  </div>
                </h5>
                <h6
                  className="card-subtitle mb-2 text-muted ellipsis"
                  title={`${movie.allocine.productionYear} - ${movie.allocine.genre.map(g => g.$).join(",")}`}
                >
                  {`${movie.allocine.productionYear} - ${movie.allocine.genre.map(g => g.$).join(",")}`}
                </h6>
                <div className="movie-card-actions" style={{ position: "absolute", top: 2, right: 4 }}>
                  <i
                    title="Add"
                    className="fas fa-link"
                    style={{ cursor: "pointer", color: movie.cinema ? "#fecc00" : "inherit" }}
                    onClick={() => {
                      if (movie.cinema) return;
                      setMovieToAdd({
                        idAllocine: movie.allocine.code,
                        title: movie.allocine.title,
                        genre: movie.allocine.genre.map(m => m.$).sort(),
                        type: "Film",
                        productionYear:
                          movie.allocine.release && movie.allocine.release.releaseDate
                            ? new Date(movie.allocine.release.releaseDate).getFullYear()
                            : movie.allocine.productionYear,
                        summary: movie.allocine.synopsisShort || movie.allocine.synopsis,
                        fileUrl: movie.allocine.poster ? movie.allocine.poster.href : ""
                      });
                    }}
                  />
                </div>
                <div className="poster text-center">
                  <img
                    src={
                      movie.allocine.poster.href
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
      {movieState.movies.length === movieState.offset * movieState.page &&
      movieState.status === "FETCH_MOVIES_SUCCEEDED" ? (
        <div className="text-center m-3">
          <button onClick={() => fetchMovies()} className="btn btn-primary btn-lg">
            Load more
          </button>
        </div>
      ) : (
        undefined
      )}
    </>
  );
};
