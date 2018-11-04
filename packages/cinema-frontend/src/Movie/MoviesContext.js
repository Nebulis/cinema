import React from "react";
import findIndex from "lodash/findIndex";

export const MoviesContext = React.createContext();

export class MoviesProvider extends React.Component {
  add = movie => {
    this.setState({
      movies: [movie, ...this.state.movies]
    });
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
    this.setState({ movies: [...this.state.movies, ...data], count });
  };

  invalidate = () => {
    this.setState({ movies: [] });
  };

  onChange = name => (value = "") => {
    this.invalidate(); // hmmm :)
    this.setState(({ filters }) => ({
      filters: { ...filters, [name]: value }
    }));
  };

  state = {
    movies: [],
    count: 0,
    filters: {
      productionYear: "",
      title: "",
      genres: [],
      types: [],
      seen: null, // null = dont care, true = have seen, false = have not seen
      netflix: null, // null = dont care, true = on netflix, false = not on netflix
      limit: 30
    },
    onChange: this.onChange,
    addAll: this.addAll,
    update: this.update,
    add: this.add,
    invalidate: this.invalidate
  };

  render() {
    return (
      <MoviesContext.Provider value={this.state}>
        {this.props.children}
      </MoviesContext.Provider>
    );
  }
}
