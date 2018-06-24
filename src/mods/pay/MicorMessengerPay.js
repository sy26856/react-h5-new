/**		
	在微信公众号内支付

	参考文档： https://pay.weixin.qq.com/wiki/doc/api/jsapi.php?chapter=7_7&index=6

*/
define("mods/pay/MicorMessengerPay",function(require, exports, module){

	var PageModule = require("component/PageModule");
	
	var MicorMessengerPayModule = PageModule.render({
		/*
			param = {
				appId:"",应用id
				timeStamp: //时间戳，自1970年以来的秒数
				nonceStr:"" //随机串
				signType:"MD5"//签名方式
				paySign:"" //微信签名
			}
		*/
		pay:function( param ){

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
			
			if(!param.appid || !param.timeStamp || !param.nonceStr || !param.prepayId || !param.paySign){
				// this.uitl.alert("缺少必要参数")
				console.log("缺少必要参数 appid, timeStamp, nonceStr, prepay_id, paySign 其中一项");
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
		},

		bridgePay:function(appId, timeStamp, nonceStr, prepay_id, paySign){
			var self = this;
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
		       	   	self.onPayComplate("ok");
		       	   }else if( msg == "get_brand_wcpay_request:cancel"){
		       	   	self.onPayComplate("cancel")
		       	   }else{
		       	   	self.onPayComplate("fail");
		       	   }
		       }
		   );
		},

		onPayComplate:function( status ){

		}
	});

	module.exports = MicorMessengerPayModule;
});