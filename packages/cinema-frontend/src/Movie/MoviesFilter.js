import React, { useContext } from "react";
import identity from "lodash/identity";
import { MoviesContext } from "./MoviesContext";
import {
  AsyncMultiDownshift,
  AsyncMultiDownshiftwithReverse
} from "../Common/AsyncMultiDownshift";
import { ApplicationContext } from "../ApplicationContext";

const fromEvent = event => event.target.value;

const forInput = (
  { filters, onChange },
  name,
  transform = identity,
  from = fromEvent
) => {
  return {
    value: filters[name],
    onChange: value => onChange(name)(transform(from(value)))
  };
};

export const MoviesFilter = () => {
  const { filters, onChange } = useContext(MoviesContext);
  const { genres, types } = useContext(ApplicationContext);
  const { seen, netflix } = filters;

  const renderSeen = () => {
    let color = "",
      icon = "fa-eye",
      onClick = () => onChange("seen")(true);
    if (seen === true) {
      color = "var(--success)";
      onClick = () => onChange("seen")(false);
    } else if (seen === false) {
      color = "var(--danger)";
      icon = "fa-eye-slash";
      onClick = () => onChange("seen")(null);
    }
    return (
      <i
        className={`fas ${icon}`}
        style={{
          color,
          cursor: "pointer"
        }}
        onClick={onClick}
      />
    );
  };

  const renderNetflix = () => {
    let color = "black",
      onClick = () => onChange("netflix")(true);
    if (netflix === true) {
      color = "var(--danger)";
      onClick = () => onChange("netflix")(null);
    }

    return (
      <span onClick={onClick} className="netflix" style={{ color }}>
        N
      </span>
    );
  };

  return (
    <form className="form-inline movies-filter mt-4 mb-4 ml-3">
      <div className="form-group">
        <input
          {...forInput({ filters, onChange }, "productionYear", value =>
            parseInt(value, 10)
          )}
          type="number"
          max={2200}
          placeholder="YYYY"
          className="form-control"
          style={{ width: "90px" }}
        />
      </div>
      <div className="form-group mx-sm-3">
        <input
          type="text"
          {...forInput({ filters, onChange }, "title")}
          placeholder="Title"
          className="form-control"
        />
      </div>
      <div className="form-group" style={{ minWidth: "220px" }}>
        <AsyncMultiDownshiftwithReverse
          placeholder="Genre"
          handleChange={
            forInput({ filters, onChange }, "genres", identity, identity)
              .onChange
          }
          items={genres}
          selectedItems={[["Action", true], ["Aventure", true]]}
        />
      </div>
      <div className="form-group mx-sm-3" style={{ width: "220px" }}>
        <AsyncMultiDownshift
          placeholder="Type"
          handleChange={
            forInput({ filters, onChange }, "types", identity, identity)
              .onChange
          }
          items={types}
        />
      </div>
      <div className="form-group">{renderSeen()}</div>
      <div className="form-group mx-sm-3">{renderNetflix()}</div>
    </form>
  );
};
