import React from 'react';
import util from './lib/util';
import Queue from './module/Queue';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import './queue-list-detail.less';
import Icon from './component/icon/Icon';
import BlockLoading from './component/loading/BlockLoading';

const itemStyle = {
  borderBottom: '1px solid #eee',
  backgroundColor: '#fff'
};

export default class QueueListDetail extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();
    this.corpId = query.corpId || '';
    this.area = query.area || '';
    this.queueCode = query.queueCode || '';

    this.state = {
      loading: true,
      data: null,
      showDownloadBar: !util.isInYuantuApp(),
      refreshTime: util.dateFormat(new Date(), 'hh:mm:ss')
    }
  }

  async componentDidMount() {
    const res = await Queue.zhenjianQueueByQueue(this.corpId, this.area, this.queueCode);
    res.subscribe(this).fetch();
  }

  onSuccess(result) {
    this.setState({
      loading: false,
      success: true,
      data: result.data[0],
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
    const res = await Queue.zhenjianQueueByQueue(this.corpId, this.area, this.queueCode);
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

  doctInfo() {
    const {data} = this.state;
    const avatarUrl = data.queueLogo ? data.queueLogo : "https://image.yuantutech.com/i4/02c19c04746fcb726000ff4d49264288-84-84.png";
    const avatarStyle = {
      width: '65px',
      height: '65px',
      marginRight: '10px'
    };
    return (
      <ul className="list-ord" style={{marginBottom: '10px'}}>
        <li className="list-item ">
          <Icon url={avatarUrl} circle={true} style={avatarStyle}/>
          <div className="list-content">
            <div className="list-title doct-name">{data.queueName}</div>
            {data.bigDeptName && <div className="dept-name">{data.bigDeptName}</div>}
            <div className="corp-name">
              {data.corpName}
            </div>
          </div>
        </li>
      </ul>
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

  waitPatientListItem(item, index) {
    return (
      <li key={"w" + index} className="queue-msg-item queue-detail-item">
        <div className="queue-item-no">
          {item.orderNoTag}
        </div>
        <div className="queue-item-username">
          {this.replaceName(item.username)}
          {this.orderTypeTag(item.orderType)}
        </div>
      </li>
    );
  }

  inPatientListItem(item, index) {
    return (
      <li key={"i" + index} className="queue-msg-item queue-detail-item">
        <div className="queue-item-no">
          {item.orderNoTag}
        </div>
        <div className="queue-item-username">
          {this.replaceName(item.username)}
          {this.orderTypeTag(item.orderType)}
        </div>
        {item.diagRoom && <div className="queue-item-dept">
          <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/9e09cf9a09f10f06f2155f6abebfe8df-64-64.png"/>
          {item.diagRoom}
        </div>}
      </li>
    );
  }


  render() {
    const {data} = this.state;

    return (
      <div style={{paddingBottom: '50px'}}>
        {this.doctInfo()}
        {
          data.inPatientList && <div className="panel g-space">
            <div className="panel-title">当前叫号{data.inPatientList && `(${data.inPatientList.length})`}
              <span className="panel-extra txt-info" style={{fontSize: '12px'}}>当前叫号患者请前往诊室门口等候</span>
            </div>
            <ul className="list-ord">
              {data.inPatientList.map((item, i) => this.inPatientListItem(item, i))}
            </ul>
          </div>
        }
        {
          data.waitPatientList && <div className="panel g-space">
            <div className="panel-title">等候患者{data.inPatientList && `(${data.waitPatientList.length})`}
              <span className="panel-extra txt-info" style={{fontSize: '12px'}}>等候患者请在集中候诊区耐心等候</span>
            </div>
            <ul className="list-ord">
              {data.waitPatientList.map((item, i) => this.waitPatientListItem(item, i))}
            </ul>
          </div>
        }
        {this.downloadBar()}
      </div>
    );
  }
}
