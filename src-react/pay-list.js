import React from 'react';
import util from './lib/util';
import {SmartBlockComponent} from './BaseComponent/index';
import UserCenter from './module/UserCenter';
import WebViewLifeCycle from './lib/WebViewLifeCycle';
import TopMessage from './component/TopTips/TopMessage';
import './pay-list.less';

const STATUS = {
  100: "待支付",
  101: "支付成功-医院处理失败",
  200: "支付成功",
  401: "已过期",
  402: "已作废"
};

export default class PayList extends SmartBlockComponent {
  constructor(props) {
    super(props);
    const query = util.query();
    this.unionId = query.unionId || '';
    this.corpId = query.corpId || '';
    //是否显示标题
    this.title = query.title || '';
    this.state = {
      loading: true,
      success: false,
      data: [],
      isConfig:true,//是否配置 缴费功能 默认true
    }
  }

  componentDidMount() {
    const webViewLifeCycle = new WebViewLifeCycle();
    const sid = util.getSID();
    webViewLifeCycle.onActivation = () => {
      console.log("onActivation");
      if (sid != util.getSID()) {
        this.loadData();
      }
    };
    this.loadData();
  }

  loadData() {
    // if (this.title === 'none') {
      UserCenter.getPaymentList(this.corpId, this.unionId).subscribe(this).fetch();
    // } else {
      // UserCenter.getPayList(this.corpId, this.unionId).subscribe(this).fetch();
    // }
  }

  onSuccess(result) {
    // if (this.title === 'none') {
    // this.setState({
    //   loading: false,
    //   success: true,
    //   data: result.data || [],
    //   title: '',
    // });
    // } else {
    //支付宝城市服务特殊处理
    let isConfig;
    result.resultCode==10121200?isConfig=false:isConfig=true
    
    this.setState({
      loading: false,
      success: true,
      isConfig,
      data: result.data || [],
      title: result.data.title,
    });
    // }
  }

  item(data, i) {
    const statusRes = STATUS[data.status] || data.statusName;
    return (
      <a href={`pay-detail.html?${util.flat({
        corpId: data.corpId,
        billNo: data.billNo,
        patientId: data.patientId,
        unionId: this.unionId,
        target: '_blank'
      })}`} key={i}>
        <ul className="ui-list ui-list-pure ui-border-tb">
          <li className="ui-border-t">
            <h4>{data.billType || "缴费单"}</h4>
            <p>就诊人: {data.patientName}
              <span className="rmb">
                <span className="y">￥</span>
                {data.billFee / 100}
              </span>
            </p>
            <h5 className="ui-border-tt">{data.corpName}</h5>
            <p>
              <span className="status">{STATUS[data.status] || data.statusName}</span>
              <span className="pay-list-med-item" style={{marginRight: statusRes ? '60px' : '0'}}>发药窗口：{data.takeMedWin || "未获得"}</span>
            </p>
          </li>
        </ul>
      </a>
    );
  }

  renderTitle() {
    const { title } = this.state;
    return title ? <div className="pay-list-title">{title}</div> : null;
  }

  toBind() {
    const urlInfo = {
      unionId: this.unionId,
      target: '_blank'
    };
    window.location.href = `./patient-list.html?${util.flat(urlInfo)}`;
  }

  render() {
    const {data, title,isConfig} = this.state;
    if(!isConfig){
      return (
        <div className="notice" style={{marginTop:'160px'}}>
          <span className="notice-icon icon-record"></span>
          <p>该医院暂未配置缴费功能</p>
        </div>
      )
    }
    if (data.length > 0) {
      return (
        <div className="pay-page">
          {this.renderTitle()}
          <div className="pay-list">
            <div>
              {
                data.map((z, i) => this.item(z, i))
              }
            </div>
          </div>
        </div>
      );
    }
    return (
      <div>
        {this.renderTitle()}
        <section className="ui-notice">
          <i></i>
          <p>没有需要缴费的单据</p>
        </section>
      </div>
    );
  }
}
