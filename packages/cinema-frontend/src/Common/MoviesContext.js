import React, { useReducer } from "react";
import findIndex from "lodash/findIndex";
import { produce } from "immer";

export const MoviesContext = React.createContext();

const initialState = {
  movies: [],
  count: 0,
  filters: {
    productionYear: "-1",
    title: "",
    genres: [],
    types: [],
    tags: [],
    seen: null, // null = dont care, true = have seen, false = have not seen
    finished: null, // null = dont care, true = finished
    limit: 30
  }
};

const reducer = (state = initialState, { type, payload }) => {
  console.log(state, type, payload);
  switch (type) {
    case "ADD":
      return { ...state, movies: [payload.movie, ...state.movies] };
    case "UPDATE": {
      const index = findIndex(state.movies, ["_id", payload.id]);
      const movies = [...state.movies];
      movies[index] = payload.movie;
      // pass undefined as delete and then use filter te remove the element
      return { ...state, movies: movies.filter(Boolean) };
    }
    // next step => create real action ADD / DELETE / SEASONS / EPISODES
    case "UPDATE_WITH_TRANSFORM": {
      const index = findIndex(state.movies, ["_id", payload.id]);
      const movies = [...state.movies];
      movies[index] = produce(movies[index], payload.transform);
      // pass undefined as delete and then use filter te remove the element
      return { ...state, movies: movies.filter(Boolean) };
    }
    case "ADD_ALL":
      return { ...state, movies: [...state.movies, ...payload.movies], count: payload.count };
    case "SET_MOVIES":
      return { ...state, movies: payload.movies || [], count: payload.count || 0 };
    case "RESET_FILTERS":
      return { ...state, filters: { ...initialState.filters } };
    case "FILTERS_CHANGED":
      return {
        ...state,
        movies: [],
        count: 0,
        filters: { ...state.filters, [payload.name]: payload.value }
      };
    default:
      return state;
  }
};

export const MoviesProvider = props => {
  const [state, dispatch] = useReducer(reducer, initialState);
  return <MoviesContext.Provider value={{ state, dispatch }}>{props.children}</MoviesContext.Provider>;
};
