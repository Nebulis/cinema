import React, {Component} from "react";
import "./Movie.css";
import {withUser} from "../Login/UserContext";
import {Link} from 'react-router-dom';

const headers = (user) => ({
  Accept: "application/json",
  "Content-Type": "application/json",
  Authorization: `Bearer ${user.token}`
});

class MovieWithContext extends Component {
  constructor(props) {
    super(props);
    this.update = this.update.bind(this);
    this.deleteMovie = this.deleteMovie.bind(this);
  }

  update(field, value) {
    return () => {
      const movie = {...this.props.movie, [field]: value};
      fetch(`/api/movies/${this.props.movie._id}`, {
        method: "PUT",
        body: JSON.stringify(movie),
        headers: headers(this.props.user)
      }).then(() => this.props.onChange(movie));
    };
  }

  deleteMovie() {
    if (window.confirm()) {
      fetch(`/api/movies/${this.props.movie._id}`, {
        method: "DELETE",
        headers: headers(this.props.user)
      }).then(() => this.props.onDelete());
    }
  }

  renderSeen() {
    const {movie} = this.props;
    if (movie.type === "Film") {
      return (
        <i
          className="fas fa-eye"
          style={{
            color: movie.seen ? "var(--success)" : "black",
            cursor: "pointer"
          }}
          onClick={this.update("seen", !movie.seen)}
        />
      );
    } else {
      return movie.seen.map((season, index) => (
        <span
          key={index}
          style={{
            color: season ? "var(--success)" : "black",
            cursor: "pointer"
          }}
          onClick={this.update("seen", [
            ...movie.seen.slice(0, index),
            !movie.seen[index],
            ...movie.seen.slice(index + 1)
          ])}
        >
          {index + 1}
        </span>
      ));
    }
  }

  render() {
    const {movie, onEdit} = this.props;
    return (
      <div className="movie">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">
              <Link to={`movie/${movie._id}`}>{movie.title} - {movie.productionYear}</Link>
            </h5>
            <h6 className="card-subtitle mb-2 text-muted">
              {movie.type} {movie.season && <span>Saison {movie.season}</span>}
            </h6>
            <h6 className="card-subtitle mb-2 text-muted">
              {movie.genre.join(",")}
            </h6>
            <div>
              <i
                className="fab fa-neos"
                style={{
                  cursor: "pointer",
                  color: this.props.movie.netflix ? "var(--danger)" : "black"
                }}
                onClick={this.update("netflix", !this.props.movie.netflix)}
              />
              {this.renderSeen()}
              <i
                className="fas fa-pencil-alt"
                onClick={onEdit}
                style={{cursor: "pointer"}}
              />
              <i
                className="fas fa-trash"
                onClick={this.deleteMovie}
                style={{cursor: "pointer"}}
              />
              <i
                className="fas fa-ban"
                style={{
                  cursor: "pointer",
                  color: this.props.movie.finished ? "#fecc00" : "black"
                }}
                onClick={this.update("finished", !this.props.movie.finished)}
              />
            </div>
            <div className="poster">
              <img src={this.props.movie.fileUrl} alt="movie poster"/>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export const MovieCard = withUser(MovieWithContext);
