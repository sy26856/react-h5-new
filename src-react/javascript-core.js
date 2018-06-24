import React from 'react';
import util from './lib/util';
import JSBridge from './lib/JSBridge';
import HyBrid2 from './lib/Hybrid2';
import events from 'events'

export default class JavascriptCore extends React.Component {

  state = {
    zfb: []
  };

  constructor(props) {
    super(props);
  }

  calculate = () => {
    const hybrid = new HyBrid2("syncAdd", {a: 1, b: 5});
    var a = hybrid.send();
  };

  pay = () => {
    const zfb = this.state.zfb;
    zfb.push(1);
    this.setState({
      zfb
    })
  };

  setTitle = () => {
    const hybrid = new HyBrid2("syncSetTitle", {text: "设置中文标题"});
    const a = hybrid.send();
  };

  popView = (isReload) => () => {
    const hybrid = new HyBrid2("syncPopViewController", {isReload: isReload});
    const a = hybrid.send();
  };

  openView = () => {
    const hybrid = new HyBrid2("syncOpenViewController", {url: "https://www.baidu.com", animation: "right-in"});
    const a = hybrid.send();
  };

  popRootView = () => {
    const hybrid = new HyBrid2("syncPopRootViewController", {});
    const a = hybrid.send();
  };

  getDeviceToken = () => {
    const hybrid = new HyBrid2("syncGetDeviceToken", {});
    const a = hybrid.send();
  };

  clearCache = () => {
    const hybrid = new HyBrid2("syncClearCache", {});
    const a = hybrid.send();
  };

  pushDataToLast = () => {
    const hybrid = new HyBrid2("syncPushDataToLast", {autoBack: true, data: JSON.stringify({patientId: 10086})});
    const a = hybrid.send();
  };

  syncSetBadge = () => {
    const hybrid = new HyBrid2("syncSetBadge", {badge: 10});
    const a = hybrid.send();
  };

  syncSkipNavgation = () => {
    const hybrid = new HyBrid2("syncSkipNavgation", {Coordinate: [116.47560823, 30.3]});
    const a = hybrid.send();
  };

  syncCallCar = () => {
    const hybrid = new HyBrid2("syncCallCar", {});
    const a = hybrid.send();
  };

  syncShowImageBrowser = () => {
    const hybrid = new HyBrid2("syncShowImageBrowser", {urls:
      [
        "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/f1d7deb07a33b4fff879335bac8ddd61-378-668.png",
        "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/a4aa3740a7e24d0dde654964326a776e-393-505.png",
        "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/4abfa018ff7a0ebe32f9d67330698271-382-673.png"
      ],
      current: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/a4aa3740a7e24d0dde654964326a776e-393-505.png"
    });
    const a = hybrid.send();
  };

  syncHasBrigeMethod = () => {
    const hybrid = new HyBrid2("syncHasBrigeMethod", {method: 'syncCallCar'});
    const a = hybrid.send();
  };

  aliPay = () => {
    const hybrid = new HyBrid2("asyncPay", {
      feeChannel: 1, payData: {
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
    });
    const a = hybrid.send();
    alert(a);
  };

  wxPay = () => {
    const hybrid = new HyBrid2("asyncPay", {
      feeChannel: 2,
      payData: {
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
    });
    const a = hybrid.send();
    alert(a);
  };

  share = () => {
    const hybrid = new HyBrid2("asyncShareInfo", {
      title: "标题",
      text: "分享text",
      url: "https://www.baidu.com",
      imageUrl: "https://image.yuantutech.com/user/0c306d9a190c1bcde2d8f9ad31e29810-300-300.jpg",
      isShowButton: true,
      isCallShare: false
    });
    const a = hybrid.send();
    alert(a);
  };
  imgUpload = () => {
    const hybrid = new HyBrid2("asyncPhotoUpload", {
      crop: true
    });
    const a = hybrid.send();
  };
  showGuide = () => {
    const hybrid = new HyBrid2("syncShowGuide", {day: 0.01});
    const a = hybrid.send();
  };

  render() {
    return (
      <div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.calculate}>1+1</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.setTitle}>setTitle</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.popView(false)}>返回上个页面</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.popView(true)}>返回上个页面并刷新</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.openView}>openView</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.popRootView}>popRootView</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.getDeviceToken}>getDeviceToken</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.clearCache}>clearCache</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.pushDataToLast}>pushDataToLast</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.syncSetBadge}>syncSetBadge</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.syncSkipNavgation}>syncSkipNavgation</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.syncCallCar}>syncCallCar</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.syncHasBrigeMethod}>syncHasBrigeMethod</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.syncShowImageBrowser}>syncShowImageBrowser</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.aliPay}>支付宝支付</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.wxPay}>微信支付</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.share}>分享</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.imgUpload}>图片上传</button>
        </div>
        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.showGuide}>评论框</button>
        </div>

        <div className="btn-wrapper">
          <button className="btn btn-block" onClick={this.pay}>支付宝</button>
        </div>

        {this.state.zfb.map((z, i) => <iframe style={{display: 'none'}} key={i}
                                              src={`https://openapi.alipay.com/gateway.do?${util.flat({
                                                timestamp: '2013-01-01 08:08:08',
                                                method: 'alipay.trade.wap.pay',
                                                app_id: '1990',
                                                sign_type: 'RSA2',
                                                sign: 'ERITJKEIJKJHKKKKKKKHJEREEEEEEEEEEE',
                                                version: '1.0',
                                                biz_content: JSON.stringify({
                                                  "body": "对一笔交易的具体描述信息。如果是多种商品，请将商品描述字符串累加传给body。",
                                                  "subject": "大乐透",
                                                  "out_trade_no": "70501111111S001111119",
                                                  "timeout_express": "90m",
                                                  "total_amount": 9.00,
                                                  "product_code": "QUICK_WAP_PAY"
                                                })
                                              })}`} width="0" height="0"/>)}
      </div>
    );
  }
}