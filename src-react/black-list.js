import React from 'react';
import './black-list.less';
import util from './lib/util';
import UserCenter from './module/UserCenter';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import CacheSession from './lib/cacheSession'

export default class BlackList extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();
    this.unionId = query.unionId || '';
    this.state = {
      loading: true,
      data: []
      ,warning: true
    };
  }

  componentDidMount() {
    UserCenter.breakAppointmentList().subscribe(this).fetch();
  }

  onSuccess(result) {
    this.setState({
      success: true,
      loading: false,
      data: result.data || [],
    });
  }

  getWeekDay(date) {
    const list = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const tempDate = new Date(date);
    return list[tempDate.getDay()];
  }

  toFeedBack(data) {
    const urlInfo = {
      id: data.id,
      target: '_blank',
      unionId: this.unionId
    };
    window.location.href = `./feedback.html?${util.flat(urlInfo)}`;
  }

  toFeedBackDetail(data) {
    const urlInfo = {
      target: '_blank',
      blackId: data.id,
      unionId: this.unionId
    };
    window.location.href = `./feedback-detail.html?${util.flat(urlInfo)}`;
  }

  handleBlackDetail(item) {
    CacheSession.set( 'blackDetail', item )
    return false
  }

  renderItem(data, i) {
    const {unionId} = this
    return (
      <li className="black-list-item" key={i}>
        <a onClick={this.handleBlackDetail.bind(this, data)} href={"black-detail.html?target=_blank&unionId=" + unionId} style={{display: 'block'}}>
          <div className="black-list-main">
            <p><span className="black-list-item-name">医&nbsp;&nbsp;院：</span>{data.corpName}</p>
            <p><span className="black-list-item-name">科&nbsp;&nbsp;室：</span>{data.deptName}</p>
            <p><span className="black-list-item-name">医&nbsp;&nbsp;生：</span>{data.doctName}</p>
            <p>
              <span className="black-list-item-name">时&nbsp;&nbsp;间：</span>{data.medDate}({this.getWeekDay(data.medDate)})
              {data.medAmPm == 1 ? '  上午' : '  下午'}
              {data.startTime}~{data.endTime}
            </p>
          </div>
        </a>
      </li>
    )
  }

  handleMoreItems (index) {
    const {data} = this.state
    data[index].isMore = data[index].isMore == undefined ? false : !data[index].isMore
    this.setState({
      data
    })
  }

  renderBlock(data, i) {
    const showMoreDom = data.blacks.length > 3
    , isMore = data.isMore === undefined ? showMoreDom : data.isMore
    , blacks = (showMoreDom && isMore) ? data.blacks.slice(0,3) : data.blacks
    
    if (data.num > 0) {
      return (
        <div key={i}>
          <div className="black-list-head">
            <span className="black-list-name">就诊人：{data.name}</span>
            <span className="black-list-times">共爽约{data.num}次{data.blackFlag && "，进入黑名单"}</span>
          </div>
          {data.blackFlag ?
            <div className="black-list-date">黑名单时期：{data.blackStartTime} 至 {data.blackEndTime}</div> : null}
          <ul className="black-list">
            {blacks.map((item, i) => this.renderItem(item, i))}
          </ul>
          { showMoreDom ? <div onClick={this.handleMoreItems.bind(this,i)} className="black-list-more">{ isMore ? '查看更多' : '点击收起' }</div> : null }
          <div className=" g-space"> </div>
        </div>
      );
    }
    return null;
  }

  render() {
    const {data, warning} = this.state;
    let flag = false;
    data.forEach((z) => {
      if (z.num > 0) {
        flag = true;
      }
    });

    if (data && data.length > 0 && flag) {
      return (
        <div>
          {
            warning ?
            <div className="noticebar">
              <span className="noticebar-icon icon-warning"></span>
              <a href="./rule.html?target=_blank#blackRule" className="black-list-top noticebar-txt">
                您有就诊人三个月内爽约累计三次进入黑名单，查看规则。
              </a>
              <span onClick={()=>{ this.setState({ warning: false }) } } className="noticebar-icon icon-h-close"></span>
            </div> : null
          }
          {
              data.map((z, i) => this.renderBlock(z, i))
          }
        </div>
      );
    }
    return <div style={{overflow: 'hidden'}}>
      <div className="notice">
        <span className="notice-icon icon-black-list"></span>
        <p>当前无爽约记录</p>
      </div>
    </div>
  }
}
