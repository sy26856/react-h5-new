
"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent,SmartNoBlockComponent} from './BaseComponent/index'
import Pay from './component/pay/Pay'
import CountDown from './component/CountDown'
import './bill-detail.less'



//我的账单
export default class BillDetail extends SmartNoBlockComponent{
  constructor(props) {

    super(props);
    let query = util.query();
    this.id = query.id;
    this.corpId = query.corpId;
  }

  componentDidMount() {

    UserCenter.reginfodetail(this.id, this.corpId)
     .subscribe(this)
     .fetch()

  }

  onSuccess( result ){

    let data = result.data;

    this.setState(
      {
        loading:false,
        success:true,
        id:data.id,//订单编号
        status:data.status,//状态
        statusDes:data.statusDes, //状态描述
        type:data.type, //预约类型
        deptName:data.deptName, //可是名字
        regMode:data.regMode,// 1预约 2 挂号
        orderNo:data.orderNo, //预约号
        medDateBeg:data.medDateBeg, // 就诊开始时间
        medDateEnd:data.medDateEnd,// 就诊结束时间
        regAmount:data.regAmount, //订单金额
        benefitRegAmount:data.benefitRegAmount, //优惠后金额
        patientId:data.patientId, //就诊人id
        corpId:data.corpId, //医院id
        corpName:data.corpName,//医院名
        doctName:data.doctName, //医生姓名
        patientName:data.patientName,
        idNo:data.idNo,//就诊人身份证信息
        appoNo:data.appoNo, // 挂号序号
        medAmPm:data.medAmPm, //1 , 2
        address:data.address, // 就诊地点
        info:data.info, //其他信息
        createDate:data.createDate, //创建时间
        oppatNo:data.oppatNo, //网关返回门诊号
        cardNo:data.cardNo,  //就诊卡号
        transNo:data.transNo, //交易流水号
        expirationTime:data.expirationTime,
        expirationTimeText:""
      }
    )

    //支付倒计时
    if(data.expirationTime > 0){
      new CountDown(data.expirationTime, (time, s,f,m)=>{
        this.setState({
          expirationTime:time,
          expirationTimeText:f+":"+m
        })
      }).start();
    }
  }
  
  render(){
    let {corpName,corpId,deptName,doctName,appoNo,medDateBeg,medAmPm, medDateEnd,type, address, regMode,patientId, benefitRegAmount, expirationTime, expirationTimeText} = this.state;
    // let regTimeText = util.dateFormatGMT(medDateBeg, 'hh:mm') + "~" +util.dateFormatGMT(medDateEnd, 'hh:mm');
    let ampm = {"1":"上午", "2":"下午"};
    let dayOfWeekList = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"]
    let regTimeText = [
      util.dateFormat(medDateBeg, "yyyy-MM-dd"), 
      dayOfWeekList[new Date(medDateBeg).getDay()],
      ampm[medAmPm],
      util.dateFormatGMT(medDateBeg, 'hh:mm') + "~" +util.dateFormatGMT(medDateEnd, 'hh:mm')
    ].join(" ");
    return <div>
      <div className="panel">  
        {
          expirationTime > 0 ? ( 
            <div className="pay-time">
              <div className="pay-time-msg">剩余支付时间</div>
              <div className="time txt-prompt">{expirationTimeText}</div>
            </div>
            ) : <div className="pay-time">已过期</div>
        }
        <ul className="list g-list-flex">
          <li>
            <span className="item">医院</span>
            <span className="item-inner">{corpName}</span>
          </li>
          <li>
            <span className="item">科室</span>
            <span className="item-inner">{deptName}</span>
          </li>
          <li>
            <span className="item">医生</span>
            <span className="item-inner txt-prompt">{doctName}</span>
          </li>
          <li>
            <span className="item">就诊时间</span>
            <span className="item-inner">{regTimeText}</span>
          </li>
        </ul>
      </div>
      <Pay corpId={261} optType={3} patientId={patientId} />
      <button className="btn btn-block g-footer">确认支付￥{util.rmb(benefitRegAmount/100)}</button>
    </div>
  }

}