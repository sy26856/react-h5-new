import React from 'react'
import UserCenter from './module/UserCenter'
import AsyncRequestLoading from './component/loading/AsyncRequestLoading'
import util from './lib/util'
import Alert from './component/alert/alert'
import PayTypeList from './component/pay/Pay'
import OrderAndPayModule from './module/OrderAndPayModule'
import WXOpenIdModule from './module/WXOpenIdModule'

const STATUS_MSG = {
  "100": "待支付",
  "101": "你已支付，医院正在处理",
  "200": '支付成功',
  "401": "已过期",
  "402": "已作废"
};

export default class PayDetail extends React.Component {
  constructor(props){
    super(props)
    this.optType = 2;
    this.corpId = util.query().corpId;
    this.openId=null
    this.unionId = util.query().unionId;
    this.state = {
      status:-1,
      oppatNo:null,
      billNo:null,
      cardNo:null,
      transNo:null,
      payDate:null,
      billDate:null,
      patientId:null,
      patientName:null,
      idNo:null,
      guarderIdNo:null,
      items:[],//药瓶列表
      preSettlement:{
        billFee:0,
        selfFee:0,
        insurFee:0,//医保支付金额
        mic:false,//是否医保支付
      },//支付信息
    }
  }
  getWXOpenId(){ 
    new WXOpenIdModule(this.corpId, this.optType,this.unionId)
    .subscribe({
      onSuccess:(result)=>{
        this.openId = result.data.openId;
      },
      onError:(result)=>{
        Alert.show(result.msg)
      }
    }).fetch();
  }
  componentWillMount(){
    if(util.isInMicroMessenger()){
      this.getWXOpenId();
    }
  }
  componentDidMount(){
    ///user-web/restapi/pay/getpaymentdetail
    let query = util.query();
    

    UserCenter.getpaymentdetail(query.corpId, query.billNo, query.patientId)
    .subscribe(this.refs['blockLoading'])
    .subscribe({
      onSuccess:(result)=>{
        let data = result.data;
        this.setState({
          status:data.status,
          oppatNo:data.oppatNo,
          billNo:data.billNo,
          cardNo:data.cardNo,
          transNo:data.transNo,
          payDate:data.payDate,
          patientId:data.patientId,
          patientName:data.patientName,
          billDate:data.billDate,
          idNo:data.idNo,
          guarderIdNo:data.guarderIdNo,
          items:data.items,//药品信息
          preSettlement:data.preSettlement
        });
      }
    })
    .fetch();
  }
  //支付方式发生变更
  onSelectPayType(feeChannel, cardNo){
    this.feeChannel = feeChannel;
    this.cardNo = cardNo;
  } 
  onSubmitPay(){
    let preSettlement = this.state.preSettlement;

    if(!this.feeChannel){
      Alert.show("请选择一种支付方式");
      return;
    }

    new OrderAndPayModule(this.corpId, this.feeChannel, this.optType, {
      patientId: this.state.patientId,
      billNo: this.state.billNo,
      fee: preSettlement.selfFee,//提交的时候不加快递价格
      getType: 1,//2快递 1自取
      openId:this.openId,
      cardNo: this.cardNo
    })
    .subscribe(this.refs['payBlockLoing'])
    .subscribe({
      onSuccess:()=>{
        setTimeout(()=>{
          location.reload()
        }, 1500)
      },
      onError:(result)=>{
        if(result && result.data && result.data.id){
          let billDetaiPath = util.flatStr("/bill-detail.html?", {id:result.data.id,corpId:this.corpId, target:"_blank"});
          window.location.href = util.h5URL( billDetaiPath );
        }
      }
    }).fetch()
  }

  render(){

    let {
      status,
      oppatNo,
      cardNo,
      transNo,
      payDate,
      billDate,
      patientId,
      patientName,
      idNo,
      guarderIdNo,
      items,
      preSettlement
    } = this.state;

    let isShowPay = patientId && status == 100;
    return (
      <div>
        <AsyncRequestLoading ref="blockLoading" showError={true} />
        <AsyncRequestLoading ref="payBlockLoing" showError={true} showSuccess={true} />

        <div className="g-space">
          <div style={{textAlign:"center", marginTop:20, marginBottom:20}}>{STATUS_MSG[status]}</div>
        </div>
        <div className="panel g-space">
      		<ul className="list-ord ">
      			<li className="list-item  list-item-middel" >
      				<a href="" className="list-link-wrapper">
      					<div className="list-brief-title">就诊人</div>
      					<div className="list-content  ">{patientName}</div>
      				</a>
      			</li>
      			<li className="list-item  list-item-middel" >
      				<a href="" className="list-link-wrapper">
      					<div className="list-brief-title">证件号码</div>
      					<div className="list-content  ">{idNo || guarderIdNo}</div>
      				</a>
      			</li>
          </ul>
        </div>
        <div className="g-space">
          <div className="panel-title">费用列表</div>
          <ul className="list-ord">
            {
              items.map((item, index)=>{
                return (
                  <li className="list-item list-item-middel list-nowrap" key={index}>
      							<a className="list-link-wrapper">
      								<div className="list-content">
      									<div className="list-title txt-nowrap">{item.itemName} x{item.itemQty}</div>
      									<div className="list-brief ">规格{item.itemSpecs}  单价: ￥{util.rmb(item.itemPrice/100, 4)}</div>
      								</div>
      								<div className="list-extra">￥{util.rmb(item.cost/100, 4)}</div>
      							</a>
      						</li>
                )
              })
            }
            <li className="list-item ">
							<div className="list-content">
								<span className="txt-info">应付</span>
								<span><span className="txt-size-sm">￥</span>{util.rmb(preSettlement.billFee/ 100, 4)}</span>
                {
                  preSettlement.mic ? (
                    <span>
      								<span className="txt-info"> - 医保</span>
      								<span><span className="txt-size-sm">￥</span>{util.rmb(preSettlement.insurFee/ 100, 4)}</span>
                    </span>
                  ) : null
                }
							</div>
							<div className="list-extra">
								<span className="txt-info">自费</span>
								<span className="txt-highlight"><span className="txt-size-sm">￥</span>{util.rmb(preSettlement.selfFee/ 100, 4)}</span>
							</div>
						</li>
					</ul>
      	</div>
        <div className="g-space">
          {
            isShowPay ? <PayTypeList
              corpId={this.corpId}
              optType={this.optType}
              patientId={patientId}
              onSelectPayType={this.onSelectPayType.bind(this)}
              price={preSettlement.selfFee}
            /> : null
          }
        </div>
        {
          isShowPay ? (
            <div className="fixed-foot-wrapper">
    					<div className="btn-wrapper g-footer">
    						<button className="btn btn-lg g-right" onClick={this.onSubmitPay.bind(this)}>确认支付</button>
    					</div>
    				</div>
          ):null
        }
        {
          patientId && status != 100 ? (
            <div>
              <div className="panel g-space">
      					<ul className="list-ord ">
      						<li className="list-item  list-item-noborder">
      							<div className="list-brief-title">就诊卡卡号</div>
      							<div className="list-content txt-nowrap">{cardNo}</div>
      						</li>
      						<li className="list-item  list-item-noborder">
      							<div className="list-brief-title">门诊号</div>
      							<div className="list-content txt-nowrap">{oppatNo}</div>
      						</li>
      						<li className="list-item  list-item-noborder">
      							<div className="list-brief-title">流水号</div>
      							<div className="list-content txt-nowrap ">{transNo}</div>
      						</li>
                  <li className="list-item  list-item-noborder">
      							<div className="list-brief-title">开单时间</div>
      							<div className="list-content txt-nowrap ">{billDate}</div>
      						</li>
                  <li className="list-item  list-item-noborder">
      							<div className="list-brief-title">支付时间</div>
      							<div className="list-content txt-nowrap ">{payDate}</div>
      						</li>
      					</ul>
      				</div>
              <div className="txt-insign g-space" style={{textAlign:"center", "fontSize":12}}>如需发票，请前往人工缴费窗口打印</div>
            </div>
          ) : null
        }

      </div>
    )
  }
}
