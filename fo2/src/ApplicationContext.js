import React from "react";

export const ApplicationContext = React.createContext();

export const LOADING = Symbol();
export const LOADED = Symbol();

export class ApplicationProvider extends React.Component {
  state = {
    genres: [],
    types: [],
    status: LOADING
  };

  componentDidMount() {
    Promise.all([
      fetch("/api/movies/genre").then(data => data.json()),
      fetch("/api/movies/type").then(data => data.json())
    ]).then(([genres, types]) => {
      this.setState({
        genres,
        types,
        status: LOADED
      });
    });
  }

  render() {
    return (
      <ApplicationContext.Provider value={this.state}>
        {this.props.children}
      </ApplicationContext.Provider>
    );
  }
}
