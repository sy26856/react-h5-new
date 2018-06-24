import React from 'react';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import './patient-card-detail.less';
import BlockLoading from './component/loading/BlockLoading';
import Confirm from './component/confirm/Confirm';
import config from './config';

export default class PatientCardDetail extends SmartBlockComponent {

  constructor(props) {
    super(props);

    const query = util.query();
    this.unionId = query.unionId || '';
    this.id = query.id || ''; //卡id
    this.patientId = query.patientId || '';
    this.timer = null;
    this.currentPage = 1;
    this.totalPage = 1;
    this.pageLoading = false;

    this.state = {
      loading: true,
      data: null,
      show: false,
      cardList: null
    }
  }

  componentDidMount() {
    window.onscroll = this.handleScroll;
    UserCenter.getCardDetail(this.id, this.unionId).subscribe({
      onSuccess: (result) => {
        this.setState({
          data: result.data,
          loading: false,
          success: true
        });
      }
    }).fetch();
    UserCenter.myCardBills(this.id, 10, 1, this.unionId).subscribe({
      onSuccess: (result) => {
        this.totalPage = Math.ceil(result.data.totalItem / result.data.pageSize) || 1;
        this.setState({
          cardList: result.data.data || []
        });
      }
    }).fetch();
  }

  handleScroll = () => {
    clearTimeout(this.timer);
    this.timer = setTimeout(async () => {
      try {
        const scrollHeight = document.body.scrollHeight;
        const scrollTop = document.body.scrollTop;
        const screenHeight = window.screen.height;
        const isBottom = scrollHeight - scrollTop < screenHeight + 20;

        if (isBottom && (!this.pageLoading) && this.totalPage > this.currentPage) {
          this.pageLoading = true;
          BlockLoading.show();
          const result = await UserCenter.myCardBills(this.id, 10, this.currentPage + 1, this.unionId).fetch();
          BlockLoading.hide();
          this.pageLoading = false;
          if (this.currentPage < this.totalPage) {
            const list = JSON.parse(JSON.stringify(this.state.cardList));
            const dataList = list.concat(result.data ? result.data.data : []);
            this.currentPage++;
            this.setState({
              cardList: dataList
            })
          }
        }
      } catch (e) {
        console.log(e);
        this.pageLoading = false;
        BlockLoading.hide();
      }
    }, 250);
  }

  cardInfo() {
    const {data} = this.state;
    return (
      <div>
        <p className="list-header">就诊卡信息</p>
        <ul className="list-ord">
          <li className="list-item ">
            <div className="list-content txt-nowrap ">
              <div className="list-title txt-nowrap card-item-txt">持卡人</div>
            </div>
            <div className="list-extra card-item-extra">{data.patientName || ''}</div>
          </li>
          <li className="list-item ">
            <div className="list-content txt-nowrap ">
              <div className="list-title txt-nowrap card-item-txt">预留号码</div>
            </div>
            <div className="list-extra card-item-extra">{data.mobile || ''}</div>
          </li>
          <li className="list-item ">
            <div className="list-content txt-nowrap ">
              <div className="list-title txt-nowrap card-item-txt">卡内余额</div>
            </div>
            <div className="list-extra" style={{color: '#f15a4a'}}>¥ {data.balance / 100 > 0 ? data.balance / 100 : 0}</div>
          </li>
        </ul>
      </div>
    );
  }

  toBillDetail(item) {
    const urlInfo = {
      id: item.id,
      unionId: this.unionId,
      corpId: item.corpId,
      target: '_blank'
    };
    window.location.href = `./bill-detail.html?${util.flat(urlInfo)}`;
  }

  cardPayInfo() {
    const {cardList} = this.state;
    if (cardList.length > 0) {
      return (
        <div>
          <p className="list-header">
            就诊卡明细
            <span className="list-header-extra">单击明细条目可查看详情</span>
          </p>
          <ul className="list-ord">
            {cardList.map((item) => <li key={item.id} className="list-item list-item-middel" onClick={() => this.toBillDetail(item)}>
              <div className="list-content">
                <div className="list-title">{item.subject}-{item.corpName}</div>
                <div className="list-brief ">{item.createTime}</div>
              </div>
              <div className="list-extra card-pay-txt" style={item.isAdd ? {color: '#76acf8'} : {}}>{(item.billFee / 100).toFixed(2)}</div>
            </li>)}
          </ul>
        </div>
      );
    }
    return null;
  }

  reBind() {
    this.setState({
      show: true,
    });
  }

  recharge() {
    const {data} = this.state;
    let corpId = '';
    if (data.corpId) {
      corpId = data.corpId;
    } else if (this.unionId == 29) {
      corpId = 261;
    } else if (this.unionId == 60) {
      corpId = 549;
    }

    sessionStorage.rechargeInfo = JSON.stringify({
      patientId: this.patientId,
      cardId: this.id,
    });
    window.location.href = `${config.TMS_DOMAIN}/tms/h5/recharge.php?corpId=${corpId}&unionId=${this.unionId}&target=_blank`;
  }

  confirmCallback(confirm) {
    this.setState({
      show: false
    });
    if (confirm) {
      const {data} = this.state;
      const urlInfo = {
        patientId: this.patientId,
        cardType: data.cardType || '',
        unionId: this.unionId,
        rebind: 1,
        target: '_blank'
      };
      window.location.href = `./bind-card.html?${util.flat(urlInfo)}`;
    }
  }

  render() {
    const {data, show} = this.state;
    const cardNo = data.cardNo ? data.cardNo.toString() : '';
    let hideStr = '';
    for (let i=0; i<cardNo.length-8; i++) {
      hideStr += '*';
    }
    const cardNoStr = cardNo.slice(0, 4) + hideStr + cardNo.slice(-4);
    return (
      <div>
        <div className="card-info-header">
          <div className="card-info-container">
            <div className="card-info-item">
              <span></span>
              {data.cardName}
            </div>
            <div className="card-info-item" style={{fontSize: '20px'}}>{cardNoStr}</div>
          </div>
        </div>

        <div style={{paddingBottom: '10px'}}>
          {this.cardInfo()}
          {this.cardPayInfo()}
        </div>

        <div className="fixed-foot-wrapper">
          <div className="btn-wrapper g-footer">
            <button className="btn btn-lg btn-secondary g-left" onClick={() => this.reBind()}>重新绑定</button>
            <button className="btn btn-lg g-right" onClick={() => this.recharge()}>我要充值</button>
          </div>
        </div>

        {
          show && <Confirm display={true} title="确认重新绑定？" okText="重新绑定" des="重新绑定就诊卡将更新此类就诊卡账单信息" callback={(confirm) => this.confirmCallback(confirm)}/>
        }
      </div>
    );
  }
}

//旧代码

// "use strict";
//
// import React from 'react'
// import util from './lib/util'
// import UserCenter from './module/UserCenter'
// import Confirm from './component/confirm/Confirm'
// import {BlockLoading} from './component/loading/index'
// import Alert from './component/alert/alert'
// import {SmartBlockComponent} from './BaseComponent/index'
//
// //医保个人账户详情页面
// //当前页面仅仅支持 卡片类型为6，其他卡片详情页在老版本中
// export default class PatientCardDetail extends SmartBlockComponent{
//   constructor(props) {
//     super(props);
//
//     let query = util.query();
//     this.id = query.id;
//     this.cardName = query.cardName;
//     this.cardType = query.cardType;
//     this.unionId = query.unionId;
//     this.patientId = query.patientId;
//     this.cardNo = query.cardNo;
//
//   }
//
//   componentDidMount() {
//     this.setState({
//       loading:false,
//       success:true,
//       id:this.id,
//       cardName:this.cardName,
//       cardType:this.cardType,
//       unionId:this.unionId,
//       patientId:this.patientId,
//       cardNo:this.cardNo
//     })
//   }
//
//   //解除绑定
//   async onUnbind(){
//
//     let is = await Confirm.confirm(this.refs.cancelDialog);
//     if(is){
//       BlockLoading.show();
//       try{
//         var result = await UserCenter.cancelBindCard(this.id, this.unionId).fetch();
//         if(result.success){
//           Alert.show("解除绑定成功");
//           setTimeout(()=>{
//             //返回上一个页面并刷新
//             util.goBack(true);
//           },1000)
//         }else{
//           Alert.show(result.msg);
//         }
//       }catch(e){
//         Alert.show(e.msg);
//       }
//       BlockLoading.hide();
//     }
//
//   }
//
//   render(){
//
//     let {cardNo, id, cardType, unionId, patientId, cardName} = this.state;
//     return <div>
//       <div className="list-ord g-space">
//         <div className="list-item  list-item-middel ">
//           <span className="list-icon icon-online"></span>
//           <div className="list-content ">
//             <div className="list-title ">{cardName}</div>
//             <div className=" list-brief ">{cardNo}</div>
//           </div>
//         </div>
//       </div>
//       <div className="panel g-space">
//         <div className="panel-title">医疗保险卡介绍</div>
//         <div className="panel-msg">
//         社会医疗保险卡，简称医疗保险卡或医保卡，是医疗保险个人帐户专用卡，以个人身份证为识别码，储存记载着个人身份证号码、姓名、性别以及帐户金的拨付、消费情况等详细资料信息。医保卡由当地指定代理银行承办，是银行多功能借计卡的一种。参保单位缴费后，地方医疗保险事业部门在月底将个人帐户金部分委托银行拨付到参保职工个人医保卡上。
//         </div>
//       </div>
//       <Confirm ref='cancelDialog' title="解除绑定" des="您确认要取消当前订单吗?" okText="解除绑定" />
//       <div className="btn-wrapper g-footer">
//         <button className="btn btn-secondary btn-block" onClick={this.onUnbind.bind(this)}>解除绑定</button>
//       </div>
//     </div>
//   }
//
// }
