import React, {Component} from 'react';
import {withMovies} from './MoviesContext';
import {withRouter} from 'react-router-dom';
import find from 'lodash/find';
import {Fetch, LOADING} from '../Common/Fetch';

class MovieWithContext extends Component {
  render() {
    const {match, movies, history} = this.props;
    const movie = find(movies.movies, {_id: match.params.id});
    return <Fetch
      endpoint={`/api/movies/${match.params.id}`}
      load={!movie}
    >
      {({data = movie, status}) => {
        return status === LOADING ?
          <div>Loading ....</div>
          :
          <div>
            <h1>Great choice {data.title}</h1>
            <button type="button" onClick={() => history.goBack()}>Back</button>
          </div>
      }}
    </Fetch>
  }
}

export const Movie = withRouter(withMovies(MovieWithContext));
