import React from "react";
import findIndex from 'lodash/findIndex';

export const MoviesContext = React.createContext();
export const withMovies = Component => props => <MoviesContext.Consumer>
  {movies => <Component {...props} movies={movies}/>}
</MoviesContext.Consumer>;

export class MoviesProvider extends React.Component {

  add = (movie) => {
    this.setState({
      movies: [movie, ...this.state.movies],
    });
  };

  update = (id, movie) => {
    const index = findIndex(this.state.movies, ['_id', id]);
    const movies = [...this.state.movies];
    movies[index] = movie;
    this.setState({
      movies: movies.filter(Boolean), // pass undefined as delete and then use filter te remove the element
    });
  };

  concat = ({data, count}) => {
    this.setState({movies: [...this.state.movies, ...data], count});
  };

  invalidate = () => {
    this.setState({movies: []});
  };

  state = {
    movies: [],
    count: 0,
    concat: this.concat,
    update: this.update,
    add: this.add,
    invalidate: this.invalidate,
  };

  render() {
    return (
      <MoviesContext.Provider value={this.state}>
        {this.props.children}
      </MoviesContext.Provider>
    );
  }
}
