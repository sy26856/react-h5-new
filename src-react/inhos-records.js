'use strict'

import React from 'react'
import util from './lib/util'
import {SmartBlockComponent} from './BaseComponent'
import UserCenter from './module/UserCenter'
import config from './config'
import cache from './lib/cache'
import JSBridge from './lib/JSBridge'
import Alert from './component/alert/alert'

import './inhos-records.less'

export default class InhosRecords extends SmartBlockComponent {
  constructor(props) {
    super(props)
    let query = util.query()

    this.state = {
      unionId: query.unionId,
      corpId: query.corpId,
      id: query.id,
      isInYuantuApp: util.isInYuantuApp(),
      H5_DOMAIN: config.H5_DOMAIN,
      protocol: config.PROTOCOL,
      patientId: -1,
      inhosPatientInfo:{}
    }
    this.regEvents()
  }

  componentDidMount() {
    UserCenter.getPatientList(this.state.corpId)
      .subscribe(this)
      .fetch()
  }

  regEvents() {
    //选择就诊人回调函数
    var self = this;
    JSBridge.on("0", (result) => {
      if (result && result.ret == "SUCCESS") {
        var resultData = JSON.parse(result.data);
        var data = {
          patientId: resultData.patientId,
          patientName: resultData.patientName,
          patientIdNo: resultData.patientIdNo,
        };
        if (resultData.patientId != self.state.patientId) {
          data.inhosPatientInfo = {}
        }
        self.setState(data);
        self.getInhosPatientInfo(data)
      }
    });
  }

  onSuccess(result) {


    var defaultIndex = 0;
    var patientId = cache.get("patientId") || -1;
    var patientName = cache.get("patientName");
    var patientIdNo = cache.get("patientIdNo") || "****";

    var patientList = result.data || [];
    var data = {
      loading: false,
      success: true,
      time: util.dateFormat(result.data.gmtCreate, "yyyy-MM-dd hh:mm"),
    };
    for (var i = 0; i < patientList.length; i++) {
      if (patientId == patientList[i].id) {
        data.patientId = patientList[i].id;
        data.patientName = patientList[i].patientName;
        data.patientIdNo = (patientList[i].idType == 1 ? patientList[i].idNo : patientList[i].guarderIdNo) || patientIdNo;
        break;
      }
      if (patientList[i].default) {
        defaultIndex = i
      }
    }

    if (!data.patientId && patientList.length > 0) {
      data.patientId = patientList[defaultIndex].id;
      data.patientName = patientList[defaultIndex].patientName;
      data.patientIdNo = (patientList[defaultIndex].idType == 1 ? patientList[defaultIndex].idNo : patientList[defaultIndex].guarderIdNo);
    }

    this.setState(data)
    if (data.patientId) {
      this.getInhosPatientInfo(data)
    }

  }

  getInhosPatientInfo(data) {
    var {unionId, corpId} = this.state;
    var self = this;
    this.onSendBefore();
    UserCenter.getInhosPatientInfo(unionId, corpId, data.patientId)
      .subscribe({
        onSuccess(result){
          self.onComplete();
          var inhosPatientInfo = result.data;
          self.setState({
            inhosPatientInfo: inhosPatientInfo
          })
          if (inhosPatientInfo && inhosPatientInfo.items && inhosPatientInfo.items.length > 0) {
            inhosPatientInfo.items.map(item => {
              inhosPatientInfo[item.patientHosId] = item;
            })
          }
          if (inhosPatientInfo && !inhosPatientInfo.idNo) {
            inhosPatientInfo.idNo = cache.get("patientIdNo") || "****";
          }
          cache.set("inhosPatientInfo", JSON.stringify(result.data));
        },
        onError(result){
          self.onComplete();
          Alert.show(result.msg, 1000);
        }
      })
      .fetch()
  }

  render() {
    let {unionId, corpId, patientId, patientIdNo, patientName, inhosPatientInfo, loading} = this.state;

    var record = null;
    patientIdNo = inhosPatientInfo.idNo || patientIdNo;

    if (inhosPatientInfo && inhosPatientInfo.items && inhosPatientInfo.items.length > 0) {
      var recordList = [];
      inhosPatientInfo.items.forEach((item, i) => {
        let href = util.flatStr("./inhos-daily-list.html?", {
          unionId: unionId,
          corpId: item.corpId,
          patientHosId: item.patientHosId,
          patientId: patientId,
          patientName: patientName,
          target: "_blank",
        })
        recordList.push(
          <a className="hospitalize-item ui-border-tb" href={href} key={i}>
            <div className="hospitalize-body ">
              <div className="hospital-name">{item.corpName}</div>
              <div className="hospital-dept">{item.deptName}
                { item.cost != -1 ? <span>费用合计: <em>¥{util.moneyFormat(item.cost)}</em></span> : null }
              </div>
            </div>
            {/*<div className="ui-border-t" style="height: 1px"></div>*/}
            <div className="hospitalize-title">入院日期:{item.createDate}</div>
            <div>住院号: {item.patientHosId} <em className="hospitalize-status">{item.status}</em></div>
          </a>
        )
        record = [
          <p className="txt-line-wrapper" key="1">
            <span className="txt-line line-info">住院记录列表</span>
          </p>,
          <div className="hospitalize-list" key="2">
            {recordList}
          </div>
        ]
      })
    } else if (!loading) {
      record = <div className="notice m-t-200">
        <span className="notice-icon icon-record"/>
        <p>没有住院记录</p>
      </div>
    }


    var context = <div>
      <div className="ui-border inpatient">
        <div className="inpatient-icon"></div>
        <div className="inpatient-info">
          <div className="inpatient-name">
            <em id="inpatient-name">{patientName}</em>
            <a className="inpatient-choice"
               href={`./patient-list.html?corpId=${corpId}&unionId=${this.state.unionId}&selectView=1&referrer=${encodeURIComponent(location.href)}&saveKey=zhuyuan-cache&target=_blank`}>切换就诊人</a>
          </div>
          <div className="inpatient-idNo">{patientIdNo}</div>
        </div>
      </div>
      {record}
    </div>

    if (patientId == -1) {
      context = <div className="no-patient">
        <div className="alert-span ui-border">
          <p className="p1">尚未选择就诊人</p>
          <p className="p2">请在选择就诊人之后查看相关信息</p>
        </div>
        <a className="ui-btn-lg ui-btn-primary"
           href={`patient-list.html?selectView=1&unionId=${this.state.unionId}&saveKey=zhuyuan-cache&target=_blank`}>选择就诊人</a>
      </div>
    }

    return context
  }
}
