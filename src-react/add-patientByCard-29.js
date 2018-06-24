"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent} from './BaseComponent/index'
import {BlockLoading} from './component/loading/index'
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import Alert from './component/alert/alert'
import cache from './lib/cache'
import hybridAPI from './lib/hybridAPI'
import './add-patientByCard-29.less'
import Confirm from './component/confirm/Confirm2'
import PatientCard from './component/patientCard'


export default class AddPatient extends React.Component {
  constructor(props) {
    super(props);
    this.query = util.query();
    this.state={
      step:1 ,//头部绑卡状态
      category:1, // 1为诊疗卡 2医保卡,默认为诊疗卡
      value:"",//用来记录输入的号码
      cardTypeArr:[],//卡类型数组
      patientName:'',//就诊人名字
      name:'',//医保卡持有人名字
      btnStyle:false,//下一步按钮样式标识 false表示不可点击,是灰色; true表示可以点击,背景不是灰色
      };
  }

  componentDidMount() {
    this.initData();
  }

  initData(){
    var _this = this;
    UserCenter.getCardTypes(this.query.unionId).subscribe({
      onSendBefore(){
        BlockLoading.show("获取卡类型...");
      },
      onComplete(){
        BlockLoading.hide();
      },
      onSuccess(result){
        if (result.success && result.data) {
          _this.setState({
            cardTypeArr: result.data
          })
        }
      },
      onError(result){
       Alert.show(result.msg)
      }
    }).fetch()
  }

  handleChangeType(e){
    const category = e.target.value
    this.setState({
      category,
    })
  }

  handleChange(e){
    let value = e.target.value
    this.setState({
      value:value  
    },function(){
      if(this.state.category == 1){
          if(this.state.value!=''){
            this.setState({
              btnStyle:true,
             })
          }else{
            this.setState({
              btnStyle:false,
             })
          }
      }else if(this.state.category == 2){
        if(this.state.value!=''&&this.state.name!=''){
          this.setState({
           btnStyle:true,
          })
        }else{
           this.setState({
             btnStyle:false,
           })
        }  
      }
    })
  }
  handleChangeName(e){
    let name = e.target.value
    this.setState({
      name,
    },function(){
      if(this.state.value!=''&&this.state.name!=''){
        this.setState({
               btnStyle:true,
              })
        }else{
          this.setState({
                   btnStyle:false,
                 })
        }
    })
  }
  //跳转到帮助与反馈页面
  goHelp(){
    window.location.href = './feedback-index.html?unionId=29&corpId=&target=_blank&spm=100.1500.1000.8'
  }
  sub(){
    var _this = this;
    const value = util.trim(_this.state.value)//去除两边空格
    if (value.length !== 18 ){
      if(value.length > 18){
        Alert.show('您输入的号码的长度大于18位',1000)
      }else{
        Alert.show('您输入的号码的长度小于18位',1000)
      }
      return
    }
    if( _this.state.category == 2 ){
      const name = _this.state.category == 2 ? util.trim(_this.state.name):'';
      if (!(name.length > 1) || (!/^[\ a-zA-Z\u4e00-\u9fa5•·.]+$/.test(name))) {
        Alert.show("请正确填写持卡人姓名");
        return false;
      }
    }
    const name = _this.state.category == 2 ? _this.state.name:'';
    UserCenter.getBindCardValidateQD(_this.state.value,_this.state.category,name,_this.query.unionId).subscribe({
      onSendBefore(){
        BlockLoading.show("查询中...");
      },
      onComplete(){
        BlockLoading.hide();
      },
      onSuccess(result){
        if (result.success && result.data) {
          let cardInfo = {
            ...result.data,
            target: '_blank',
            selectView: _this.query.selectView,
            regMode:_this.query.regMode,
            value: _this.state.value
          }
          let param = util.flat(cardInfo)
          window.location.href = "./add-patientVerifyId-29.html?" + param
        }
      },
      onError(result){
        Alert.show(result.msg);
      }
    }).fetch()
  }

  render() {
    return (
      <div className="Input-card-information" id="Input-card-information">
        <Title step={this.state.step}/>
        <div className="bind-card-type">
          <div className="bind-card-item bind-card-item-first" style={{position:'relative'}}>
            <div style={{color:'#666'}}>卡类型</div>
            <div className="ui-select">
              <select onChange={this.handleChangeType.bind(this)}>
              {
                this.state.cardTypeArr.map( (v,k) => {
                  return <option key={k} value={v.category}>{v.name}</option>
                })
              }
              </select>
            </div>
            <span className="arrow"></span>
          </div>
          <div className="bind-card-item" style={{borderBottom:'1px solid #eee'}}>
            <div>
              {
                this.state.category == 1
                ? "就诊卡号"
                : "身份证号"
              }
            </div>
            <div className="id-input">
              <input onChange={this.handleChange.bind(this)}  
                     placeholder={
                      this.state.category == 1
                      ? "请准确填写18位就诊卡号"
                      : "请准确填写18位身份证号"} 
                      type="text"/></div>
          </div>
          {this.state.category == 2?
          (<div className="bind-card-item">
            <div>姓名</div>
            <div className="id-input">
                <input onChange={this.handleChangeName.bind(this)}  
                        value={this.state.name}
                       placeholder="请填写该医保卡持有人姓名"
                       type="text"/>
            </div>
          </div>):null}
        </div>
        <div className="reminder">
          <div style={{color:'#333'}}>温馨提示</div>
          {
             this.state.category == 1
             ? (<div><p>1.请先确认已在医院办理就诊卡,并准确填写就诊卡号。</p>
              <p>2.若卡号磨损无法辨认,可到<span id="helpLink" onClick={this.goHelp}>帮助与反馈</span>请客服帮忙。</p>
              <p>3.未办理就诊卡,持医保卡用户请选择卡类型为医保卡。</p></div>)
             : <p>请先确认该医保卡已在医院建档,若无请选择卡类型为就诊卡</p>
          }
        </div>

        <div className="fixed-foot-wrapper">
          <div className="btn-wrapper g-footer">
            <button onClick={()=>{this.state.btnStyle&&this.sub()}}  className={'btn btn-lg '+(this.state.btnStyle?'':' btn_disabled')} id="J_SubmintBtn" >
              下一步
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export class Title extends React.Component {
  constructor () {
    super();
  }
  render(){
    // let 
    return (
      <div className="title-container">
        <div className="title">
          <div className="title-item ">
            <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/92a5036d5a9749db88ed9a0bd6869d22-84-84.png" alt=""/>
            <div className={this.props.step >= 1? "card-info" : "card-info"}>就诊卡信息</div>
          </div>

          <div className="title-item Identity-check">
            <div className={ this.props.step >= 2 ? "hr active" : "hr"}></div>
            <img src={this.props.step >= 2 ? "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/d8ec26fc2bfc2a05fe8f7ae15e3b12d8-84-84.png" : "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/8c37320e5ccc8e3de7ff89d8d1a04dcc-84-84.png"} alt=""/>
            <div className={this.props.step >= 2? "card-info" : ""}>身份校验</div>
          </div>

          <div className="title-item info-confirm">
            <div className={ this.props.step === 3 ? "hr active" : "hr"}></div>
            <img src={this.props.step === 3 ? "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/19f05bc05c9b2c6a9b027c50b7158429-84-84.png" : "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/ddd3497611ae34171c784c7bc5dc464c-84-84.png"} alt=""/>
            <div className={this.props.step === 3? "card-info" : ""}>确认信息</div>
          </div>
        </div>
        {
          this.props.warning
          ? <div className="warning">
            {this.props.warning}
          </div>
          : null
        }
      </div>
    )
  }
}