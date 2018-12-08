import React, { Fragment, useContext, useEffect, useState, useRef } from "react";
import { MovieCard } from "./MovieCard";
import isArray from "lodash/isArray";
import { ApplicationContext, LOADING } from "../ApplicationContext";
import { MoviesContext } from "../Common/MoviesContext";
import { MoviesFilter } from "./MoviesFilter";
import * as MovieAPI from "../Common/MovieAPI";
import { UserContext } from "../Login/UserContext";
import debounce from "lodash/debounce";
import { MovieForm } from "./MovieForm";

const newMovie = () => ({});
const getMovies = MovieAPI.getMovies(true);

const buildQuery = (filters, offset) => {
  // can use lodash/partition to one line
  const genres = filters.genres.filter(genre => genre[1]).map(genre => genre[0]);
  const notGenres = filters.genres.filter(genre => !genre[1]).map(genre => genre[0]);
  return Object.keys(filters)
    .filter(key => key !== "genres") // handle genres manually)
    .filter(key => key !== "productionYear" || (key === "productionYear" && filters[key] !== "-1"))
    .filter(
      key =>
        (!isArray(filters[key]) && filters[key] !== null && filters[key] !== "") ||
        (isArray(filters[key]) && filters[key].length > 0)
    )
    .map(key => `${key}=${filters[key]}`)
    .concat(
      genres.length > 0 ? `genres=${genres.join(",")}` : "",
      notGenres.length > 0 ? `notGenres=${notGenres.join(",")}` : "",
      `offset=${offset}`
    )
    .filter(Boolean) // remove empty strings
    .join("&");
};

export const List = () => {
  // load contexts
  const { status } = useContext(ApplicationContext);
  const { state, dispatch } = useContext(MoviesContext);
  const { movies, filters, count } = state;
  const user = useContext(UserContext);

  // create state
  const [offset, setOffset] = useState(movies.length ? movies.length / filters.limit - 1 : 0);
  const [movie, setMovie] = useState(newMovie());
  const [key, setKey] = useState(0);
  // set to true otherwise when navigating back to the page, the loader is displayed
  const [loaded, setLoaded] = useState(true);

  //create actions
  const loadMore = _ => {
    setLoaded(false);
    getMovies(buildQuery(filters, offset), user).then(movies => {
      if (offset === 0) {
        // use a different action on new search otherwise there are some issues due to asynchronous action
        dispatch({ type: "SET_MOVIES", payload: { movies: movies.data, count: movies.count } });
      } else {
        dispatch({ type: "ADD_ALL", payload: { movies: movies.data, count: movies.count } });
      }
      setLoaded(true);
    });
  };
  const showMovie = () => {
    // ignore first trigger, needed for backward navigation
    if (key > 0) {
      // eslint-disable-next-line no-undef
      $("#movie-creator-updator").modal("show");
    }
  };

  // create effects
  useEffect(
    () => {
      // useDebounce :)
      const debouncedLoadMore = debounce(loadMore, 400, {
        leading: false,
        trailing: true
      });
      // no movies ? then automatically fetch some (note: every time a filter is updated, movies are cleaned up)
      if (count === 0) {
        // the condition is needed in case of back navigation
        setLoaded(false);
        setOffset(0);
        dispatch({ type: "SET_MOVIES", payload: {} }); // remove existing movies in case of backward navigation with initial load of movie
        debouncedLoadMore();
      }
      return () => debouncedLoadMore.cancel();
    },
    [filters]
  );
  useEffect(showMovie, [movie]);

  const isFirstRun = useRef(true);
  // dont run this the first time landing in the page as it's run by the effect listening to filters
  useEffect(
    () => {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }
      loadMore();
    },
    [offset]
  );

  // render
  return (
    <div>
      {status === LOADING ? (
        <h2 className="text-center mt-2">
          <i className="fas fa-spinner fa-spin fa-2x" />
        </h2>
      ) : (
        <Fragment>
          <MovieForm
            // force reinitialisation of movie form
            key={movie._id || key}
            movie={movie._id ? movie : null}
            onAdd={movie => dispatch({ type: "ADD", payload: { movie } })}
            onUpdate={movie => dispatch({ type: "UPDATE", payload: { movie, id: movie._id } })}
          />
          <i
            onClick={() => {
              setMovie(newMovie());
              setKey(key + 1);
            }}
            className="fas fa-plus-circle fa-3x"
            style={{
              top: "22px",
              left: "22px",
              position: "absolute",
              color: "#F1F7EE",
              cursor: "pointer"
            }}
            title="Add a movie or a tv show"
          />
          <MoviesFilter />
          <h2 className="text-center">
            {movies.length === count && count > 0 ? (
              <span>{count} movies/tvshows</span>
            ) : movies.length < count ? (
              <span>
                {movies.length} of {count} movies/tvshows
              </span>
            ) : loaded ? (
              <span> No movies/tvshows</span>
            ) : null}
          </h2>
          <div className="movies">
            {movies.map(movie => (
              <MovieCard
                key={movie._id}
                movie={movie}
                onChange={movie => dispatch({ type: "UPDATE", payload: { movie, id: movie._id } })}
                onDelete={_ => dispatch({ type: "UPDATE", payload: { id: movie._id } })}
                onEdit={() => {
                  setMovie({
                    ...movie // create a new movie to force the show effect to be displayed
                  });
                  setKey(key + 1); // mandatory otherwise first edit fail
                }}
              />
            ))}
          </div>
          <h2 className="text-center mt-2">
            {!loaded ? (
              <span>
                <i className="fas fa-spinner fa-spin fa-2x" />
              </span>
            ) : null}
          </h2>
          {movies.length < count && loaded ? (
            <div className="text-center m-3">
              <button onClick={() => setOffset(offset + 1)} className="btn btn-primary btn-lg">
                Load more
              </button>
            </div>
          ) : (
            undefined
          )}
        </Fragment>
      )}
    </div>
  );
};
