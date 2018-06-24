"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent} from './BaseComponent/index'
import './patient-list.less'
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import Alert from './component/alert/alert'
import cache from './lib/cache'
import hybridAPI from './lib/hybridAPI'
import backRefresh from './hoc/backRefresh'


//病人列表
//@backRefresh
export default class PatientList extends SmartBlockComponent {
  constructor(props) {
    super(props);
    this.patientTypeTips = {
      "1": "点击就诊人管理就诊人信息和就诊卡",
      "2": "当前页面仅显示成人就诊人",
      "3": "当前页面仅显示0-7岁儿童就诊人"
    };
    this.patientTypeText = {
      "1": "",
      "2": "成人",
      "3": "儿童"
    };
    this.query = util.query();
    console.log('URL参数',this.query)
    let param = util.flat(this.query)
    this.corpId = this.query.corpId;
    this.unionId = this.query.unionId;
    if (this.unionId == 29){
      window.location.href = "./patient-list-29.html?"+ param
    }
    if (this.unionId == 60){
      window.location.href = "./patient-list-60.html?"+ param
    }
    this.selectView = this.query.selectView;
    this.referrer = this.query.referrer;
    this.saveKey = this.query.saveKey;//缓存的保存位置，默认会保存到 yuantu-cache
    this.patientType = this.query.patientType || 1; //1全部  2成人  3儿童
    this.countPatient = 0;
    this.lastSelectPatientId = this.query.lastSelectPatientId || '';
    this.state = {
      lastSelectPatientId: this.lastSelectPatientId
    }
  }

  componentDidMount() {
    if (!util.isLogin()) {
      util.goLogin();
    } else {
      let webViewLifeCycle = new WebViewLifeCycle();
      //通过history.back回来需要重新加载list
      webViewLifeCycle.onActivation = () => {
        console.log("onActivation");
        this.initData();
      }
      this.initData();
    }
  }


  initData() {
    UserCenter.getPatientList(this.corpId, this.unionId, this.patientType)
      .subscribe(this)
      .fetch()
  }

  onSuccess(result) {
    let data = result.data;
    console.log(data)
    this.setState({
      success: true,
      loading: false,
      patientList: data || [],
    })
  }

  lastSelect(lastSelectPatientId, selectView) {
    if (selectView) {
      this.setState({
        lastSelectPatientId,
      });
      //发送请求修改默认就诊人
    }
  }

  bindCardNum(item) {
    if (this.selectView == 1 && item.cardCount < 1) {
      return null;
    }
    if (this.unionId == 29) {
      return null;
    }
    if (item.cardCount > 0) {
      return (
        <div className="list-brief">已绑定 {item.cardCount} 张就诊卡</div>
      );
    }
    return <div className="txt-prompt list-brief">尚未绑定就诊卡，点击就诊人进行绑卡操作</div>
  }

  getPatientList() {
    let patientList = this.state.patientList;
    let list = patientList.map((item, key) => {
        let {id, idNo, idType, patientName, guarderIdNo} = item || {};
        const listItemStyle = {
          margin: "10px",
          padding: "12px 10px",
          border: this.state.lastSelectPatientId == id ? "1px solid #76acf8" : "1px solid #ddd",
          borderRadius: "4px",
          backgroundColor: '#fff',
          overflow: 'hidden'
        };

        let href = "add-patient.html?target=_blank&id=" + item.id;
        href = this.unionId ? (href + "&unionId=" + this.unionId) : href;
        href = this.corpId ? (href + "&corpId=" + this.corpId) : href;
        const imgUrl = idType == 2 ? "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/f67f01446d90cf0613feee5389c44b36-68-68.png"
          : "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/7fee31b86360d5ee6b19c10b4dae22c2-68-68.png"
        const hideIdNo = idNo && `${idNo.slice(0, 3)}***********${idNo.slice(14)}`;
        const hideGuarderIdNo = guarderIdNo && `${guarderIdNo.slice(0, 3)}***********${guarderIdNo.slice(14)}`;

        return (
          <li className="list-item" style={listItemStyle} key={key}
              onClick={() => this.lastSelect(id, this.selectView)}>
            <a href={href} data-patientid={id} data-patientIdNo={idNo ? "_" + idNo : "_" + guarderIdNo}
               data-patientname={patientName} onClick={(e) => {
              this.select(e, item)
            }} className={`${this.selectView ? '' : 'txt-arrowlink'} list-link-wrapper`}>
              <img style={{width: '34px', height: '34px'}} src={imgUrl} className="list-icon"/>
              <div className="list-content">
                <div className="list-title">
                  {patientName}
                  <span className="patient-type-label">{idType == 2 ? '儿童' : '成人'}</span>
                </div>
                <div className="list-brief">{idNo ? "身份证号:" + hideIdNo : "监护人身份证:" + hideGuarderIdNo}</div>
                {this.unionId != 29 && this.bindCardNum(item)}
              </div>
              {this.selectView ?
                (
                  this.state.lastSelectPatientId == id ?
                    <img
                      className="patient-select"
                      src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/4796db90d6dfe217fc7a1aeaafa824aa-36-36.png"/>
                    : <div className="patient-no-select"></div>
                )
                : null}
            </a>
            {item.default ? <div className="default-patient-icon"></div> : null}
          </li>
        )
      }) || [];

    return (
      <div id="J_PatientList">
        <ul className="list-ord" style={{border: "none", backgroundColor: '#f8f8f8'}}>
          {list}
        </ul>
        <div className="ui-tips center">{this.patientTypeTips[this.patientType]}</div>
      </div>
    )
  }

  addPatient(e) {
    let patientList = this.state.patientList || [];
    if (patientList.length >= 5) {
      e.preventDefault();
      Alert.show("最多添加5位就诊人");
    }
  }

  select(e, patientInfo) {
    if (this.selectView) {
      e.preventDefault();
      var patientId = patientInfo.id;
      var patientName = patientInfo.patientName;
      var patientIdNo = patientInfo.idNo || "";
      //处理有0开头的身份证
      if (patientIdNo.indexOf("_") > -1) {
        patientIdNo = patientIdNo.replace("_", "");
      }
      cache.set("patientId", patientId);
      cache.set("patientName", patientName);
      cache.set("needDefault", false);
      cache.set("patientIdNo", patientIdNo);
      if (util.isInYuantuApp()) {
        //如果是 远图 app 就把值通过 jsbrige返回到上一个界面

        hybridAPI.pushDataToParent(true, JSON.stringify({
          patientId: patientId,
          patientName: patientName,
          patientIdNo: patientIdNo,
          origin: "patient-list"
        }))
      } else {
        if (this.referrer) {
          //如果当前页面没有登录，这里 referrer 会是登录页面
          //safari浏览器back回去上一个页面不会刷新 12.19
          window.location.replace(this.referrer)
        } else {
          window.history.back(-1);
        }
      }
    }
  }

  render() {
    let href = "add-patient.html?target=_blank";
    href = this.unionId ? (href + "&unionId=" + this.unionId) : href;
    href = this.corpId ? (href + "&corpId=" + this.corpId) : href;
    const {patientList} = this.state;
    if (patientList.length > 0) {
      return (
        <div>
          <div className="page-patient-list">
            <div className="ui-tips  center">
              最多添加 5 位就诊人，您还可以添加 {5 - patientList.length >=0 ? 5 - patientList.length : 0} 位
            </div>
            {this.getPatientList()}
          </div>
          {
            patientList.length < 5 ? <div className="btn-wrapper">
                <a href={href} className="btn btn-secondary btn-block" onClick={(e) => this.addPatient(e)}>
                  <span className="add-patient-btn-icon">+</span>添加就诊人
                </a>
              </div> : null
          }
        </div>
      );
    }

    return (
      <div style={{overflow: 'hidden'}}>
        <div className="notice">
          <span className="notice-icon notice-no-patient"/>
          <p style={{marginBottom: '10px'}}>尚未添加就诊人</p>
          <a href={href} className="btn" onClick={(e) => this.addPatient(e)}>添加就诊人</a>
        </div>
      </div>
    );
  }

}