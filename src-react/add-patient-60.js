"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import { SmartBlockComponent } from './BaseComponent/index'
import Alert from './component/alert/alert'
import './add-patient-60.less'
import Confirm2 from './component/confirm/Confirm2'
import Picker from './component/Picker/picker'
import pull from './images/panyu/pull.png'
import hybridAPI from './lib/hybridAPI'

let type = {
  '1':'身份证',
  '3':'护照',
  '5':'港澳居民来往内地通行证',
  '7':'台湾居民来往大陆通行证',
}

export default class AddPatient extends SmartBlockComponent {
  constructor(props) {
    super(props);
    this.query = util.query();
    this.unionId = this.query.unionId
    this.corpId = this.query.corpId
    
    let date = new Date(); //初始化出生日期为今天
    this.state = {
      year:date.getFullYear(),
      month:date.getMonth() + 1,
      day:date.getDate(),
      sex:1,//默认  男
      idNo:'',
      guarderIdNo:'',
      isDefault:false,
      idType:1,//默认 成人 身份证
      patientName:'',
      phoneNum:'',
      btnStyle:false,
      show:false
    }
    this.selectView = this.query.selectView;
  }

  select(){
    this.setState({
      show:true,
    },()=>{
      if(util.isInYuantuApp()){
        hybridAPI.interceptRefreshLayout(true)
    }
      this.showPicker()
    })
}

  onCancel(){
    this.setState({
      show:false,
    },()=>{
      if(util.isInYuantuApp()){
          hybridAPI.interceptRefreshLayout(false)
      }
      this.hidePicker()
    })
  }

  //确认选择
  onConfirm(date){
    console.log(date)
    let idType;
    for(let key in type){
      if(date.first == type[key]){
        idType=key
      }
    }
      this.setState({
        show:false,
        idType,
    },()=>{
        if(util.isInYuantuApp()){
          hybridAPI.interceptRefreshLayout(false)
        }
        this.hidePicker()
      })
  }

  showPicker(){
    this.scrollTop = document.scrollingElement.scrollTop;//记录弹窗弹起瞬间document.body滚动条位置
    document.body.style.position = 'fixed';//解决穿透问题
    document.body.style.width = '100%'; //防止document脱离标准流 子元素没有宽度参考而样式错乱
    document.body.style.top = -this.scrollTop + 'px';

  }

  hidePicker() {
    document.body.style.position = 'static';//还原到标准流中
    document.scrollingElement.scrollTop = this.scrollTop;//还原位置到弹窗前滚动条停留的位置
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
          <p>1.如果儿童是使用监护人身份证办理民生卡，添加就诊人请选择“儿童”类型</p>
          <p>2.如果儿童是使用儿童本人身份证办理民生卡，添加就诊人请选择“成年人”类型</p>
          <p>3.添加“儿童”类型就诊人后预约，取号时需使用此处填写的监护人身份证号和儿童姓名相匹配的就诊卡取号，否则无法取号</p>
          <p>4.请先办理番禺民生卡，并在添加就诊人后绑定卡片，才能挂号</p>
        </div>
      )
    } else if (idType === 1) {
      //成人
      return (
        <div className="panel-msg patient-notice-msg" style={{borderTop:'none',color:'#999',paddingTop:'0'}}>
          <p>1.添加就诊人后预约，取号时需使用与此处填写的就诊人身份证号和姓名相匹配的就诊卡，否则无法取号</p>
          <p>2.无身份证儿童请先办理番禺民生卡，并通过<span onClick={this.handleAdd.bind(this,2)} className="dianji">添加儿童就诊人</span>后绑定卡片，才能挂号</p>        </div>
      )
    }
  }

  handleAdd(idType) {
    this.setState({
      idType,
      patientName:'',
      idNo:'',
      phoneNum:'',
      btnStyle:false,
    })
    //切换置空
    this.refs.patientName.value = ''
    this.refs.idNo.value = ''
    this.refs.phoneNum.value = ''
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
    let { birthday, guarderIdNo,idNo, idType, patientName, phoneNum, sex, isDefault, year, month, day } = this.state;
    let data = {
      guarderIdNo,idNo, idType, patientName, phoneNum, sex, isDefault, birthday
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
      case 'phoneNum':
        phoneNum = this.refs[type].value;
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
      birthday, guarderIdNo,idNo, idType, patientName, phoneNum, sex, isDefault, year, month, day
    },()=>{
      if(this.state.idType==1){
        const adult = [patientName,idNo,phoneNum];
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
        const child = [patientName,guarderIdNo,phoneNum,sex,year,month,day]
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
      }else if(this.state.idType!=1&&this.state.idType!=2){
        const child = [patientName,idNo,phoneNum,sex,year,month,day]
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
    let { guarderIdNo,idNo, idType, patientName, phoneNum, sex, isDefault, birthday } = data;
    patientName = patientName || "";
    if (!(patientName.length > 1) || (!/^[\ a-zA-Z\u4e00-\u9fa5•·.]+$/.test(patientName))) {
      Alert.show("请正确填写患者姓名",1000);
      return false;
    }

    if (!phoneNum || !/^\d{11}$/.test(phoneNum)) {
      Alert.show("请正确填写手机号码",1000);
      return false;
    }
    
    if(idType == 1){
      if(idNo.length!=18){
        Alert.show("请正确填写身份证号码",1000);
        return false;
      }
    }
   
    if (idType == 2 && (!/^\d{4}-\d{2}-\d{2}$/.test(birthday))) {
      Alert.show("请正确填写儿童出生日期",1000);
      return false;
    }
    if (idType == "2") { 
      if(guarderIdNo.length!=18){
        Alert.show("请正确填写监护人身份证号码",1000);
        return false;
      }
    }

    return true;
  }

  submit() {
    let _this = this
    let {guarderIdNo,idNo, idType, cardInfo, patientName,phoneNum, sex, isDefault, birthday, cardType} = this.state;
    patientName = patientName ? patientName.trim() : '';
    let data = {
         idType, patientName, phoneNum,isDefault
        }
        if(idType != 1){//儿童多传
          if(idType==2){
            data.guarderIdNo = guarderIdNo;
          }else{
            data.idNo = idNo
          }
          data.sex = sex;
          data.birthday = birthday;
        }else if(idType == 1){
          data.idNo = idNo
        }

    if (this.checkData(data)) {
      console.log(11111)
      UserCenter.updatePatient(this.corpId, this.unionId, data)
        .subscribe({
          onSendBefore() {
            _this.setState({
              btnStyle:false
            });
          },
          onSuccess:result=>{
            if (result.success && result.data) {
                this.setState({
                  display: true,
                  title: "就诊人绑定"+ "成功，是否立即绑定就诊卡",
                  des: "绑定就诊卡可以方便各项医院内服务",
                  cancelText: "暂不绑卡",
                  okText: "绑定就诊卡",
                  disabled: false,
                  confirmCallback: confirm=>{
                    if (confirm) {
                      location.replace("./bind-card.html?" + util.flat({
                          corpId: this.corpId,
                          unionId: this.unionId,
                          patientId: result.data,
                          cardType,
                          idType,
                          target: "_blank"
                        })
                      );
                    } else {
                      util.goBack(true);
                    }
                  }
                })
            }
          },
          onError:result=>{
            this.setState({
              btnStyle:true
            })
              Alert.show(result.msg);
          }
        })
        .fetch()
    }
  }

  render() {
    let { readOnly,show, birthday,cardInfoReady,cancelText, okText, confirmCallback, display, title, des, guarderIdNo,idNo, idType, patientName, phoneNum, sex, isDefault, year, month, day } = this.state;
    return (
      <div className="page-add-patient" id="add-patientById-60">
        <div className="ui-form">
          <div className="ui-form-item ui-form-item-show  ui-border-b">
            <label >{idType == 2?'儿童姓名':'姓名'}</label>
            <input type="text" id="patientName" maxLength="20"
              className={readOnly ? "txt-info" : null} readOnly={readOnly}
              onChange={this.formOnChange.bind(this, "patientName")} ref="patientName" placeholder="请填写姓名" />
          </div>
          {idType != 2 ?
            <div className="ui-form-item ui-form-item-show ui-border-b" id="J_idNo">
              <label onClick={()=>this.select()} style={{overflow:'hidden',whiteSpace:'nowrap'}}>{type[idType]}<img src={pull} style={{width:'10px',height:'100%',verticalAlign:'middle',marginLeft:'5px'}}/></label>
              <input type="text" onChange={this.formOnChange.bind(this, "idNo")}
                ref="idNo"
                className={readOnly ? "txt-info" : null} readOnly={readOnly} id="idNo" maxLength="25"
                placeholder="请准确填写证件号" />
            </div> : null}
          {idType != 1 ?
            <div className="ui-form-item ui-border-b" id="sex" style={{position:'relative'}}>
              <label>{idType==2?'儿童性别':'性别'}</label>
              <div className="ui-select">
                <select id="J_Sex" value={sex || 1} onChange={this.formOnChange.bind(this, "sex")} ref="sex">
                  <option value="1">男</option>
                  <option value="2">女</option>
                </select>
              </div>
              <span className="arrow"></span>
            </div> : null
          }
          {idType != 1 ?
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
              onChange={this.formOnChange.bind(this, "phoneNum")} ref="phoneNum" />
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
          <Confirm2 title={title} des={des} cancelText={cancelText} okText={okText} display={display}
                 callback={confirmCallback}/>
          <Picker
          listData={[
            '身份证',
            '护照',
            '港澳居民来往内地通行证',
            '台湾居民来往大陆通行证',
          ]}
          isShow={show}
          onCancel={this.onCancel.bind(this)}
          onConfirm={this.onConfirm.bind(this)}/>
        </div>
      </div>
    )
  }

}
