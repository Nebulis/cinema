import React, { Component, Fragment, StrictMode } from "react";
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import "./App.css";
import { List } from "./Movie/List";
import { Movie } from "./Movie/Movie";

class App extends Component {
  render() {
    return (
      <StrictMode>
        <Router>
          <Fragment>
            <Route exact path="/" component={List} />
            <Route exact path="/movie/:id" component={Movie} />
          </Fragment>
        </Router>
      </StrictMode>
    );
  }
}

export default App;
