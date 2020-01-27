import React, { Component, Fragment } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import { List } from "./MovieList/List";
import { Movie } from "./Movie/Movie";
import { Header } from "./Header";
import { NotificationsList } from "./Notifications/NotificationsList";
import { Admin } from "./Admin/Admin";

class App extends Component {
  render() {
    return (
      <Fragment>
        <Router>
          <Fragment>
            <Header />
            <NotificationsList />
            <Route exact path="/" component={List} />
            <Route exact path="/movie/:id" component={Movie} />
            <Route exact path="/admin" component={Admin} />
          </Fragment>
        </Router>
      </Fragment>
    );
  }
}

export default App;
