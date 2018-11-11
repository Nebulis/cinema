import firebase from "firebase";
import React, { Component } from "react";
import "./App.css";
import { Connexion } from "./Connexion/Connexion";
import { UserContext } from "./Connexion/UserContext";
import logo from "./logo.svg";

interface IAppState {
  user?: firebase.User;
}

export class App extends Component<{}, IAppState> {
  constructor(props: {}) {
    super(props);
    this.state = {
      user: undefined
    };

    firebase
      .auth()
      .onAuthStateChanged(user => this.setState({ user: user || undefined }));
  }

  public render() {
    return (
      <UserContext.Provider value={this.state.user}>
        <Connexion />
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.js</code> and save to reload.
            </p>
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn React
            </a>
          </header>

          <div>Hello</div>
        </div>
      </UserContext.Provider>
    );
  }
}
