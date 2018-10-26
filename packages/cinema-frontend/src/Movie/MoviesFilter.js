import React, { useContext, useEffect } from "react";
import identity from "lodash/identity";
import { MoviesFilterContext } from "./MoviesFilterContext";
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
  const filters = useContext(MoviesFilterContext);
  const movies = useContext(MoviesContext);
  const { genres, types } = useContext(ApplicationContext);
  useEffect(() => movies.invalidate(), [filters.filters]);
  const { seen, unseen, netflix, unnetflix } = filters.filters;

  return (
    <form className="form-inline">
      <div className="form-group mx-sm-3 mb-2">
        <input
          {...forInput(filters, "productionYear", value => parseInt(value, 10))}
          type="number"
          max={2200}
          placeholder="YYYY"
          className="form-control"
          style={{ width: "90px" }}
        />
      </div>
      <div className="form-group mx-sm-3 mb-2">
        <input
          type="text"
          {...forInput(filters, "title")}
          placeholder="Title"
          className="form-control"
        />
      </div>
      <div className="form-group mx-sm-3 mb-2" style={{ maxWidth: "300px" }}>
        <AsyncMultiDownshiftwithReverse
          placeholder="Genre"
          handleChange={
            forInput(filters, "genres", identity, identity).onChange
          }
          items={genres}
        />
      </div>
      <div className="form-group mx-sm-3 mb-2" style={{ maxWidth: "300px" }}>
        <AsyncMultiDownshift
          placeholder="Type"
          handleChange={forInput(filters, "types", identity, identity).onChange}
          items={types}
        />
      </div>
      <div className="form-group mx-sm-3 mb-2">
        <i
          className="fas fa-eye"
          style={{
            color: seen ? "var(--success)" : "",
            cursor: "pointer"
          }}
          onClick={() => filters.onChange("seen")(!seen)}
        />
        <i
          className="fas fa-eye-slash"
          style={{
            color: unseen ? "var(--success)" : "",
            cursor: "pointer"
          }}
          onClick={() => filters.onChange("unseen")(!unseen)}
        />
      </div>
      <div className="form-group mx-sm-3 mb-2">
        <span
          className="fa-stack fa-1g"
          onClick={() => filters.onChange("netflix")(!netflix)}
          style={{
            cursor: "pointer"
          }}
        >
          <i
            className="far fa-circle fa-stack-2x"
            style={{
              color: netflix ? "var(--danger)" : "black"
            }}
          />
          <i className="fab fa-neos fa-stack-1x" />
        </span>
        <span
          className="fa-stack fa-1g"
          onClick={() => filters.onChange("unnetflix")(!unnetflix)}
          style={{
            cursor: "pointer"
          }}
        >
          <i
            className="fas fa-ban fa-stack-2x"
            style={{
              color: unnetflix ? "var(--danger)" : "black"
            }}
          />
          <i className="fab fa-neos fa-stack-1x" />
        </span>
      </div>
    </form>
  );
};
