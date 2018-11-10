import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { ApplicationProvider } from "./ApplicationContext";
import { UserProvider, UserContext } from "./Login/UserContext";
import { Login } from "./Login/Login";
import { MoviesProvider } from "./Common/MoviesContext";

ReactDOM.render(
  <UserProvider>
    <UserContext.Consumer>
      {({ token }) =>
        token ? (
          <ApplicationProvider token={token}>
            <MoviesProvider>
              <App />
            </MoviesProvider>
          </ApplicationProvider>
        ) : (
          <Login />
        )
      }
    </UserContext.Consumer>
  </UserProvider>,
  document.getElementById("root")
);
