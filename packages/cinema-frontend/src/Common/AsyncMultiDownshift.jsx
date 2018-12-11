import { MultiDownshift } from "./MultiDownshift";
import { ArrowIcon, ControllerButton, Item, Menu } from "../shared";
import { Component } from "react";
import identity from "lodash/identity";
import { MultiDownshiftWithReverse } from "./MultiDownshiftWithReverse";
/** @jsx jsx */
import { jsx } from "@emotion/core";

const BaseMultiDownshift = BaseComponent =>
  class extends Component {
    render() {
      const { handleChange, placeholder, items, selectedItems } = this.props;
      return (
        <BaseComponent onChange={handleChange} selectedItems={selectedItems} placeholder={placeholder}>
          {({
            getToggleButtonProps,
            getMenuProps,
            getRemoveButtonProps,
            removeItem,
            isOpen,
            selectedItems,
            getItemProps,
            highlightedIndex,
            toggleMenu,
            clickOnItem = () => void 0,
            displayItem = identity,
            displayBackground = () => "#ccc",
            isSelected = item => selectedItems.includes(item)
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
                  {selectedItems.length > 0 ? (
                    selectedItems.map((item, index) => (
                      <div
                        key={index}
                        css={{
                          margin: "0 2px",
                          paddingLeft: 8,
                          paddingRight: 8,
                          display: "inline-block",
                          wordWrap: "none",
                          backgroundColor: displayBackground(item),
                          borderRadius: 2
                        }}
                        onClick={event => {
                          event.preventDefault();
                          event.stopPropagation();
                          clickOnItem(item, index);
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
                          <span>{displayItem(item)}</span>
                          <button
                            {...getRemoveButtonProps({ item })}
                            css={{
                              cursor: "pointer",
                              lineHeight: 0.8,
                              border: "none",
                              backgroundColor: "transparent",
                              padding: "0",
                              fontSize: "16px"
                            }}
                            type="button"
                          >
                            𝘅
                          </button>
                        </div>
                      </div>
                    ))
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
                          isSelected: isSelected(item)
                        })}
                      >
                        {item}
                      </Item>
                    ))
                  : null}
              </Menu>
            </div>
          )}
        </BaseComponent>
      );
    }
  };

export const AsyncMultiDownshift = BaseMultiDownshift(MultiDownshift);
export const AsyncMultiDownshiftwithReverse = BaseMultiDownshift(MultiDownshiftWithReverse);
