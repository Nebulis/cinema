import React, { Component } from "react";
import "./Movie.css";
import { UserContext } from "../Login/UserContext";

class MovieWithContext extends Component {
  constructor(props) {
    super(props);
    this.seen = this.seen.bind(this);
    this.deleteMovie = this.deleteMovie.bind(this);
  }

  seen(value) {
    return () => {
      const movie = { ...this.props.movie, seen: value };
      fetch(`/api/movies/${this.props.movie._id}`, {
        method: "PUT",
        body: JSON.stringify(movie),
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.props.token}`
        }
      }).then(() => this.props.onChange(movie));
    };
  }

  deleteMovie() {
    fetch(`/api/movies/${this.props.movie._id}`, {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.props.token}`
      }
    }).then(() => this.props.onDelete());
  }

  render() {
    const { movie, onEdit } = this.props;
    return (
      <div className="movie">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">{movie.title}</h5>
            <h6 className="card-subtitle mb-2 text-muted">
              {movie.type} {movie.season && <span>Saison {movie.season}</span>}
            </h6>
            <h6 className="card-subtitle mb-2 text-muted">{movie.genre}</h6>
            <div>
              {movie.seen ? (
                <i
                  className="fas fa-eye"
                  style={{ color: "var(--success)", cursor: "pointer" }}
                  onClick={this.seen(false)}
                />
              ) : (
                <i
                  className="fas fa-eye-slash"
                  style={{ cursor: "pointer" }}
                  onClick={this.seen(true)}
                />
              )}
              <i
                className="fas fa-pencil-alt"
                onClick={onEdit}
                style={{ cursor: "pointer" }}
              />
              {/*<i*/}
              {/*className="fas fa-trash"*/}
              {/*onClick={this.deleteMovie}*/}
              {/*style={{ cursor: "pointer" }}*/}
              {/*/>*/}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const Movie = props => (
  <UserContext>
    {({ token }) => <MovieWithContext token={token} {...props} />}
  </UserContext>
);
