let React = require('react/addons');
let ReactTransitionGroup = React.addons.TransitionGroup;
let ClickAwayable = require('../mixins/click-awayable');
let StylePropable = require('../mixins/style-propable');
let Events = require('../utils/events');
let PropTypes = require('../utils/prop-types');
let Menu = require('../menus/menu');


let IconMenu = React.createClass({

  mixins: [StylePropable, ClickAwayable],

  contextTypes: {
    muiTheme: React.PropTypes.object,
  },

  propTypes: {
    closeOnItemTouchTap: React.PropTypes.bool,
    iconButtonElement: React.PropTypes.element.isRequired,
    openDirection: PropTypes.corners,
    onItemTouchTap: React.PropTypes.func,
    onKeyboardFocus: React.PropTypes.func,
    onMouseDown: React.PropTypes.func,
    onMouseLeave: React.PropTypes.func,
    onMouseEnter: React.PropTypes.func,
    onMouseUp: React.PropTypes.func,
    onTouchTap: React.PropTypes.func,
    menuStyle: React.PropTypes.object,
    touchTapCloseDelay: React.PropTypes.number,
  },

  getDefaultProps() {
    return {
      closeOnItemTouchTap: true,
      openDirection: 'bottom-left',
      onItemTouchTap: () => {},
      onKeyboardFocus: () => {},
      onMouseDown: () => {},
      onMouseLeave: () => {},
      onMouseEnter: () => {},
      onMouseUp: () => {},
      onTouchTap: () => {},
      touchTapCloseDelay: 200,
    };
  },

  getInitialState() {
    return {
      iconButtonRef: this.props.iconButtonElement.props.ref || 'iconButton',
      menuInitiallyKeyboardFocused: false,
      open: false,
    };
  },

  componentWillUnmount() {
    if (this._timeout) clearTimeout(this._timeout);
  },

  componentClickAway() {
    this.close();
  },

  render() {
    let {
      closeOnItemTouchTap,
      iconButtonElement,
      openDirection,
      onItemTouchTap,
      onKeyboardFocus,
      onMouseDown,
      onMouseLeave,
      onMouseEnter,
      onMouseUp,
      onTouchTap,
      menuStyle,
      style,
      ...other,
    } = this.props;

    let open = this.state.open;
    let openDown = openDirection.split('-')[0] === 'bottom';
    let openLeft = openDirection.split('-')[1] === 'left';

    let styles = {
      root: {
        display: 'inline-block',
        position: 'relative',
      },

      menu: {
        top: openDown ? 12 : null,
        bottom: !openDown ? 12 : null,
        left: !openLeft ? 12 : null,
        right: openLeft ? 12 : null,
      },
    };

    let mergedRootStyles = this.mergeAndPrefix(styles.root, style);
    let mergedMenuStyles = this.mergeStyles(styles.menu, menuStyle);

    let iconButton = React.cloneElement(iconButtonElement, {
      onKeyboardFocus: this.props.onKeyboardFocus,
      onTouchTap: (e) => {
        this.open(Events.isKeyboard(e));
        if (iconButtonElement.props.onTouchTap) iconButtonElement.props.onTouchTap(e);
      }.bind(this),
      ref: this.state.iconButtonRef,
    });

    let menu = open ? (
      <Menu
        {...other}
        initiallyKeyboardFocused={this.state.menuInitiallyKeyboardFocused}
        onEscKeyDown={this._handleMenuEscKeyDown}
        onItemTouchTap={this._handleItemTouchTap}
        openDirection={openDirection}
        style={mergedMenuStyles}>
        {this.props.children}
      </Menu>
    ) : null;

    return (
      <div
        onMouseDown={onMouseDown}
        onMouseLeave={onMouseLeave}
        onMouseEnter={onMouseEnter}
        onMouseUp={onMouseUp}
        onTouchTap={onTouchTap}
        style={mergedRootStyles}>
        {iconButton}
        <ReactTransitionGroup>{menu}</ReactTransitionGroup>
      </div>
    );
  },

  close(isKeyboard) {
    if (this.state.open) {
      this.setState({open: false}, () => {
        //Set focus on the icon button when the menu close
        if (isKeyboard) {
          let iconButton = this.refs[this.state.iconButtonRef];
          React.findDOMNode(iconButton).focus();
          iconButton.setKeyboardFocus();
        }
      });
    }
  },

  open(menuInitiallyKeyboardFocused) {
    if (!this.state.open) {
      this.setState({
        open: true,
        menuInitiallyKeyboardFocused: menuInitiallyKeyboardFocused,
      });
    }
  },

  _handleItemTouchTap(e, child) {

    if (this.props.closeOnItemTouchTap) {
      let isKeyboard = Events.isKeyboard(e);

      this._timeout = setTimeout(() => {
        this.close(isKeyboard);
      }, this.props.touchTapCloseDelay);
    }

    this.props.onItemTouchTap(e, child);
  },

  _handleMenuEscKeyDown() {
    this.close(true);
  },

});

module.exports = IconMenu;
