import React from 'react'
import {SmartBlockComponent} from '../../BaseComponent'
import UserCenter from '../../module/UserCenter'
import Alert from '../../component/alert/alert'
import util from '../../lib/util'
import Pay from './Pay'
import hybridAPI from '../../lib/hybridAPI'
import CountDown from '../../component/CountDown'
import OrderAndPayModule from '../../module/OrderAndPayModule'
import WXOpenIdModule from '../../module/WXOpenIdModule'

/**

  corpId:
  optType 业务类型 //1、充值 2、缴费 3、挂号 5、预约
  patientId:
  price:
  optParam: 业务参数
  expirationTime:  倒计时  有值标示需要倒计时，不需要倒计时不用传次参数
  redirect: 绑卡完成后需要跳转的页面（这个设计很糟糕，但是没有办法）
  feeChannel 支付方式  //1、支付宝 2、微信 3、余额 5、到院支付

  <PayDialog corpId={corpId} optType={optType} patientId={patientId} optParam={optParam} price={price} />
*/


export default class PayDialog extends React.Component {

  constructor(props){
    super(props)
    this.state = {
      //自己定义的状态
      payStatus:100, //100等待选择 101支付中 102 获取支付结果 200 支付成功 300 支付失败
      //倒计时，倒计时结束会调用  支付取消接口
      expirationTime:this.props.expirationTime,
      feeChannel:null,
      countDownTime:"",
      msg:"",
      cardId: '',
      balance:'',
    }
    this.openId=null
    this.propsOnPayComplate = this.props.onPayComplate;
    this.propsOnPayCancel = this.props.onPayCancel;
  }
  
  componentDidMount() {
    let {expirationTime} = this.props;
    if(expirationTime){
      this.countdown = new CountDown(expirationTime, (time, s, f, m)=>{
        this.setState({countDownTime: f>0 ? f+":"+m : m+"秒"});
        if(time <= 0){
          this.onPayCancel();
        }
      }).start();
      
    }
    // if(util.isInMicroMessenger()){
    //   this.getWXOpenId();
    // }
  }
  // getWXOpenId(){
  //   let {corpId, optType, optParam} = this.props;
  //   new WXOpenIdModule(corpId, optType)
  //   .subscribe({
  //     onSuccess:(result)=>{
  //       this.openId = result.data.openId;
  //       console.log(this.openId)
  //     },
  //     onError:(result)=>{
  //       Alert.show(result.msg)
  //     }
  //   }).fetch();
  // }
  componentWillUnmount(){
    this.countdown && this.countdown.stop();
  }
  onPayComplate(isOkey, id, result, msg){
    //只会触发一次
    this.propsOnPayComplate && this.propsOnPayComplate(isOkey, id, result, msg);
    this.propsOnPayComplate = null
  }

  onPayCancel(){
    //只会触发一次
    this.propsOnPayCancel && this.propsOnPayCancel();
    this.propsOnPayCancel = null
  }
  //支付类型发生变化
  onFeeChannelChange(feeChannel, cardId,cardNo){
    this.setState({
      feeChannel:feeChannel,
      cardId,
      cardNo
    })
    } 
  getBalance(balance){
    this.setState({
      balance:balance
    })
  }
  onPaySubmit(){
    let { corpId, optType, optParam,isGraphic} = this.props;
    let {feeChannel, cardId,cardNo} = this.state;
    optParam.cardId = cardId;
    optParam.cardNo = cardNo;
    // this.props.onFeelChange?this.props.onFeelChange(feeChannel):''
    new OrderAndPayModule(corpId, feeChannel, optType, optParam, this.props.redirect,isGraphic)
    .subscribe({
      onSendBefore:(result)=>{
        this.setState({
          payStatus:101,
          msg:result.msg
        })
      },
      onSuccess:(result)=>{
        this.setState({
          payStatus:200,
          msg:result.msg
        })
        
        this.props.onPayComplate && this.props.onPayComplate(true)
      },
      onError:(result)=>{
        this.setState({
          payStatus:300,
          msg:result.msg
        })
        this.props.onPayComplate && this.props.onPayComplate(false)
      }
    })
    .fetch()
  }
  onPaySubmitNone(){
    let { feeChannel, balance } = this.state;
    if (!feeChannel){
      Alert.show('就诊人未绑定就诊卡');
      return;
    }
  }

  render(){

    let {corpId, optType, patientId, price, redirect,regType} = this.props;
    let {payStatus, countDownTime, msg, feeChannel,balance} = this.state;
    //到院支付不能显示 “支付成功” 只能显示 “成功”
    let className = {
      101:"topo-loading-icon topo-loading",
      102:"topo-loading-icon topo-loading",
      200:"topo-loading-icon topo-success",
      300:"topo-loading-icon topo-error",
    }[payStatus] || "topo-loading-icon topo-loading";
    return (
      <div className="pay-manner-wrapper">
        <div className="pay-manner-panel" style={{ height: screen.height < 600 ? '360px' : '440px' }}>
          <div className="pay-manner-title">
            <span className="icon-fork" onClick={this.onPayCancel.bind(this)}></span>
            支付方式
          </div> 
          <Pay corpId={corpId} redirect={redirect} optType={optType} patientId={patientId} price={price} regType={regType} onFeeChannelChange={this.onFeeChannelChange.bind(this)} getBalance={this.getBalance.bind(this)}/>
          {(balance < util.rmb(price / 100) && regType == 6 && feeChannel==3) || (!feeChannel && regType == 6) ? <button className="btn btn-block method-btn " style={{ background: '#ddd', color: '#666' }} onClick={this.onPaySubmitNone.bind(this)}>
            {feeChannel != 4 ? `确认支付￥${util.rmb(price / 100)}` : "确认到院支付"}
            {countDownTime ? ` (还剩${countDownTime})` : null}
          </button>:
          <button className="btn btn-block method-btn" onClick={this.onPaySubmit.bind(this)}>
            {feeChannel != 4 ? `确认支付￥${util.rmb(price/100)}` : "确认到院支付"}
            {countDownTime ? ` (还剩${countDownTime})` : null}
          </button>
          }
          {
            payStatus != 100 ? (
              <div className="topo-loading-mask ">
                <div className="topo-loading-wrapper">
                  <div className={className}></div>
                  <div className="topo-loading-describe">{msg}</div>
                </div>
              </div>
            ) : null
          }
        </div>
      </div>
    )
  }
}