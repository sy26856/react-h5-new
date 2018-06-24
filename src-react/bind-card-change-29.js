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
import './bind-card-change-29.less'
import Confirm from './component/confirm/Confirm2'
import PatientCard from './component/patientCard'

export default class AddPatient extends React.Component {
  constructor(props) {
    super(props);
    this.query = util.query();
    this.corpId = this.query.corpId;
    this.unionId = this.query.unionId;
    this.state = {
      cardType: '',//卡类型 1 诊疗卡 2 医保卡
      oldCardType: this.query.cardType,//卡类型 1 诊疗卡 2 医保卡
      cardObj: {},
      verify: "",//要验证的校验号码
      isPhone: 1,//0非手机号验证，1 手机号验证
      idNo: this.query.idNo,
      guarderIdNo:this.query.guarderIdNo,
      patientId: this.query.patientId,
      patientName: this.query.patientName,
      phoneNum: this.query.phoneNum,
      idType:this.query.idType,
      cardNo:this.query.cardNo,
      btnStyle:false,//下一步按钮样式标识 false表示不可点击,是灰色; true表示可以点击,背景不是灰色
    };
  }

  componentDidMount() {
    this.initData();
  }

  initData() {
      let _this = this;
      //传入身份证号码和名字查询该就诊人可绑定的卡的类型
      let _idNo;
      if(_this.state.idNo){
        _idNo = _this.state.idNo
      }else if(_this.state.guarderIdNo){
        _idNo = _this.state.guarderIdNo
      }
    UserCenter.getUserCardsByPatientId(_this.state.guarderIdNo, _this.state.patientName,_this.state.patientId).subscribe({
        onSendBefore() {
          BlockLoading.show("请稍后...");
        },
        onComplete() {
          BlockLoading.hide();
        },
        onSuccess(result) {
          if (result.success && result.data) {
            let resultDate = result.data;//卡的数据是一个[{}.{}]形式
            const newPatientCard = resultDate.find((v)=>{
                return v.cardType != _this.state.oldCardType
            })
            _this.setState({
              cardNo:newPatientCard.cardNo,
              cardType:newPatientCard.cardType,
              cardObj:newPatientCard,
              idNo: newPatientCard.idNo
            })
          }
        },
        onError(result) {
          Alert.show(result.msg,1000)
        }
      }).fetch()
  }


  handleChangePhone() {
    this.setState({
      isPhone: 1
    })
    this.refs.selectType.value = 1; 
  }

  handleChangeVerifyType(e) {
    let verifyType = e.target.value;
    this.setState({
      isPhone: verifyType
    })
  }

  handleChangeVerify(e) {
    let verify = e.target.value;
    this.setState({
      verify: verify//要验证的号码
    },function(){
      if(verify != ''){
        this.setState({
          btnStyle:true
        })
      }else{
        this.setState({
          btnStyle:false
        })
      }
    })
  }

  sub() {
    //更新卡的信息,主要是cardType,cardNo,
    var _this = this;
    let {patientId, idNo, guarderIdNo,idType,patientName,cardType,cardNo} = _this.state;
    patientName = patientName ? patientName.trim() : '';
    let data = {
      patientId, idNo, idType,patientName,guarderIdNo, cardType,cardNo
    }
    data.target = '_blank';
    let verify = this.state.verify;
    data.unionId = _this.query.unionId
    let param = util.flat({
      unionId: _this.query.unionId,
      target: '_blank'
    })
    UserCenter.validateByPhoneAndID(this.state.cardType, this.state.guarderIdNo, this.state.idNo, this.state.patientName, verify, this.state.isPhone).subscribe({
      onSuccess: (res) => {
        console.log(res)
        _this.setState({
          cardNo: res.data.cardNo,
          cardType: res.data.cardType,
          idNo: res.data.idNo,
          display: true,
          title: "更换绑卡会将之前邦定的卡解除，确认要更换吗？",
          des: true,
          confirmCallback: function (confirm) {
            _this.setState({
              display: false
            })
            if (confirm) {
              const _cardNo = _this.state.cardType == 1 ? _this.state.cardNo : _this.state.idNo
              UserCenter.addCardQD(_cardNo, _this.state.cardType, patientId, _this.query.unionId).subscribe({
                onSendBefore() {
                  BlockLoading.show("查询中...");
                },
                onComplete() {
                  BlockLoading.hide();
                },
                onSuccess: (result) => {
                  if (result.success) {
                    Alert.show("卡片更换绑定成功", 1000);
                    const isInYuantuApp = util.isInYuantuApp();
                    if (isInYuantuApp) {//在远图App中
                      let time = 2
                      let returnImmediately = true
                      hybridAPI.popToTimeViewController(false, time, returnImmediately)
                    } else {//在H5中
                      //const href = "./patient-list-29.html?" + param;
                      //window.location.replace(href) 
                      window.history.go(-2)
                    }
                  }
                },
                onError: (result) => {
                  Alert.show(result.msg, 1000);
                }
              }).fetch();
            } else {
              _this.setState({
                display: false,
              })
            }
          }
        })
      },
      onError: (result) => {
        Alert.show('信息验证有误,请核对正确信息', 1000)
        console.log(result.msg)
      }
    }).fetch()
    
  }
  render() {
    let {cancelText, okText, confirmCallback, display, title, des,isPhone} = this.state;
    const mobile = this.state.cardObj.mobile||'';
    const cardNo = this.state.cardObj.cardNo||'';
    const hideMobile = mobile ||''
    const hideCardNo = cardNo||''
    return (
      <div className="Input-card-information">
        <div className="bind-card-type" style={{ marginTop: "0px" }}>
          <div className="bind-card-item bind-card-item-first" style={{position:'relative'}}>
            <div>卡类型</div>
            <div style={{marginRight:'10px'}}>
              <span>{this.state.oldCardType == 1 ? "青岛区域诊疗卡" : "青岛医保卡"}</span>
            </div>
            <span className="arrow"></span>
          </div>
          <div className="bind-card-item bind-card-item-first">
            <div>
              {this.state.isPhone == 0 ? '卡号':'手机号'}
            </div>
            <div className="id-input">
              {
                this.state.oldCardType == 1 ? (this.state.isPhone == 0 ? hideCardNo : hideMobile) : hideMobile
              }
            </div>
          </div>
          <div className="bind-card-item bind-card-item-first" style={{position:'relative'}}>
            <div>
              校验类型
            </div>
            {
              this.state.oldCardType == 1
              //cardType类型为1,说明就是诊疗卡,就可以选择就诊卡校验,还是电话号码校验
                ? (
                  <div className="ui-select">
                    <select onChange={this.handleChangeVerifyType.bind(this)} ref="selectType">
                      <option value="1">电话号校验</option>
                      <option value="0">就诊卡号校验</option>
                    </select>
                  </div>
                )
                //cardType类型不为1(为2),说明是医保卡,只可以通过电话号码校验
                : (<div>
                    <span style={{marginRight:'10px'}}>电话号校验</span>
                </div>)
            }
          <span className="arrow"></span>
          </div>
          <div className="bind-card-item ">
            <div>
              校验
            </div>
            <div className="id-input"><input onChange={this.handleChangeVerify.bind(this)} placeholder={
              this.state.oldCardType == 1
                ? this.state.isPhone == 0 ? "请输入就诊卡后4位" : "请输入办卡时预留手机后4位"
                : "请输入办卡时预留手机后4位"
            } type="text" /></div>
          </div>
        </div>

        <div className="reminder">
          <div style={{color:'#333'}}>温馨提示</div>
          {
            this.state.oldCardType == 1
              ? this.state.isPhone == 0 ? (<div><p>1.若卡号磨损，请通过<a style={{color:'#429fff'}} href="./feedback-index.html?unionId=29&corpId=&target=_blank&spm=100.1500.1000.8">帮助与反馈</a>联系客服查询,或者使用<a onClick={this.handleChangePhone.bind(this)} style={{color:'#429fff'}}>手机号校验</a></p>
                <p>2.未办理就诊卡，持医保卡的用户请选择卡的类型为医保卡</p>
                <p>3.绑定就诊卡后就诊人信息将以卡信息为准</p></div>) : <p>手机号为医院办卡时预留的号码</p>

              : <p>手机号为在医院持医保卡建档时预留的手机号码</p>
          }
        </div>

        <div className="fixed-foot-wrapper">
          <div className="btn-wrapper g-footer">
            <button onClick={this.state.btnStyle&&this.sub.bind(this)} className={"btn btn-lg "+(this.state.btnStyle?'':'btn_disabled')} id="J_SubmintBtn" >
              确认绑定
            </button>
          </div>
        </div>
        <Confirm title={title} des={des} cancelText={cancelText} okText={okText} display={display}
                 callback={confirmCallback}/>
      </div>
    )
  }
}           
