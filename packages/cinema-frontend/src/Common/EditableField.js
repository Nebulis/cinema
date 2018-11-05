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
          {props.textarea ? (
            <textarea
              placeholder={props.placeholder}
              style={{ width: "100%" }}
              onChange={event => setValue(transform(event.target.value))}
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
              }}
              value={value}
            />
          ) : (
            <input
              placeholder={props.placeholder}
              type="text"
              value={value}
              onChange={event => setValue(transform(event.target.value))}
              onClick={event => {
                event.preventDefault();
                event.stopPropagation();
              }}
            />
          )}
          <button
            className="btn btn-primary"
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
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
        <span
          onClick={event => {
            event.preventDefault();
            event.stopPropagation();
            setEdit(true);
          }}
          className={props.className}
        >
          {value}
        </span>
      )}
    </Fragment>
  );
};
