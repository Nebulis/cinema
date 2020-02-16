import React, { useContext } from "react";
import identity from "lodash/identity";
import { MoviesContext, SORTS } from "../Common/MoviesContext";
import { AsyncMultiDownshift, AsyncMultiDownshiftwithReverse } from "../Common/AsyncMultiDownshift";
import { ApplicationContext } from "../ApplicationContext";
import { Tag } from "../Admin/Tag";

const fromEvent = event => event.target.value;

const forInput = ({ filters, onChange }, name, transform = identity, from = fromEvent) => {
  return {
    value: filters[name],
    onChange: value => onChange(name)(transform(from(value)))
  };
};

const FilterTag = ({ tag, selected, onAdd, onDelete }) => (
  <span onClick={selected ? onDelete : onAdd}>
    <Tag {...tag} className={`filter-tag mr-2 ${selected ? "selected" : ""}`} />
  </span>
);

export const MoviesFilter = () => {
  const {
    state: { filters },
    dispatch
  } = useContext(MoviesContext);
  const { genres, types, tags, years } = useContext(ApplicationContext);
  const { seen, finished, done } = filters;

  const onChange = name => value => {
    dispatch({ type: "FILTERS_CHANGED", payload: { name, value } });
  };

  const renderSeen = () => {
    let color = "",
      icon = "fa-eye",
      onClick = () => onChange("seen")("true");
    if (seen === "true") {
      color = "var(--success)";
      onClick = () => onChange("seen")("partial");
    } else if (seen === "partial") {
      color = "var(--warning)";
      onClick = () => onChange("seen")("false");
    } else if (seen === "false") {
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

  const renderFinished = () => {
    let color = "",
      onClick = () => onChange("finished")(true);
    if (finished === true) {
      color = "var(--danger)";
      onClick = () => onChange("finished")(null);
    }
    return (
      <i
        className={`fas fa-ban`}
        style={{
          color,
          cursor: "pointer"
        }}
        onClick={onClick}
      />
    );
  };

  const renderDone = () => {
    let color = "",
      onClick = () => onChange("done")(false);
    if (done === false) {
      color = "var(--danger)";
      onClick = () => onChange("done")(null);
    }
    return (
      <i
        className={`fas fa-film`}
        style={{
          color,
          cursor: "pointer"
        }}
        onClick={onClick}
      />
    );
  };

  return (
    <form className="form-inline movies-filter mt-4 ml-3">
      <div className="form-group mr-2">
        <select className="form-control" {...forInput({ filters, onChange }, "productionYear")}>
          <option value="-1">YYYY</option>
          {years.map(year => (
            <option value={year} key={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group mr-2">
        <input type="text" {...forInput({ filters, onChange }, "title")} placeholder="Title" className="form-control" />
      </div>
      <div className="form-group mr-2" style={{ minWidth: "220px" }}>
        <AsyncMultiDownshiftwithReverse
          placeholder="Genre"
          handleChange={forInput({ filters, onChange }, "genres", identity, identity).onChange}
          items={genres}
          selectedItems={filters.genres}
        />
      </div>
      <div className="form-group mr-2" style={{ width: "220px" }}>
        <AsyncMultiDownshift
          placeholder="Type"
          handleChange={forInput({ filters, onChange }, "types", identity, identity).onChange}
          items={types}
          selectedItems={filters.types}
        />
      </div>
      <div className="form-group mr-2">{renderSeen()}</div>
      <div className="form-group mr-2">{renderFinished()}</div>
      <div className="form-group mr-2">{renderDone()}</div>
      <div>
        {tags.map(tag => (
          <FilterTag
            key={tag._id}
            tag={tag}
            selected={filters.tags.find(filterTag => filterTag === tag._id)}
            onAdd={() => onChange("tags")([...filters.tags, tag._id])}
            onDelete={() => onChange("tags")(filters.tags.filter(t => t !== tag._id))}
          />
        ))}
      </div>
      <div>
        <select
          className="form-control"
          value={filters.sort.id}
          onChange={event => onChange("sort")(SORTS.find(sort => sort.id === event.target.value))}
        >
          {SORTS.map(sort => (
            <option value={sort.id} key={sort.id}>
              {sort.label}
            </option>
          ))}
        </select>
      </div>
    </form>
  );
};
