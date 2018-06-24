/**
	封装支付接口的调用
	* 参考支付接口 http://gitlab.yuantutech.com/yuantu/usercenter/wikis/fee_interface

	支付方式，业务类型，业务参数
	.pay(feeChannel, optType, optParam);
	.onPayComplate
*/
define("mods/pay/pay",function(require, exports, module){

	var STATUS_CODE = {
		//支付宝
		"9000":"订单支付成功",
		"8000":"订单处理中...",
		"4000":"订单支付失败",
		"6001":"已取消支付", //用户中途取消
		"6002":"网络错误，未获得支付结果",
		//微信
		"0":"订单支付成功",
		"-1":"支付失败",
		"-2":"取消支付",
		//余额
		"100":"待处理",
		"101":"支付中...",
		"200":"支付成功，等待医院处理",
		"201":"支付失败",
		"202":"充值撤销成功",
		"203":"消费冲正成功",
		"300":"支付成功",
		"301":"支付成功，医院处理失败",
		"400":"失效订单",
		"605":"医院手动退费成功",
		"606":"医院手动退费失败",
		"500":"退费成功",
		"501":"退款失败"
	};

	var domainName = config.domainName; 

	//支付场景
	/**
		公众号内： JSAPI,
		在远图的app中: APP
	*/
	var TRADE_TYPE = {
		"JSAPI":"JSAPI",// 公众号内
		"APP":"APP",
		"DEFAULT":"default"
	};


	var PageModule = require("component/PageModule");

	var payModule = PageModule.render({

		STATUS_CODE:STATUS_CODE,

		/**
			feeChannel 支付方式	 //1、支付宝 2、微信 3、余额 5、到院支付 6支付宝网页支付
			optType 业务类型 //1、充值 2、缴费 3、挂号 5、预约
			optParam 业务参数
		*/
		pay:function(feeChannel, optType, optParam){
			this.feeChannel = feeChannel;
			this.optType = optType;
			this.optParam = optParam;

			//todo
			// optParam.corpId="549"
			var param = $.extend({
				feeChannel:feeChannel,
				optType:optType,
				corpId:this.query.corpId,
				unionId:this.query.unionId,
			}, optParam || {});

		
			//JSAPI 如果在微信中 使用微信支付，则使用JSAPI的方式
			//如果在微信中，又选择了微信支付，就走公众号支付流程
			if( this.util.isInMicroMessenger() && feeChannel == 5){
				param.tradeType = "JSAPI";
				// this.preCharge(param);
			}else{
				param.tradeType = "APP";
			}
			//支付宝网页支付 支付完成后需要一个前端返回页面
			if(feeChannel == 6 && !param.returnUrl){
				// param.returnUrl = window.location.href;
				//只用web支付的结果都跳转到账单详情页面
				param.returnUrl = this.util.h5URL("/pay-status.html?"+this.util.flat({
					unionId:this.query.unionId,
					successUrl:encodeURIComponent(window.location.href)
				}));
			}
			this.preCharge(param);

		},
		
		preCharge(param){
			this.util.waitAlert("正在生成订单...");
			this.get("/user-web/restapi/account/preCharge", param);
		},
		//检查微信支付，支付宝支付 的返回参数
		checkPayResult:function(data){

			if( this.feeChannel == 1 ){
				if( !data.notify_url || !data.partner || !data.total_fee ){
					this.util.alert("notify_url, partner, total_fee");
					return false;
				}
			}

			if( this.feeChannel == 2 ){
				if( !data.appid || !data.mch_id || !data.notify_url || !data.partner || !data.prepayId  ){
					this.util.alert("appid, mch_id, notify_url, partner, prepayId");
					return false;
				}
			}

			return true;
		},

		onSuccess:function( result ){


			var tradeData = result.data;
			var self = this;

			//医保支付流程
			//医保支付需要跳转到第三方医保页面进行支持
			let feeChannel = tradeData.feeChannel || this.feeChannel;
			
			if(feeChannel == 7){
				this.payType7Action( result );
				return ;
			}

			//直接返回 200标示支付成功，到院支付没有id 请注意
			if(tradeData.status == 200){
				self.onPayComplate( true, tradeData.id, result, "成功");
				return ;
			}


			//101 ，100  才是新订单的状态
			if(tradeData.status == 101 || tradeData.status == 100){
				//检查必要参数
				this.checkPayResult( tradeData.data );


				//余额支付 到院支付 不需要走一下流程
				if( feeChannel == 3 || feeChannel == 4 ){
					//轮训支付结果 //支付流水号
					this.roundGetStatus( tradeData.id );
					return;
				}
				//微信内 微信 支付
				if( feeChannel == 5 && this.util.isInMicroMessenger() ){
					this.micorMessengerPay( tradeData );
					return ;
				}

				//支付宝服务窗
				if(feeChannel == 6){
					this.aliPayWebPay(tradeData)
				}

				this.yuanTuPay( tradeData )

			}else{
				//已经创建过的订单 直接查询订单状态
				this.util.waitAlert("正在获取上次支付结果");
				setTimeout(function(){
					self.roundGetStatus( tradeData.id );
				}, 1500);
			}

		},

		//微信环境中支付
		micorMessengerPay:function(tradeData){
			//调用微信支付逻辑
			var self = this;
			seajs.use("mods/pay/MicorMessengerPay", function( MicorMessengerPay ){
				MicorMessengerPay.onPayComplate = function( status ){
					if( status == "ok" ){
						self.roundGetStatus(tradeData.id);
					}else if(status == "cancel"){
		       	self.util.alert("取消支付");
					}else{
		       	self.util.alert("支付失败");
					}
				};
				MicorMessengerPay.pay(tradeData.data);
			});
			// alert("微信内支付");
		},

		//远图app中支付
		yuanTuPay:function( tradeData ){


			var self = this;
			//流水号id
			var id = tradeData.id;

			this.util.waitAlert("正在支付...");

			// key 改变 适配 app
			//tradeData.data.out_trade_no = tradeData.data.outTradeNo;
			//tradeData.data.out_trade_no = tradeData.outTradeNo;

			//调用支付brige
			this.util.pay(this.feeChannel, tradeData.data, function(result){
				try{
					var data = result.data ? JSON.parse(result.data) : null;
					self.util.waitHide();

					if( result.ret == "SUCCESS" && data){
						// (支付宝) || (微信)
						if( (self.feeChannel == 1 && data.resultStatus == "9000") || (self.feeChannel == 2 && data.resultStatus == "0") ){
							self.roundGetStatus( id );
						}else if( data && data.resultStatus ){
							self.util.alert(STATUS_CODE[data.resultStatus] || "支付失败，错误码:"+ data.resultStatus);
						}else{
							self.util.alert("由于网络问题未能获取订单状态");
						}
					}else{
						self.util.alert("支付遇到问题，请稍后再试");
					}
				}catch(e){
					// self.util.alert("没有正确获取支付状态，请到账单中查看!");
					self.roundGetStatus( id );
				}
			}, function(result){
				result = result || {}
				self.util.alert(result.msg || "调用支付接口失败");
			})
		},

		//轮训支付结果
		roundGetStatus:function(id){

			this.util.waitAlert("正在获取支付结果...");

			var io = this.io;
			var self = this;
			var timeid = null;
			var corpId = this.query.corpId;
			var unionId = this.query.unionId || '';

			function round(){

				io.get("/user-web/restapi/pay/query/status", {id:id, corpId:corpId, unionId:unionId}, function( result ){

					
					if( result && result.success ){


						var status = result.data.status;
						var isOkay = status == "300";
						//失败或者成功就不再刷新了
						// if( status == "300" || status == "301" || status == "201" || status == "400" ){
						if( status != "101" ){
							//不是支付中.. 就不用轮训了。
							clearTimeout( timeid );
							self.onPayComplate( isOkay, id, result, STATUS_CODE[status] || "失败");
						}

					}
				}, function(){});

				timeid = setTimeout(function(){
					round();
				}, 3000);
			}

			round();

			//60秒以后不返回 ==> 无法发获得支付结果
			setTimeout(function(){
				self.onPayComplate(false, id, {msg:"无法获得支付结果"}, "无法获得支付结果");
			}, 1000*60);

		},

		payType7Action( result ){

			if(result.success && result.data.data){
				var tradeData = result.data.data;
				tradeData.RedirectUrl = window.location.href;
				var keys = Object.keys(tradeData);
				
				let form = document.createElement("form");
				form.method="post";
				form.action = tradeData["postUrl"];
				form.id = "J_Pay7";
				keys.map((key)=>{
					let input = document.createElement("input");
					input.type="hidden";
					input.name=key;
					input.value= tradeData[key];
					form.appendChild(input);

				});
				
				$(document.body).append( form );
				$('#J_Pay7').submit();//把支付数据提交到第三方
			}else{
				this.util.alert("支付失败，请稍后再试");
			}
		},
		roundGetStatusByOutId(out_trade_no){
			this.util.waitAlert("正在获取支付结果...");

			var io = this.io;
			var self = this;
			var timeid = null;
			var corpId = this.query.corpId;
			var unionId = this.query.unionId || '';

			function round(){

				io.get("/user-web/restapi/pay/query/status", {out_trade_no:out_trade_no, corpId:corpId, unionId:unionId}, function( result ){

					
					if( result && result.success ){


						var status = result.data.status;
						var isOkay = status == "300";
						//失败或者成功就不再刷新了
						// if( status == "300" || status == "301" || status == "201" || status == "400" ){
						if( status != "101" ){
							//不是支付中.. 就不用轮训了。
							clearTimeout( timeid );
							self.onPayComplate( isOkay, result.data.id, result, STATUS_CODE[status] || "失败");
						}

					}
				}, function(){});

				timeid = setTimeout(function(){
					round();
				}, 3000);
			}

			round();

			//60秒以后不返回 ==> 无法发获得支付结果
			setTimeout(function(){
				self.onPayComplate(false, id, {msg:"无法获得支付结果"}, "无法获得支付结果");
			}, 1000*60);

		},
		//支付宝网页支付
		aliPayWebPay(tradeData){
			/**
				paramMap.put("service", "alipay.wap.create.direct.pay.by.user");
        paramMap.put("partner", zfbPartner);
        paramMap.put("seller_id", zfbSellerId);
        paramMap.put("input_charset", AlipayConfig.input_charset);
        paramMap.put("payment_type", payment_type);
        paramMap.put("notify_url", AlipayConfig.ALIPAY_NOTIFY_URL);
        paramMap.put("return_url", AlipayConfig.ALIPAY_RETURN_URL);
        paramMap.put("out_trade_no", platfomFeeLogDO.getOutTradeNo());
        paramMap.put("subject", platfomFeeLogDO.getSubject());
        paramMap.put("total_fee", String.valueOf(platfomFeeLogDO.getFee()));
        paramMap.put("show_url", AlipayConfig.ALIPAY_SHOW_URL);
        paramMap.put("it_b_pay", "90m");  //交易超时时间，从点击付款开始，到了超时时间，如果还没有支付，交易订单将关闭
        paramMap.put("body", platfomFeeLogDO.getSubject());

        String createLinkString = AlipayCore.createLinkString(AlipayCore.paraFilter(paramMap));
        String sign = RSA.sign(createLinkString, alipayPrivateRsa, AlipayConfig.CHARSET);
        log.info("生成支付宝签名{}", sign);
        paramMap.put("sign_type", "RSA");
        paramMap.put("sign", sign);
			**/
			let postData = tradeData.data;
			// postData.gateway_url = "https://openapi.alipay.com/gateway.do";
			// postData.return_url=window.location.href;
			let keys = this.util.keys(postData);
			//enctype="application/x-www-form-urlencoded"
			//这里用get提交，就不用构建form表单了
			let gateway_url = postData.gateway_url;
			postData.gateway_url = null;

			let getPayUrl = gateway_url + "?"+ this.util.flat(postData);
			window.location.href = getPayUrl;

			// let fromHTML = `
			// 	<form id="alipaysubmit" style="display:none;"  name="alipaysubmit" action="${postData["gateway_url"]}" method="POST" >
			// 		${
			// 			keys.map((key)=>{
			// 				if(key == "gateway_url"){
			// 					return ""
			// 				}
			// 				return `<input type="hidden" name="${key}" value="${postData[key]}"/>`
			// 			}).join("")
			// 		}
			// 		<input type="submit" value="ok" style="display:none;"/>
			// 	</form>
			// `
			// $(document.body).append(fromHTML);
			// $('#alipaysubmit').submit();
		},
		/**
			支付完成以后出发 onPayComplate
			isOkay: true, false,
			id: "11111", 支付流水号
			result:{} 支付的参数
		*/
		onPayComplate:function(isOkay, id, result, msg ){

		}
	});

	module.exports = payModule;
});
