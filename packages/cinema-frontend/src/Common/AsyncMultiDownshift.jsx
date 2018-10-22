import { MultiDownshift } from "./MultiDownshift";
import { ArrowIcon, ControllerButton, css, Item, Menu } from "../shared";
import React, { Component } from "react";

export class AsyncMultiDownshift extends Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
  }

  render() {
    const { handleChange, placeholder, items, selectedItems } = this.props;
    return (
      <MultiDownshift onChange={handleChange} selectedItems={selectedItems}>
        {({
          getInputProps,
          getToggleButtonProps,
          getMenuProps,
          getRemoveButtonProps,
          removeItem,
          isOpen,
          inputValue,
          selectedItems,
          getItemProps,
          highlightedIndex,
          toggleMenu
        }) => (
          <div style={{ margin: "auto", position: "relative" }}>
            <div
              {...css({
                cursor: "pointer",
                position: "relative",
                borderRadius: "6px",
                borderTopRadius: 6,
                borderBottomRightRadius: isOpen ? 0 : 6,
                borderBottomLeftRadius: isOpen ? 0 : 6,
                padding: 10,
                paddingRight: 50,
                boxShadow: "0 2px 3px 0 rgba(34,36,38,.15)",
                borderColor: "#96c8da",
                borderTopWidth: "1",
                borderRightWidth: 1,
                borderBottomWidth: 1,
                borderLeftWidth: 1,
                borderStyle: "solid"
              })}
              onClick={() => {
                toggleMenu();
                !isOpen && this.input.current.focus();
              }}
            >
              <div
                {...css({
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center"
                })}
              >
                {selectedItems.length > 0
                  ? selectedItems.map((item, index) => (
                      <div
                        key={index}
                        {...css({
                          margin: 2,
                          paddingTop: 2,
                          paddingBottom: 2,
                          paddingLeft: 8,
                          paddingRight: 8,
                          display: "inline-block",
                          wordWrap: "none",
                          backgroundColor: "#ccc",
                          borderRadius: 2
                        })}
                      >
                        <div
                          {...css({
                            display: "grid",
                            gridGap: 6,
                            gridAutoFlow: "column",
                            alignItems: "center"
                          })}
                        >
                          <span>{item}</span>
                          <button
                            {...getRemoveButtonProps({ item })}
                            {...css({
                              cursor: "pointer",
                              lineHeight: 0.8,
                              border: "none",
                              backgroundColor: "transparent",
                              padding: "0",
                              fontSize: "16px"
                            })}
                            type="button"
                          >
                            𝘅
                          </button>
                        </div>
                      </div>
                    ))
                  : placeholder}
                <input
                  {...getInputProps({
                    ref: this.input,
                    onKeyUp(event) {
                      if (event.key === "Backspace" && !inputValue) {
                        removeItem(selectedItems[selectedItems.length - 1]);
                      }
                    },
                    ...css({
                      border: "none",
                      marginLeft: 6,
                      flex: 1,
                      fontSize: 14,
                      minHeight: 27
                    })
                  })}
                />
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
                        isSelected: selectedItems.includes(item)
                      })}
                    >
                      {item}
                    </Item>
                  ))
                : null}
            </Menu>
          </div>
        )}
      </MultiDownshift>
    );
  }
}
