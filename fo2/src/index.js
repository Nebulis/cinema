import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";
import { ApplicationProvider } from "./ApplicationContext";

ReactDOM.render(
  <ApplicationProvider>
    <App />
  </ApplicationProvider>,
  document.getElementById("root")
);
registerServiceWorker();
