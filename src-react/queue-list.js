import React from 'react';
import Queue from './module/Queue';
import util from './lib/util';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import AppDownloadBanner from './component/AppDownloadBanner';
import BlockLoading from './component/loading/BlockLoading';
import './queue-list.less';

export default class QueueList extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();
    this.corpId = query.corpId || '';
    this.area = query.area || '';
    this.state = {
      loading: true,
      data: null,
      showDownloadBar: !util.isInYuantuApp(),
      refreshTime: util.dateFormat(new Date(), 'hh:mm:ss')
    }
  }

  async componentDidMount() {
    const res = await Queue.queryHzQueueByArea(this.corpId, this.area);
    res.subscribe(this).fetch();
  }

  onSuccess(result) {
    this.setState({
      loading: false,
      success: true,
      data: result.data,
      refreshTime: util.dateFormat(new Date(), 'hh:mm:ss')
    });
  }

  closeDownloadBar() {
    this.setState({
      showDownloadBar: false,
    });
  }

  async refresh() {
    BlockLoading.show();
    const res = await Queue.queryHzQueueByArea(this.corpId, this.area);
    await res.subscribe(this).fetch();
    BlockLoading.hide();
  }

  downloadBar() {
    return (
      <div className="download-with-refresh">
        <div className="download-refresh-bar">
          <span>队列更新时间 {this.state.refreshTime}</span>
          <button onClick={() => this.refresh()}>立即刷新</button>
        </div>
        {
          this.state.showDownloadBar ? <div className="download-bar" data-spm="download" style={{position: 'relative'}}>
              <a className="logo" href="https://s.yuantutech.com/tms/fb/app-download.html"></a>
              <a className="info" href="https://s.yuantutech.com/tms/fb/app-download.html">
                <h1>慧医</h1>
                <p>排队信息实时掌握</p>
              </a>
              <a className="ui-btn-lg ui-btn-primary" href="https://s.yuantutech.com/tms/fb/app-download.html">查看</a>
              <i className="ui-icon-close-page" onClick={this.closeDownloadBar.bind(this)}></i>
            </div> : null
        }
      </div>
    );
  }

  replaceName(name) {
    let userName = "";
    if (name) {
      let temp = null;
      temp = name.length > 1 ? name.split("") : ["*"];
      temp.splice(1, 1, "*");
      userName = temp.join("");
    }
    return userName || "";
  }

  orderTypeTag(orderType) {
    if (orderType == "APPOINT_CHARGE") {
      return <div className="badge-nowrapper" style={{backgroundColor: '#5c93f7'}}>
        <div className="badge-txt">预约</div>
      </div>
    }
    if (orderType == "NORMAL_BACK") {
      return <div className="badge-nowrapper" style={{backgroundColor: '#F15A4A'}}>
        <div className="badge-txt">回诊</div>
      </div>
    }
    if (orderType == "NORMAL_PASS") {
      return null;
    }
    if (orderType == "AM") {
      return <div className="badge-nowrapper" style={{backgroundColor: '#aaa'}}>
        <div className="badge-txt">上午</div>
      </div>
    }
    return null;
  }

  renderItem(item, i, length) {
    const heightStyle = {height: length > 1 ? '42px' : '89px'};
    const lineHeightStyle = {lineHeight: length > 1 ? '42px' : '89px'};

    return (
      <div key={"m" + i} className="queue-msg-item" style={heightStyle}>
        <div className="queue-item-no" style={lineHeightStyle}>
          {item.orderNoTag}
        </div>
        <div className="queue-item-username" style={lineHeightStyle}>
          {this.replaceName(item.username)}
          {this.orderTypeTag(item.orderType)}
        </div>
        {item.diagRoom && <div className="queue-item-dept" style={lineHeightStyle}>
          <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/9e09cf9a09f10f06f2155f6abebfe8df-64-64.png"/>
          {item.diagRoom}
        </div>
        }
      </div>
    );
  }

  renderPanel(res, i) {

    return (
      <div className="panel g-space" key={i}>
        <div className="panel-title">{res.queueName}
          <span
            className="panel-extra txt-prompt">排队总数：{res.inPatientList.length + res.waitPatientList.length}</span>
        </div>
        <div className="queue-msg-container">
          <div className="queue-label">当<br />前<br />叫<br />号</div>
          <div className="queue-msg-list">
            {(res.inPatientList && res.inPatientList.length > 0)
              ? res.inPatientList.map((item, j) => this.renderItem(item, j, res.inPatientList.length))
              : <div className="queue-empty-item"></div>}
          </div>
        </div>
        <div className="btn-wrapper">
          <button
            className="btn btn-secondary g-right"
            style={{padding: '6px', fontSize: '14px'}}
            onClick={() => this.queueDetail(res)}
          >
            查看完整队列
          </button>
        </div>
      </div>
    )
  }

  queueDetail(item) {
    const urlInfo = {
      corpId: this.corpId,
      area: this.area,
      queueCode: item.queueCode,
      target: '_blank'
    };
    window.location.href = `./queue-list-detail.html?${util.flat(urlInfo)}`
  };

  render() {
    const {data} = this.state;
    const dataList = data.filter(item => item.inPatientList && item.inPatientList.length > 0);
    const waitList = data.filter(item => (item.inPatientList && item.inPatientList.length === 0 && item.waitPatientList && item.waitPatientList.length > 0));
    const emptyList = data.filter(item => item.inPatientList && item.inPatientList.length === 0 && item.waitPatientList && item.waitPatientList.length === 0);

    if (data.length > 0) {
      return (
        <div style={{paddingBottom: '50px'}}>
          {dataList.map((res, i) => this.renderPanel(res, i))}
          {waitList.map((res, i) => this.renderPanel(res, i))}
          {emptyList.map((res, i) => this.renderPanel(res, i))}
          {this.downloadBar()}
        </div>
      );
    } else {
      return (
        <div style={{overflow: 'hidden'}}>
          <div className="notice">
            <img
              className="no-queue-img"
              src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/daf49447398df64ad8e08bbddaffca8d-120-120.png"
            />
            <p>尚未开诊</p>
            <p>请等待医生呼叫</p>
          </div>
        </div>
      );
    }
  }
}