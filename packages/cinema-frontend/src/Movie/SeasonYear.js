import React, { Fragment, useState } from "react";

export const SeasonYear = props => {
  const [productionYear, setProductionYear] = useState(props.value || "");
  const [edit, setEdit] = useState(!props.value);
  return (
    <Fragment>
      {edit ? (
        <Fragment>
          <input
            type="text"
            value={productionYear}
            onChange={event =>
              setProductionYear(parseInt(event.target.value, 10))
            }
          />
          <button
            className="btn btn-primary"
            onClick={() => {
              props.onChange(productionYear);
              setEdit(false);
            }}
          >
            OK
          </button>
        </Fragment>
      ) : (
        <span onClick={() => setEdit(true)}>- {productionYear}</span>
      )}
    </Fragment>
  );
};
