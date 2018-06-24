'use strict'

import React from 'react'
import util from './lib/util'
import {SmartBlockComponent} from './BaseComponent'
import UserCenter from './module/UserCenter'
import config from './config'
import cache from './lib/cache'

import './inhos-daily-detail.less'

export default class InhosDailyDetail extends SmartBlockComponent {
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
      date: query.date,
      patientId: query.patientId,
      patientName: query.patientName,
      patientHosId: query.patientHosId,
      dailyCost: "0.00",
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
    var {unionId, corpId, date, patientId} = this.state;

    UserCenter.getInhosBillDetail(unionId, corpId, patientId, date)
      .subscribe(this)
      .fetch()
  }

  onSuccess(result) {
    console.log(result)

    this.setState({
      loading: false,
      success: true,
      detailList: result.data.items || [],
      dailyCost: util.moneyFormat(result.data.dailyCost || 0)
    })

  }

  onError(result) {
    if (result.startTime){
      this.onComplete();
      this.setState({
        success: true,
        detailList: []
      });
    } else {
      super.onError(result)
    }

  }

  render() {
    let {unionId, corpId, patientId, patientName, date, patientHosId, inhosPatientInfo, detailList, dailyCost} = this.state;
    // TODO idNo需要用从选择就诊人穿过来的idNo做非空处理
    let {name, idNo} = inhosPatientInfo || {};
    let inhosItem = inhosPatientInfo[patientHosId];
    let {corpName} = inhosItem || {};
    var detailTable = null;
    if (detailList && detailList.length > 0) {
      var list = detailList.map((item, i) => {
        return <tr key={i}>
          <td className="warp">{item.itemName}</td>
          <td className="item-right">{util.moneyFormat(item.itemPrice, 4)}</td>
          <td className="item-right">{item.itemQty}{item.itemUnits}</td>
          <td className="item-right">{util.moneyFormat(item.cost)}</td>
        </tr>
      })
      if (list.length > 0) {
        detailTable = [
          <div className="line-span" key="1">
            <div className="ui-border line"></div>
            <div className="line-info">日清单明细</div>
          </div>,
          <div className="table-wrapper" key="2">
            <div className="detail-date ui-border-t">
              {date}
            </div>
            <table className="table ui-table">
              <thead>
              <tr className="txt-justify">
                <th >名称</th>
                <th >单价</th>
                <th >数量</th>
                <th >金额</th>
              </tr>
              </thead>
              <tbody>
              {list}
              </tbody>
            </table>
            <div className="m-b-30"></div>
            <div className="cost-span ui-border-tb position-fix">
              <div className="daily-cost">合计:<em>{dailyCost}元</em></div>
            </div>
          </div>]
      } else {
        detailTable = <div className="notice m-t-50">
          <span className="notice-icon icon-record"/>
          <p>暂无日清单明细</p>
        </div>
      }
    }

    return <div>
      <div className="inpatient ui-border-b">
        <div className="inpatient-icon"></div>
        <div className="inpatient-info">
          <div className="inpatient-name">
            <em >{name}</em>
          </div>
          <div className="inpatient-idNo">{idNo}</div>
        </div>
      </div>
      <div className="hospitalize-item ui-border-tb">
        <em className="hos-name">{corpName}</em>住院号: <em className="hos-no">{patientHosId}</em>
      </div>
      {detailTable}
    </div>
  }
}
