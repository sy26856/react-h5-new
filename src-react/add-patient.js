"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent} from './BaseComponent/index'
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import Alert from './component/alert/alert'
import cache from './lib/cache'
import hybridAPI from './lib/hybridAPI'
import './add-patient.less'
import Confirm from './component/confirm/Confirm2'
import PatientCard from './component/patientCard/index'


export default class AddPatient extends SmartBlockComponent {
  constructor(props) {
    super(props);
    this.query = util.query();
    this.corpId = this.query.corpId;
    this.unionId = this.query.unionId;
    this.state.show = false;
    this.state.cardInfoReady = false;
    this.id = this.query.id;
    this.state.idType = 1;//默认为成人
    this.bindBack = this.query.bindBack || '';
    let date = new Date(); //初始化出生日期为今天
    this.state.year = date.getFullYear();
    this.state.month = date.getMonth() + 1;
    this.state.day = date.getDate();
    this.state.cardReady = false;
    this.state.disabled = false;
    this.state.showId = this.id ? false : true;
   
  }

  componentDidMount() {
    if (!util.isLogin()) {
      util.goLogin();
    } else if (this.id) {
      this.initData();
      this.setState({
        readOnly: true
      });
    } else {
      this.setState({
        success: true,
        loading: false,
        readOnly: false
      });
    }
    this.isNeedCard();
  }

  initData() {
    var self = this;
    UserCenter.getBaseInfo(this.corpId, this.unionId, this.id)
      .subscribe(this)
      .fetch()
    // 根据unionid或者corpId判断是否要绑卡

    /*UserCenter.getCardList(this.corpId, this.unionId, this.id).subscribe({
     onSuccess(result){
     self.setState({
     cardInfo: result.data || {},
     cardInfoReady: true
     })
     },
     onError(result){
     console.log(result)
     self.setState({
     cardInfoReady: true
     })
     }
     }).fetch();*/
    UserCenter.getNoBalanceList(this.id, true, 1, this.corpId,this.unionId).subscribe({
      onComplete() {
        self.setState({
          cardReady: true
        });
      },
      onSuccess(result){
        self.setState({
          cardInfo: result.data || [],
          cardInfoReady: true
        })
      },
      onError(result){
        console.log(result)
        self.setState({
          cardInfoReady: true
        })
      }
    }).fetch();
  }

  isNeedCard() {
    var self = this;
    UserCenter.isNeedCard(this.corpId, this.unionId).subscribe({
      onSuccess(result){
        if (result.success && result.data) {
          let data = result.data || {};
          self.setState({
            ...data
          })
        }
      },
      onError(result){
        console.log(result)
      }
    }).fetch()
  }

  onSuccess(result) {
    let data = result.data || {};
    let year, month, day, birthday;
    if (data.birthday) {
      let date = new Date(data.birthday);
      year = date.getFullYear();
      month = date.getMonth() + 1;
      day = date.getDate();
      birthday = util.dateFormat(date, "yyyy-MM-dd");
    }
    this.setState({
      success: true,
      loading: false,
      birthday: birthday,
      idNo: data.idNo,
      guarderIdNo: data.guarderIdNo,
      id: data.id,
      idType: data.idType,
      patientName: data.patientName,
      phoneNum: data.phoneNum,
      sex: data.sex,
      isDefault: data.default,
      year,
      month,
      day
    })
  }

  setTips() {
    let {idType} = this.state;
    if (this.unionId == 60) {
      if (idType == 2) {
        //广州儿童
        return (
          <div className="panel-msg patient-notice-msg">
            <p>1.如果儿童是使用监护人身份证办理民生卡，添加就诊人请选择“儿童”类型；</p>
            <p>2.如果儿童是使用儿童本人身份证办理民生卡，添加就诊人请选择“成年人”类型；</p>
            <p>3.添加“儿童”类型就诊人后预约，取号时需使用此处填写的监护人身份证号和儿童姓名相匹配的就诊卡取号，否则无法取号；</p>
            <p>4.请先办理番禺民生卡，并在添加就诊人后绑定卡片，才能挂号。</p>
          </div>
        )
      } else {
        //广州成人
        return (
          <div className="panel-msg patient-notice-msg">
            <p>1.如果儿童是使用本人身份证办理民生卡，添加就诊人请选择“成年人”类型；</p>
            <p>2.添加就诊人后预约，取号时需使用与此处填写的就诊人身份证号和姓名相匹配的就诊卡，否则无法取号；</p>
            <p>3.无身份证儿童请先办理番禺民生卡，并在添加“儿童”类型就诊人后绑定卡片，才能挂号。</p>
          </div>
        )
      }
    } else {
      if (idType == 2) {
        //非广州儿童
        return (
          <div className="panel-msg patient-notice-msg">
            <p>1. 如果儿童已办理身份证，请选择“成人”类型添加就诊人，并在线下办卡时，凭借儿童本人身份证办理就诊卡；</p>
            <p>2.添加“儿童”类型就诊人需另外提供监护人身份信息。</p>
            <p>3.添加儿童就诊人后预约，取号时需使用此处填写的监护人身份证号和儿童姓名相匹配的就诊卡取号，否则无法取号；</p>
          </div>
        )
      } else {
        //非广州成人
        return (
          <div className="panel-msg patient-notice-msg">
            <p>1. 就诊人姓名、身份证号将用于医院建档信息匹配，请输入正确的就诊人姓名和身份证号；</p>
            <p>2.添加就诊人后预约，取号时需使用与此处填写的就诊人身份证号和姓名相匹配的就诊卡，否则无法取号；</p>
            <p>3.无身份证儿童请选择“儿童”类型添加就诊人。</p>
          </div>
        )
      }
    }
  }

  getBirthday() {
    let {year, month, day} = this.state;
    let yearList = [], monthList = [], dayList = [];
    let nowYear = (new Date()).getFullYear();
    if (nowYear - 17 > year) {
      yearList.push(<option value={year} key={year}></option>)
    }
    for (let i = 0; i < 18; i++) {
      yearList.push(<option value={nowYear - i} key={i}>{nowYear - i} </option>);
    }
    for (let i = 1; i < 13; i++) {
      monthList.push(<option value={i} key={i}> {i < 10 ? "0" + i : i} </option>);
    }
    let now = new Date(year, month, 0)
    for (let i = 1; i <= now.getDate(); i++) {
      dayList.push(<option value={i} key={i}>{i < 10 ? "0" + i : i}</option>);
    }
    return (
      <div className="ui-form-item ui-border-b" id="J_Date">
        <label >出生日期</label>
        <div className="ui-select-group">
          <div className="ui-select">
            <select id="J_Year" value={year} onChange={this.formOnChange.bind(this, "year")} ref="year">
              {yearList}
            </select>
          </div>
          <div className="ui-select">
            <select id="J_Month" value={month} onChange={this.formOnChange.bind(this, "month")} ref="month">
              {monthList}
            </select>
          </div>
          <div className="ui-select">
            <select id="J_Day" value={day} onChange={this.formOnChange.bind(this, "day")} ref="day">
              {dayList}
            </select>
          </div>
        </div>
      </div>
    )
  }

  formOnChange(type, idTypeNum) {
    var self = this;
    let {birthday, guarderIdNo, id, idNo, idType, patientName, phoneNum, sex, isDefault, year, month, day} = this.state;
    let data = {
      guarderIdNo, id, idNo, idType, patientName, phoneNum, sex, isDefault, birthday
    }
    switch (type) {
      case 'idType':
        //idType = this.refs[type].value;
        idType = idTypeNum;
        break;
      case 'guarderIdNo':
        guarderIdNo = this.refs[type].value;
        break;
      case 'idNo':
        idNo = this.refs[type].value;
        break;
      case 'patientName':
        patientName = this.refs[type].value;
        break;
      case 'sex':
        sex = this.refs[type].value;
        break;
      case 'phoneNum':
        phoneNum = this.refs[type].value;
        break;
      case 'isDefault':
        isDefault = this.refs[type].checked;
        data.isDefault = isDefault;
        this.setState({
          display: true,
          title: isDefault ? "是否将此人设为默认就诊人？" : "是否取消默认就诊人",
          des: true,
          confirmCallback: function (confirm) {
            if (confirm) {
              self.setState({
                display: false
              })
              if (self.id) {
                UserCenter.updatePatient(self.corpId, self.unionId, data)
                  .subscribe({
                    onSuccess(result){
                      Alert.show("修改成功");
                    },
                    onError(){
                      Alert.show("修改失败");
                    }
                  }).fetch()
              }
            } else {
              self.setState({
                display: false,
                isDefault: !isDefault
              })
            }
          }
        })
        break;
      case 'year':
        year = this.refs[type].value;
        break;
      case 'month':
        month = this.refs[type].value;
        day = 1;
        break;
      case 'day':
        day = this.refs[type].value;
        break;
      default:
        break;
    }
    if (year && month && day) {
      birthday = year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
    }
    this.setState({
      birthday, guarderIdNo, id, idNo, idType, patientName, phoneNum, sex, isDefault, year, month, day
    })
  }

  checkData(data) {
    let {guarderIdNo, id, idNo, idType, patientName, phoneNum, sex, isDefault, birthday} = data;
    patientName = patientName || "";
    if (!(patientName.length > 1) || (!/^[\ a-zA-Z\u4e00-\u9fa5•·.]+$/.test(patientName))) {
      Alert.show("请正确填写患者姓名");
      return false;
    }

    if (!phoneNum || !/^\d{11}$/.test(phoneNum)) {
      Alert.show("请正确填写手机号码");
      return false;
    }

    if (!(/^\d{17}[\d\x]?/.test(idNo)) && idType == "1") {
      Alert.show("请正确填写身份证号码");
      return false;
    }
    if (idType == 2 && (!/^\d{4}-\d{2}-\d{2}$/.test(birthday))) {
      Alert.show("请正确填写儿童出生日期");
      return false;
    }
    // console.log(/^\d{17}[\d\x]?/.test(data.guarderIdNo))
    if (idType == "2") { //&& data.guarderIdNo != ""
      if (!/^\d{17}[\d\x]?/.test(guarderIdNo)) {
        Alert.show("请正确填写监护人身份证号码");
        return false;
      }
    }

    return true;
  }

  submit() {
    let {guarderIdNo, id, idNo, idType, cardInfo, patientName, phoneNum, sex, isDefault, birthday, cardType, description, need} = this.state;
    patientName = patientName ? patientName.trim() : '';
    let data = {
      guarderIdNo, id, idNo, idType, patientName, phoneNum, sex, isDefault, birthday
    }
    
    data.idNo = data.idNo ? data.idNo.toUpperCase() : "";
    data.guarderIdNo = data.guarderIdNo ? data.guarderIdNo.toUpperCase() : "";
    cardInfo = cardInfo || [];
    let self = this;

    if ( idType == 1 ) {
      delete data.guarderIdNo
    } else {
      delete data.idNo
    }

    if (this.checkData(data)) {
      let type = data.id ? "修改" : "新增";
      UserCenter.updatePatient(this.corpId, this.unionId, data)
        .subscribe({
          onSendBefore() {
            self.setState({
              disabled: true,
            });
          },
          onSuccess(result){
            if (result.success && result.data) {
              let type = data.id ? "修改" : "新增";
              if (self.id) {
                util.goBack(true);
              } else if (need && cardInfo.length == 0) {
                self.setState({
                  display: true,
                  title: "就诊人" + type + "成功，是否立即绑定就诊卡",
                  des: "绑定就诊卡可以方便各项医院内服务",
                  cancelText: "暂不绑卡",
                  okText: "绑定就诊卡",
                  disabled: false,
                  confirmCallback: function (confirm) {
                    if (confirm) {
                      location.replace("./bind-card.html?" + util.flat({
                          corpId: self.corpId,
                          unionId: self.unionId,
                          patientId: result.data,
                          cardType,
                          description,
                          bindBack: 1,
                          target: "_blank"
                        })
                      );
                    } else {
                      util.goBack(true);
                    }
                  }
                })
              } else {
                self.setState({
                  disabled: false,
                });
                Alert.show(type + "成功");
                util.goBack(true);
              }
            }
          },
          onError(result){
            self.setState({
              disabled: false,
            });
            if (result.msg) {
              Alert.show(result.msg);
            } else {
              Alert.show("网络错误");
            }
            // console.log(result)
          }
        })
        .fetch()
    }
  }

  deletePatient() {
    var self = this;
    this.setState({
      display: true,
      title: "删除就诊人后，所有医疗服务数据也一并删除，确认要删除吗？",
      des: true,
      confirmCallback: function (confirm) {
        self.setState({
          display: false
        })
        if (confirm) {
          UserCenter.deletePatient(self.corpId, self.unionId, self.id)
            .subscribe({
              onSuccess(result){
                if (result.success) {
                  Alert.show("删除成功");
                  util.goBack(true);
                }
              },
              onError(result){
                Alert.show(result.msg || "网络请求出错");
                // console.log(result)
              }
            })
            .fetch()
        } else {

        }
      }
    })


  }


  selectPatient() {
    const {idType, readOnly} = this.state;
    const adultImg = idType == 1 ?
      "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/7fee31b86360d5ee6b19c10b4dae22c2-68-68.png"
      : "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/61dfbb94f0f5f337937cde067f33547f-68-68.png";
    const childImg = idType == 1 ? "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/07d61d77770f827864c17f9d3aa82ef2-68-68.png"
      : "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/f67f01446d90cf0613feee5389c44b36-68-68.png";

    const readOnlyImg = idType == 1 ? "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/61dfbb94f0f5f337937cde067f33547f-68-68.png"
      : "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/07d61d77770f827864c17f9d3aa82ef2-68-68.png"

    if (readOnly) {
      return (
        <div className="select-patient-type">
          <div className="select-patient-item">
            <img src={readOnlyImg}/>
            <div style={{marginLeft: '40px'}}>
              <div>{idType == 1 ? '成年人' : '儿童'}</div>
              <div>{idType == 1 ? '(本人身份证)' : '(监护人身份证)'}</div>
            </div>
            <div className="patient-select-icon"
                 style={{backgroundImage: 'url(https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/ea85a99901bc3f7490c98d3555aef2a0-56-56.png)'}}></div>
          </div>
        </div>
      );
    }
    return (
      <div className="select-patient-type">
        <div
          className="select-patient-item"
          style={idType == 1 ? {borderColor: '#76acf8', color: '#76acf8'} : {}}
          onClick={() => this.formOnChange('idType', 1)}
        >
          <img src={adultImg}/>
          <div style={{marginLeft: '40px'}}>
            <div>成年人</div>
            <div>(本人身份证)</div>
          </div>
          {idType == 1 && <div className="patient-select-icon"></div>}
        </div>
        <div
          className="select-patient-item"
          style={idType == 2 ? {borderColor: '#76acf8', color: '#76acf8'} : {}}
          onClick={() => this.formOnChange('idType', 2)}
        >
          <img src={childImg}/>
          <div style={{marginLeft: '40px'}}>
            <div>儿童</div>
            <div>(监护人身份证)</div>
          </div>
          {idType == 2 && <div className="patient-select-icon"></div>}
        </div>
      </div>
    )
  }

  showIdToggle = () => {
    this.setState({
      showId: !this.state.showId,
    });
  };

  cardLoading() {
    return <div className="card-loading">
      加载中...<span></span>
    </div>
  }

  render() {
    let {readOnly, birthday, showId, cardInfo, disabled, cardInfoReady, need, cardType, description, cancelText, okText, confirmCallback, display, title, des, guarderIdNo, id, idNo, idType, patientName, phoneNum, sex, isDefault, year, month, day} = this.state;

    const hideIdNo = idNo && `${idNo.slice(0, 3)}***********${idNo.slice(14)}`;
    const hideGuarderIdNo = guarderIdNo && `${guarderIdNo.slice(0, 3)}***********${guarderIdNo.slice(14)}`;

    return (
      <div className="page-add-patient">
        <div className="add-patient-label">选择就诊人类型</div>
        {this.selectPatient()}
        <div className="add-patient-label" style={{paddingTop: '15px'}}>填写就诊人信息</div>

        <div className="ui-form">

          {/*<div className="ui-form-item ui-form-item-show ui-border-tb">
           <label>类型:</label>
           <div className="ui-select">
           <select id="idType" disabled={readOnly} className={readOnly ? "txt-info" : null} value={idType}
           onChange={this.formOnChange.bind(this, "idType")} ref="idType">
           <option value="1">成年人(本人身份证)</option>
           <option value="2">儿童(监护人身份证)</option>
           </select>
           </div>
           </div>*/}

          <div className="ui-form-item ui-form-item-show  ui-border-b">
            <label >姓名:</label>
            <input type="text" id="patientName" maxLength="20" value={patientName}
                   className={readOnly ? "txt-info" : null} readOnly={readOnly}
                   onChange={this.formOnChange.bind(this, "patientName")} ref="patientName" placeholder="请输入就诊人姓名"/>
          </div>


          <div className="ui-form-item ui-form-item-show ui-border-b">
            <label >就诊人手机:</label>
            <input type="number" value={phoneNum} id="J_Phone" placeholder="就诊人手机号码"
                   onChange={this.formOnChange.bind(this, "phoneNum")} ref="phoneNum"/>
          </div>
          {idType == 2 ?
            <div className="ui-form-item ui-border-b" id="sex">
              <label>性别：</label>
              <div className="ui-select">
                <select id="J_Sex" value={sex || 1} onChange={this.formOnChange.bind(this, "sex")} ref="sex">
                  <option value="1">男</option>
                  <option value="2">女</option>
                </select>
              </div>
            </div> : null
          }
          {idType == 2 ?
            this.getBirthday() : null
          }

          {idType == 1 ?
            <div className="ui-form-item ui-form-item-show ui-border-b" id="J_idNo">
              <label >{idType == 1 ? '身份证:' : '儿童身份证'}</label>
              <input type="text" value={showId ? idNo : hideIdNo} onChange={this.formOnChange.bind(this, "idNo")}
                     ref="idNo"
                     className={readOnly ? "txt-info" : null} readOnly={readOnly} id="idNo" maxLength="25"
                     placeholder="请输入证件号码"/>
              {this.id && <img
                src={showId ? "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/e6877f285003690384c51c37bbe79e80-40-28.png"
                  : "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/cf281f2a20afa4b0f224a308ba643e2a-40-24.png"}
                className="id-toggle" data-spm="see" onClick={this.showIdToggle}/>}
            </div> : null}
          {idType == 2 ?
            <div className="ui-form-item ui-form-item-show ui-border-b" id="J_GuarderIdNoInput">
              <label >监护人证件:</label>
              <input type="text" id="guarderIdNo" readOnly={readOnly} className={readOnly ? "txt-info" : null}
                     maxLength="25" placeholder="请输入监护人身份证号码"
                     value={showId ? guarderIdNo : hideGuarderIdNo}
                     onChange={this.formOnChange.bind(this, "guarderIdNo")} ref="guarderIdNo"/>
              {this.id && <img
                src={showId ? "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/e6877f285003690384c51c37bbe79e80-40-28.png"
                  : "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/cf281f2a20afa4b0f224a308ba643e2a-40-24.png"}
                className="id-toggle" data-spm="see" onClick={this.showIdToggle}/>}
            </div> : null
          }
          <div className="ui-form-item ui-form-item-switch ui-border-b">
            <p className="checkbox-name">
              设为默认就诊人
            </p>
            <label className="ui-switch">
              <input type="checkbox" checked={isDefault} onChange={this.formOnChange.bind(this, "isDefault")}
                     ref="isDefault" id="J_Default"/>
            </label>
          </div>


        </div>
        {this.id ?
          this.state.cardReady ?
            <PatientCard cardType={cardType} cardInfo={cardInfo} description={description} patientId={id}
                         unionId={this.unionId} corpId={this.corpId} need={need} bindBack={this.bindBack}/> : this.cardLoading()
          : null
        }
        <div className="panel g-space notice-top" id="J_BindCardTip">
          <div className="panel-title">温馨提示：</div>
          {this.setTips()}
        </div>


        {this.id ?
          <div className="fixed-foot-wrapper">
            <div className="btn-wrapper g-footer">
              <button className="btn btn-secondary btn-lg" id="J_DeleteBtn" onClick={this.deletePatient.bind(this)}>
                删除就诊人
              </button>
              <button className="btn btn-lg" id="J_SubmintBtn" onClick={this.submit.bind(this)}>
                确认编辑
              </button>
            </div>
          </div> :
          <div className="fixed-foot-wrapper">
            <div className="btn-wrapper g-footer">
              <button disabled={disabled} className="btn btn-lg" id="J_SubmintBtn" onClick={this.submit.bind(this)}>
                确认
              </button>
            </div>
          </div>
        }
        <Confirm title={title} des={des} cancelText={cancelText} okText={okText} display={display}
                 callback={confirmCallback}/>
      </div>
    )
  }
}