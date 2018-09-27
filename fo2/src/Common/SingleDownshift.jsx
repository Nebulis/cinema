import React from "react";
import Downshift from "downshift";
import { ArrowIcon, ControllerButton, css, Item, Menu } from "../shared";

export class SingleDownshift extends React.Component {
  render() {
    const { placeholder, items } = this.props;
    return (
      <Downshift>
        {({
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
              }}
            >
              <div
                {...css({
                  display: "flex",
                  flexWrap: "wrap",
                  alignItems: "center"
                })}
              >
                {selectedItem ? (
                  <div
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
                      <span>{selectedItem}</span>
                    </div>
                  </div>
                ) : (
                  placeholder
                )}
              </div>
              <ControllerButton>
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
