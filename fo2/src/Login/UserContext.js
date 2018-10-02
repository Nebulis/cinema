import React from "react";

export const UserContext = React.createContext();

export const LOGOUT = Symbol();
export const LOGIN = Symbol();
export const LOGIN_FAILED = Symbol();

export class UserProvider extends React.Component {
  state = {
    token: null,
    status: LOGOUT,
    login: this.login.bind(this)
  };

  login(password) {
    fetch("/login", {
      method: "POST",
      body: JSON.stringify({ password }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(data => data.json())
      .then(({ token }) => {
        this.setState({ token, status: LOGIN });
      })
      .catch(() => this.setState({ status: LOGIN_FAILED }));
  }

  render() {
    return (
      <UserContext.Provider value={this.state}>
        {this.props.children}
      </UserContext.Provider>
    );
  }
}
