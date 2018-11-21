import React, { useContext, Fragment } from "react";
import "./TagList.css";
import { deleteTag, updateTag } from "../Common/TagAPI";
import { UserContext } from "../Login/UserContext";
import { Tag } from "./Tag";
import { useInput, useToggle } from "../Common/hooks";
import { generateColor } from "./tag.utils";
import { ApplicationContext } from "../ApplicationContext";

export const TagListElement = ({ tag, onDelete, onUpdate }) => {
  const [edit, toggleEdit] = useToggle(false);
  const [color, setColor] = useInput(tag.color || "");
  const [label] = useInput(tag.label || "");
  // get context
  const user = useContext(UserContext);
  const { tags } = useContext(ApplicationContext);

  return (
    <div
      className="mt-2 mb-2 d-flex"
      style={{
        overflow: "hidden" // Collapsing margins
      }}
    >
      {/* avoid the tag element to fill up all the available height */}
      {!edit ? (
        <Fragment>
          <div>
            <Tag {...tag} big />
          </div>
          <button
            type="button"
            className="btn btn-primary ml-2"
            onClick={toggleEdit}
          >
            <i className="fas fa-pencil-alt" />
          </button>
          <button
            type="button"
            className="btn btn-danger ml-2"
            onClick={_ => {
              if (window.confirm("Delete tag ?")) {
                deleteTag(tag, user).then(onDelete);
              }
            }}
          >
            <i className="fas fa-times" />
          </button>
        </Fragment>
      ) : (
        <form className="form-inline w-100">
          <input type="color" className="form-control colorpicker" {...color} />
          <input
            type="text"
            className="form-control ml-2"
            placeholder="Label"
            {...label}
          />
          <button
            type="button"
            className="btn btn-info btn-sm ml-2"
            onClick={() => {
              setColor(generateColor());
            }}
          >
            <i className="fas fa-sync-alt" />
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm ml-2"
            onClick={() => {
              updateTag(
                {
                  _id: tag._id,
                  color: color.value,
                  label: label.value
                },
                user
              )
                .then(onUpdate)
                .then(toggleEdit);
            }}
            disabled={
              !label.value ||
              tags.find(
                tag => tag.label.toLowerCase() === label.value.toLowerCase()
              )
            }
          >
            <i className="fas fa-check" />
          </button>
          <Tag
            style={{ marginLeft: "auto" }}
            color={color.value}
            label={label.value || "Label"}
          />
        </form>
      )}
    </div>
  );
};
