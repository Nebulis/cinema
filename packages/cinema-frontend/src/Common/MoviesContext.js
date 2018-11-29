import React from "react";
import findIndex from "lodash/findIndex";

export const MoviesContext = React.createContext();

const initialFilters = () => ({
  productionYear: "",
  title: "",
  genres: [],
  types: [],
  tags: [],
  seen: null, // null = dont care, true = have seen, false = have not seen
  finished: null, // null = dont care, true = finished
  limit: 30
});

export class MoviesProvider extends React.Component {
  add = movie => {
    this.setState(({ movies }) => ({ movies: [movie, ...movies] }));
  };

  update = (id, movie) => {
    const index = findIndex(this.state.movies, ["_id", id]);
    const movies = [...this.state.movies];
    movies[index] = movie;
    this.setState({
      movies: movies.filter(Boolean) // pass undefined as delete and then use filter te remove the element
    });
  };

  addAll = ({ data, count }) => {
    this.setState(({ movies }) => ({ movies: [...movies, ...data], count }));
  };

  invalidate = () => {
    this.setState({ movies: [], count: 0 });
  };

  resetFilters = () => {
    this.setState({ filters: initialFilters() });
  };

  onChange = name => (value = "") => {
    this.setState(({ filters }) => ({
      movies: [],
      count: 0,
      filters: { ...filters, [name]: value }
    }));
  };

  state = {
    movies: [],
    count: 0,
    filters: initialFilters(),
    onChange: this.onChange,
    addAll: this.addAll,
    update: this.update,
    add: this.add,
    invalidate: this.invalidate,
    resetFilters: this.resetFilters
  };

  render() {
    return <MoviesContext.Provider value={this.state}>{this.props.children}</MoviesContext.Provider>;
  }
}
