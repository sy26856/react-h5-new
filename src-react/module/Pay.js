
import UserCenter from './UserCenter'
import hybridAPI from '../lib/hybridAPI'
import Alert from '../component/alert/alert'
import {BlockLoading} from '../component/loading/index'

class PayModule {
  constructor(feeChannel, optType, optParam){

    this.feeChannel = feeChannel;
    this.optType = optType;
    this.optParam = optParam;

  }
  pay(){

    var self = this;
    //生成支付订单
    UserCenter.preCharge(this.feeChannel, this.optType, this.optParam)
    .subscribe({
        onSendBefore(){
          // console.log("onSendBefore")
          BlockLoading.show("正在生成订单...");
        },
        onComplete(){
          BlockLoading.hide();
          // console.log("onComplete")
        },
        onSuccess( result ){
          // console.log("onSuccess")
          self.onSuccess( result )
        },
        onError(){
          BlockLoading.hide();
          Alert.show("生成订单错误，请稍后再试");
          console.log("onError")
        }
    })
    .fetch()

  }
  //支付订单生成成功
  preChargeSuccess(result){
    let tradeData = result.data;
    if(tradeData.status == 200){
      this.onPayComplate(true, tradeData.id, result, "成功");
      return 
    }

    //101 ，100  才是新订单的状态
    if(tradeData.status == 101 || tradeData.status == 100){
      //检查必要参数
      // this.checkPayResult( tradeData.data );
      //余额支付 到院支付 不需要走一下流程
      if( this.feeChannel == 3 || this.feeChannel == 5 ){
        //轮训支付结果 //支付流水号
        this.roundGetStatus( tradeData.id );
        return;
      }
      //微信内 微信 支付
      if( this.feeChannel == 2 && this.util.isInMicroMessenger() ){
        this.micorMessengerPay( tradeData );
        return ;
      }

      this.yuanTuPay( tradeData )

    }else{
      //已经创建过的订单 直接查询订单状态
      // this.util.waitAlert("正在获取上次支付结果");
      // setTimeout(function(){
      this.roundGetStatus( tradeData.id );
      // }, 1500);
    }
  }
  //轮训支付结果
  roundGetStatus(id){

    
    BlockLoading.show("正在获取支付结果...")

    var io = this.io;
    var self = this;
    var timeid = null;
    function round(){

      UserCenter.getPayStatus(id)
      .subscribe({
        onComplete(result){
          if( result && result.success ){

            var status = result.data.status;
            var isOkay = status == "300";

            //失败或者成功就不再刷新了
            // if( status == "300" || status == "301" || status == "201" || status == "400" ){
            if( status != "101" ){
              //不是支付中.. 就不用轮训了。
              clearTimeout( timeid );
              BlockLoading.hide();
              self.onPayComplate( isOkay, id, result, STATUS_CODE[status] || "失败");
            }

          }
        }
      }).fetch();

      timeid = setTimeout(function(){
        round();
      }, 3000);
    }

    round();

    //60秒以后不返回 ==> 无法发获得支付结果
    setTimeout(function(){
      BlockLoading.hide();
      self.onPayComplate(false, id, {msg:"无法获得支付结果"}, "无法获得支付结果");
    }, 1000*60);

  }
  //微信内支付
  micorMessengerPay(){
    Alert.show('微信内支付未上线，请选择其他支付方式')
  }
  //远图客户端中支付
  yuanTuPay(){
    var self = this;
    //流水号id
    var id = tradeData.id;

    // this.util.waitAlert("正在支付...");

    // key 改变 适配 app
    //tradeData.data.out_trade_no = tradeData.data.outTradeNo;
    //tradeData.data.out_trade_no = tradeData.outTradeNo;

    //调用支付brige
    hybridAPI.pay(this.feeChannel, tradeData.data, function(result){
      try{
        var data = result.data ? JSON.parse(result.data) : null;
        // self.util.waitHide();
        if( result.ret == "SUCCESS" && data){
          // (支付宝) || (微信)
          if( (self.feeChannel == 1 && data.resultStatus == "9000") || (self.feeChannel == 2 && data.resultStatus == "0") ){
            self.roundGetStatus( id );
          }else if( data && data.resultStatus ){
            Alert.show(STATUS_CODE[data.resultStatus] || "支付失败，错误码:"+ data.resultStatus);
          }else{
            Alert.show("由于网络问题未能获取订单状态");
          }
        }else{
          Alert.show("支付遇到问题，请稍后再试");
        }
      }catch(e){
        // self.util.alert("没有正确获取支付状态，请到账单中查看!");
        self.roundGetStatus( id );
      }
    }, function(result){
      result = result || {}
      self.util.alert(result.msg || "调用支付接口失败");
    })
  }
  onPayComplate(isOkay, id, result,msg){

  }
}