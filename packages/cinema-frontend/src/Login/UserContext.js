import React from "react";

export const UserContext = React.createContext();
export const withUser = Component => props => (
  <UserContext.Consumer>
    {user => <Component {...props} user={user} />}
  </UserContext.Consumer>
);

export const LOGOUT = Symbol();
export const LOGIN = Symbol();
export const LOGIN_FAILED = Symbol();

const handleResponse = response => {
  if (response.ok) return response.json();
  throw new Error("Fetch fail");
};

export class UserProvider extends React.Component {
  state = {
    token: null,
    status: LOGOUT,
    login: this.login.bind(this)
  };

  componentDidMount() {
    const token = localStorage.getItem("token");
    if (token) {
      fetch("/account", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      })
        .then(handleResponse)
        .then(({ exp }) => {
          if (new Date() < new Date(exp * 1000))
            this.setState({ token, status: LOGIN });
        });
    }
  }

  login(password) {
    fetch("/login", {
      method: "POST",
      body: JSON.stringify({ password }),
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    })
      .then(handleResponse)
      .then(({ token }) => {
        this.setState({ token, status: LOGIN });
        localStorage.setItem("token", token);
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
