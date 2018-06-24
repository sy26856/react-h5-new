
"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent, SmartNoBlockComponent} from './BaseComponent/index'
import './bill.less'


//我的账单
export default class Bills extends SmartNoBlockComponent{
  constructor(props) {
    super(props);
    let query = util.query();
    this.unionId = query.unionId;
    this.corpId = query.corpId;
    this.pageSize = 30;
    this.pageNum = 1;

    this.bufferHeight = 360; // 缓冲高度
    this.prevHeight = 0// 上一次的容器的高度
    this.activation = 1 // 默认启动

    this.state = {
      loading: true,
      success: false,
      nonData: null
    }

    if(!util.isLogin()) {
      util.goLogin()
    }
  }

  componentDidMount() {
    UserCenter.myBills(this.pageSize, this.pageNum, this.unionId, this.corpId)
     .subscribe(this) //自动处理load状态
     .fetch();
    window.addEventListener('scroll', this.handleScroll.bind(this))
  }

  componentWillUnmount() {
  }

  stop() {
    this.activation = 0
  }

  start() {
    this.activation = 1
  }

  recovery() {
    this.isRecovery = 1
  }

  onEnd() {
    UserCenter.myBillsNoCache(this.pageSize, ++this.pageNum, this.unionId)
      .subscribe(this) //自动处理load状态
      .fetch();
  }

  handleScroll() {
    const scrollHeight = this.refs.container.scrollHeight;
    const scrollTop = Math.abs(this.refs.container.getBoundingClientRect().top);
    const innerHeight = window.innerHeight;

    if(this.prevHeight !== scrollHeight) {
      this.start()
    }

    if(this.activation !== 1 || this.isRecovery) {
      return
    }

    if (scrollHeight - scrollTop - innerHeight - this.bufferHeight < 0) {
      this.stop()
      this.loading.classList.remove("hidden")
      this.prevHeight = scrollHeight;
      this.onEnd()
    }
  }

  onSuccess( result ){
    let data = result.data;

    if(data.data.length === 0) {
      this.setState({
        nonData: true,
        loading: false,
        success: true
      })
      return
    }

    if( data.currentPage >= (data.totalItem / data.pageSize) ){
      this.recovery();
      this.loading && this.loading.classList.add("hidden")
    }
    //停止下拉滚动
    // 如果当前请求的页面不是第一个页面，需要将数据添加进去
    if(data.currentPage !== 1) {
      this.setState({
        list: this.state.list.concat(data.data)
      })
      return
    }

    // 如果当前请求的页面不是第一个页面，需要将数据添加进去 End
    this.setState(
      {
        loading:false,
        success:true,
        currentPage:data.currentPage,
        pageSize:data.pageSize,
        totalItem:data.totalItem,
        list:data.data.map((item)=>{
          return {
            gmtModify:item.gmtModify,
            gmtCreate:item.gmtCreate,
            id:item.id,
            corpId:item.corpId,
            corpUnionId:item.corpUnionId,
            userId:item.userId,
            patientId:item.patientId,
            outId:item.outId,
            fee:item.fee,
            billFee:item.billFee,
            status:item.status,
            feeChannel:item.feeChannel,
            optType:item.optType,
            subject:item.subject,
            tradeType:item.tradeType,
            outTradeNo:item.outTradeNo,
            productType:item.productType,
            idNo:item.idNo,
            idType:item.idType,
            patientName:item.patientName,
            orderSource:item.orderSource,
            balance:item.balance,
            corpName:item.corpName,
            corpUnionName:item.corpUnionName,
            createTime:item.createTime,
            feeString:item.feeString,
            balanceString:item.balanceString,
            statusDesc:item.statusDesc
          }
        })
      }
    )
  }

  render(){
    let {list, showLoading, nonData} = this.state;
    return (
      <div>
        {
          nonData ? <div className="notice">
              <span className="notice-icon icon-record"></span>
              <p>没有账单纪录</p>
          </div> : <div>
              <div ref="container">
                <ul className="ui-ord">
                  {
                    list.map((item, index)=>{
                      return (
                        <a href={util.flatStr("./bill-detail.html?", {id:item.id, target:"_blank", corpId:item.corpId, unionId: this.unionId})} key={index}>
                          <li className="list-item list-nowrap">
                              <span className={"list-icon " + this.getPayTypeClassName(item.feeChannel)}></span>
                              <div className="list-content">
                                <div className="list-title txt-nowrap">
                                  <span className="y">￥</span>{(item.billFee/100).toFixed(2)}
                                </div>
                                <div className="list-brief txt-nowrap">{item.subject} {item.patientName} - {item.corpName}</div>
                              </div>
                              <div className="list-extra" >{this.getDay(item.gmtModify)} {this.getTime(item.gmtModify)}</div>
                          </li>
                        </a>
                      )
                    })
                  }
                </ul>
              </div>
              {/*在这里加上一个加载中的状态*/}
              <div >
                <div ref={(dom) => this.loading = dom} className="refresh-wrapper hidden">
                  <span className="refresh-icon icon-h-loading"></span>
                  <span className="refresh-txt">加载中...</span>
                </div>
              </div>
          </div>
        }
      </div>
    )
  }
  //是否今天
  isToday(time){
    //当前时间
    var yy = new Date().getFullYear();
    var mm = new Date().getMonth()+1;
    var dd = new Date().getDate();
    return yy == time.getFullYear() && mm == time.getMonth()+1 && dd == time.getDate();
  }
  //是否昨天
  isYesterday(time){

    var yy = new Date().getFullYear();
    var mm = new Date().getMonth()+1;
    var dd = new Date().getDate();

    return yy == time.getFullYear() && mm == time.getMonth()+1 && dd-1 == time.getDate();
  }

  getPayTypeClassName(feeChannel){
    const billIcon = {
      "1": "bill-icon-1",
      "2": "bill-icon-2",
      "3": "bill-icon-3",
      "4": "bill-icon-4",
      "5": "bill-icon-5",
      "6": "bill-icon-6",
      "7": "bill-icon-7",
      "8": "bill-icon-1",
      "9": "bill-icon-1",
      "10": "bill-icon-1",
      "11": "bill-icon-2",
      "12": "bill-icon-2",
      "13": "bill-icon-2",
    };
    return billIcon[feeChannel] || "bill-icon-8";
  }

  getDay(date){
    var time = new Date( date );
    var dayArr = ["周日","周一","周二","周三","周四","周五","周六","昨天","今天"];
    var day = this.isToday(time) ? 8 : this.isYesterday(time) ? 7 : time.getDay();

    return dayArr[day];
  }

  getTime(date){
    try{
      var time = new Date( date );
      return util.dateFormat(time, (this.isToday(time) || this.isYesterday(time)) ? "hh:mm" : "MM-dd");
    }catch(e){
      return date;
    }
  }

}
