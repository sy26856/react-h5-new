import UserCenter from './UserCenter'
import JSONPAsyncData from '../lib/JSONPAsyncData'
import util from '../lib/util'
import hybridAPI from '../lib/hybridAPI'
import WXPayModule from './WXPayModule'

/**

  corpId:
  optType 业务类型 //1、充值 2、缴费 3、挂号 5、预约
  patientId:
  price: 金额
  optParam: 业务参数
  feeChannel 支付方式  //1、支付宝 2、微信 3、余额 5、到院支付
  cardId 支付卡ID


  new OrderAndPay(corpId, feeChannel, optType, optParam).subscribe({
    onSuccess:()=>{
      result = {
        success:true,
        msg:"",说明
        data:{
          id://订单ID，
          tradeData://订单详情
        }
      }
    }
  }).fetch()

*/

//下单并支付


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


export default class OrderAndPayModule extends JSONPAsyncData {

  constructor(corpId, feeChannel, optType, optParam, successUrl,isGraphic){
    super()
    //合并参数
    this.optParam = optParam;//Object.assign({}, {corpId:corpId}, optParam)
    this.corpId = corpId;
    this.feeChannel = feeChannel;
    this.optType = optType;
    this.isGraphic = isGraphic//是不是图文问诊的支付
    this.successUrl = successUrl || window.location.href;
    this.state = {
      //自己定义的状态
      payStatus:100, //100等待选择 101支付中 102 获取支付结果 200 支付成功 300 支付失败
      msg:"",
    }

    //下单
    // this.placeAnOrder();
  }
  fetch(){
    this.placeAnOrder();
  }
  placeAnOrder(){
    /*
    feeChannel:1
    optType:1
    corpId:261
    unionId:29
    fee:1
    patientId:1000012714
    cardId:
    tradeType:APP
    returnUrl:https://uat.yuantutech.com/yuantu/h5-cli/1.8.0/pay-status.html?unionId=29&successUrl=https%3A%2F%2Fuat.yuantutech.com%2Fyuantu%2Fh5-cli%2F1.8.0%2Fpages%2Frecharge.html%3FcorpId%3D261%26unionId%3D29%26title%3Dnone%26target%3D_blank%26spm%3D100.1001.2.4
    */
    /**
    fee:1
    patientId:1000012714
    cardId:370201112100204441
    returnUrl:http://undefined/yuantu/h5-cli/undefined/pay-status.html?corpId=261&successUrl=http%3A%2F%2Fa.uat.yuantutech.com%3A8080%2Frecharge.html%3FcorpId%3D261%26unionId%3D29
    feeChannel:1
    optType:1
    corpId:261
    */
    let optParam = this.optParam || {};
    let feeChannel = this.feeChannel;

    //支付宝支付需要添加 returnUrl
    if(this.feeChannel == 1 || this.feeChannel == 6){
        //本来可以使用 pay-status.html 但是因为adnroid 2.9.1 有一个判断的bug ，必须使用 .php
      optParam.returnUrl = util.tmsUrl("/tms/h5/pay-status.php?"+util.flat({
        corpId:this.corpId,
        unionId:this.unionId,
        successUrl:this.successUrl,
        isGraphic:this.isGraphic
      }));
      // Android	GET /user-web/restapi/account/preChargeNew?patientId=1000012714&billNo=15602586&fee=9&getType=1&returnUrl=https://uat.yuantutech.com/yuantu/h5-cli/1.9.9/pay-status.html?corpId=261&unionId=&tradeType=APP&feeChannel=1&optType=2&corpId=261&t=28688&invokerChannel=H5&invokerDeviceType=yuantuApp&invokerAppVersion=1.9.9&callback=jsonp1503544556699 HTTP/1.1
      // ios	GET /user-web/restapi/account/preChargeNew?fee=1&patientId=1000012714&cardId=370201112100204441&returnUrl=https%3A%2F%2Fuat.yuantutech.com%2Fyuantu%2Fh5-cli%2F1.9.9%2Fpay-status.html%3FcorpId%3D261%26unionId%3D&tradeType=APP&feeChannel=1&optType=1&corpId=261&t=6902&invokerChannel=H5&invokerDeviceType=yuantuApp&invokerAppVersion=1.9.9&callback=jsonp1503545448016 HTTP/1.1
    }

    //公众号内支付
    if( util.isInMicroMessenger() && feeChannel == 5){
      optParam.tradeType = "JSAPI";
    }else{
      optParam.tradeType = "APP";
    }


    UserCenter.preChargeNew(this.feeChannel, this.optType, this.corpId, this.optParam)
    .subscribe({
      onSendBefore:()=>{
        this.emit(this.SEND_BEFORE, {
          status:100,
          msg:"创建支付订单..."
        })
      },
      onSuccess:(result)=>{
        let tradeData = result.data;
        let status = tradeData.status;
  			//101 ，100  才是新订单的状态
  			if(tradeData.status == 101 || tradeData.status == 100){
  				//检查必要参数
  				// this.checkPayResult( tradeData.data );

          //余额支付 到院支付 不需要走一下流程
  				if( feeChannel == 3 || feeChannel == 4 ){
  					//轮训支付结果 //支付流水号
  					this.roundGetStatus( tradeData.id );
  					return;
  				}

  				if(feeChannel == 7){
  					//医保支付
  					this.payType7Action( tradeData );
  					return ;
  				}

  				//微信内 微信 支付
  				if( feeChannel == 5 && util.isInMicroMessenger() ){
  					this.micorMessengerPay( tradeData );
  					return ;
  				}

  				//支付宝服务窗
  				if(feeChannel == 6){
            if (tradeData.data.interface_version == "2.0") {
              //2.0走新的支付方式
              this.aliPayWebPay2D0(tradeData);
              return;
            } else {
              this.aliPayWebPay(tradeData);
              return;
            }
  				}

  				//支付宝native支付
  				if(feeChannel == 1){
              if(tradeData.data.interface_version == "2.0"){
                //2.0走新的支付方式
                //2.0  app webview会拦截支付链接并唤起webview
                this.aliPayWebPay2D0(tradeData);
                return ;
              }
  				}
  				//其他 微信公众号，支付宝1.0走app支付
  				this.yuanTuPay( tradeData );
        }else if(status == "200"){
          //直接返回 200标示支付成功，到院支付没有id 请注意
          this.emit(this.SUCCESS, {
            success:true,
            data:{
              id:tradeData.id,
              tradeData:tradeData
            }
          });
        }else{
          //其他状态轮训支付结果
          this.roundGetStatus( tradeData.id );
        }
      },
      onError:(result)=>{
        this.emit(this.ERROR, {
          success:false,
          status:300,
          msg:result && result.msg ?  result.msg :  "调用支付接口失败"
        })
      }
    })
    .fetch();
  }


  //番禺医保个账支付
  payType7Action(tradeData){
    tradeData = tradeData.data;
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

		document.body.appendChild(form);
		document.getElementById('J_Pay7').submit();//把支付数据提交到第三方

  }

  micorMessengerPay(tradeData){
    //微信内支付
    new WXPayModule(tradeData.data).subscribe({
      onSendBefore:(result)=>{
        this.emit(this.SEND_BEFORE, result);
      },//
      onSuccess:(result)=>{
        // this.emit(this.SUCCESS, result); 这里不能触发，不然会触发两次
        //轮训支付结果
        this.roundGetStatus(tradeData.id);
      },
      onError:(result)=>{
        this.emit(this.ERROR, result);
      }
    }).fetch();
    // console.log("微信中支付，未实现")
  }
  //支付宝2.0支付
  aliPayWebPay2D0(tradeData){
    /**
			https://openapi.alipay.com/gateway.do?timestamp=2013-01-01 08:08:08&method=alipay.trade.wap.pay&app_id=1990&sign_type=RSA2&sign=ERITJKEIJKJHKKKKKKKHJEREEEEEEEEEEE&version=1.0&biz_content=
			{
				"body":"对一笔交易的具体描述信息。如果是多种商品，请将商品描述字符串累加传给body。",
				"subject":"大乐透",
				"out_trade_no":"70501111111S001111119",
				"timeout_express":"90m",
				"total_amount":9.00,
				"product_code":"QUICK_WAP_WAY"
			}
		*/
		//把tradeData全部提交到支付宝，除了下面3个数据
    tradeData = tradeData.data;
		delete tradeData.gateway_url;
		delete tradeData.interface_version;
		delete tradeData.total_fee;
    // console.log(tradeData)
    // console.log(`https://openapi.alipay.com/gateway.do?`+util.flat(tradeData))
		window.location.href = `https://openapi.alipay.com/gateway.do?`+util.flat(tradeData);
  }
  //支付宝1.0的网页支付
  aliPayWebPay(tradeData){
    let postData = tradeData.data;
		//这里用get提交，就不用构建form表单了
		let gateway_url = postData.gateway_url;
		postData.gateway_url = null;

		let getPayUrl = gateway_url + "?"+ util.flat(postData);
		window.location.href = getPayUrl;
  }

  async yuanTuPay( tradeData ){

    //流水号id
    var id = tradeData.id;
    var feeChannel = this.feeChannel;
    try{
      this.emit(this.SEND_BEFORE, {msg:"正在使用第三方支付...", success:false, status:100});
      var result = await hybridAPI.pay(feeChannel, tradeData.data);
      var data = result.data ? JSON.parse(result.data) : null;
      if( result.ret == "SUCCESS" && data){
        // (支付宝) || (微信)
        if( (feeChannel == 1 && data.resultStatus == "9000") || (feeChannel == 2 && data.resultStatus == "0") ){
          this.roundGetStatus( id );
        }else if( data && data.resultStatus ){
          let msg = STATUS_CODE[data.resultStatus] || "支付失败，错误码:"+ data.resultStatus;
          this.emit(this.ERROR, {
            success:false,
            status:300,
            msg:msg
          });
        }else{

          this.emit(this.ERROR, {
            success:false,
            status:300,
            msg:"由于网络问题未能获取订单状态"
          });
        }
      }else{
        this.emit(this.ERROR, {
          success:false,
          status:300,
          msg:"支付遇到问题，请稍后再试"
        });
      }

    }catch(e){
        // self.util.alert("没有正确获取支付状态，请到账单中查看!");
      this.roundGetStatus( id );
    }

  }

  //轮训支付结果
  roundGetStatus(id, tradeData){

    let corpId = this.corpId;

    function run(){
      UserCenter.getPayStatus(id, corpId)
      .subscribe({
        onSendBefore:()=>{
          this.emit(this.SEND_BEFORE, {payStatus:102, msg:"正在获取支付结果..."});
        },
        onComplete:(result)=>{
          if( result && result.success ){

            var status = result.data.status;
            var isOkay = status == "300";
            if( status != "101" ){
              if(isOkay){//成功
                this.emit(this.SUCCESS, {
                  success:true,
                  msg:STATUS_CODE[status],
                  data:{
                    id:id,
                    tradeData:tradeData
                  }
                });
              }else{//失败
                this.emit(this.ERROR, {
                  success:false,
                  msg:STATUS_CODE[status],
                  data:{
                    id:id,
                    tradeData:tradeData
                  }
                });
              }
            }else{
              //2秒后再次发起轮训
              setTimeout(()=>{
                run.call(this)
              }, 2000)
            }
          }else{
            //2秒后再次发起轮训
            setTimeout(()=>{
              run.call(this)
            }, 2000)
          }
        },
        onError:()=>{
          this.emit(this.ERROR, {payStatus:102, msg:"正在获取支付结果..."});
          //2秒后再次发起轮训
          setTimeout(()=>{
            run.call(this)
          }, 2000)
        }
      })
      .fetch()
    }

    run.call(this);


  }


}