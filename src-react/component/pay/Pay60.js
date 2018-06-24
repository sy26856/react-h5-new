import React from 'react'
import {SmartComponent} from '../../BaseComponent'
import util from '../../lib/util'
import cache from '../../lib/cache'
import UserCenter from '../../module/UserCenter'
import WebViewLifeCycle from '../../lib/WebViewLifeCycle'
import './pay-type-list.less'

//支付宝 1
var PAY_TYPE_ALI = "aliPay";
//微信 2
var PAY_TYPE_WX = "wxPay";
//余额 3
var PAY_TYPE_ACCOUNT = "accountPay";
//到院支付  4
var PAY_TYPE_HOSPITAL = "hospitalPay";

//公众号支付 5
var PAY_TYPE_GZH = "gzh";
//支付宝网页支付 6
var PAY_TYPE_ALI_WEB = "aliPayWeb";
//医保支付 7
var PAY_TYPE_MEDICARE = "medicare";//edicarePay
//先诊疗后付费 8
var PAY_TYPE_PAYAFTERDIAGNOSIS = "payAfterDiagnosis";//AFTER

/**
 <Pay corpId={corpId} redirect={redirect} optType={optType} patientId={patientId} price={price} onFeeChannelChange={this.onFeeChannelChange.bind(this)} />
 */
export default class Pay29 extends SmartComponent {
  /**
   props = {
      corpId: //医院id
      optType: //支付场景 //1、充值 2、缴费 3、挂号
      patientId: //就诊人
    }

   //支付方式发生变化
   onFeeChannelChange(feeChannel, optType, optParam)

   feeChannel 支付方式  //1、支付宝 2、微信 3、余额 5、到院支付
   optType 业务类型 //1、充值 2、缴费 3、挂号 5、预约
   optParam 业务参数

   */
  static defaultProps = {
    patientId: ''
  };

  constructor(props) {
    super(props)
    //本地环境支持的支付方式
    this.supportPayTypes = this.initLocalSupportPayType();

    this.feeChannelNumber = {};
    //支付宝
    this.feeChannelNumber[PAY_TYPE_ALI] = 1;
    //微信
    this.feeChannelNumber[PAY_TYPE_WX] = 2;
    //余额
    this.feeChannelNumber[PAY_TYPE_ACCOUNT] = 3;
    //到医支付
    this.feeChannelNumber[PAY_TYPE_HOSPITAL] = 4;
    //微信公众号支付
    this.feeChannelNumber[PAY_TYPE_GZH] = 5;
    //支付宝网页支付
    this.feeChannelNumber[PAY_TYPE_ALI_WEB] = 6;
    //广州医保卡支付
    this.feeChannelNumber[PAY_TYPE_MEDICARE] = 7;
    //先诊疗后付费
    this.feeChannelNumber[PAY_TYPE_PAYAFTERDIAGNOSIS] = 8;

    const query = util.query();

    this.unionId = query.unionId || '';

    this.state = {
      loading: true,
      isShowPYMedicarePayDialog:false
    }
  }

  componentDidMount() {

    if(this.props.optType != 1){
      //充值场景没有绑卡动作，不需要刷新
      let webViewLifeCycle = new WebViewLifeCycle()
      //如果从后台回复到前台，需要重新获取一次支付方式，已解决 绑卡完以后看不到卡的问题
      webViewLifeCycle.onActivation = () => {
        this.initData()
      }
    }

    this.initData();
  }

  componentWillReceiveProps(next) {
    if (next.patientId != this.props.patientId) {
      this.initData(next.patientId);
    }
  }

  initData(nextId) {
    //获取支持的支付方式
    let {corpId, optType, patientId} = this.props;
    //获取当前支持的支付方式
    UserCenter.getPayTypes(corpId, optType, nextId || patientId).subscribe(this).fetch();
  }

  onSuccess(result) {
    let data = result.data;
    let price = this.props.price || 0;
    let {accoutPay, hospitalPay, wxPay, aliPay, wxGzhPay, pyMedicarePay, aliFwcPay } = result.data;
    let afterDiagnosis = {};
    afterDiagnosis.status = true;
    let payTypes = [];
    //把支付方式添加到 this.payTypes 中
    // accoutPay.cardNo && accoutPay.status && this.isLocalSupportPayType(PAY_TYPE_ACCOUNT) && payTypes.push(PAY_TYPE_ACCOUNT)
    // aliPay.status && this.isLocalSupportPayType(PAY_TYPE_ALI) && payTypes.push(PAY_TYPE_ALI)
    // wxPay.status && this.isLocalSupportPayType(PAY_TYPE_WX) && payTypes.push(PAY_TYPE_WX)
    // hospitalPay.status && this.isLocalSupportPayType(PAY_TYPE_HOSPITAL) && payTypes.push(PAY_TYPE_HOSPITAL)

    // 是否显示绑卡 显示绑定就诊卡 没有卡号  有卡 能支持绑卡
    let isTiedCard = !accoutPay.cardNo && accoutPay.cardType && accoutPay.isTiedCard && accoutPay.status;

    //余额支付
    let isAccoutPay = accoutPay.cardNo && accoutPay.status && this.isLocalSupportPayType(PAY_TYPE_ACCOUNT);
    //支付宝支付
    let isAliPay = aliPay.status && this.isLocalSupportPayType(PAY_TYPE_ALI);
    //微信支付
    let isWXPay = wxPay.status && this.isLocalSupportPayType(PAY_TYPE_WX);
    //到院支付
    let isHospitalPay = hospitalPay.status && this.isLocalSupportPayType(PAY_TYPE_HOSPITAL);

    //微信公众号
    let isWXGzhPay = wxGzhPay.status && this.isLocalSupportPayType(PAY_TYPE_GZH);
    //医保卡支付
    let isPyMedicarePay = pyMedicarePay.status && this.isLocalSupportPayType(PAY_TYPE_MEDICARE);
    //支付宝网页支付
    let isAliFwcPay = aliFwcPay.status && this.isLocalSupportPayType(PAY_TYPE_ALI_WEB);
    //先诊疗后付费
    let isAfterDiagnosis = afterDiagnosis.status && this.isLocalSupportPayType(PAY_TYPE_PAYAFTERDIAGNOSIS);

    let checkedPayType = this.state.checkedPayType;
    if(!checkedPayType){ //重新获取支付方式的时候，不需要改变已选中的支付方式
      //余额要大于支付金额
      if (isAccoutPay && accoutPay.balance > price) {
        checkedPayType = PAY_TYPE_ACCOUNT;
      } else if (isHospitalPay) {
        checkedPayType = PAY_TYPE_HOSPITAL;
      } else if (isAliPay) {
        checkedPayType = PAY_TYPE_ALI;
      } else if (isWXPay) {
        checkedPayType = PAY_TYPE_WX;
      } else if(isWXGzhPay){
        checkedPayType = PAY_TYPE_GZH;
      } else if(isAliFwcPay){
        checkedPayType = PAY_TYPE_ALI_WEB;
      }else if(isPyMedicarePay){
        checkedPayType = PAY_TYPE_MEDICARE;
      }else if(isAfterDiagnosis){
        checkedPayType = PAY_TYPE_PAYAFTERDIAGNOSIS;
      }else{
        console.log("没有选中默认支付方式")
      }
    }
    this.setState({
      loading: false,
      success: true,
      selectPayType: "",
      //当前可支付方式状态
      hospitalPay: {
        status: hospitalPay.status
      },
      aliPay: {
        status: aliPay.status
      },
      wxPay: {
        status: wxPay.status
      },
      accoutPay: {
        cardNo: accoutPay.cardNo, //卡号
        balance: accoutPay.balance,//余额  -1 标示未能正确获取余额
        status: accoutPay.status, // 状态是否可用
        name: accoutPay.name, //就诊卡名字
        isTiedCard: accoutPay.isTiedCard, //是否允许绑卡
        cardType: accoutPay.cardType, //卡片类型
        id: accoutPay.id //卡id
      },
      wxGzhPay:{
        status:wxGzhPay.status
      },
      pyMedicarePay:{
        status:pyMedicarePay.status,
        name:pyMedicarePay.name,
        cardNo:cache.get("yibaokahao")
      },
      aliFwcPay:{
        status:aliFwcPay.status
      },
      isTiedCard: isTiedCard,
      isAccoutPay: isAccoutPay,
      isAliPay: isAliPay,
      isWXPay: isWXPay,
      isHospitalPay: isHospitalPay,
      isWXGzhPay:isWXGzhPay,
      isPyMedicarePay:isPyMedicarePay,
      isAliFwcPay:isAliFwcPay,
      isAfterDiagnosis:isAfterDiagnosis,
      //默认选中的支付方式
      checkedPayType: checkedPayType,
    });

    if (checkedPayType) {
      //默认选中的支付方式
      this.onSelectPayType(checkedPayType);
    }
  }

  //当前环境所支持的支付方式
  initLocalSupportPayType() {

    // 默认所有环境都支持 余额 支付
    var types = [PAY_TYPE_ACCOUNT, PAY_TYPE_HOSPITAL,PAY_TYPE_MEDICARE];

    //在App中增加支付宝和微信客户端支付
    if (util.isInYuantuApp()) {
      types.push(PAY_TYPE_WX);
      types.push(PAY_TYPE_ALI);
    }
   
    if(util.isInMicroMessenger()){
      types.push( PAY_TYPE_GZH );
    }else if(!util.isInYuantuApp()){
      //除微信中，其他环境均支付支付宝网页支付
      //远图app中已经有一种支付宝支付方式了，所以排除
      types.push( PAY_TYPE_ALI_WEB );
    }

    return types;

  }

  isLocalSupportPayType(type) {
    return this.supportPayTypes.indexOf(type) != -1;
  }


  onSelectPayType(type) {
    //如果是余额支付需要传卡号
    let cardId = type == PAY_TYPE_ACCOUNT ? this.state.accoutPay.cardId : "";
    let cardNo = type == PAY_TYPE_ACCOUNT ? this.state.accoutPay.cardNo : "";
    if(type == PAY_TYPE_MEDICARE){
      //如果是番禺医保卡支付，需要用户提前输入卡号，存入到缓存中
      if(!this.state.pyMedicarePay.cardNo){
        this.showPYMedicarePayDialog();
        return ;
      }else{
        cardId = this.state.pyMedicarePay.cardNo;
      }
    }

    this.setState({
      checkedPayType:type
    });

    this.props.onFeeChannelChange && this.props.onFeeChannelChange(this.feeChannelNumber[type], cardId, cardNo);
    this.props.onSelectPayType && this.props.onSelectPayType(this.feeChannelNumber[type], cardId, cardNo);

  }

  showPYMedicarePayDialog(){
    this.setState({
      pyMedicarePayInputTips:null,
      isShowPYMedicarePayDialog:true
    })
  }
  hidePYMedicarePayDialog(){
    this.setState({
      pyMedicarePayInputTips:null,
      isShowPYMedicarePayDialog:false
    });
  }
  onInputPYMedicarePayCardNo(){
    let cardNo = this.refs['pyMedicarePayInput'].value;
    if(cardNo && cardNo.trim()){
      cache.set("yibaokahao", cardNo);//缓存医保卡号
      let pyMedicarePay = this.state.pyMedicarePay;
      pyMedicarePay.cardNo = cardNo;
      this.setState({
        pyMedicarePayInputTips:null,
        isShowPYMedicarePayDialog:false,
        checkedPayType:PAY_TYPE_MEDICARE,//添加卡号，默认选中医保支付
        pyMedicarePay:pyMedicarePay
      });
      setTimeout(()=>{
        //cardNo 刚更新 state 是异步的，所以这里要延迟
        this.onSelectPayType(PAY_TYPE_MEDICARE);
      }, 0)
    }else{
      this.setState({
        pyMedicarePayInputTips:"请输入医保卡号"
      })
    }
  }
  renderError() {
    return <div className="ui-tips center">暂时无法获得可用的支付方式，请稍后再试</div>
  }

  renderLoading() {
    return <div className="ui-tips center">正在获取支付方式...</div>
  }

  render() {

    let {
      hospitalPay, aliPay, accoutPay, wxPay,wxGzhPay,pyMedicarePay,aliFwcPay,
      isTiedCard,
      isAccoutPay,
      isAliPay,
      isWXPay,
      isHospitalPay,
      isWXGzhPay,
      isPyMedicarePay,
      isAliFwcPay,
      checkedPayType,
      isShowPYMedicarePayDialog,
      pyMedicarePayInputTips,
      isAfterDiagnosis
    } = this.state;
    let {patientId, corpId, redirect, price, optType} = this.props;
    price = price || 0;
    //是否至少有一种支付方式可用
    let havePayType = isAccoutPay || isAliPay || isWXPay || isHospitalPay || isWXGzhPay || isPyMedicarePay || isAliFwcPay;

    let tips = havePayType ? "请选择一种支付方式" : isTiedCard ? "绑定就诊卡可在线支付" : "该医院不支持网上支付";
    //如果跳转到绑卡页面，绑定卡片结束以后需要跳转的地址

    redirect = redirect ? encodeURIComponent(redirect) : "";

    //没有可用的支付方式
    if (!havePayType && !isTiedCard) {
      return (
        <div className="ui-tips center">{tips}</div>
      )
    }
    return (
        <div id="pay-type-list">
          <div className="payStyle" style={{color:'#666'}}>支付方式</div>
          <div className="list-ord">
            {
              //绑定就诊卡
              isTiedCard ? <a className="list-item list-item-middel txt-arrowlink" href={
                  `./bind-card.html?${util.flat({
                    patientId: patientId,
                    corpId: corpId,
                    bindBack: 1,
                    unionId: this.props.unionId || this.unionId,
                    target: "_blank",
                    description: accoutPay.name,
                    redirect: redirect
                  })}`
                }>
                  <span className="list-icon icon-online"></span>
                  <div className="list-content ">
                    <div className="list-title  txt-prompt ">尚未绑卡，请先绑定就诊卡</div>
                  </div>
                </a> : null
            }
            {
              isAccoutPay ? <label htmlFor="radio1" className="list-label-wrapper">
                  <div className="list-item list-item-middel list-nowrap">
                    <div className="list-icon icon-online" style={{backgroundImage:'url(https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/570cd9eb67e080005320c0fe38d4792a-84-84.png)'}}></div>
                    <div className="list-content " style={{position:'relative'}}>
                      <div className="list-title ">{accoutPay.name} {accoutPay.idType == 1?
                        <span> (尾号{accoutPay.cardNo.slice(-4)})</span>:null}</div>
                      <div className=" list-brief txt-insign ">
                            {util.rmb(accoutPay.balance / 100)< this.props.price ?
                              <span style={{color:"#ff5256"}}>余额:&yen;{util.rmb(accoutPay.balance / 100)}</span>
                                  :
                                  <span style={{color:'#333333'}}>余额:&yen;{util.rmb(accoutPay.balance / 100)}</span>
                          }
                      </div>
                      {/* 预约 */}
                      {
                        optType == 6 ? <div className="list-brief">就诊当天无需支付，取号更快捷</div> : null
                      }
                    </div>
                    <label className="radio-wrapper radio-right">
                      <input type="radio" name="radio" disabled={accoutPay.balance < price} id="radio1"
                            checked={checkedPayType == PAY_TYPE_ACCOUNT}
                            onChange={this.onSelectPayType.bind(this, PAY_TYPE_ACCOUNT)}/>
                    </label>
                  </div>
                </label> : null
            }
            {
              isAfterDiagnosis ? (
                <label htmlFor="radio2" className="list-label-wrapper">
                  <div className="list-item list-item-middel list-nowrap">
                    <div className="list-icon icon-outline"></div>
                    <div className="list-content ">
                      <div className="list-title ">先诊疗后付费</div>
                      <div className="list-brief txt-nowrap">挂号费用在取号时支付</div>
                    </div>
                    <label className="radio-wrapper radio-right">
                      <input type="radio" name="radio" id="radio2-a" checked={checkedPayType == PAY_TYPE_PAYAFTERDIAGNOSIS}
                            onChange={this.onSelectPayType.bind(this, PAY_TYPE_PAYAFTERDIAGNOSIS)}/>
                    </label>
                  </div>
                </label>
              ) : null
            }
            {
              isHospitalPay ? (
                <label htmlFor="radio2" className="list-label-wrapper">
                  <div className="list-item list-item-middel list-nowrap">
                    <div className="list-icon icon-outline"></div>
                    <div className="list-content ">
                      <div className="list-title ">到院支付</div>
                      <div className="list-brief txt-nowrap">预约费用在取号时支付</div>
                    </div>
                    <label className="radio-wrapper radio-right">
                      <input type="radio" name="radio" id="radio2" checked={checkedPayType == PAY_TYPE_HOSPITAL}
                            onChange={this.onSelectPayType.bind(this, PAY_TYPE_HOSPITAL)}/>
                    </label>
                  </div>
                </label>
              ) : null
            }

            {
              isAliPay ? (
                <label htmlFor="radio4" className="list-label-wrapper">
                  <div className="list-item list-item-middel ">
                    <span className="list-icon icon-alipay"></span>
                    <div className="list-content">
                      <div className="list-title">支付宝支付</div>
                    </div>
                    <span className="radio-wrapper">
                      <input type="radio" name="radio" id="radio4" checked={checkedPayType == PAY_TYPE_ALI}
                            onChange={this.onSelectPayType.bind(this, PAY_TYPE_ALI)}/>
                    </span>
                  </div>
                </label>
              ) : null
            }

            {
              isAliFwcPay ? (
                <label htmlFor="radio4" className="list-label-wrapper">
                  <div className="list-item list-item-middel ">
                    <span className="list-icon icon-alipay"></span>
                    <div className="list-content">
                      <div className="list-title">支付宝支付</div>
                    </div>
                    <span className="radio-wrapper">
                      <input type="radio" name="radio" id="radio4" checked={checkedPayType == PAY_TYPE_ALI_WEB}
                            onChange={this.onSelectPayType.bind(this, PAY_TYPE_ALI_WEB)}/>
                    </span>
                  </div>
                </label>
              ) : null
            }

            {
              isWXGzhPay ? (
                <label htmlFor="radio3" className="list-label-wrapper">
                  <div className="list-item  list-item-middel ">
                    <span className="list-icon icon-weixin"></span>
                    <div className="list-content ">
                      <div className="list-title ">微信支付</div>
                    </div>
                    <span className="radio-wrapper">
                      <input type="radio" name="radio" id="radio3" checked={checkedPayType == PAY_TYPE_GZH}
                            onChange={this.onSelectPayType.bind(this, PAY_TYPE_GZH)}/>
                    </span>
                  </div>
                </label>
              ) : null
            }

            {
              isWXPay ? (
                <label htmlFor="radio3" className="list-label-wrapper">
                  <div className="list-item  list-item-middel ">
                    <span className="list-icon icon-weixin"></span>
                    <div className="list-content ">
                      <div className="list-title ">微信支付</div>
                    </div>
                    <span className="radio-wrapper">
                      <input type="radio" name="radio" id="radio3" checked={checkedPayType == PAY_TYPE_WX}
                            onChange={this.onSelectPayType.bind(this, PAY_TYPE_WX)}/>
                    </span>
                  </div>
                </label>
              ) : null
            }

            {
              isPyMedicarePay ? (
                <label className="list-label-wrapper" onClick={!pyMedicarePay.cardNo ? this.showPYMedicarePayDialog.bind(this) : null} >
                  <div className="list-item list-item-middel list-nowrap">
                    <div className="list-icon icon-yibao"></div>
                    <div className="list-content ">
                      <div className="list-title ">
                        {pyMedicarePay.name}
                      </div>
                      <div className=" list-brief txt-insign ">
                        {
                          pyMedicarePay.cardNo ?
                            <span className="pay-number">{pyMedicarePay.cardNo} <span onClick={this.showPYMedicarePayDialog.bind(this)} className="txt-prompt">修改卡号</span></span>
                          : <span onClick={this.showPYMedicarePayDialog.bind(this)} className="txt-prompt">点击添加卡号</span>
                        }
                      </div>
                    </div>
                    <label className="radio-wrapper radio-right">
                      {
                        pyMedicarePay.cardNo ? <input type="radio" name="radio" checked={checkedPayType == PAY_TYPE_MEDICARE}
                              onChange={this.onSelectPayType.bind(this, PAY_TYPE_MEDICARE)} /> : null
                      }
                    </label>
                  </div>
                </label>
              ) : null
            }
            {
              isShowPYMedicarePayDialog && isPyMedicarePay ? (
                <div className="modal-mask ">
                  <div className="modal-wrapper">
                    <div className="modal">
                      <div className="modal-title">请输入医保卡号：</div>
                      <div className="modal-body ">
                        <input className="modal-input" ref="pyMedicarePayInput" type="text" placeholder="请输入医保卡号" autoFocus defaultValue={pyMedicarePay.cardNo} />
                        <div className="txt-insign txt-warning">{pyMedicarePayInputTips}</div>
                      </div>
                      <div className="modal-footer">
                        <div className="modal-button-group-h">
                          <a  className="modal-button" onClick={this.hidePYMedicarePayDialog.bind(this)}>取消</a>
                          <a  className="modal-button" onClick={this.onInputPYMedicarePayCardNo.bind(this)}>确定</a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ):null
            }
          </div>
        </div>  
    )
  }
}
