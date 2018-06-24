'use strict'

import React from 'react'
import util from './lib/util'
import {SmartBlockComponent} from './BaseComponent'
import UserCenter from './module/UserCenter'
import config from './config'
import cache from './lib/cache'

import './inhos-daily-list.less'

export default class InhosDailyList extends SmartBlockComponent {
  constructor(props) {
    super(props)
    let query = util.query()
    var inhosPatientInfo = cache.get("inhosPatientInfo");
    try {
      inhosPatientInfo = JSON.parse(inhosPatientInfo)
    } catch (e) {
      console.log(e)
      inhosPatientInfo = {}
    }

    this.state = {
      unionId: query.unionId,
      corpId: query.corpId,
      patientId: query.patientId,
      patientName: query.patientName,
      patientHosId: query.patientHosId,
      isInYuantuApp: util.isInYuantuApp(),
      H5_DOMAIN: config.H5_DOMAIN,
      protocol: config.PROTOCOL,
      inhosPatientInfo: inhosPatientInfo,
      pageSize: 100,
      pageNum: 1,
      success: "step1",
    }
  }


  componentDidMount() {
    var {unionId, corpId, patientId, pageSize, pageNum} = this.state;
    UserCenter.getInhosBillList(unionId, corpId, patientId, pageSize, pageNum)
      .subscribe(this)
      .fetch()
  }

  onSuccess(result) {
    this.setState({
      loading: false,
      success: true,
      dailyList: result.data.items || []
    })

  }

  onError(result) {
    if (result.startTime) {
      this.onComplete();
      this.setState({
        success: true,
        dailyList: []
      });
    } else {
      super.onError(result)
    }

  }


  render() {
    let {unionId, corpId, patientId, patientName, patientHosId, inhosPatientInfo, dailyList} = this.state;
    // TODO idNo需要用从选择就诊人穿过来的idNo做非空处理
    let {name, idNo} = inhosPatientInfo || {};
    let inhosItem = inhosPatientInfo[patientHosId];
    let {createDate, status, corpName, deptName, area, bedNo, cost} = inhosItem || {};

    var list = null;
    var lineSpan = <div className="line-span">
      <div className="ui-border line"></div>
      <div className="line-info">日清单列表</div>
    </div>;
    if (dailyList) {
      list = dailyList.map((item, i) => {
        let href = util.flatStr("inhos-daily-detail.html?", {
          date: item.tradeTime,
          corpId: corpId,
          unionId: unionId,
          patientId: patientId,
          patientName: patientName,
          patientHosId: patientHosId,
          target: "_blank"
        })
        return <a className="daily-item ui-border-tb ui-arrowlink" href={href} key={i}>
          每日清单
          <em className="date-em">{item.tradeTime}</em>
          <em className="daily-cost">{util.moneyFormat(item.cost)}元</em>
        </a>
      })
    }
    if (list && list.length == 0) {
      list = <div className="notice m-t-50">
        <span className="notice-icon icon-record"/>
        <p>暂无日清单</p>
      </div>
    }
    bedNo = (bedNo && bedNo != "null") ? bedNo : "";

    return <div>
      <div className="inpatient ui-border-b">
        <div className="inpatient-icon"></div>
        <div className="inpatient-info">
          <div className="inpatient-name">
            <em >{name}</em>
          </div>
          <div className="inpatient-idNo">{ idNo || "****"}</div>
        </div>
      </div>
      <div className="hospitalize-item ui-border-tb">
        <div className="hospitalize-title panel">
          <div className="row panel-title">
            <em className="col-black"> 入院日期:&nbsp;</em >
            <em className="col-black"> {createDate}</em>
            <em className="hospitalize-status">{status || ""}</em>
          </div>
          <ul className="list-ord">
            <div className="row">
              <em className="column">医院名称:</em>
              <em className="col-black">{corpName || ""}</em>
            </div>
            <div className="row">
              <em className="column">科室:</em>
              <em className="col-black">{deptName || ""}</em>
            </div>
            <div className="row">
              <em className="column">住院号: </em>
              <em className="col-black">{patientHosId || ""}</em>
            </div>
            <div className="row">
              <em className="column">病区: </em>
              <em className="col-black">{area || ""}</em>
            </div>
            <div className="row">
              <em className="column">床位: </em>
              <em className="col-black">{bedNo || ""}</em>
            </div>
            <div className="row">
              <em className="column">费用合计: </em>
              <em className="cost-sum">{util.moneyFormat(cost || "0")}元</em>
            </div>
          </ul>
        </div>
      </div>
      {list ? lineSpan : null}
      <div className="daily-list">
        {list}
      </div>
    </div>
  }
}