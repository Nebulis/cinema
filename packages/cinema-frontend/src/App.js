import React, { Component, Fragment } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import "./App.css";
import { List } from "./MovieList/List";
import { Movie } from "./Movie/Movie";
import { Header } from "./Header";
import { Statistics } from "./Statistics/Statistics";
import { TagList } from "./Admin/TagList";
import { NotificationsList } from "./Notifications/NotificationsList";

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
            <Route exact path="/stats" component={Statistics} />
            <Route exact path="/admin" component={TagList} />
          </Fragment>
        </Router>
      </Fragment>
    );
  }
}

export default App;
