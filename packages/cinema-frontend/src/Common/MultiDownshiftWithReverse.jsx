import React from "react";
import Downshift from "downshift";

export class MultiDownshiftWithReverse extends React.Component {
  state = { selectedItems: this.props.selectedItems || [] };
  stateReducer = (state, changes) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem:
        return {
          ...changes,
          highlightedIndex: state.highlightedIndex,
          isOpen: true
        };
      default:
        return changes;
    }
  };

  callOnChange = downshift => () => {
    if (this.props.onChange) {
      this.props.onChange(
        this.state.selectedItems,
        this.getStateAndHelpers(downshift)
      );
    }
  };

  handleSelection = (selectedItem, downshift) => {
    if (this.state.selectedItems.filter(item => selectedItem === item[0]).length > 0) {
      this.removeItem([selectedItem], this.callOnChange(downshift));
    } else {
      this.addSelectedItem(selectedItem, this.callOnChange(downshift));
    }
  };

  removeItem = (item, cb) => {
    this.setState(({ selectedItems }) => {
      return {
        selectedItems: selectedItems.filter(i => i[0] !== item[0])
      };
    }, cb);
  };
  addSelectedItem(item, cb) {
    this.setState(
      ({ selectedItems }) => ({
        selectedItems: [...selectedItems, [item, true]]
      }),
      cb
    );
  }

  getRemoveButtonProps = downshift => ({ onClick, item, ...props } = {}) => {
    return {
      onClick: e => {
        // TODO: use something like downshift's composeEventHandlers utility instead
        onClick && onClick(e);
        e.stopPropagation();
        this.removeItem(item, this.callOnChange(downshift));
      },
      ...props
    };
  };

  clickOnItem = (downshift) => (item, index) => {
    this.setState(({ selectedItems }) => {
      const newSelectedItems = selectedItems;
      newSelectedItems[index] = [item[0], !item[1]];
      return {
        selectedItems: newSelectedItems.filter(i => i !== item[0])
      };
    }, this.callOnChange(downshift));
  };
  displayItem = (item) => {
    return item[0]
  };
  displayBackground = (item) => {
    return item[1] ? "#ccc" : "tomato"
  };

  getStateAndHelpers(downshift) {
    const { selectedItems } = this.state;
    const { getRemoveButtonProps, removeItem, clickOnItem, displayItem, displayBackground } = this;
    return {
      getRemoveButtonProps: getRemoveButtonProps(downshift),
      removeItem,
      selectedItems,
      clickOnItem: clickOnItem(downshift),
      displayItem,
      displayBackground,
      ...downshift
    };
  }
  render() {
    const { render, children = render, ...props } = this.props;
    // TODO: compose together props (rather than overwriting them) like downshift does
    return (
      <Downshift
        {...props}
        stateReducer={this.stateReducer}
        onChange={this.handleSelection}
        selectedItem={null}
      >
        {downshift => children(this.getStateAndHelpers(downshift))}
      </Downshift>
    );
  }
}
