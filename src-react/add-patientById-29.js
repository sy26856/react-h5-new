"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import { SmartBlockComponent } from './BaseComponent/index'
import { BlockLoading } from './component/loading/index'
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import Alert from './component/alert/alert'
import cache from './lib/cache'
import hybridAPI from './lib/hybridAPI'
import './add-patientById-29.less'
import Confirm from './component/confirm/Confirm2'
import PatientCard from './component/patientCard'
import { setTimeout } from 'core-js/library/web/timers';

export default class AddPatient extends SmartBlockComponent {
  constructor(props) {
    super(props);
    this.query = util.query();
    let date = new Date(); //初始化出生日期为今天
    this.state = {
      year:date.getFullYear(),
      month:date.getMonth() + 1,
      day:date.getDate(),
      isChild:false,
      sex:1,
      idNo:'',
      guarderIdNo:'',
      isDefault:false,
      idType:1,
      patientName:'',
      mobile:'',
      btnStyle:false
    }
    this.selectView = this.query.selectView;
  }

  componentDidMount() {
    if (!util.isLogin()) {
      util.goLogin();
    }else {
    this.setState({
      success: true,
      loading: false,
      readOnly: false
    });
    }
  }

  setTips() {
    let { idType } = this.state;
    if (idType === 2) {
      //儿童
      return (
        <div className="panel-msg patient-notice-msg" style={{borderTop:'none',paddingTop:'0',color:'#999'}}>
          <p>1.为方便儿童就诊，保持病例信息系统统一且完整，优先使用儿童个人身份证号码添加就诊人；儿童无身份证号码时才可添加儿童就诊人;</p>
          <p>2.在线预约挂号实行实名制，请准确填写身份信息，否则无法正常取号;</p>
          <p>3.无就诊卡用户首次预约后需先到医院自助机建档;</p>
        </div>
      )
    } else if (idType === 1) {
      //成人
      return (
        <div className="panel-msg patient-notice-msg" style={{borderTop:'none',color:'#999',paddingTop:'0'}}>
          <p>1.在线预约挂号实行实名制，请准确填写身份信息，否则无法正常取号;</p>
          <p>2.无就诊卡用户首次预约后需先到医院自助机建档;</p>
          <p>3.儿童若未办理身份证，可在户口本上查看身份证号，若都无可点击 <span onClick={this.handleAddChild.bind(this)} className="dianji"> 添加儿童就诊人</span></p>
        </div>
      )
    }
  }

  handleAddChild() {
    this.setState({
      idType: 2,
      patientName:'',
      idNo:'',
      mobile:'',
      btnStyle:false,
    })
    //切换置空
    this.refs.patientName.value = ''
    this.refs.idNo.value = ''
    this.refs.mobile.value = ''
  }

  getBirthday() {
    let { year, month, day } = this.state;
    let yearList = [], monthList = [], dayList = [];
    let nowYear = (new Date()).getFullYear();
    if (nowYear - 17 > year) {
      yearList.push(<option value={year} key={year}></option>)
    }
    for (let i = 0; i < 18; i++) {
      yearList.push(<option value={nowYear - i} key={i}>{nowYear - i}</option>);
    }
    for (let i = 1; i < 13; i++) {
      monthList.push(<option value={i} key={i}> {i < 10 ? "0" + i : i}</option>);
    }
    let now = new Date(year, month, 0)
    for (let i = 1; i <= now.getDate(); i++) {
      dayList.push(<option value={i} key={i}>{i < 10 ? "0" + i : i}</option>);
    }
    return (
      <div className="ui-form-item ui-border-b" id="J_Date">
        <label >出生日期</label>
        <div className="ui-select-group" style={{display:'flex',justifyContent:'flex-end',marginRight:'20px'}}> 
          <div className="ui-select" style={{marginRight:'0',display:'flex'}}>
            <select id="J_Year" value={year} onChange={this.formOnChange.bind(this, "year")} ref="year" style={{paddingRight:'0',direction:'ltr'}}>
              {yearList}
            </select>
            <span>-</span>
          </div>
          <div className="ui-select" style={{marginRight:'0',display:'flex'}}>
            <select id="J_Month" value={month} onChange={this.formOnChange.bind(this, "month")} ref="month" style={{paddingRight:'0',direction:'ltr'}}>
              {monthList}
            </select>
            <span>-</span>
          </div>
          <div className="ui-select" style={{marginRight:'0'}}>
            <select id="J_Day" value={day} onChange={this.formOnChange.bind(this, "day")} ref="day" style={{paddingRight:'0',direction:'ltr'}}>
              {dayList}
            </select>
          </div>
          <span className="arrow"></span>
        </div>
      </div>
    )
  }

  formOnChange(type, idTypeNum) {
    var self = this;
    let { birthday, guarderIdNo,idNo, idType, patientName, mobile, sex, isDefault, year, month, day } = this.state;
    let data = {
      guarderIdNo,idNo, idType, patientName, mobile, sex, isDefault, birthday
    }
    switch (type) {
      case 'idType':
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
      case 'mobile':
        mobile = this.refs[type].value;
        break;
      case 'isDefault':
        self.setState({
          display: true,
          title: !isDefault ? "是否将此人设为默认就诊人？" : "是否取消默认就诊人",
          des: true,
          confirmCallback: function (confirm) {
            if (confirm) {
              self.setState({
                display: false,
                isDefault:!isDefault
              })
              if (self.id) {
                UserCenter.updatePatient(self.corpId, self.unionId, data)
                  .subscribe({
                    onSuccess(result){
                      Alert.show("修改成功",1000);
                    },
                    onError(){   
                      Alert.show("修改失败",1000);
                    }
                  }).fetch()
              }
            } else {
              self.setState({
                display: false,
                isDefault: isDefault
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
      birthday, guarderIdNo,idNo, idType, patientName, mobile, sex, isDefault, year, month, day
    },function(){
      if(this.state.idType==1){
        const adult = [patientName,idNo,mobile];
        const result = adult.some(function(v){
            return v == ''
        })
        if(result){
          this.setState({
            btnStyle:false
          })
        }else{
          this.setState({
            btnStyle:true
          })
        }
      }else if(this.state.idType==2){
        const child = [patientName,guarderIdNo,mobile,sex,year,month,day]
        const result = child.some(function(v){
          return v == ''
        })
        if(result){
          this.setState({
            btnStyle:false
          })
        }else{
          this.setState({
            btnStyle:true
          })
        }
      }
    })
    
  }

  checkData(data) {
    let { guarderIdNo,idNo, idType, patientName, mobile, sex, isDefault, birthday } = data;
    patientName = patientName || "";
    if (!(patientName.length > 1) || (!/^[\ a-zA-Z\u4e00-\u9fa5•·.]+$/.test(patientName))) {
      Alert.show("请正确填写患者姓名",1000);
      return false;
    }

    if (!mobile || !/^\d{11}$/.test(mobile)) {
      Alert.show("请正确填写手机号码",1000);
      return false;
    }

    if (!(/^\d{17}[\d\x]?/.test(idNo)) && idType == "1") {
      Alert.show("请正确填写身份证号码",1000);
      return false;
    }
    if (idType == 2 && (!/^\d{4}-\d{2}-\d{2}$/.test(birthday))) {
      Alert.show("请正确填写儿童出生日期",1000);
      return false;
    }
    if (idType == "2") { 
      if (!/^\d{17}[\d\x]?/.test(guarderIdNo)) {
        Alert.show("请正确填写监护人身份证号码",1000);
        return false;
      }
    }

    return true;
  }

  submit() {
    let _this = this;
    let { guarderIdNo,idNo, idType,patientName, mobile, sex, isDefault, birthday, cardType} = this.state;
    patientName = patientName ? patientName.trim() : '';
    let data = {
     idType, patientName, mobile,isDefault
    }
    if(idType == 2){//儿童多传
      data.guarderIdNo = guarderIdNo;
      data.sex = sex;
      data.birthday = birthday;
    }else{
      data.idNo = idNo
    }
    data.target = '_blank';
    data.unionId = _this.query.unionId
    data.selectView = _this.query.selectView
    let param = util.flat(data)
    if (_this.checkData(data)){
      const _idNo = data.idType == 1 ? data.idNo:data.guarderIdNo;//_idNo为了避免重复命名报错
      UserCenter.getCardUserCards(_idNo,data.patientName,data.idType).subscribe({
        onSendBefore() {
          BlockLoading.show("请稍后...");
        },
        onComplete() {
          BlockLoading.hide();
        },
        onSuccess(result) {
          if (result.data.length > 0) {
            //跳转到绑卡页面绑卡
            window.location.href = "./add-patientByIdBindCard-29.html?" + param
          }
        },
        onError(result) {
          if(result.resultCode == 1000){//没有建档
            _this.subpatient(data)
          }
        }
      }).fetch()

    }
  }

  subpatient(data) {
    let _this = this;
    UserCenter.updatePatient("", _this.query.unionId, data)
      .subscribe({
        onSendBefore() {
          BlockLoading.show("查询中...");
        },
        onComplete() {
          BlockLoading.hide();
        },
        onSuccess(result) {
          if (result.resultCode == 100 ) {
            Alert.show('添加成功',1000)
            setTimeout(function(){
              window.location.href = "./patient-list-29.html?unionId=" + _this.query.unionId + '&target=' + '_blank'
            },1000)
          }
        },
        onError(result) {
          Alert.show(result.msg,1000);
        }
      }).fetch();
  }

  render() {
    let { readOnly, birthday,cardInfoReady,cancelText, okText, confirmCallback, display, title, des, guarderIdNo,idNo, idType, patientName, mobile, sex, isDefault, year, month, day } = this.state;
    return (
      <div className="page-add-patient" id="add-patientById-29">
        <div className="ui-form">
          <div className="ui-form-item ui-form-item-show  ui-border-b">
            <label >{idType == 1?'姓名':'儿童姓名'}</label>
            <input type="text" id="patientName" maxLength="20"
              className={readOnly ? "txt-info" : null} readOnly={readOnly}
              onChange={this.formOnChange.bind(this, "patientName")} ref="patientName" placeholder="请填写姓名" />
          </div>

          {idType == 1 ?
            <div className="ui-form-item ui-form-item-show ui-border-b" id="J_idNo">
              <label >身份证号</label>
              <input type="text" onChange={this.formOnChange.bind(this, "idNo")}
                ref="idNo"
                className={readOnly ? "txt-info" : null} readOnly={readOnly} id="idNo" maxLength="25"
                placeholder="请准确填写18位身份证号" />
            </div> : null}
          {idType == 2 ?
            <div className="ui-form-item ui-border-b" id="sex" style={{position:'relative'}}>
              <label>儿童性别</label>
              <div className="ui-select">
                <select id="J_Sex" value={sex || 1} onChange={this.formOnChange.bind(this, "sex")} ref="sex">
                  <option value="1">男</option>
                  <option value="2">女</option>
                </select>
              </div>
              <span className="arrow"></span>
            </div> : null
          }
          {idType == 2 ?
            this.getBirthday() : null
          }
          {idType == 2 ?
            <div className="ui-form-item ui-form-item-show ui-border-b" id="J_GuarderIdNoInput">
              <label>监护人身份证</label>
              <input type="text" id="guarderIdNo" readOnly={readOnly} className={readOnly ? "txt-info" : null}
                maxLength="25" placeholder="请输入监护人身份证号码"
                onChange={this.formOnChange.bind(this, "guarderIdNo")} ref="guarderIdNo" />
            </div> : null
          }
          <div className="ui-form-item ui-form-item-show ui-border-b">
            <label >手机号码</label>
            <input type="number" id="J_Phone" placeholder="填写接收信息的手机号码"
              onChange={this.formOnChange.bind(this, "mobile")} ref="mobile" />
          </div>
          <div className="ui-form-item ui-form-item-switch ui-border-b">
            <p className="checkbox-name">
              设为默认就诊人
            </p>
            <label className="ui-switch">
              <input type="checkbox" onChange={this.formOnChange.bind(this, "isDefault")}
                ref="isDefault" checked={isDefault} id="J_Default" />
            </label>
          </div>
        </div>
        <div className="panel g-space notice-top" id="J_BindCardTip">
          <div className="panel-title" style={{color:'#333'}}>温馨提示</div>
          {this.setTips()}
        </div>
        <div className="fixed-foot-wrapper">
          <div className="btn-wrapper g-footer">
            <button onClick={this.state.btnStyle&&this.submit.bind(this)}  className={"btn btn-lg "+(this.state.btnStyle?'':' btn_disabled')} id="J_SubmintBtn" >
              下一步
              </button>
          </div>
          <Confirm title={title} des={des} cancelText={cancelText} okText={okText} display={display}
                 callback={confirmCallback}/>
        </div>
      </div>
    )
  }
}
