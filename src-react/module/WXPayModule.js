/**
  微信内支付

  new WXPayModule(param).subscribe({
    onSuccess(){

    }
    onError(){

    }
  }).fetch();
*/
import JSONPAsyncData from '../lib/JSONPAsyncData'

export default class WXPayModule extends JSONPAsyncData{
  constructor(param){
    super()
    /**
      appid: "wxe9062380f1a04582"
      mch_id: "1279981801"
      nonceStr: "SU1449728064"
      notify_url: "http://api.daily.yuantutech.com/user-web/restapi/common/wx/payNotify"
      partner: "1279981801"
      paySign: "623076DB37F46CBED4E4C52874204723"
      prepayId: "wx2015121014142451ed3c87c70557435178"
      signType: "MD5"
      timeStamp: "1449728064"
    */

    this.param = param;

  }

  fetch(){
    /**
      appid: "wxe9062380f1a04582"
      mch_id: "1279981801"
      nonceStr: "SU1449728064"
      notify_url: "http://api.daily.yuantutech.com/user-web/restapi/common/wx/payNotify"
      partner: "1279981801"
      paySign: "623076DB37F46CBED4E4C52874204723"
      prepayId: "wx2015121014142451ed3c87c70557435178"
      signType: "MD5"
      timeStamp: "1449728064"
    */
    //验证服务端返回的参数
    let param = this.param;
    if(!param.appid || !param.timeStamp || !param.nonceStr || !param.prepayId || !param.paySign){
      this.emit(this.ERROR, {
        sucess:false,
        msg:"缺少必要参数 appid, timeStamp, nonceStr, prepay_id, paySign 其中一项"
      })
    }

    var self = this;

    function onBridgeReady(){
      self.bridgePay( param.appid, param.timeStamp, param.nonceStr, param.prepayId, param.paySign );
    }

    if (typeof WeixinJSBridge == "undefined"){
       if( document.addEventListener ){
           document.addEventListener('WeixinJSBridgeReady', onBridgeReady, false);
       }else if (document.attachEvent){
           document.attachEvent('WeixinJSBridgeReady', onBridgeReady);
           document.attachEvent('onWeixinJSBridgeReady', onBridgeReady);
       }
    }else{
       onBridgeReady();
    }
  }

  bridgePay(appId, timeStamp, nonceStr, prepay_id, paySign){
    var self = this;
    self.emit(self.SEND_BEFORE, {msg:"正在使用微信支付...", success:false})
    WeixinJSBridge.invoke(
     'getBrandWCPayRequest', {
         "appId":appId,     //公众号名称，由商户传入
         "timeStamp":timeStamp,         //时间戳，自1970年以来的秒数
         "nonceStr":nonceStr, //随机串
         "package":"prepay_id="+prepay_id,
         "signType":"MD5",         //微信签名方式：
         "paySign":paySign //微信签名
     },
     function(res){
         //get_brand_wcpay_request：cancel 取消
         //get_brand_wcpay_request：ok 成功
         //get_brand_wcpay_request：fail 错误
         //注：JS API的返回结果get_brand_wcpay_request：ok仅在用户成功完成支付时返回。由于前端交互复杂，get_brand_wcpay_request：cancel或者get_brand_wcpay_request：fail可以统一处理为用户遇到错误或者主动放弃，不必细化区分。
         var msg = res.err_msg;
         if( msg == "get_brand_wcpay_request:ok"){
           self.emit(self.SUCCESS, {msg:"支付成功", success:true})
         }else if( msg == "get_brand_wcpay_request:cancel"){
           self.emit(self.ERROR, {msg:"取消支付", success:false})
         }else{
           self.emit(self.ERROR, {msg:"支付遇到错误，请稍后再试", success:false})
         }
     }
   );
  }
}
