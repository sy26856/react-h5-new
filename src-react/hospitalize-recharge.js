import React from 'react';
import AsyncRequestLoading from './component/loading/AsyncRequestLoading'
import UserCenter from './module/UserCenter'
import PayTypeList from './component/pay/Pay'
import SelectPatient from './component/patient/SelectPatient'
import SelectPatientCard from './component/patient/SelectPatientCard'
import OrderAndPayModule from './module/OrderAndPayModule'
import util from './lib/util'
import Alert from './component/alert/alert'
import WXOpenIdModule from './module/WXOpenIdModule'

export default class Recharge extends React.Component {

  constructor(props){
    super(props)
    let query = util.query();
    this.corpId = query.corpId;
    this.unionId = query.unionId;
    this.openId = null;
    this.optType = 4;//住院充值业务 optType = 4
    this.state = {
      currentPatientId:"",//当前选中的就诊人ID
      currentPatientName:"",//当前选中的就诊人姓名
      hasRechargeHospitalize:false,
      hasRechargeHospitalizeMsg:"",
      showSelectPatient:false,
      showSelectPateintCard:false,
      currentAccountBannce:0,
      feeChannel:null,
      patients:[]
    };
  }

  componentDidMount(){
    this.getPatientList();
    //如果在微信中需要查询 openId 才能使用微信支付
    if(util.isInMicroMessenger()){
      this.getWXOpenId();
    }
  }

  getWXOpenId(){
    new WXOpenIdModule(this.corpId, this.optType)
    .subscribe({
      onSuccess:(result)=>{
        this.openId = result.data.openId;
      },
      onError:(result)=>{
        Alert.show(result.msg)
      }
    }).fetch();
  }

  getPatientList(){
    UserCenter.getPatientList(this.corpId, this.unionId)
    .subscribe(this.refs['getPatientListLoading'])
    .subscribe({
      onSuccess:(result)=>{
        let currentPatientId = "";
        let currentPatientName = "";
        let patients = result.data.map((item, index)=>{
          if(index == 0 || item.default){
            //选中第一个就诊人或者有默认就诊人
            currentPatientId = item.id;
            currentPatientName = item.patientName
          }
          return {
            id:item.id,
            patientName:item.patientName,
            idType:item.idType,
            idNo:item.guarderIdNo || item.idNo
          }
        })

        this.setState({
          patients:patients
        });

        this.onChangePatient(currentPatientId, currentPatientName);

      },
      onError:(result)=>{
        //未登录跳转
        if(result.resultCode == "202"){
          util.goLogin()
        }
      }
    })
    .fetch();
  }
  //获取就诊人余额
  getPatientBalance(patientId){
    UserCenter.getPatientinfo(this.corpId, patientId, true, true)
    .subscribe(this.refs['queryBalanceLoading'])
    .subscribe({
      onSuccess:(result)=>{
        let data = result.data;
        let hasRechargeHospitalize = false;
        let hasRechargeHospitalizeMsg = "";

        //是否存在出院号 有则可以充值，没有则不能充值，不判断其他状态 8月17号 和张强商量的结果
        //可能存在某些区域出院后还能查到住院号的情况，也让他可以充值，his自己去判断

        let isPatientHosId = (data.items || []).filter((item)=>{
           return item.patientHosId;
        }).length;

        if(isPatientHosId){
          hasRechargeHospitalize = true;
        }else{
          hasRechargeHospitalizeMsg = "就诊人还没有住院号,无法住院充值"
        }

        this.setState({
          currentAccountBannce:data.balance || 0,
          hasRechargeHospitalize:hasRechargeHospitalize,
          hasRechargeHospitalizeMsg:hasRechargeHospitalizeMsg
        });

      },
      onError:(result)=>{
        this.setState({
          currentAccountBannce:0,
          hasRechargeHospitalize:false,
          hasRechargeHospitalizeMsg:result.msg || "查询就诊人住院信息错误，无法住院充值"
        })
      }
    })
    .fetch();
  }

  onChangePatient(currentPatientId, currentPatientName){

    this.setState({
      showSelectPatient:false,
      currentPatientId:currentPatientId,//currentPatientId,
      currentPatientName:currentPatientName
    });

    this.getPatientBalance(currentPatientId);
  }


  //确认充值按钮
  onSubmitRecharge(){
    let price = this.refs['rechargeAmount'].value * 100;
    let feeChannel = this.state.feeChannel;
    let patientId = this.state.currentPatientId;
    let cardId = this.state.currentAccountNo
    // let optType = 1//充值业务类型 1

    if(!price > 0){
      Alert.show("支持最小充值金额0.01元");
      return ;
    }

    if(!feeChannel){
      Alert.show("请选择支付方式");
      return ;
    }

    if(!patientId){
      Alert.show("请选择就诊人");
      return ;
    }

    //下单并支付
    new OrderAndPayModule(this.corpId, feeChannel, this.optType, {
      fee:price,
      patientId:patientId,
      openId:this.openId,
      cardId:cardId
    })
    .subscribe(this.refs['blockLoading'])
    .subscribe({
      onSuccess:(result)=>{
        //需要更新页面余额
        this.getPatientBalance(this.state.currentPatientId);
        // this.setState({
        //   currentAccountBannce: this.state.currentAccountBannce + price
        // });
      },
      onError:(result)=>{
        if(result && result.data && result.data.id){
          //支付失败  跳转到 订单详情页
          setTimeout(()=>{
            let id = result.data.id;
            window.location.href = util.h5URL("/bill-detail.html?")+util.flat({id, corpId:this.corpId, target:"_blank"});
          }, 1500)
        }
        // else{
        //   location.reload();
        // }
      }
    })
    .fetch()
  }

  render() {
    let {
      currentPatientId,
      currentPatientName,
      showSelectPatient,
      showSelectPateintCard,
      currentAccountName,
      currentAccountBannce,
      patients,
      hasRechargeHospitalize,
      hasRechargeHospitalizeMsg,
      feeChannel
    } = this.state;
    //住院状态正确，and支付方式可用 标示可以充值
    hasRechargeHospitalize = hasRechargeHospitalize && feeChannel;
    return (
      <div>

        <AsyncRequestLoading ref="getPatientListLoading" text="获取就诊人..." showError={true} />
        <AsyncRequestLoading ref="queryBalanceLoading" text="住院状态..."  />
        <AsyncRequestLoading ref="blockLoading" showError={true} showSuccess={true} />

        <ul className="list-ord">
        	<li className="list-item  ">
        		<a className="txt-arrowlink list-link-wrapper"
              onClick={()=>{
                this.setState({showSelectPatient:!showSelectPatient})
              }}
            >
        			<div className="list-content">就诊人：</div>
        			<div className="list-extra">{currentPatientName || "请选择就诊人"}</div>
        		</a>
        	</li>
        	<li className="list-item  ">
        		<div className="list-content">账户余额：</div>
        		<div className="list-extra">{currentAccountBannce/100}元</div>
        	</li>
        </ul>
        <div className="list-ord" style={{marginTop:20}}>
        	<div className="list-item item-input recharge-price-item">
            <label>
          		<div className="item-input-title">充值金额：</div>
          		<div className="item-input-content">
          			￥<input type="text" placeholder="请输入充值金额" defaultValue="0.01" ref="rechargeAmount" />
          		</div>
            </label>
        	</div>
        </div>

        <div style={{marginTop:20, marginBottom:30}}>
          <PayTypeList
            corpId={this.corpId}
            optType={1}
            onFeeChannelChange={(feeChannel)=>{
              this.setState({
                feeChannel:feeChannel
              })
            }}
          />
        </div>

        <div className="ui-tips center">{hasRechargeHospitalizeMsg}</div>

        <div className="btn-wrapper">
        	<button className={hasRechargeHospitalize ? "btn btn-block" : "btn btn-block btn-disabled"} disabled={!hasRechargeHospitalize} onClick={this.onSubmitRecharge.bind(this)}>确认充值</button>
        </div>

        <SelectPatient
          display={showSelectPatient}
          patients={patients}
          onChange={this.onChangePatient.bind(this)}
          onCancel={()=>{
            this.setState({showSelectPatient:!showSelectPatient})
          }}
        />

      </div>
    )

  }
}
