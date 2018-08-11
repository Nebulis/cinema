import React, { Component, StrictMode } from "react";
import "./App.css";
import { Fetch } from "./Common/Fetch";
import { Movie } from "./Movie/Movie";
import { MultiDownshift } from "./Common/MultiDownshift";
import { ArrowIcon, ControllerButton, css, Item, Menu } from "./shared";
import isArray from "lodash/isArray";

class App extends Component {
  inputType = React.createRef();
  inputGenre = React.createRef();
  constructor(props) {
    super(props);
    this.state = {
      filters: {
        title: "",
        genres: [],
        types: [],
        seen: false,
        unseen: false
      }
    };
    this.onInput = this.onInput.bind(this);
    this.onInputWithoutEvent = this.onInputWithoutEvent.bind(this);
    this.onSeen = this.onSeen.bind(this);
  }

  onInput(name) {
    return event =>
      this.setState({
        filters: { ...this.state.filters, [name]: event.target.value }
      });
  }

  onInputWithoutEvent(name) {
    return value =>
      this.setState({
        filters: { ...this.state.filters, [name]: value }
      });
  }

  onSeen(name) {
    return () =>
      this.setState({
        filters: { ...this.state.filters, [name]: !this.state.filters[name] }
      });
  }

  buildQuery() {
    const filters = Object.keys(this.state.filters)
      .filter(
        key =>
          (!isArray(this.state.filters[key]) && this.state.filters[key]) ||
          (isArray(this.state.filters[key]) &&
            this.state.filters[key].length > 0)
      )
      .map(key => `${key}=${this.state.filters[key]}`);

    return filters.join("&");
  }

  render() {
    return (
      <StrictMode>
        <input
          type="text"
          value={this.state.title}
          onInput={this.onInput("title")}
          placeholder="Title"
        />
        {this.renderMulti({
          placeholder: "Genre",
          input: this.inputGenre,
          handleChange: this.onInputWithoutEvent("genres"),
          endpoint: "/api/movies/genre"
        })}
        {this.renderMulti({
          placeholder: "Type",
          input: this.inputType,
          handleChange: this.onInputWithoutEvent("types"),
          endpoint: "/api/movies/type"
        })}
        <i
          className="fas fa-eye"
          style={{ color: this.state.filters.seen ? "var(--success)" : "" }}
          onClick={this.onSeen("seen")}
        />{" "}
        <i
          className="fas fa-eye-slash"
          style={{ color: this.state.filters.unseen ? "var(--success)" : "" }}
          onClick={this.onSeen("unseen")}
        />
        <div className="movies">
          <Fetch endpoint={`/api/movies?${this.buildQuery()}`}>
            {data => data.map(movie => <Movie key={movie._id} movie={movie} />)}
          </Fetch>
        </div>
      </StrictMode>
    );
  }

  renderMulti({ placeholder, input, handleChange, endpoint }) {
    // TODO copy past from downshift example
    return (
      <Fetch endpoint={endpoint}>
        {items => (
          <MultiDownshift onChange={handleChange}>
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
              <div style={{ width: 500, margin: "auto", position: "relative" }}>
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
                    !isOpen && input.current.focus();
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
                              >
                                𝘅
                              </button>
                            </div>
                          </div>
                        ))
                      : placeholder}
                    <input
                      {...getInputProps({
                        ref: input,
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
        )}
      </Fetch>
    );
  }
}

export default App;
