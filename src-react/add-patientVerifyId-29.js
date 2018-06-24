"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent} from './BaseComponent/index'
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import Alert from './component/alert/alert'
import cache from './lib/cache'
import hybridAPI from './lib/hybridAPI'
import './add-patientVerifyId-29.less'
import Confirm from './component/confirm/Confirm2'
import PatientCard from './component/patientCard'
import { Title } from "./add-patientByCard-29";

export default class AddPatientVerify extends React.Component {
  constructor(props) {
    super(props);
    this.query = util.query();
    this.state={
      unionId: this.query.unionId,
      step:2 ,// 头部绑卡状态
      cardType:this.query.cardType,
      VerifyValue:'',
      idNo:this.query.idNo ? this.query.idNo:null,
      guarderIdNo:this.query.guarderIdNo ? this.query.guarderIdNo:null,
      phoneNum: this.query.mobile || "" ,
      cardNo: this.query.cardNo || "" , //卡面号
      patientName: this.query.patientName,
      VerifyType:this.query.cardType == 1 ? 2 : 1 , //2:验证身份证;1:验证手机号
      btnStyle:false,//下一步按钮样式标识 false表示不可点击,是灰色; true表示可以点击,背景不是灰色
      value: this.query.value
    } ;
    this.VerifyTypeArr = ["身份证号" , "手机号"]
  }

  componentDidMount() {}

  handleChangeType(e){
    let VerifyType = e.target.value
    this.setState({
        VerifyType:VerifyType
    })
  }

  handelChangeValue(e){
    let cardValue = e.target.value;
    this.setState({
      VerifyValue: cardValue,
    },function(){
      if(cardValue!=''){
        this.setState({
          btnStyle:true
        })
      }else{
        this.setState({
          btnStyle:false
        })
      }
    })
    if(this.state.VerifyType == 2 ){
      //比较身份证后6位
      if(cardValue.length == 6 ){
       
      }
    }else if (this.state.VerifyType == 1 ){
      //比较手机后4位
      if(cardValue.length == 4 ){
       
      }
    }
  }

  sub(){
    let { patientName, VerifyType, cardType, cardNo, unionId, VerifyValue }=this.state;
    let _this=this;
    UserCenter.validateByCard(unionId, this.state.value, cardType, patientName, VerifyValue, VerifyType).subscribe({
      onSuccess(result){
        let param = util.flat({
          ..._this.query,
        })
        let valueIdNo = result.data.idNo ? result.data.idNo : ''
        let valueGuarderIdNo = result.data.guarderIdNo ? result.data.guarderIdNo : ''
        window.location.href = "./add-patientConfirm-29.html?valueIdNo=" + valueIdNo + "&valueGuarderIdNo=" + valueGuarderIdNo + "&valuePhone=" + result.data.phoneNum + "&" + param
      },
      onError(){
        Alert.show("号码不匹配,请核对正确", 1000);
        return false;
      }
    }).fetch()
  }
  
  render() {
    let hidePhoneNum= this.state.phoneNum||'';
    console.log(hidePhoneNum)
    let _idNo;
    _idNo = this.state.guarderIdNo ? this.state.guarderIdNo:this.state.idNo;
    const hideIdNo = _idNo||'';    
    return (
      <div className="Input-card-information" id="add-patientVerifyId-29">
        <Title step={this.state.step}/>
        <div className="bind-card-type">
          <div className="bind-card-item bind-card-item-first" style={{position:'relative'}}>
            <div>验证类型</div>
            <div className="ui-select">
              {
                this.state.cardType == 2//医保卡
                ?(<select>
                  <option value="1">手机号</option>
                </select>)
                :(<select onChange={this.handleChangeType.bind(this)}>
                  <option value="2">身份证号</option>
                  <option value="1">手机号</option>
                </select>)
              }
            </div>
            <span className="arrow"></span>
          </div>
          <div className="bind-card-item" style={{borderBottom:"1px solid #eee"}}>
            <div>
              {
                this.state.VerifyType == 2
                ? "身份证号"
                : "手机号"
              }
            </div>

            <div className="id-input">
              <span>
              {
                this.state.VerifyType == 2
                ? hideIdNo
                : hidePhoneNum
              }
              </span>
            </div>
            </div>
            <div className="bind-card-item bind-card-item-first">
              <div>校验</div>
              <div className="id-input">
                  <input onChange={this.handelChangeValue.bind(this)} 
                        placeholder={
                          this.state.VerifyType == 2
                          ? "请输入身份证后6位"
                          : "请输入办卡时预留手机后4位"
                          } 
                        type="text"
                        style={{paddingRight:"5px"}}
                    />
              </div>
              </div>
        </div>
        
        <div className="reminder">
          <div style={{color:'#333'}}>温馨提示</div>
          {
             this.state.VerifyType == 2
             ? <p>身份证号为医院办卡时填写的身份证号，若办理的儿童卡，则身份证号为监护人身份证。</p>
             : <p>手机号为在医院持医保卡建档时预留的号码。</p>
          }
        </div>

        <div className="fixed-foot-wrapper">
          <div className="btn-wrapper g-footer">
            <button onClick={this.state.btnStyle && this.sub.bind(this)} className={"btn btn-lg "+(this.state.btnStyle?'':' btn_disabled')} id="J_SubmintBtn" >
              下一步
            </button>
          </div>
        </div>
      </div>
    )
  }
}
