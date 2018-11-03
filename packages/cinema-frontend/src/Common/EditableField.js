import React, { Fragment, useState } from "react";
import identity from "lodash/identity";

export const EditableField = props => {
  const [value, setValue] = useState(props.value || "");
  const [edit, setEdit] = useState(!props.value);
  const transform = props.transform || identity;
  return (
    <Fragment>
      {edit ? (
        <Fragment>
          <input
            placeholder={props.placeholder}
            type="text"
            value={value}
            onChange={event => setValue(transform(event.target.value))}
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              props.onChange(value);
              setEdit(false);
            }}
          >
            OK
          </button>
          {value ? (
            <button
              className="btn btn-danger"
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                setEdit(false);
              }}
            >
              Cancel
            </button>
          ) : (
            undefined
          )}
        </Fragment>
      ) : (
        <Fragment>
          {/*tmp use render prop :)*/}
          {props.bold ? (
            <span
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                setEdit(true);
              }}
            >
              <b>{value}</b>
            </span>
          ) : (
            <span
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
                setEdit(true);
              }}
            >
              {value}
            </span>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};
