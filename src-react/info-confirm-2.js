"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent, SmartNoBlockComponent} from './BaseComponent/index'
import {BlockLoading} from './component/loading/index'
import cache from './lib/cache'
import Alert from './component/alert/alert'
import Pay from './component/pay/Pay';
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import PayDialog from './component/pay/PayDialog'
import TopTips from './component/TopTips/TopTips'
import JSBridge from './lib/JSBridge'
import WXOpenIdModule from './module/WXOpenIdModule'
import './info-confirm-2.less'

export default class InfoConfrim2 extends SmartBlockComponent {
  constructor(props) {
    super(props);

    this.sid = util.getSID();
    var query = util.query();
    this.defaultPrice = query.regAmount || '';
    this.openId = null
    this.unionId = query.unionId;

    if(this.unionId==60){
      location.replace(util.flatStr('./info-confirm-60.html?',{...query}))
    }

    this.state = util.vis({

      isLogin: true,
      loading: false,
      success: true,

      needSource: true,
      sourceEmpty: false,
      corpId: query.corpId,
      scheduleId: query.scheduleId,
      medAmPm: query.medAmPm,
      doctName: query.doctName,
      doctCode: query.doctCode,
      hosRegType: query.hosRegType,
      medDate: query.medDate,
      regAmount: query.regAmount,
      discountFee: query.regAmount, //优惠后金额
      deptCode: query.deptCode,
      deptName: query.deptName,
      corpName: query.corpName,
      regType: query.regType,
      regMode: query.regMode,
      patientId: "", //就诊人
      patientName: "",
      sourceList: [],//号源

      //订单生成以后会获得 outId(订单id)
      submit: null,
      outId: null,
      //支付方式 1、支付宝 2、微信 3、余额 4、到院支付
      feeChannel: null,
    });


    this.regEvents()
  }

  regEvents() {
    //选择就诊人回调函数
    JSBridge.on("0", (result) => {
      if (result && result.ret == "SUCCESS") {
        var data = result.data ? JSON.parse(result.data) : null;
        var needDefault = cache.get("needDefault");//默认就诊人改造
        if (data.patientId && needDefault == "false") {
          //设置就诊人
          this.updateSelectPatient(data.patientId, data.patientName);
        }
      }
    });
  }
  getWXOpenId(){
    let {corpId,regMode} = this.state;
    let optType = regMode == 1 ? 6 : 3;
    
    new WXOpenIdModule(corpId, optType,this.unionId)
    .subscribe({
      onSuccess:(result)=>{
        this.openId = result.data.openId;
      }
    }).fetch();
  }
  componentWillMount(){
    if(util.isInMicroMessenger()){
      this.getWXOpenId();
    }
  }
  componentDidMount() {
    let {corpId, regType, deptCode, doctCode, regMode, medAmPm, medDate, scheduleId} = this.state;
    
    //获取号源
    UserCenter.getNumbersource(corpId, regType, deptCode, doctCode, regMode, medAmPm, medDate, scheduleId)
      .subscribe({
        onSendBefore(){
          BlockLoading.show("请稍等...");
        },
        onComplete(){
          BlockLoading.hide();
        },
        onSuccess: (result) => {
          var data = result.data;

          if (data && data.needSource) {
            this.setState({
              //需要选择号源
              needSource: true,
              sourceList: data.sourceList
            })
          } else {
            this.setState({
              //不需要选择号源
              needSource: false
            })   
          }
          //选择就诊人
          //注意本地测试的时候 不同端口选择完就诊人可能无法 获取到localStorage

          this.setPatient(cache.get("patientId"));
        },
        onError: () => {
          this.setState({
            needSource: false
          });
        }

      }).fetch();

  }    

  //设置就诊人
  setPatient(patientId) {
    const _this = this;
    UserCenter.getPatientList(this.state.corpId, this.unionId)
      .subscribe({
        onSendBefore(){
          BlockLoading.show("请稍等...");
        },
        onComplete(){
          BlockLoading.hide();
        },
        onError() {
          _this.setState({
            isLogin: false,
          });
        },
        onSuccess: (result) => {
          if (result.data) {
            var patientList = result.data;
            var isSelect = false;
            var needDefault = cache.get("needDefault");
            _this.setState({
              isLogin: true,
            });
            // 默认就诊人改造
            //选择上次选择的就诊人
            for (var i = 0; i < patientList.length; i++) {
              if (patientId == patientList[i].id && needDefault == "false") {
                isSelect = true;
                this.updateSelectPatient(patientList[i].id, patientList[i].patientName);
                break;
              }
            }
            //选择第一个就诊人
            if (!isSelect) {
              for (var i = 0; i < patientList.length; i++) {
                if (patientList[i].default) {
                  this.updateSelectPatient(patientList[i].id, patientList[i].patientName);
                }
              }
            }
          }
        }
      })
      .fetch()
  }

  //更新用户选择的就诊人
  updateSelectPatient(patientId, patientName) {
    // alert(patientId+"333"+patientName)
    this.setState({
      isLogin: true,
      patientId: patientId,
      patientName: patientName,
    })
    var state = this.state;
    var self = this;
    let {corpId, regType, deptCode, doctCode, regMode, medAmPm, medDate, scheduleId, regAmount} = this.state;
    //获取优惠信息
    UserCenter.getAppointRegBenefit(corpId, regType, deptCode, doctCode, regMode, medAmPm, medDate, scheduleId, patientId, regAmount)
      .subscribe({
        onSendBefore(){
          BlockLoading.show("正在获取优惠信息...");
        },
        onError(e){
          if (e.resultCode == -100) {
            self.setState({
              discountFee: self.defaultPrice
            })
          }
          BlockLoading.hide();
        },
        onComplete(){
          BlockLoading.hide();
        },
        onSuccess: (result) => {
          if (result.data && typeof result.data.discountFee == "number") {
            this.setState({discountFee: result.data.discountFee})
          }
        }
      }).fetch();
    //localStorage
    cache.set("patientId", patientId);
    cache.set("patientName", patientName);
    cache.set("needDefault", true);
  }

  //支付类型发生变化(原PayDialog中的方法)
  onFeeChannelChange(feeChannel) {
    this.setState({
      feeChannel: feeChannel,
    })
    //localStorage
    // cache.set("patientId", this.state.patientId);
    // cache.set("patientName", this.state.patientName);
  }

  //是否需要选择号源
  isNeedSource() {
    return this.state.needSource;
  }

  //号源是否为空
  isSourceEmpty() {
    return this.state.sourceEmpty;
  }

  // 如果用户切换账户重新登录
  // onActivation(){
  //   if(this.sid != this.util.getSID()){
  //     this.sid = this.util.getSID();
  //     //删除之前选择的就诊人
  //     //this.registerData.remove("patient");
  //     //重新载入页面
  //     location.reload();
  //   }
  // }

  toPatientList(corpId, patientId ) {
    const { isLogin } = this.state;
    //如果在远图app中，在点击就诊人的时候就判断是否登录。如果不在远图app中，那么先前往就诊人列表然后再判断登录状态
    if ((util.isLogin() && isLogin) || !util.isInYuantuApp()) {
      if(this.unionId==60){
        window.location.href = `./patient-list-60.html?corpId=${corpId}&lastSelectPatientId=${patientId ? localStorage.getItem("patientId") : ''}&selectView=1&unionId=${this.unionId}&referrer=${encodeURIComponent(location.href)}&target=_blank`;
      }else{
        window.location.href = `./patient-list.html?corpId=${corpId}&lastSelectPatientId=${patientId ? localStorage.getItem("patientId") : ''}&selectView=1&unionId=${this.unionId}&referrer=${encodeURIComponent(location.href)}&target=_blank`;
      }
    } else {
      util.goLogin();
    }
  }

  render() {
    var {scheduleId, medAmPm, doctName, medDate, regAmount, deptName, corpName, corpId, needSource, patientId, patientName, discountFee, regMode, submit, outId, expirationTime} = this.state;
    var ampm = {"1": "上午", "2": "下午"};
    var dayOfWeekList = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    var time = [medDate, dayOfWeekList[new Date(medDate).getDay()], ampm[medAmPm]].join(" ");
    //regMode 6 预约 3挂号
    var optType = regMode == 1 ? 6 : 3;
    return (
      <div>
        <TopTips corpId={corpId} tipsKey="regdetails"/>
        <ul className="list g-space">
          <li>
            <span className="item">医院</span>
            <span className="item-inner">{corpName}</span>
          </li>
          <li>
            <span className="item">科室</span>
            <span className="item-inner">{deptName}</span>
          </li>
          {
            doctName ?
              <li>
                <span className="item">医生</span>
                <span className="item-inner">{doctName}</span>
              </li>
              : null
          }
          <li>
            <span className="item">就诊时间</span>
            <span className="item-inner txt-prompt">{time}</span>
          </li>
        </ul>
        <ul className="list list-link">
          {
            needSource ?
              <li className="txt-arrowlink">
                <span className="item">选择号源</span>
                <span className="item-inner item-right">
                {this.renderSourceList()}
                </span>
              </li>
              : null
          }
          <li>
            <a
              onClick={() => this.toPatientList(corpId, patientId, patientName)}
              className="txt-arrowlink">
              <span className="item">就诊人</span>
              <span className="item-inner item-right">{patientName}</span>
            </a>
          </li>
        </ul>
        <div className="list-pay-msg clearfix g-space">
          <span className="txt-info">应付</span>
          <span>￥ {util.rmb(regAmount / 100)}</span>
          {
            regAmount - discountFee > 0 ? <span>
              <span className="txt-info"> - 优惠</span>
              <span>￥{util.rmb((regAmount - discountFee) / 100)}</span>
            </span>
              : null
          }
          <div className="item-right">
            <span className="txt-info">实付</span>
            <span className="txt-highlight">￥ {util.rmb(discountFee / 100)}</span>
          </div>
        </div>
        {
          regMode == 1 && patientId ? <Pay
              corpId={corpId}
              unionId={this.unionId}
              optType={optType}
              patientId={patientId}
              price={discountFee}
              onFeeChannelChange={this.onFeeChannelChange.bind(this)}
            /> : null
        }
        <div className="msg-rules">
          <a href="./rule.html?target=_blank">请遵守平台预约挂号规则</a>
        </div>
        <a className="btn btn-block g-footer J_Submit" onClick={this.submit.bind(this, optType)}>确认</a>
        {
          submit ? <PayDialog
              corpId={corpId}
              optType={optType}
              patientId={patientId}
              price={discountFee}
              optParam={{corpId:corpId, patientId:patientId, outId:outId,openId:this.openId}}
              onPayComplate={this.onPayComplate.bind(this)}
              onPayCancel={this.onPayCancel.bind(this)}
              expirationTime={expirationTime}
              redirect={ util.flatStr(util.h5URL("/register-details-2.html?"), {corpId, unionId:this.unionId,pay:1,id:outId, guide:1,openId:this.openId}) }
            /> : null
        }
      </div>
    );
  }

  renderSourceList() {
    let sourceList = this.state.sourceList;
    let sourceItem = null;
    if (sourceList.length == 0) {
      return null
    }
    return <select ref="regNoList">
      ${
      sourceList.map((item, index) => {
        sourceItem = util.vis({
          appoNo: item.appoNo ? item.appoNo + "号" : "",
          medBegTime: item.medBegTime,
          medEndTime: item.medEndTime,
          extend: item.extend ? item.extend : "",
        });
        return <option key={item.appoNo || index}
                       value={[item.appoNo || "", sourceItem.medBegTime, sourceItem.medEndTime, sourceItem.extend||""].join(",")}>{sourceItem.appoNo} {sourceItem.medBegTime}~{sourceItem.medEndTime}</option>
      })
    }
    </select>
  }

  submit(optType) {
    var {corpId, scheduleId, regType, medDate, medAmPm, regMode, deptCode, doctCode, patientId, feeChannel} = this.state;
    if (this.isNeedSource()) {
      var noList = this.refs.regNoList.value;// ? $(regNoList).val() : ",,,";
      var appoNo = noList.split(',')[0] || "";
      var medBegTime = noList.split(',')[1] || "";
      var medEndTime = noList.split(',')[2] || "";
      var extend = noList.split(',')[3] || "";
    }
    if (this.isNeedSource()) {
      if (this.isSourceEmpty()) {
        Alert.show("号源被抢光了！");
        return;
      }
    }

    if (!patientId) {
      Alert.show("请选择就诊人");
      return;
    }

    //下单
    UserCenter.appointCreateOrder( regMode, scheduleId, corpId, regType, deptCode, doctCode, medDate, appoNo, medAmPm, patientId, medBegTime, medEndTime, extend, optType, feeChannel)
      .subscribe({
        onSendBefore(){
          BlockLoading.show("请稍等...");
        },
        onComplete(e){
          BlockLoading.hide();
        },
        onSuccess: (result) => {
          //下单完成 弹出支付窗口，让用户选择支付方式
          let data = result.data;
          let {corpId, idStr} = result.data;
          if (regMode == 1) {//预约直接跳转
            //id变为idStr,因为超过了19位长度……
            window.location.replace(util.flatStr("./register-details-2.html?", {
              corpId,
              unionId:this.unionId,
              id:idStr,
              guide:1,
              target:"_blank"
            }));
          } else {
            //挂号弹出支付方式
            this.setState({submit: true, outId:idStr,expirationTime: data.expirationTime})
          }
        },
        onError(e){
          BlockLoading.hide();
          Alert.show(e.msg)
        }
      })
      .fetch()

  }

  //支付成功回调函数
  onPayComplate(isOkay) {
    let {corpId, outId} = this.state;

    setTimeout(() => {
      this.setState({submit: false})
      window.location.replace (util.flatStr("./register-details-2.html?", {
        corpId,
        unionId:this.unionId,
        id:outId,
        guide:1,
        openId:this.openId,
        target:"_blank"
      }))
    }, 2000)
  }

  //取消支付
  onPayCancel() {
    let {corpId, outId} = this.state;
    this.setState({submit: false})
    window.location.replace(util.flatStr("./register-details-2.html?", {
      corpId,
      unionId:this.unionId,
      id:outId,
      guide:1,
      openId:this.openId,
      target:"_blank"
    }))
  }
}