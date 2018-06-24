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
      loading: false
      ,success: true
      ,data: CacheSession.get('blackDetail')
    }
  }

  componentDidMount() {
    
  }

  getWeekDay(date) {
    const list = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    const tempDate = new Date(date);
    return list[tempDate.getDay()];
  }

  toFeedBack(data) { // 我要申述
    const urlInfo = {
      id: data.id,
      target: '_blank',
      unionId: this.unionId
    };
    window.location.href = `./feedback.html?${util.flat(urlInfo)}`;
  }

  toFeedBackDetail(data) { //反馈记录
    const urlInfo = {
      target: '_blank',
      blackId: data.id,
      unionId: this.unionId
    };
    window.location.href = `./feedback-detail.html?${util.flat(urlInfo)}`;
  }

  render() {
    const {data} = this.state
    
    return <div>
      <div className="black-detail-header">
        <div className="list-content">
          <div className="list-title">爽约</div>
          <div className="list-brief ">您未在约定时间前取号，已记录该就诊人爽约。</div>
        </div>
      </div>
      <div className=" g-space"> </div>
      <div className="black-detail-wrapped">
        <div className="black-list-title">预约信息</div>
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
      </div>
      <div className=" g-space"> </div>
      <div>
        <div className="black-detail-name" style={{color:'#76ACF8',paddingLeft: '15px'}}>爽约申诉规则</div>
        <div className="black-list-main" style={{paddingTop: '4px'}}>
          { data.complainStatus == 2 ? 
          <p>您可点击下方【查看客服反馈】查看客服回复情况。患者因个人原因未按时取号，此类申诉可能无法通过。</p> :
          <p>患者因个人原因未按时取号，申诉可能无法通过；其它非个人原因造成的爽约，可在下方点击【我要申诉】进行申诉。</p>
          }
        </div>
      </div>
      <div className="black-detail-footer">
        <div className="btn-wrapper">
          { data.complainStatus == 2 ? 
          <a onClick={()=>{this.toFeedBackDetail(data)}} className="btn btn-secondary btn-block">查看客服反馈</a> :
          <a onClick={()=>{this.toFeedBack(data)}} className="btn btn-secondary btn-block">我要申诉</a>
          }
        </div>
      </div>
    </div>
  }
}