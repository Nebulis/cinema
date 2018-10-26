import React from "react";

export const ApplicationContext = React.createContext();
export const withApplication = Component => props => (
  <ApplicationContext.Consumer>
    {application => <Component {...props} application={application} />}
  </ApplicationContext.Consumer>
);

export const LOADING = Symbol();
export const LOADED = Symbol();

export class ApplicationProvider extends React.Component {
  state = {
    genres: [],
    types: [],
    status: LOADING
  };

  componentDidMount() {
    const options = {
      headers: {
        Authorization: `Bearer ${this.props.token}`
      }
    };

    const handleResponse = response => {
      if (response.ok) return response.json();
      throw new Error("Fetch fail");
    };
    Promise.all([
      fetch("/api/movies/genre", options).then(handleResponse),
      fetch("/api/movies/type", options).then(handleResponse)
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
