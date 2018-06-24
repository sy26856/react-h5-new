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
    this.optType = 1;//充值业务 optType = 1
    this.state = {
      currentPatientId:"",//当前选中的就诊人ID
      currentPatientName:"",//当前选中的就诊人姓名
      currentAccountNo:"",//当前选中的就诊人卡号
      currentAccountName:"",
      showSelectPatient:false,
      showSelectPateintCard:false,
      currentAccountBannce:0,
      feeChannel:null,
      patients:[],
      accounts:[]
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

        this.getNoBalanceList(currentPatientId, currentPatientName);

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

  //获取卡列表
  getNoBalanceList(patientId,patientName){

    this.setState({
      currentPatientId:patientId,
      currentPatientName:patientName,
      showSelectPatient:false
    });

    UserCenter.getNoBalanceList(patientId, true, 1, this.corpId, this.unionId)
    // .subscribe(this.refs['getPatientListLoading'])
    .subscribe({
      onSuccess:(result)=>{
        let currentAccount = {};
        let accounts = result.data.map((item, index)=>{

          let card = {
            cardName:item.cardName,
            cardNo:item.cardNo,//item.cardNo,
            hasDetail:item.hasDetail,//是否有详情，有详情的卡 余额需要通过另外一个接口查询
            balance:item.balance
          };

          if(index == 0){
            currentAccount = card;
          }

          return card

        })

        this.setState({
          accounts:accounts
        })

        this.onChangePatientCard(currentAccount)
      }
    })
    .fetch();
  }

  onChangePatient(currentPatientId){

    this.setState({
      currentPatientId:currentPatientId//currentPatientId,
    });

    this.getNoBalanceList(currentPatientId);
  }

  onChangePatientCard(card){
    this.setState({
      currentAccountNo:card.cardNo,
      currentAccountName:card.cardName,
      currentAccountBannce:card.balance || 0,
      showSelectPateintCard:false
    });
    //是否需要查询余额
    if(!card.hasDetail){
      this.getCardBannce(card.cardNo);
    }
  }

  //获取卡片余额
  getCardBannce(cardId){
    //这个接口只能在青岛用，需要给后端提要求
    UserCenter.getCardBannce(this.corpId, cardId).subscribe({
      onSuccess:(result)=>{
        if(result && result.data && result.data.balance != undefined){
          this.setState({
            currentAccountBannce:result.data.balance
          })
        }
      }
    }).fetch();
  }

  //确认充值按钮
  onSubmitRecharge(){
    let price = this.refs['rechargeAmount'].value * 100;
    let feeChannel = this.state.feeChannel;
    let patientId = this.state.currentPatientId;
    let cardId = this.state.currentAccountNo
    let optType = 1//充值业务类型 1

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

    if(!cardId){
      Alert.show("请选择就诊卡");
      return ;
    }

    //下单并支付
    new OrderAndPayModule(this.corpId, feeChannel, optType, {
      fee:price,
      patientId:patientId,
      openId:this.openId,
      cardId:cardId
    })
    .subscribe(this.refs['blockLoading'])
    .subscribe({
      onSuccess:(result)=>{
        // window.location.reload();
        // Alert.showSuccess()
        this.getNoBalanceList();//重新获取余额
        //需要更新页面余额
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
        }else{
          location.reload()
        }
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
      accounts
    } = this.state;

    return (
      <div>

        <AsyncRequestLoading ref="getPatientListLoading" text="获取就诊人..." showError={true} />
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
        		<a className="txt-arrowlink list-link-wrapper"
              onClick={()=>{
                this.setState({showSelectPateintCard:!showSelectPateintCard})
              }}

            >
        			<div className="list-content">充值账户：</div>
        			<div className="list-extra">{currentAccountName || "请选择就诊卡"}</div>
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

        <div className="btn-wrapper">
        	<button className="btn btn-block" onClick={this.onSubmitRecharge.bind(this)}>确认充值</button>
        </div>

        <SelectPatient
          display={showSelectPatient}
          patients={patients}
          onChange={this.getNoBalanceList.bind(this)}
          onCancel={()=>{
            this.setState({showSelectPatient:!showSelectPatient})
          }}
        />

        {
          //选择就诊人的卡
          <SelectPatientCard
            display={showSelectPateintCard}
            onChange={this.onChangePatientCard.bind(this)}
            onCancel={()=>{
              this.setState({showSelectPateintCard:!showSelectPateintCard})
            }}
            cards= {accounts}
          />
        }

      </div>
    )

  }
}
