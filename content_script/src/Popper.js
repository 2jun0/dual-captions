import React from 'react';
import Popper from 'popper.js';
const throttle = require('lodash.throttle');

class StickyPopper extends React.Component {
  constructor(props) {
    super(props);
    this.previousPosition = null;
    this.onPositionChanged = this.onPositionChanged.bind(this);
  }

  onPositionChanged(position) {
    this.previousPosition = position;
  }

  render() {
    const {
      children,
      target
    } = this.props;
    if (target) {
      return (
        <WithPopper
          {...this.props}
          onPositionChanged={this.onPositionChanged}
        >
          { children }
        </WithPopper>
      );
    } else if (this.previousPosition) {
      return (
        <div className='dc-popper' style={this.previousPosition}>
          { children }
        </div>
      )
    } else {
      return null;
    }
  }
}

class WithPopper extends React.Component {
  constructor(props) {
    super(props);
    this.canAttachToTarget = this.canAttachToTarget.bind(this);
    this.createPopper = this.createPopper.bind(this);
    this.scheduleUpdate = this.scheduleUpdate.bind(this);
    this.throttledScheduleUpdate = throttle(this.scheduleUpdate, 1000 * 5);
    this.popper = null;
  }

  createPopper() {
    const {
      placement
    } = this.props;
    console.log('Creating new Popper.');
    if (this.popper) {
      this.popper.destroy();
    }
    this.popper = new Popper(
      this.props.target,
      this.popperPosition,
      {
        onCreate: (data) => {
          if (this.props.onPositionChanged) {
            this.props.onPositionChanged(data.styles);
          }
        },
        onUpdate: (data) => {
          if (this.props.onPositionChanged) {
            this.props.onPositionChanged(data.styles);
          }
        },
        placement: placement,
        modifiers: {
          flip: {
            enabled: false
          }
        }
      }
    );
  }

  canAttachToTarget() {
    return this.props.target && this.popperPosition;
  }

  componentDidMount() {
    if (this.canAttachToTarget()) {
      this.createPopper();
    }
  }

  componentWillUnmount() {
    if (this.popper) {
      this.popper.destroy();
    }
  }

  scheduleUpdate() {
    if (this.popper) {
      this.popper.scheduleUpdate();
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.target !== this.props.target && this.canAttachToTarget()) {
      this.createPopper();
    } else {
      if (this.props.updateInfrequently) {
        this.throttledScheduleUpdate();
      } else if (!this.props.dontUpdate) {
        this.scheduleUpdate();
      }
    }
  }

  render() {
    return (
      <div className='dc-popper' ref={(ref) => this.popperPosition = ref}>
        {this.props.children}
      </div>
    );
  }
}

WithPopper.defaultProps = {
  placement: 'bottom',
  dontUpdate: false,
  updateInfrequently: false
}

export { StickyPopper };
export default WithPopper;
