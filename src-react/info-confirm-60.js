"use strict";
import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent, SmartNoBlockComponent} from './BaseComponent/index'
import {BlockLoading} from './component/loading/index'
import cache from './lib/cache'
import Confirm2 from './component/confirm/Confirm2'
import Alert from './component/alert/alert'
import Pay_py from './component/pay/Pay60';
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import PayDialog_py from './component/pay/PayDialog60'
import TopTips from './component/TopTips/TopTips'
import JSBridge from './lib/JSBridge'
import './info-confirm-60.less'
import hybridAPI from './lib/hybridAPI'
export default class InfoConfrim60 extends SmartBlockComponent {
  constructor(props) {
    super(props);
    this.sid = util.getSID();
    var query = util.query();
    this.defaultPrice = query.regAmount || '';
    this.unionId = query.unionId;
    this.state = util.vis({
      isLogin: true,
      loading:true,
      success: false, 
      needSource: true,
      sourceEmpty: false,
      selectView:1,
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
      regType: query.regType,//预约 2 挂号 1
      regMode: query.regMode,//预约 1 挂号 2
      patientId: "", //就诊人
      patientName: "",
      sourceList: [],//号源
      sourceValue: "",//格式化后的号源字符串
      sourceArr:[],//格式化前的号源数组
      //订单生成以后会获得 outId(订单id)
      submit: null,
      outId: null,
      //支付方式 1、支付宝 2、微信 3、余额 4、到院支付
      feeChannel: null,
      patientCardCount:'',//选择的就诊人绑卡的数量
      patientIdType:'',//选定就诊人的类型 1成人 2儿童
      patientIdNo:'',//选定就诊人的身份号码  成为身份证  儿童监护人身份证
      showMask:false,//设置遮罩的显示状态,默认不显示
      notRecord:'',//未建档的就诊人的识别标志,
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
          this.updateSelectPatient(data.patientId, 
                                    data.patientName,
                                    data.patientCardCount,
                                    data.patientIdType,
                                    data.patientCardType,
                                    data.patientIdNo,
                                    data.notRecord);
        }
      }
    });
  }
  
  //更新用户选择的就诊人
  updateSelectPatient(
    patientId,
    patientName,
    patientCardCount,
    patientIdType,
    patientCardType,
    patientIdNo,
    notRecord) {
    this.setState({
      isLogin: true,
      patientId,
      patientName,
      patientCardCount,
      patientIdType,
      patientCardType,
      patientIdNo,
      notRecord
    })
    var self = this;
    let {corpId, regType, deptCode, doctCode, regMode, medAmPm, medDate, scheduleId, regAmount} = self.state;
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
    cache.set('patientCardCount',patientCardCount);
    cache.set('patientIdType',patientIdType);
    cache.set('patientIdNo',patientIdNo);
    cache.set('notRecord',notRecord);
  }

  componentDidMount() {
    //获取号源
    this.getNumberSource()
  }
  //获取号源
  getNumberSource(){
    let {corpId, regType, deptCode, doctCode, regMode, medAmPm, medDate, scheduleId} = this.state;
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
              //有号源就需要选择号源
              needSource: true,
              success: true,
              loading:false,
              sourceList: data.sourceList
            })
          } else {
            this.setState({
              //没有号源就不需要选择号源
              loading:false,
              success: true,
              needSource: false
            })
          }
          this.setPatient(cache.get("patientId"));
        },
        onError: (result) => {
          Alert.show(result.msg,1000)
          this.setState({
            loading:false,
            needSource: false
          });
        }
      }).fetch();
  }

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
          if (result.data){
            var patientList = result.data;
            var isSelect = false;
            var needDefault = cache.get("needDefault");
            // return
            _this.setState({
              isLogin: true,
            });
            // 默认就诊人改造
            //手动选择的就诊人
            for (var i = 0; i < patientList.length; i++) {
              if (patientId == patientList[i].id && needDefault == "false") {
                const lastSelectPatient = patientList[i]
                let idNo = lastSelectPatient.idType == 2 ? lastSelectPatient.guarderIdNo:lastSelectPatient.idNo;
                isSelect = true;
                const notRecord = lastSelectPatient.cardCount > 0? false:true; 
                _this.updateSelectPatient(lastSelectPatient.id,
                                         lastSelectPatient.patientName,
                                         lastSelectPatient.cardCount,
                                         lastSelectPatient.idType,
                                         lastSelectPatient.cardType,
                                         idNo,
                                         notRecord);
                break;
              }
            }
            //选择默认就诊人
            if (!isSelect) {
              for (var i = 0; i < patientList.length; i++) {
                if (patientList[i].default) {
                  const patientDefault = patientList[i]
                  const notRecord = patientDefault.cardCount > 0? false:true;
                  let idNo = patientDefault.idType == 2 ? patientDefault.guarderIdNo:patientDefault.idNo;
                    //如果默认就诊人未建档，或者已绑卡，可以展示，否则(建档未绑卡)不允许展示 
                    if(patientDefault.cardCount > 0){
                      _this.updateSelectPatient(patientDefault.id,
                                               patientDefault.patientName,
                                               patientDefault.cardCount,
                                               patientDefault.idType,
                                               patientDefault.cardType,
                                               idNo,
                                               notRecord
                                              );
                      break;
                    }
                    UserCenter.getCardUserCards(idNo, patientDefault.patientName).subscribe({
                      onSendBefore() {
                        BlockLoading.show("请稍后...");
                      },
                      onComplete() {
                        BlockLoading.hide();
                      },
                      onSuccess(result) {
                      },
                      onError(result) {
                        if(result.resultCode == 1000 ){//未建档默认就诊人
                          _this.updateSelectPatient(patientDefault.id,
                                                   patientDefault.patientName,
                                                   patientDefault.cardCount,
                                                   patientDefault.idType,
                                                   patientDefault.cardType,
                                                   idNo,
                                                   notRecord,
                           );
                        }
                      }
                    }).fetch()
                }
              }
            }
          }
        }
      })
      .fetch()
  }
  
  //支付类型发生变化(原PayDialog中的方法)
  onFeeChannelChange(feeChannel) {
    this.setState({
      feeChannel: feeChannel,
    })
  }

  //是否需要选择号源
  isNeedSource() {
    return this.state.needSource;
  }

  //号源是否为空
  isSourceEmpty() {
    return this.state.sourceEmpty;
  }

  //点击选择就诊人
  toPatientList(corpId, patientId ) {
    const { isLogin,regMode } = this.state;
    //如果在远图app中，在点击就诊人的时候就判断是否登录。如果不在远图app中，那么先前往就诊人列表然后再判断登录状态
    if ((util.isLogin() && isLogin) || !util.isInYuantuApp()) {
      window.location.href = `./patient-list.html?corpId=${corpId}&lastSelectPatientId=${patientId ? localStorage.getItem("patientId") : ''}&selectView=1&unionId=${this.unionId}&referrer=${encodeURIComponent(location.href)}&target=_blank&regMode=${regMode}&isFromInfoConfirm2=true`;
    } else {
      util.goLogin();
    }
  }

   //点击确定,取消文案提示
   cancelTips(type){
     //0:优惠  1:额外支付
    let _this = this
    this.setState({
      display: true,
      title: type==0?'优惠金额提示':'额外支付金额提示',
      des: type==0?'优惠可以为员工优惠,如有疑问请详询医院':'额外支付可能为儿童挂号加价,如有疑问请详询医院',
      confirmCallback: function (confirm) {
        _this.setState({
          display: false
        })
      }
    })
  }

  //渲染页面
  render(){
    const {scheduleId,selected, medAmPm,doctName,notRecord,showMask, medDate, patientIdType,regAmount,patientIdNo, deptName, corpName, corpId, needSource, patientId, patientName, discountFee, regMode, submit, outId, expirationTime,needDefault,patientCardCount,cancelText, okText,confirmCallback, display, title, des} = this.state;
    var ampm = {"1": "上午", "2": "下午"};
    var dayOfWeekList = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    var time = [medDate, dayOfWeekList[new Date(medDate).getDay()], ampm[medAmPm]].join(" ");
    //regMode 6 预约 3挂号
    var optType = regMode == 1 ? 6 : 3;
    let sourceList = this.state.sourceList;
    let sourceItem = null;
    //身份证信息隐私处理
    let hideIdNo;
    patientIdNo ? hideIdNo = patientIdNo:null;
    return (
      <div className="info-60_container">
         {/* 遮罩 */}
        <div className="mask" style={{display:showMask?'block':'none'}}></div>
        <div style={{overflowY:"scroll",position:"relative", height: "100%",paddingBottom:'60px'}} id="listItems">
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
              <span className="item">日期</span>
              <span className="item-inner txt-prompt" style={{color:'#429fff'}}>{time}</span>
            </li>
            <li>
              <span className="item">费用</span>
              <span className="item-inner txt-prompt"> <span style={{color:'#ff5256'}}>&yen;{util.rmb(regAmount / 100)}</span></span>
            </li>
          </ul>
          <ul className="list list-link">
            <li className="li_selectPatient">
              <div className="txt-arrowlink selectPatient">
                <span className="item" style={{color:'#666'}}>就诊人</span>
                <span style={{color:'#999'}}>请确保身份信息填写正确</span>
                <span  
                      id="gotoList"
                      onClick={() => this.toPatientList(corpId, patientId, patientName)}>选择就诊人</span>
              </div>    
            </li>
              {
                  patientName?
                  <li id="infoShow" className="txt-arrowlink">
                  <span>{patientName}</span>
                  {patientIdType == 1? //成人
                    <span style={{color:'#666'}}><i>身份证</i><i style={{color:"#666",marginLeft:'10px'}}>{hideIdNo}</i></span>
                      :
                    <span style={{color:'#666'}}><i>监护人身份证</i><i style={{color:"#666",marginLeft:'10px'}}>{hideIdNo}</i></span>
                    } 
                  </li>:null
              }
            {regMode == 1? <div className="space"></div>:null}
            {
              needSource ?
                <li className="txt-arrowlink"  onClick={this.handleChangeSource.bind(this)} id="patientTime">
                  <span className="patientTime">就诊时间段</span>
                  <span className="item-inner item-right" ref="showSource" style={{width: "120px"}}>
                  {this.renderSourceList()}
                  </span>
                  <span className="selectTime" ref="getSelectedTime">请选择</span>
                </li>
                : null
            }
          </ul>
              <div>
                <div>
                  {regMode == 1 && patientId ? //预约操作 
                <Pay_py
                  corpId={corpId}
                  unionId={this.unionId}
                  optType={optType}
                  patientId={patientId}
                  price={Number(util.rmb(discountFee / 100))}
                  onFeeChannelChange={this.onFeeChannelChange.bind(this)}
                  ></Pay_py>
                  : null}
                  </div>
              </div>
              {patientCardCount > 0 || notRecord ?
                  null:
                  <div className="msg-rules">
                  <a href="./rule.html?target=_blank">请遵守平台预约挂号规则</a>
                </div> 
                  }

          { regMode == 2 && patientId?
            <PayDialog_py
                ref="PayDialog"
                corpId={corpId}
                optType={optType}
                patientId={patientId}
                price={discountFee}
                optParam={{corpId:corpId, patientId:patientId, outId:outId}}
                onPayComplate={this.onPayComplate.bind(this)}
                onPayCancel={this.onPayCancel.bind(this)}
                expirationTime={expirationTime}
                redirect={ util.flatStr(util.h5URL("/register-details-2.html?"), {corpId, unionId:this.unionId,pay:1,id:outId, guide:1}) }
              /> : null
          }
          <div className="confirm">
            <div className="pay-info">
                  {
                    regAmount - discountFee > 0  ?
                    <span className="discount" onClick={()=>this.cancelTips(0)}>
                      <span className="txt-info">已优惠 </span>
                      <span className="txt-info">&yen;{util.rmb((regAmount - discountFee) / 100)}</span>
                      <span className='yiwen'/>
                    </span>:
                    regAmount - discountFee < 0?
                    <span className="discount" onClick={()=>this.cancelTips(1)}>
                      <span className="txt-info">额外付 </span>
                      <span className="txt-info">&yen;{util.rmb((discountFee - regAmount) / 100)}</span>
                      <span className='yiwen'/>
                    </span>
                      : <span className="discount"></span>} 
                  <span className="notDiscount">
                    <span style={{fontSize:'14px'}}>应付 </span>
                    <span className="cost">&yen;{util.rmb(discountFee / 100)}</span>
                  </span>
              </div>
            { regMode == 1?
              <button className="confirmBtn" onClick={this.submit.bind(this, optType)} ref="confirmBtn">
              确认预约
              </button>
            : 
            <button className="confirmBtn"  onClick={this.submit.bind(this, optType)} ref="confirmBtn">
              确认挂号
              </button>
              }
          </div>
        </div>
          <div style={styles.tips} ref="tips">
                  <div style={styles.title}>
                    <div onClick={this.cancelSourceList.bind(this)} className="cancel">取消</div>
                    <div style={{color:'#333'}}>选择就诊时间段</div>
                    <div ref="isConfirm" onClick={(e)=>this.selectTime(e)} className="isConfirm">确认</div>
                  </div>
                  <div style={styles.sourceList} className="sourceList-item-overflow"  ref="sourceList" id="sourceList">
                    {
                    sourceList.map((item, index) => {
                      sourceItem = util.vis({
                        appoNo: item.appoNo ? item.appoNo + "号" : "",
                        medBegTime: item.medBegTime,
                        medEndTime: item.medEndTime,
                        extend: item.extend ? item.extend : "",
                      });
                      return <div onClick={(e)=>this.selectSourceItem(e)} 
                                  style={styles.sourceItem} 
                                  className="selectSourceItem"
                                  key={item.appoNo || index}
                                  ref="timeItem"
                                  data-value={[item.appoNo || "", sourceItem.medBegTime, sourceItem.medEndTime, sourceItem.extend||""].join(",")}>
                                    {sourceItem.appoNo} {sourceItem.medBegTime}-{sourceItem.medEndTime}
                              </div>
                    })
                  } 
                  </div>
            </div>
            <Confirm2 title={title} des={des} cancelText={cancelText} okText={okText} display={display}
                 callback={confirmCallback} showCancelBtn={1}/>
      </div> 
    )
  }

  handleChangeSource() { // 点击选择号源从下弹起div
    let tips = this.refs.tips;
    tips.style.bottom = "0px";    
    tips.style.opacity = "1";    
    //设置遮罩显示状态
    this.setState({
      showMask:!this.state.showMask
    })
    //禁用外层页面滚动条
    const isInYuantuApp = util.isInYuantuApp()
    if(isInYuantuApp){//在远图App中
        hybridAPI.interceptRefreshLayout(true)
    }else{
      document.body.style.overflow = 'hidden'
      document.body.ontouchmove = function(){
        event.preventDefault};//阻止body的滑动事件
    }
  }

  //点击选择就诊时间
  selectSourceItem(e){
    this.setState({
      sourceValue: e.target.innerText, //号源字符串
      sourceArr:e.target.dataset.value
    })
    let divs =  e.target.parentElement.children
    for(let i =0 ,length = divs.length;i<length;i++){
        divs[i].style.backgroundColor ="#fff"
        divs[i].style.color ="#429fff"
    }
    e.target.style.backgroundColor= "#429fff";
    e.target.style.color ="#fff";
  }

  //选中号源后点击确定
  selectTime(){
    this.refs.timeItem.style.backgroundColor = "#fff"
    this.refs.timeItem.style.color ="#429fff"
    let getSelectedTime = this.refs.getSelectedTime
    getSelectedTime.innerText = this.state.sourceValue
    if(!getSelectedTime.innerText){
      Alert.show('您未选择就诊时间!',1000)
      return
    }
    //隐藏遮罩
    this.setState({
      showMask:!this.state.showMask
    })
    //号源弹出div隐藏
    let tips = this.refs.tips
    tips.style.bottom = '-252px'
    tips.style.opacity = "0";   
    const isInYuantuApp = util.isInYuantuApp()
    if(isInYuantuApp){//在远图App中
      hybridAPI.interceptRefreshLayout(false)
    }else{
        //恢复页面滚动条及上下拉功能
      document.body.style.overflow = 'scroll'
    }
  }

  //点击取消选择号源
  cancelSourceList(){
    let tips = this.refs.tips;
    tips.style.bottom = "-252px";
    tips.style.opacity = "0";   
    this.setState({
      showMask:!this.state.showMask,
    })
    const isInYuantuApp = util.isInYuantuApp()
    if(isInYuantuApp){//在远图App中
    hybridAPI.interceptRefreshLayout(false)
    }else{
      //恢复页面滚动条
    document.body.style.overflowY = 'scroll'
    }
  }

  renderSourceList() {
    let sourceList = this.state.sourceList;
    let sourceItem = null;
    if (sourceList.length == 0) {
      return null
    }
  }

  submit(optType) {
    const _this = this
    var {corpId, scheduleId, regType, medDate, medAmPm, regMode, deptCode, doctCode, patientId, feeChannel} = _this.state;
    if (!patientId) {
      Alert.show("请选择就诊人",1000);
      return;
    }
    if (_this.isNeedSource()) {
      //预约选定的就诊时间
      var noList =_this.state.sourceArr;
      if(noList.length == 0){
        Alert.show('请选择就诊时间段!',1000)
        return
      }
      var appoNo = noList.split(',')[0] || "";
      var medBegTime = noList.split(',')[1] || "";
      var medEndTime = noList.split(',')[2] || "";
      var extend = noList.split(',')[3] || "";
    }
    if (_this.isNeedSource()) {
      if (_this.isSourceEmpty()) {
        Alert.show("号源被抢光了！",1000);
        return;
      }
    }
    _this.refs.confirmBtn.style.disabled = 'disabled'//下单过程中禁用点击按钮
    _this.refs.confirmBtn.style.backgroundColor = '#cccccc'//样式改变,给用户友好体验
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
          let data = result.data;
          let {corpId, idStr} = result.data;
          if (regMode == 1) {//预约直接跳转
            //id变为idStr,因为超过了19位长度……
            location.replace(util.flatStr("./register-details-2.html?", {
              corpId,
              unionId:_this.unionId,
              id:idStr,
              guide:1,
              target:"_blank"
            }));
          } else {//挂号操作
            //挂号弹出支付方式
            _this.setState({outId:idStr,expirationTime: data.expirationTime})
            //调用PayDialog子组件中挂号提交支付的方法
            _this.refs.PayDialog.onPaySubmit()
          }
        },
        onError(e){
          _this.refs.confirmBtn.style.disabled = ''//预约失败恢复按钮
          _this.refs.confirmBtn.style.backgroundColor = '#429fff'//样式恢复
          BlockLoading.hide();
          Alert.show(e.msg,1000)
        }
      })
      .fetch()

  }

  //支付成功回调函数
  onPayComplate(isOkay) {
    let {corpId, outId} = this.state;

    setTimeout(() => {
      window.location.replace(util.flatStr("./register-details-2.html?", {
        corpId,
        unionId:this.unionId,
        id:outId,
        guide:1,
        target:"_blank"
      }))
    }, 2000)
  }

  //取消支付
  onPayCancel() {
    let {corpId, outId} = this.state;
    this.setState({submit: false})
    window.location.replace ( util.flatStr("./register-details-2.html?", {
      corpId,
      unionId:this.unionId,
      id:outId,
      guide:1,
      target:"_blank"
    }))
  }
  
}

const styles = {
  tips: {
    position: "fixed",
    height: "252px",
    bottom: "-252px",
    opacity:'0',
    width: "100%",
    zIndex:'9999',
    backgroundColor: "#ffffff",
    transition: " all .5s",
  },
  title: {
    display: "flex",
    height: "46px",
    alignItems: "center",
    justifyContent: "space-between",
    padding:"0 15px",
    boxSizing:"borderBox",
    borderBottom:'1px solid #b2b2b2'
  },
  sourceList: {
    position:'absolute',
    width: "100%",
    padding:'0px 8px 25px 8px',
    fontSize: "11px",
    boxSizing: "border-box",
    height: "216px",
    overflowY: "scroll",
    WebkitOverflowScrolling: 'touch',
    cursor: "pointer",
  },
  sourceItem: {
    float:'left',
    width:"32%",
    color:"#429fff", 
    textAlign: "center",
    boxSizing: "border-box",
    padding: "10px 0px",
    marginTop:'25px',
    border:" 1px solid #429fff",
    borderRadius:"6px",
    borderSizing:"borderBox"
  }

}