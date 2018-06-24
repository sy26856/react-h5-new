import React, {PropTypes} from 'react';
import './TopTips.less';

export default class TopMessage extends React.Component {

  static propTypes = {
    text: PropTypes.string,
    onClick: PropTypes.func
  };

  constructor ( props ) {
    super( props )
    this.isClick = !!props.onClick
  }

  clickBar() {
    this.props.onClick && this.props.onClick();
  }

  render() {
    const {text} = this.props;
    return (
      <div className="sections-message" onClick={() => this.clickBar()}>
        <span className="sections-message-icon" />
        {text}
        { this.isClick ? <span className="sections-message-to" /> : null }
      </div>
    );
  }
}