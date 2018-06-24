import React, {PropTypes} from 'react'
import util from '../lib/util'

export default class AppDownloadBanner extends React.Component {

  static propTypes = {
    text: PropTypes.string,
  };

  constructor(props) {
    super(props)

    this.state = {
      isInYuantuApp: util.isInYuantuApp()
    }

  }

  closeDownloadBar() {
    this.setState({
      isInYuantuApp: true
    })
  }

  render() {
    let {isInYuantuApp} = this.state;
    let {text} = this.props;

    return !isInYuantuApp ? (
        <div className="download-bar" data-spm="download">
          <a className="logo" href="https://s.yuantutech.com/tms/fb/app-download.html"></a>
          <a className="info" href="https://s.yuantutech.com/tms/fb/app-download.html">
            <h1>慧医</h1>
            <p>{text || "居民健康信息服务平台"}</p>
          </a>
          <a className="ui-btn-lg ui-btn-primary" href="https://s.yuantutech.com/tms/fb/app-download.html">查看</a>
          <i className="ui-icon-close-page" onClick={this.closeDownloadBar.bind(this)}></i>
        </div>
      ) : null;

  }
}
