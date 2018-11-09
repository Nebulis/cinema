import React, { Fragment, useState } from "react";
import identity from "lodash/identity";

const EditableField = props => {
  const [value, setValue] = useState(props.value || "");
  const [edit, setEdit] = useState(!props.value);
  const transform = props.transform || identity;
  const lock = props.lock || false;
  return (
    <Fragment>
      {!lock && edit ? (
        <Fragment>
          {props.renderFormField({
            ...props,
            value,
            onChange: event => setValue(transform(event.target.value))
          })}
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
        </Fragment>
      ) : (
        <Fragment>
          {props.renderValue({
            className: props.className,
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
      <input
        placeholder={fieldProps.placeholder}
        type="text"
        value={fieldProps.value}
        onChange={fieldProps.onChange}
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
        }}
      />
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
        placeholder={fieldProps.placeholder}
        style={fieldProps.style}
        value={fieldProps.value}
        rows={fieldProps.rows || 2}
        onChange={fieldProps.onChange}
        onClick={event => {
          event.preventDefault();
          event.stopPropagation();
        }}
      />
    )}
    renderValue={valueProps => (
      <span onClick={valueProps.onClick} className={valueProps.className}>
        {valueProps.value.split("\n").map((item, key) => (
          <Fragment key={key}>
            {item}
            <br />
          </Fragment>
        ))}
      </span>
    )}
  />
);
