import React from 'react';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import './insurance-list.less';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import {TMS_DOMAIN} from './config';

export default class OrderList extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();

    this.unionId = query.unionId || '';

    this.state = {
      loading: true,
      data: null,
    };
  }

  componentDidMount() {
    UserCenter.getInsurance().subscribe(this).fetch();
  }

  onSuccess(result) {
    this.setState({
      loading: false,
      success: true,
      data: result.data || []
    });
  }

  statusItem(status) {
    switch (status) {
      case "0":
        return <span className="panel-extra txt-highlight">待支付</span>;
      case "1":
        return <span className="panel-extra txt-highlight">待出单</span>;
      case "2":
        return <span className="panel-extra txt-prompt">已出单</span>;
      case "3":
        return <span className="panel-extra txt-prompt">已生效</span>;
      case "4":
        return <span className="panel-extra txt-info">已终止</span>;
      case "8":
        return <span className="panel-extra txt-info">已取消</span>;
      case "9":
        return <span className="panel-extra txt-info">出单失败</span>;
      case "10":
        return <span className="panel-extra txt-info">已退款</span>;
    }
  }

  itemClick(data) {
    console.log(data);
    console.log(data.orderAid);
    const urlInfo = {
      ordaid: data.orderAid,
      prodValue: `https:${TMS_DOMAIN}/tms/h5/transfer.php?transferKey=22&unionId=${this.unionId}`,
      target: '_blank'
    };
    window.location.href = `http://m.htbaobao.com/orderconfirm.html?${util.flat(urlInfo)}`
  }

  renderItem(data, i) {
    return (
      <div onClick={() => this.itemClick(data)} key={i} className="panel g-space">
        <div className="panel-title">
          {data.prodName}
          {this.statusItem(data.isuStatus)}
        </div>
        <ul className="list-ord insurance-item">
          <li className="list-item list-item-noborder">
            <div className="list-brief-title">订单号</div>
            <div className="list-content txt-nowrap">{data.orderAid}</div>
          </li>
          <li className="list-item list-item-noborder">
            <div className="list-brief-title">被保人</div>
            <div className="list-content txt-nowrap">{data.custName}</div>
          </li>
          <li className="list-item list-item-noborder">
            <div className="list-brief-title">保障期限</div>
            <div className="list-content txt-nowrap">
              {data.isuDtStart && data.isuDtStart.split(" ")[0]} ~ {data.isuDtEnd && data.isuDtEnd.split(" ")[0]}
            </div>
          </li>
          <li className="list-item list-item-noborder">
            <div className="list-brief-title">订单金额</div>
            <div className="list-content txt-nowrap txt-highlight">¥ {((data.orderPrice - 0) / 100).toFixed(2)}</div>
          </li>
        </ul>
      </div>
    );
  }

  toOrderList() {
    window.location.href = `${TMS_DOMAIN}/tms/fb/insurance-list.html?target=_blank`;
  }

  render() {
    const {data} = this.state;
    if (data.length > 0) {
      return (
        <div>
          <div className="list-insurance-container">
            {data.map((z, i) => this.renderItem(z, i))}
          </div>
          <div className="insurance-list-footer">
            {/*该保险产品由第三方服务商海豚保宝提供*/}
            保险产品由第三方服务商提供，如未查询到订单信息，<br/>
            以收到的投保信息短信为准
          </div>
        </div>
      );
    }
    return (
      <div style={{overflow: 'hidden'}}>
        <div className="notice">
          <span className="notice-icon icon-record"></span>
          <p>您还没有过任何</p>
          <p>保险订单</p>
          <button onClick={this.toOrderList} style={{marginTop: '10px'}} className="btn">前往商城</button>
        </div>
        <div className="insurance-list-footer">
          {/*该保险产品由第三方服务商海豚保宝提供*/}
          保险产品由第三方服务商提供，如未查询到订单信息，<br/>
          以收到的投保信息短信为准
        </div>
      </div>
    )
  }
}
