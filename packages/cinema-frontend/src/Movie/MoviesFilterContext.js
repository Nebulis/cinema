import React from "react";

export const MoviesFilterContext = React.createContext();
export const withMoviesFilter = Component => props => (
  <MoviesFilterContext.Consumer>
    {filters => <Component {...props} filters={filters} />}
  </MoviesFilterContext.Consumer>
);

export class MoviesFilterProvider extends React.Component {
  onChange = name => value =>
    this.setState(({ filters }) => ({
      filters: { ...filters, [name]: value || "" }
    }));

  state = {
    filters: {
      productionYear: "",
      title: "",
      genres: [],
      types: [],
      seen: false,
      unseen: false
    },
    onChange: this.onChange
  };

  render() {
    return (
      <MoviesFilterContext.Provider value={this.state}>
        {this.props.children}
      </MoviesFilterContext.Provider>
    );
  }
}
