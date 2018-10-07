import React, { Component } from "react";
import "./Movie.css";
import { UserContext } from "../Login/UserContext";

class MovieWithContext extends Component {
  state = {
    image: ""
  };

  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    this.deleteMovie = this.deleteMovie.bind(this);
  }

  componentDidMount() {
    if (this.props.movie.idAllocine) {
      const baseUrl =
        this.props.movie.type === "Film"
          ? "/api/allocine/movie/"
          : "/api/allocine/serie/";
      fetch(`${baseUrl}${this.props.movie.idAllocine}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.props.token}`
        }
      })
        .then(data => data.json())
        .then(allocine => {
          const baseObject =
            this.props.movie.type === "Film"
              ? allocine.movie
              : allocine.tvseries;
          this.setState({
            image:
              (baseObject && baseObject.poster && baseObject.poster.href) || ""
          });
        });
    }
  }

  update(field, value) {
    return () => {
      const movie = { ...this.props.movie, [field]: value };
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
    if (window.confirm()) {
      fetch(`/api/movies/${this.props.movie._id}`, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.props.token}`
        }
      }).then(() => this.props.onDelete());
    }
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
              <i
                className="fab fa-neos"
                style={{
                  cursor: "pointer",
                  color: this.props.movie.netflix ? "var(--danger)" : "black"
                }}
                onClick={this.update("netflix", !this.props.movie.netflix)}
              />
              {movie.seen ? (
                <i
                  className="fas fa-eye"
                  style={{ color: "var(--success)", cursor: "pointer" }}
                  onClick={this.update("seen", false)}
                />
              ) : (
                <i
                  className="fas fa-eye-slash"
                  style={{ cursor: "pointer" }}
                  onClick={this.update("seen", true)}
                />
              )}
              <i
                className="fas fa-pencil-alt"
                onClick={onEdit}
                style={{ cursor: "pointer" }}
              />
              <i
                className="fas fa-trash"
                onClick={this.deleteMovie}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div className="poster">
              <img src={this.state.image} />
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
