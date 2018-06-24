
"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent} from './BaseComponent/index'

import './bill-detail.less'


let STATUS_CODE = {
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


//我的账单
export default class BillDetail extends SmartBlockComponent{
  constructor(props) {
    super(props);
    let query = util.query();
    //第三方支付回来以后传递的是 out_trade_no
    this.id = query.id || query.out_trade_no;
    this.corpId = query.corpId || '';
    this.unionId = query.unionId || '';

    if(!util.isLogin()) {
      util.goLogin()
    }
  }
  componentDidMount() {
    UserCenter.billDetail(this.id, this.corpId, this.unionId)
     .subscribe(this)
     .fetch()
  }

  onSuccess( result ){
    let data = result.data;
    this.setState(
      {
        loading: false,
        success: true,
        gmtModify: data.gmtModify,// 1478675051000,
        gmtCreate: data.gmtCreate,// 1478675051000,
        id: data.id,// 118180,
        corpId: data.corpId,// 261,
        corpUnionId: data.corpUnionId,// 29,
        userId: data.userId,// 744,
        patientId: data.patientId,// 1000009264,
        outId: data.outId,// 43910,
        fee: data.fee,// 700,
        billFee: data.billFee,// 700,
        status: data.status,// 400,
        feeChannel: data.feeChannel,// 4,
        optType: data.optType,// 6,
        subject: data.subject,// "预约",
        tradeType: data.tradeType,// "APP",
        outTradeNo: data.outTradeNo,// "20161109150411961000000000000744",
        productType: data.productType,// "",
        idNo: data.idNo,// "511324198902013818",
        idType: data.idType,// 1,
        patientName: data.patientName,// "鲁军",
        orderSource: data.orderSource,// 3,
        balance: data.balance,// 0,
        corpName: data.corpName,// "青岛市妇女儿童医院",
        corpUnionName: data.corpUnionName,// "青岛市卫生计生委",
        createTime: data.createTime,// "2016-11-09 15:04:11",
        /**
         *
         * platfomFeeItemList = [
         *  {
         *    itemName:"预交金"
         *    itemFee:data.itemFee,// 700,
         *    isSelfFee:data.isSelfFee,// true
         *   }
         * ]
         *
         * **/
        platfomFeeItemList: data.platfomFeeItemList,//
        statusDesc: data.statusDesc,// "失效订单",
        feeString: data.feeString,// "7.0",
        balanceString: data.balanceString// "0.0"
      }
    )

    //如果医院正在处理中，每隔3秒刷新页面
    if(data.status == "200"){
      setTimeout(()=>{
        this.componentDidMount();
      }, 3000)
    }
  }

  render(){

    let {orderSource, status, billFee, id, subject, patientName, gmtCreate, corpName, platfomFeeItemList} = this.state;
    let source = {"0":"人工窗口","1":"自助机","2":"诊间屏","3":"线上"}[orderSource] || orderSource;// == 3 ? "线上" :"线下";
    let statusText = STATUS_CODE[status] || status;
    let subjectText = subject +"-"+ (patientName || "");
    let createTime = util.dateFormat(gmtCreate);

    return <div>
      <div className="info ui-border-t">
        <div className="status">{statusText}</div>
        <div className="number"><span className="y">￥</span>{util.rmb(billFee/100)}</div>
      </div>
      <ul className="ui-list ui-list-text ui-border-tb" style={{marginTop:0}}>
        {
          platfomFeeItemList.map((item, index)=>{
            return <li className="ui-border-t" key={index}>
              <h4>{item.itemName}</h4>
              <div className="ui-txt-info"><span className="y">￥</span>{util.rmb(item.itemFee/100)} {item.isSelfFee?"(自费)":""}</div>
            </li>
          })
        }
      </ul>
      <ul className="ui-list ui-list-text  ui-border-tb">
        <li className="ui-border-t">{corpName}</li>
        <li className="ui-border-t">
          <h4>交易来源</h4>
          <div className="ui-txt-info">{source}</div>
        </li>
        <li className="ui-border-t">
          <h4>流水号</h4>
          <div className="ui-txt-info">{id}</div>
        </li>
        <li className="ui-border-t">
          <h4>订单信息</h4>
          <div className="ui-txt-info">{subjectText}</div>
        </li>
        <li className="ui-border-t">
          <h4 className="ui-nowrap">创建时间</h4>
          <div className="ui-txt-info">{createTime}</div>
        </li>
      </ul>
      <div className="ui-tips center">对订单有疑问，请联系客服</div>
    </div>
  }

}
