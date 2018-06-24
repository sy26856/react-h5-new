
"use strict";

import React from 'react'
import hybridAPI from './lib/hybridAPI'
import {SmartComponent} from './BaseComponent/index'

//我的账单
export default class BillDetail extends SmartComponent{
  constructor(props) {
    super(props);

    this.state = {
      loading:false,
      success:true
    }
  }

  brige(name){
    let arg = arguments;
    return function(){
      name.apply(hybridAPI, Array.prototype.slice.call(arg, 1)).then((data)=>{
        // console.log(data)
        alert(JSON.stringify(data))  
      })
    }
  }

  aliPay(){

    this.brige(hybridAPI.pay, {
      feeChannel: 1,
      payData: {
        "service": "alipay.wap.create.direct.pay.by.user",//支付宝接口名
        "partner": "2088711222690042", // 商户号
        "seller_id": "2088711222690042", //  商户id
        "payment_type": "1", //
        "notify_url": "http://api.daily.yuantutech.com/user-web/restapi/common/ali/payNotify", //后端回调地址
        "return_url": "http://api.daily.yuantutech.com/user-web/restapi/common/ali/payReturn",// 没有的，前端自己拼装
        "out_trade_no": parseInt(Math.random() * 100000), //商户订单号  用此订单查询状态
        "subject": "浙江远图充值", //中文字符串
        "body": "医院充值",
        "total_fee": "1" // 充值
      }
    })()

  }

  wxpay(){
    this.brige(hybridAPI.pay, {
      "feeChannel": 2,
      "payData": {
        "mch_id": "1279981801",
        "timeStamp": "1477387885",
        "signType": "MD5",
        "notify_url": "http://api.uat2.yuantutech.com/user-web/restapi/common/wx/payNotify",
        "appid": "wxe9062380f1a04582",
        "nonceStr": "SU1477387885",
        "partner": "1279981801",
        "prepayId": "wx20161025173125b60ac107e60087819294",
        "paySign": "FCFAAC658A0A41E3528EADA4D6A35463"
      }
    })()
  }

  joinVideoRoom(){
    this.brige(hybridAPI.joinVideoRoom, {
      key:"c8fd086ac60c4e25b730c6369153304a",
      room:"abc",
      title:"网络诊间",
      timeout:1000*30,
      jumpURL:"http://www.baidu.com",
      caller:{name:"呼叫者",headImage:"http://image.yuantutech.com/user/e2725d04e88364af9fbfca1940a2011b-93-93.png"},//caller 呼叫的用户
      callee:{name:"被呼叫者",headImage:"http://image.yuantutech.com/user/36e4ec7d6de0d27bf517da602cab9778-93-93.png"}
    })()
  }

  imageBrowser(){
    this.brige(hybridAPI.imageBrowser, {
      current:"https://ww1.sinaimg.cn/large/005tUUiajw1etgpao7sydj30qo140dpx.jpg",
      urls: [
        "https://ww1.sinaimg.cn/large/005tUUiajw1etgpao7sydj30qo140dpx.jpg",
        "https://ww2.sinaimg.cn/thumbnail/98719e4agw1e5j49zmf21j20c80c8mxi.jpg",
        "https://ww2.sinaimg.cn/thumbnail/67307b53jw1epqq3bmwr6j20c80axmy5.jpg",
        "https://ww2.sinaimg.cn/thumbnail/9ecab84ejw1emgd5nd6eaj20c80c8q4a.jpg"
      ] // 需要预览的图片http链接列表
    })()

  }

  render(){


    return <div>
      <button className="ui-btn-lg ui-btn-primary" onClick={() => { hybridAPI.onSureBack( '这是返回确认标题', '这是返回确认内容区' ) }}>返回确认</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={()=>{ location.reload() }} >刷新页面</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={()=>{ alert(document.cookie) }} >查看cookie</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={()=>{ alert( navigator.userAgent ) }} >查看 UA </button>
      <a  className="ui-btn-lg ui-btn-primary" href="hybrid-test.html?target=_blank&native_title=no"> target=_blank 新开窗口</a>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.add)} >jsbrige 求和 1+2</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.backView, false)} >返回上一个native界面</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.backView, true)} >返回上一个native界面，并刷新</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.popToRootViewController, false)} >标记当前View为根界面</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.pushDataToParent, true, "123")} >向上一个view发送信息</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.setTitle, "helloworld")}  >设置view title</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.openView, location.href, "right-in")} >打开一个view窗口 right-in</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.openView, location.href, "bottom-in")} >打开一个view窗口 bottom-in</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.aliPay.bind(this)}>支付宝支付请求</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.wxpay.bind(this)}>微信支付请求</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.getDeviceToken)}>获取设备id</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.setBadge, 10)} >设置未读消息条数10</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.clearCache)}>清除native缓存</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.callPhotoUpload, false)} >上传图片</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.callPhotoUpload, true)}>上传图片(允许修改)</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.skipNavigation, 116.47560823, 39.98848272)}>唤起第三方导航</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.hasBrigeMethod, "skipNavigation")}>测试存在的brige</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.hasBrigeMethod, "skipNavigation11")}>测试不存在的brige</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.joinVideoRoom.bind(this)} >加入ABC视频房间</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.imageBrowser.bind(this)} >预览图片</button>
      <button className="ui-btn-lg ui-btn-primary" onClick={this.brige(hybridAPI.videoTest)}>测试本地视频对话</button>
      <a  href="yuantuhuiyi://huiyi.app/home" className="ui-btn-lg ui-btn-primary">Intent /home</a >
      <a  href="yuantuhuiyi://huiyi.app/news" className="ui-btn-lg ui-btn-primary">Intent /news</a >
      <a  href="yuantuhuiyi://huiyi.app/mine" className="ui-btn-lg ui-btn-primary">Intent /mine</a >
      <a  href="yuantuhuiyi://huiyi.app/message" className="ui-btn-lg ui-btn-primary">Intent /message</a >
      <a  href="yuantuhuiyi://huiyi.app/scanner" className="ui-btn-lg ui-btn-primary">Intent /scanner</a >
      <a  href="yuantuhuiyi://huiyi.app/setting" className="ui-btn-lg ui-btn-primary">Intent /setting</a >
      <a  href="yuantuhuiyi://huiyi.app/hosp?corpId=261" className="ui-btn-lg ui-btn-primary">Intent /hosp?corpId=261</a >
      <a  href="yuantuhuiyi://huiyi.app/webview?url=http://www.baidu.com" className="ui-btn-lg ui-btn-primary">Intent /webview?url=baidu.com</a >
    </div>

  }

}