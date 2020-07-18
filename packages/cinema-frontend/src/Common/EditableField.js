import React, { Fragment, useState, useRef } from "react";
import identity from "lodash/identity";
import { AsyncMultiDownshift } from "./AsyncMultiDownshift";
import "./EditableField.css";

const disableBubbleClick = {
  onClick: event => {
    event.preventDefault();
    event.stopPropagation();
  }
};

const disableDragAndDrop = {
  draggable: true,
  onDragStart: event => {
    event.preventDefault();
    event.stopPropagation();
  }
};

const EditableField = props => {
  const [value, setValue] = useState(props.value || "");
  const [edit, setEdit] = useState(!props.value);
  const transform = props.transform || identity;
  const lock = props.lock || false;

  // handle props.value update
  const lastInitialValue = useRef(props.value);
  if (props.value !== lastInitialValue.current) {
    setValue(props.value || "");
    setEdit(!props.value);
    lastInitialValue.current = props.value;
  }

  return (
    <Fragment>
      {!lock && edit ? (
        <Fragment>
          {props.renderFormField({
            ...props,
            value,
            // in case of downshift, event is directly the value
            onChange: event => setValue(transform(event.target ? event.target.value : event)),
            submit: () => {
              if (value) {
                props.onChange(value);
                setEdit(false);
              }
            }
          })}
          <button
            className="btn btn-primary"
            {...disableDragAndDrop}
            onClick={event => {
              event.preventDefault();
              event.stopPropagation();
              if (value) {
                props.onChange(value);
                setEdit(false);
              }
            }}
          >
            OK
          </button>
        </Fragment>
      ) : (
        <Fragment>
          {props.renderValue({
            className: `${props.className || ""} ${!lock ? "editable-field" : ""}`,
            value,
            onClick: event => {
              if (!lock) {
                event.preventDefault();
                event.stopPropagation();
                setEdit(true);
              }
            }
          })}
        </Fragment>
      )}
    </Fragment>
  );
};

export const EditableInput = props => (
  <EditableField
    {...props}
    renderFormField={fieldProps => (
      <div className="form-inline d-inline-block">
        <input
          className="form-control mr-1"
          placeholder={fieldProps.placeholder}
          type={props.type || "text"}
          value={fieldProps.value}
          onKeyDown={event => {
            if (event.key === "Enter") {
              fieldProps.submit();
            }
          }}
          onChange={fieldProps.onChange}
          {...disableDragAndDrop}
          {...disableBubbleClick}
        />
      </div>
    )}
    renderValue={valueProps => (
      <span onClick={valueProps.onClick} className={valueProps.className}>
        {valueProps.value}
      </span>
    )}
  />
);

export const EditableTextarea = props => (
  <EditableField
    {...props}
    renderFormField={fieldProps => (
      <textarea
        className="form-control w-100"
        placeholder={fieldProps.placeholder}
        style={fieldProps.style}
        value={fieldProps.value}
        rows={fieldProps.rows || 2}
        onKeyDown={event => {
          if (event.key === "Enter" && event.ctrlKey) {
            fieldProps.submit();
          }
        }}
        onChange={fieldProps.onChange}
        {...disableDragAndDrop}
        {...disableBubbleClick}
      />
    )}
    renderValue={valueProps => (
      <span onClick={valueProps.onClick} className={`${valueProps.className} w-100`}>
        {props.split ? (
          valueProps.value.split("\n").map((item, key) => (
            <Fragment key={key}>
              {item}
              <br />
            </Fragment>
          ))
        ) : (
          <Fragment>{valueProps.value}</Fragment>
        )}
      </span>
    )}
  />
);

export const EditableMultiSelect = props => (
  <EditableField
    {...props}
    renderFormField={fieldProps => (
      <div
        className="form-inline d-inline-block"
        style={{
          minWidth: "220px"
        }}
      >
        <AsyncMultiDownshift
          placeholder={fieldProps.placeholder}
          handleChange={values => fieldProps.onChange(values.sort())}
          items={fieldProps.items}
          selectedItems={fieldProps.value}
          className="form-group"
        />
      </div>
    )}
    renderValue={valueProps => (
      <span onClick={valueProps.onClick} className={valueProps.className}>
        {valueProps.value.join(",")}
      </span>
    )}
  />
);
