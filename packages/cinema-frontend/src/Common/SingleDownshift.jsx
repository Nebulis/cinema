import React from "react";
import Downshift from "downshift";
import { ArrowIcon, ControllerButton, Item, Menu } from "../shared";
/** @jsx jsx */
import { jsx } from "@emotion/core";

export class SingleDownshift extends React.Component {
  render() {
    const { onChange, placeholder, items, selectedItem } = this.props;
    return (
      <Downshift onChange={onChange} selectedItem={selectedItem}>
        {({
          getToggleButtonProps,
          getInputProps,
          getItemProps,
          getLabelProps,
          getMenuProps,
          isOpen,
          inputValue,
          highlightedIndex,
          selectedItem,
          toggleMenu
        }) => (
          <div
            style={{
              margin: "auto",
              position: "relative",
              width: "100%"
            }}
          >
            <div
              css={{
                cursor: "pointer",
                position: "relative",
                padding: ".375rem .75rem",
                paddingRight: 50,
                border: "1px solid #ced4da",
                borderRadius: ".25rem",
                backgroundColor: "white"
              }}
              onClick={() => {
                toggleMenu();
              }}
            >
              <div
                css={{
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center"
                }}
              >
                {selectedItem ? (
                  <div
                    css={{
                      margin: "0 2px",
                      paddingLeft: 8,
                      paddingRight: 8,
                      display: "inline-block",
                      wordWrap: "none",
                      backgroundColor: "#ccc",
                      borderRadius: 2
                    }}
                  >
                    <div
                      css={{
                        display: "grid",
                        gridGap: 6,
                        gridAutoFlow: "column",
                        alignItems: "center"
                      }}
                    >
                      <span>{selectedItem}</span>
                    </div>
                  </div>
                ) : (
                  <span
                    css={{
                      color: "#6c757d"
                    }}
                  >
                    {placeholder}
                  </span>
                )}
              </div>
              <ControllerButton
                {...getToggleButtonProps({
                  // prevents the menu from immediately toggling
                  // closed (due to our custom click handler above).
                  onClick(event) {
                    event.stopPropagation();
                  }
                })}
              >
                <ArrowIcon isOpen={isOpen} />
              </ControllerButton>
            </div>
            <Menu {...getMenuProps({ isOpen })}>
              {isOpen
                ? items.map((item, index) => (
                    <Item
                      key={index}
                      {...getItemProps({
                        item,
                        index,
                        isActive: highlightedIndex === index,
                        isSelected: selectedItem === item
                      })}
                    >
                      {item}
                    </Item>
                  ))
                : null}
            </Menu>
          </div>
        )}
      </Downshift>
    );
  }
}
