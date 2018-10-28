import React, { Component, Fragment } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import { List } from "./Movie/List";
import { Movie } from "./Movie/Movie";
import { Header } from "./Header";

class App extends Component {
  render() {
    return (
      <Fragment>
        <Header />
        <Router>
          <Fragment>
            <Route exact path="/" component={List} />
            <Route exact path="/movie/:id" component={Movie} />
          </Fragment>
        </Router>
      </Fragment>
    );
  }
}

export default App;
