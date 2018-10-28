import { Fragment, useState } from "react";
import React from "react";

export const MovieSeasonYear = props => {
  // useInput :)
  const [year, setYear] = useState(props.year || "");
  return (
    <Fragment>
      <input
        value={year}
        onChange={event => setYear(event.target.value)}
        type="number"
        max={2200}
        placeholder="YYYY"
        className="form-control d-inline"
        style={{ width: "90px" }}
      />
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => props.onChange(year)}
      >
        Ok
      </button>
    </Fragment>
  );
};
