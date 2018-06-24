"use strict";

import './feedback-query.less'
import React from 'react'
import util from './lib/util'
import Ticket from './module/Ticket'
import Alert from './component/alert/alert'
import {SmartBlockComponent, SmartNoBlockComponent} from './BaseComponent/index'


export default class FeedbackQuery extends SmartNoBlockComponent {
  constructor(props) {
    super(props);

    this.pageSize = 30;
    this.pageNum = 1;
    const query = util.query();
    this.unionId = query.unionId || '';
    this.status = {
      0: '尚未受理',
      1: '待您回复',
      2: '客服处理中',
      3: '待确认',
      4: '已关闭'
    }
    this.textColor = {
      0: 'txt-weak',
      1: 'txt-prompt',
      2: '',
      3: '',
      4: 'txt-weak'
    }
  }

  // timer = null;
  async componentDidMount() {
    try {
      let userInfo = await Ticket.getUserInfo().fetch()
      if (userInfo.code == 100) {
        util.goLogin()
      }
    } catch (e) {
      Alert.show(e.msg || "获取用户信息失败");
    }

    Ticket.getTicketList()
      .subscribe(this) //自动处理load状态
      .fetch();
    // window.addEventListener('scroll', this.handleScroll)
  }

  onError(result) {
    if (result.code == 100) {
      util.goLogin();
    } else {
      super.onError();
    }
  }

  onSuccess(result) {
    //   return
    let data = result.data;

    this.setState(
      {
        loading: false,
        success: true,
        ticketList: data.ticketList,
        totalPage: data.totalPage
      })
  }

  toDetail(data) {
    const urlInfo = {
      ticketId: data.ticketId || '',
      target: '_blank',
      unionId: this.unionId
    };
    window.location.href = `./feedback-detail.html?${util.flat(urlInfo)}`;
  }

  render() {
    let ticketList = this.state.ticketList || [];
    console.log(ticketList);
    return (
      <div className='feedback-query'>
        {
          !ticketList.length ?
            <div className="notice">
              <span className="notice-icon icon-no-msg"></span>
              <p>点击 <a className="txt-prompt">提交反馈</a></p>
              <p>客服将在第一时间为你解答</p>
            </div>
            :
            <div className='ticket-list'>
              {
                ticketList.map((item, index) =>
                  <div onClick={() => this.toDetail(item)} key={index} className="card card-full g-space">
                    <div className="card-header card-nowrap">
                      <div className="card-content">
                        <div
                          className="card-title txt-nowrap">{(item.extend && item.extend.split('@')[0]) || item.product}</div>
                      </div>
                      <div className={"card-extra " + this.textColor[item.status]}>{this.status[item.status]}</div>
                    </div>
                    <div className="card-body ">
                      <div className="card-brief txt-overflow-two">{item.description}</div>
                    </div>
                    <div className="card-footer">
                      <div className="card-brief">{util.dateFormat(item.createTime, 'yyyy-MM-dd hh:mm:ss')}</div>
                      <div className="card-extra">
                        <a style={{color: '#999'}}>查看详情</a>
                        <span className='icon-right'></span>
                      </div>
                    </div>
                  </div>
                )
              }
            </div>
        }
        <div className="fixed-foot-wrapper">
          <div className="btn-wrapper g-footer">
            <a className="btn btn-block" href={`./feedback.html?target=_blank&unionId=${this.unionId}`}>提交反馈信息</a>
          </div>
        </div>
      </div>
    )
  }
}
