import React from "react";
import Downshift from "downshift";

export class MultiDownshift extends React.Component {
  state = { selectedItems: [] };

  componentDidUpdate(prevProps) {
    if (
      prevProps.selectedItems !== this.props.selectedItems &&
      this.props.selectedItems !== this.state.selectedItems
    ) {
      this.setState({ selectedItems: this.props.selectedItems || [] });
    }
  }

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
    if (this.state.selectedItems.includes(selectedItem)) {
      this.removeItem(selectedItem, this.callOnChange(downshift));
    } else {
      this.addSelectedItem(selectedItem, this.callOnChange(downshift));
    }
  };

  removeItem = (item, cb) => {
    this.setState(({ selectedItems }) => {
      return {
        selectedItems: selectedItems.filter(i => i !== item)
      };
    }, cb);
  };
  addSelectedItem(item, cb) {
    this.setState(
      ({ selectedItems }) => ({
        selectedItems: [...selectedItems, item]
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

  getStateAndHelpers(downshift) {
    const { selectedItems } = this.state;
    const { getRemoveButtonProps, removeItem } = this;
    return {
      getRemoveButtonProps: getRemoveButtonProps(downshift),
      removeItem,
      selectedItems,
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
