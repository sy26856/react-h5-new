'use strict'

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import TopMessage from './component/TopTips/TopMessage'
import {SmartNoBlockComponent, SmartBlockComponent} from './BaseComponent/index'

import './report.less'

class Content extends SmartNoBlockComponent {
  constructor(props) {
    super(props)
    let query = util.query()
    this.unionId = query.unionId || '';
    this.corpId = query.corpId || '';
    //是否带标题
    this.title = query.title || '';
    this.modifyTab = props.modifyTab
    this.reqCount = 0;
    this.tabIndex = props.tabIndex

    if (!util.isLogin()) {
      //util.goLogin()
    }

    if(this.unionId == 29){
         location.replace(util.flatStr('./report-29.html?',{
         ...query
       }))
     }
  }

  componentDidMount() {
    this.sendReq(this.tabIndex)
  }

  sendReq(tabIndex) {
    // 判断当前的tab来选择是加载检查报告单数据还是影像报告单数据
    this.reqCount++;
    if (!tabIndex) {
      if (this.title === 'none') {
        UserCenter.getPatientInspect(this.unionId, this.corpId).subscribe(this).fetch()
      } else {
        UserCenter.getInspect(this.unionId, this.corpId).subscribe(this).fetch()
      }
    } else {
      if (this.title === 'none') {
        UserCenter.getPatientPacs(this.unionId, this.corpId).subscribe(this).fetch()
      } else {
        UserCenter.getPacs(this.unionId, this.corpId).subscribe(this).fetch()
      }
    }
  }

  componentWillReceiveProps(props) {
    if (props.tabIndex != this.props.tabIndex) {
      this.tabIndex = props.tabIndex
      this.sendReq(props.tabIndex)
    }
  }

  onSuccess(result) {
    if (this.reqCount === 1) {
      this.modifyTab()
    }
    let title = '', data = result.data;
    if (this.title !== 'none') {
      title = result.data.title;
      data = result.data.list;
    }
    this.setState({
      loading: false,
      success: true,
      title,
      data: data.map((item) => {
        return {
          checkUpDate: item.checkUpDate || item.reportDate,
          corpId: item.corpId,
          patientName: item.patientName,
          repId: item.repId,
          inspectTypeName: item.inspectTypeName || item.checkItem,
          checkNo: item.checkNo,
          status: item.status,
          statusDes: item.statusDes,
          read: item.read
        }
      })
    })
  }

  sort(data) {
    var reportList = data;
    var reportMap = {}

    reportList.map((item) => {
      // 兼容检验报告和影像报告两种格式
      var checkUpDate = item.checkUpDate || item.reportDate
      var date = new Date(checkUpDate)
      var month = date.getMonth() + 1

      if (!reportMap[month]) {
        reportMap[month] = {
          checkUpDate: checkUpDate,
          date: checkUpDate ? util.dateFormat(date, "yyyy年MM月") : "无日期",
          checkItems: []
        }
      }

      reportMap[month].checkItems.push(
        util.vis({
          checkUpDate: checkUpDate,
          corpId: item.corpId,
          inspectTypeName: item.inspectTypeName || item.checkItem,
          patientName: item.patientName || "",
          read: item.read !== false,
          status: item.status,
          statusDes: item.statusDes,
          repId: item.repId,// 检查报告单
          checkNo: item.checkNo// 影响报告单
        })
      )

    })

    reportList = util.forEach(
      reportMap, (item, key) => {
        return item
      }).sort((a, b) => {
      return b.checkUpDate - a.checkUpDate
    })

    return reportList;
  }

  renderTitle() {
    const {title} = this.state;
    if (this.title === "none") {
      return null;
    }
    return title ? <div className="report-list-title">{this.state.title}</div> : null
  }

  notRead() {
    return (
      <div className="not-read"></div>
    );
  }

  reportStatus(item) {
    const statusColor = {
      "0": "#fd8f01",
      "1": "#fd8f01",
      "2": "#999",
      "3": "#999"
    }
    return (
      <div style={{color: statusColor[item.status]}} className="list-extra">{item.statusDes}</div>
    );
  }

  toReport(item) {
    let report = './report-detail.html?'
    window.location.href = `${report}${util.flat({
      corpId: item.corpId,
      unionId: this.unionId,
      repId: item.repId,
      checkNo: item.checkNo,
      target: "_blank"
    })}`;
  }

  render() {
    let {data, title} = this.state
    let finalData = this.sort(data)
    if (finalData.length === 0) {
      return <div>
        {this.renderTitle()}
        <div className="notice">
          <span className="notice-icon icon-record"></span>
          <p>没有查询到报告单</p>
        </div>
      </div>
    }
    return (
      <div>
        {this.renderTitle()}
        {
          finalData.map((item, index) => {
            return <div key={index} className="every-month">
              <div className="month-title">
                {item.date}
              </div>
              <div>
                {
                  item.checkItems.map((item, index) => {
                    return <div key={index} className="panel" style={{marginBottom: '10px'}} onClick={() => this.toReport(item)}>
                      <div className="list-ord">
                        <div className="list-item list-nowrap">
                          <img
                            src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/4609b4b8db490d84f4ba44add3547681-84-84.png"
                            className="list-icon"
                          />
                          <div className="list-content">
                            <div className="list-title txt-nowrap">{item.inspectTypeName}</div>
                            <div className="list-brief">就诊人: {item.patientName}</div>
                          </div>
                          <div className="list-extra">{this.reportStatus(item)}</div>
                          {item.read ? null : this.notRead()}
                        </div>
                      </div>
                      <ul className="list-ord">
                        <li className="list-item list-nowrap">
                          <a className="txt-arrowlink list-link-wrapper">
                            <div className="list-content">
                              <div className="list-brief">{item.checkUpDate ? util.dateFormat(new Date(item.checkUpDate), "yyyy-MM-dd hh:mm:ss") : '无日期'}</div>
                            </div>
                            <div className="list-extra ">查看详情</div>
                          </a>
                        </li>
                      </ul>
                    </div>
                  })
                }
              </div>
            </div>
          })
        }
      </div>
    )
  }
}

export default class Report extends React.Component {
  constructor(props) {
    super(props)

    const query = util.query();
    this.unionId = query.unionId || '';

    this.isShowPromptMsg = specialConfig.hideReportPromptMsg.unionIds.indexOf( this.unionId ) == -1
    this.isShowPromptMsgNoClick = specialConfig.showReportPromptMsgNoClick.unionIds.indexOf( this.unionId ) != -1
    if ( this.isShowPromptMsgNoClick ) {
      this.showPromptMsgNoClickTxt = specialConfig.showReportPromptMsgNoClick.msgUnionIds[ this.unionId ]
    }

    this.state = {
      tabIndex: this.getTabIndex(),
      dataHaved: false
    }
  }

  getTabIndex() {
    var a
    try {
      a = +localStorage.getItem('tabIndex') // 前面用加号来将取出来的字符串转换成数字
    } catch (e) {
      console.log(e)
      a = 0;
    }
    return a ? a : 0; // 如果a是0，那么为否，返回值依旧是0。如果a是1，那么为真，返回值是a的原值
  }

  checkReport(event) {
    try {
      localStorage.setItem('tabIndex', '0')
    } catch (e) {
      console.log(e)
    }
    this.setState({
      tabIndex: 0
    })
  }

  imageReport(event) {
    try {
      localStorage.setItem('tabIndex', '1')
    } catch (e) {
      console.log(e)
    }
    this.setState({
      tabIndex: 1
    })
  }

  modifyTab() {
    setTimeout(() => {
      this.setState({
        dataHaved: true
      })
    }, 50)
  }

  toBind() {
    const urlInfo = {
      target: '_blank',
      unionId: this.unionId,
    };
    window.location.href = `./patient-list.html?${util.flat(urlInfo)}`;
  }

  render() {
    let {tabIndex, dataHaved} = this.state

    return (
      <div>
        {/* 头部tab导航 */}
        <div className="tab-nav">
          <div className="tab-nav-in">
            <ul>
              <li className={tabIndex === 0 ? "on" : ""}><a onClick={this.checkReport.bind(this)}>检验报告</a></li>
              <li className={tabIndex === 1 ? "on" : ""}><a onClick={this.imageReport.bind(this)}>影像报告</a></li>
            </ul>
            {/* 导航滚动条 */}
            <div className={`nav-roll-bar tab-index-${
              dataHaved ? tabIndex : ""
              }`}></div>
          </div>
        </div>
        {/* 头部tab导航 END */}
        <div className="content">
          { this.isShowPromptMsgNoClick ? <TopMessage text={ this.showPromptMsgNoClickTxt } /> : null}
          { this.isShowPromptMsg ? <TopMessage onClick={() => this.toBind()} text="不显示未绑卡就诊人报告单，前往绑卡"/> : null}
          <Content tabIndex={tabIndex} modifyTab={() => this.modifyTab()}/>
        </div>
      </div>
    )
  }
}