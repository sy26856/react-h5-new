"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import { SmartBlockComponent } from './BaseComponent/index'
import {BlockLoading} from './component/loading/index'
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import Alert from './component/alert/alert'
import cache from './lib/cache'
import hybridAPI from './lib/hybridAPI'
import './add-patientByIdBindCard-29.less'
import Confirm from './component/confirm/Confirm2'
import PatientCard from './component/patientCard'

export default class AddPatient extends React.Component {
  constructor(props) {
    super(props);
    this.query = util.query();
    //儿童生日格式化
    let birthday = this.query.birthday;
    if(Number(birthday)){
      let d = new Date()
      d.setTime(birthday);
      let year = d.getFullYear();
      let month = d.getMonth() + 1;
      let day = d.getDate();
      birthday = year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
    }
    this.state = {
      unionId:this.query.unionId,
      idType:this.query.idType,
      cardType: '',//卡类型 1 诊疗卡 2 医保卡
      cardArr: [],
      verify: "",
      isPhone: 0,//0非手机号验证，1 手机号验证
      id:this.query.id,
      idNo: this.query.idType == 1 ? this.query.idNo:'',
      guarderIdNo: this.query.idType == 2 ? this.query.guarderIdNo:'',
      patientName: this.query.patientName,
      mobile: this.query.mobile,
      selectView:this.query.selectView,
      target:this.query.target,
      sex:this.query.idType == 2 ? this.query.sex:'',
      birthday:this.query.idType == 2 ? birthday:'',
      isDefault:this.query.isDefault,
      patientId:'',
      cardIndex:'',
      cardNo:'',
      btnStyle:false,//下一步按钮样式标识 false表示不可点击,是灰色; true表示可以点击,背景不是灰色
    };
  }


  componentDidMount() {
    this.initData();
  }

  initData() {
    let _this = this;
    let { guarderIdNo,idNo,idType,patientName,mobile, sex, isDefault, birthday, cardType, target, unionId } = this.state;
    patientName = patientName ? patientName.trim() : '';
    let data = {
     idType, patientName,mobile,isDefault,unionId,
    }
    
    if(idType == 2){//儿童多传
      data.guarderIdNo = guarderIdNo;
      data.sex = sex;
      data.birthday = birthday;
    }else{
      data.idNo = idNo
    }
    data.selectView = _this.query.selectView
    data.target = _this.query.target
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
          let resultDate = result.data;//[{}...]
          _this.setState({
              cardArr:resultDate,
              cardType : resultDate[0].cardType,//设置默认显示的卡片类型
              cardNo:resultDate[0].cardNo//设置默认显示卡片类型的卡号
            })
        if (resultDate[0].cardType == 2){
                _this.setState({
                  isPhone: 1
                  })
                }
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

  handleChangeType(e) {
    let _this = this
    let cardIndex = e.target.value; 
    let isPhone = 1;
    if (_this.state.cardArr[cardIndex].cardType == 1) {
      isPhone = 0;
    }
    _this.setState({
      cardIndex: cardIndex,
      cardType: _this.state.cardArr[cardIndex].cardType,
      isPhone: isPhone,
      cardNo:_this.state.cardArr[cardIndex].cardNo,
    })
    return
  }
//跳转到帮助与反馈页面
goHelp(){
  window.location.href = './feedback-index.html?unionId=29&corpId=&target=_blank&spm=100.1500.1000.8'
}
  sub() {
    let _this = this
    let verify = this.state.verify;
    UserCenter.validateByPhoneAndID(this.state.cardType, this.state.guarderIdNo, this.state.idNo, this.state.patientName, verify, this.state.isPhone).subscribe({
      onSuccess: (result) => {
        _this.setState({
          cardNo: result.data.cardNo,
          cardType: result.data.cardType
        })
        let { id, guarderIdNo, idNo, cardNo, idType, patientName, mobile, sex, isDefault, birthday, cardType, target, unionId } = _this.state;
        patientName = patientName ? patientName.trim() : '';
        let data = {
          idType, patientName, cardNo, mobile, isDefault, unionId, id
        }
        if (idType == 2) {//儿童多传
          data.guarderIdNo = guarderIdNo;
          data.sex = sex;
          data.birthday = birthday;
        } else {
          data.idNo = idNo
        }
        data.selectView = _this.query.selectView
        data.target = _this.query.target
        _this.subpatient(data);//根据身份证,姓名等信息获取patientId等信息
      },
      onError: (result) => {
        Alert.show('信息验证有误,请核对正确信息', 1000)
        console.log(result.msg)
      }
    }).fetch()
    

  }
  //获取patientId
    subpatient(data) {
    let _this = this;
    let param = util.flat({
      unionId: _this.query.unionId,
      target: '_blank',
      selectView:_this.query.selectView,
    })
    UserCenter.updatePatient("", _this.query.unionId,data)
      .subscribe({
        onSendBefore() {
          BlockLoading.show("查询中...");
        },
        onComplete() {
          BlockLoading.hide();
        },
        onSuccess(result) {
          if (result.resultCode == 100 ) {
                      _this.setState({
                        id:result.data // 添加成功返回data就是patientid,妈的,后台取的什么鬼名字
                      })
                      _this.bindCard(data,_this.state.id);
            }
        },
        onError(result) {
          Alert.show(result.msg,1000);
        }
      }).fetch();
}

bindCard(data,patientid){
  let _this = this
    let param = util.flat({
        unionId: _this.query.unionId,
        target: '_blank',
        selectView: _this.query.selectView
    })	  
    const _cardNo = _this.state.cardType == 1? data.cardNo:_this.state.idType == 1? data.idNo:data.guarderIdNo;
    UserCenter.addCardQD(_cardNo, _this.state.cardType,patientid, _this.query.unionId).subscribe({
        onSendBefore(){
            BlockLoading.show("查询中...");
        },
          onComplete(){
            BlockLoading.hide();
        },
        onSuccess: (result) => {
          if (result.success) {
            Alert.show("卡片绑定成功",1000);
            const isInYuantuApp = util.isInYuantuApp();
                    // ,isGtVersion3140 = isInYuantuApp && util.version.gt( 3, 14, 0 );
                    // if(isInYuantuApp && isGtVersion3140){//在远图App中
                      if(isInYuantuApp){//在远图App中
                        let time = 3
                        let returnImmediately = true
                        hybridAPI.popToTimeViewController(false,time,returnImmediately)
                    }else{//在H5中
             window.location.href = "./patient-list-29.html?" + param
              }
          }
        },
        onError: (result) => {
            Alert.show(result.msg,1000);
        }
    }).fetch();
  
};

  render() {
    return (
      <div id="add-patientByIdBindCard-29">
        <div className="Input-card-title">
          <div className="title-item ">
            绑定就诊卡后您才可使用该卡取号、就诊、缴费;
          </div>
          <div className="title-item Identity-check">
            绑定就诊卡后线下挂号记录也能同步到线上;
          </div>
          <div className="title-item info-confirm">
            绑定就诊卡信息更安全，防止身份证信息泄露导致隐私被侵犯;
          </div>
        </div>
        <div className="bind-card-type" style={{ marginTop: "0px" }}>
          <div className="bind-card-item bind-card-item-first" style={{position:'relative'}}>
            <div>卡类型</div>
              <div className="ui-select">
                <select onChange={this.handleChangeType.bind(this)}>
                    {
                      this.state.cardArr.map((v, k) => {
                        return <option key={k} value={k}>{v.cardType == 1 ? "青岛区域诊疗卡" : "青岛医保卡"}</option>
                      })
                    }
                </select>
              </div>
              <span className="arrow"></span>
          </div>
          <div className="bind-card-item bind-card-item-first">
            <div>
              {
                this.state.isPhone == 0
                  ? "卡号"
                  : "手机号"
              }
            </div>
                {/*显示手机号或者诊疗卡号 */}
            <div className="id-input" ref="selectCardType">
              {
                this.state.isPhone == 0
                  ? this.state.cardArr.map((item)=>{
                    if ( item.cardType == this.state.cardType )
                    {
                      return item.cardNo;//选择符合条件的卡号,并且隐私处理
                    }
                  }) 
                  : this.state.cardArr.map((item)=>{
                    if ( item.cardType == this.state.cardType )
                    {
                      return item.mobile//原理同上
                    }
                  }) 
              }
            </div>
          </div>
          <div className="bind-card-item bind-card-item-first" style={{position:'relative'}}>
            <div>
              校验类型
            </div>
            {
              this.state.cardType == 1
              //cardType类型为1,说明就是诊疗卡,就可以选择就诊卡校验,还是电话号码校验
                ? (
                  <div className="ui-select">
                    <select onChange={this.handleChangeVerifyType.bind(this)} ref="selectType">
                      <option value="0">就诊卡号校验</option>
                      <option value="1">电话号校验</option>
                    </select>
                  </div>
                )
                //cardType类型不为1(为2),说明是医保卡,只可以通过电话号码校验
                : (<div className="ui-select">
                  <select>
                    <option value="1">电话号校验</option>
                  </select>
                </div>)
            }
            <span className="arrow"></span>
          </div>
          <div className="bind-card-item ">
            <div>
              校验
            </div>
            <div className="id-input"><input onChange={this.handleChangeVerify.bind(this)} placeholder={
              this.state.cardType == 1
                ? this.state.isPhone == 0 ? "请输入就诊卡后4位" : "请输入办卡时预留手机后4位"
                : "请输入办卡时预留手机后4位"
            } type="text" /></div>
          </div>
          <div style={{width:'100%',height:'10px',backgroundColor:'#eee'}}></div>
          {/* 温馨提示区域 */}
        <div className="reminder" style={{marginTop:'0'}}>
          <div style={{color:'#333'}}>温馨提示</div>
          {
            this.state.cardType == 1
              ? this.state.isPhone == 0 ? (<div><p>1.若卡号磨损，请通过<span onClick={this.goHelp} className='helpAndResponse'>帮助与反馈</span>联系客服查询,或者使用<a onClick={this.handleChangePhone.bind(this)} className='mobileVerify'>手机号校验</a></p>
                <p>2.未办理就诊卡，持医保卡的用户请选择卡的类型为医保卡</p>
                <p>3.绑定就诊卡后就诊人信息将以卡信息为准</p></div>) : <p>手机号为医院办卡时预留的号码</p>

              : <p>手机号为在医院持医保卡建档时预留的手机号码</p>
          }
        </div>
      </div>
          {/* 确认绑定区域 */}
          <div className="fixed-foot-wrapper">
          <div className="btn-wrapper g-footer">
            <button onClick={this.state.btnStyle&&this.sub.bind(this)} className={"btn btn-lg "+(this.state.btnStyle?'':'btn_disabled')} id="J_SubmintBtn" >
              确认绑定
            </button>
          </div>
        </div>
      </div>
    )
  }
}
