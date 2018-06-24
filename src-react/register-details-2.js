"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import Aolsee from './module/Aolsee'
import {SmartBlockComponent} from './BaseComponent/index'
import CountDown from './component/CountDown'
import TopTips from './component/TopTips/TopTips'
import PayDialog from './component/pay/PayDialog'
import Alert from './component/alert/alert'
import AlertTip from './component/alert/alertTip'
import Confirm from './component/confirm/Confirm'

import Evaluate from './component/evaluate'
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import {BlockLoading} from './component/loading/index'
import Confirm2 from './component/confirm/Confirm2'
import {TMS_DOMAIN} from './config'
import hybridAPI from './lib/hybridAPI'
import JSBridge from './lib/JSBridge'
import './bill-detail.less'
import './register-details-2.less'
import ReactSwipe from 'react-swipe'
import config from './config'
import Modal from './component/modal/Modal'

let REG_TYPE_TEXT = {
  "1": "普通挂号",
  "2": "专家挂号",
  "3": "名医挂号",
  "14": "急诊挂号",
  "15": "便民挂号",
  "16": "视频问诊挂号",
  "4": "普通预约",
  "5": "专家预约",
  "6": "名医预约",
  "54": "急诊预约",
  "55": "便民预约",
  "56": "视频问诊预约"
};


//我的账单
export default class BillDetail extends SmartBlockComponent {
  constructor(props) {

    super(props);
    let query = util.query();
    this.id = query.id;
    this.uriPay = query.pay;
    this.corpId = query.corpId;
    this.unionId = query.unionId || '';
    this.showPay = query.showPay || '';
    this.openId = query.openId
    //从预约流程跳转过来的话，则带guide参数
    this.guide = query.guide || '';
    //确认支付按钮被点击
    this.state.confirmPay = false;
    this.state.isEvaluate = true;
    this.state.evaluateReady = false;
    this.state.show = false;
    this.state.adPositionTypeList = []
    this.state.contentTip = '';
    this.state.isBindweChatApp = 1;
    this.state.isLoading = false;//绑定微信时的加载图标是否展示
    this.state.isBindweChatOfficialAccount=1
  }
  componentDidMount() {
    if (util.isInYuantuApp() && util.getPlatform() === 'ios' && this.guide == '1' && util.version.gt(3, 0, 0)) {
      hybridAPI.guide("15");
    } 
    if (util.isInYuantuApp()) {
      hybridAPI.setTitle("预约/挂号详情");
    }
    if (this.showPay) {
      this.setState({
        confirmPay: true,
      })
    }
    UserCenter.reginfodetail(this.id, this.corpId, this.unionId)
      .subscribe(this)
      .fetch()
      //展示弹窗
    UserCenter.appointRegInfoWindowMsg(this.id,this.unionId).subscribe({
      onSuccess:(result)=>{
        this.setState({
          contentTip:result.data.msg,
          isBindweChatApp:result.data.isBindweChatApp,
          isBindweChatOfficialAccount: JSON.stringify(result.data) == "{}" ? 1 : result.data.isBindweChatOfficialAccount
        })
      }
    }).fetch()

  }

  onSuccess(result) {
    let data = result.data;
    var self = this;
    this.setState(
      {
        loading: false,
        success: true,
        canAppointRegAgain: data.canAppointRegAgain,
        canAppointRegSecondTime: data.canAppointRegSecondTime,
        canCancel: data.canCancel,
        canPay: data.canPay,
        canQueue: data.canQueue,
        canRegAgain: data.canRegAgain,
        cancelReasonList: data.cancelReasonList || [],
        cancelReasonType: data.cancelReasonType,
        id: data.idStr,//订单编号
        status: data.status,//状态
        statusDes: data.statusDes, //状态描述
        statusDesc: data.statusDesc,//状态描述
        type: data.type, //预约类型
        deptCode: data.deptCode,//科室id
        deptName: data.deptName, //可是名字
        regMode: data.regMode,// 1预约 2 挂号
        regType: data.regType,
        orderNo: data.orderNo, //预约号
        medDateBeg: data.medDateBeg, // 就诊开始时间
        medDateEnd: data.medDateEnd,// 就诊结束时间
        regAmount: data.regAmount, //订单金额
        benefitRegAmount: data.benefitRegAmount, //实付金额
        patientId: data.patientId, //就诊人id
        corpId: data.corpId, //医院id
        corpName: data.corpName,//医院名
        doctCode: data.doctCode,//医生code
        doctName: data.doctName, //医生姓名
        patientName: data.patientName,
        idNo: data.idNo,//就诊人身份证信息
        guarderIdNo: data.guarderIdNo,//监护人身份证信息
        appoNo: data.appoNo, // 挂号序号
        medAmPm: data.medAmPm, //1 , 2
        medEndTime: data.medEndTime,
        address: data.address, // 就诊地点
        info: data.info, //其他信息
        payStatus: data.payStatus, //支付状态
        createDate: data.createDate, //创建时间
        oppatNo: data.oppatNo, //网关返回门诊号
        cardNo: data.cardNo,  //就诊卡号
        transNo: data.transNo, //交易流水号
        tradeMode: data.tradeMode,//支付方式，key  //CA：现金，DB：银行卡，MIC：医保卡，OC：银医通账户，ZFB：支付宝，WX:微信 不可空
        payTypeDesc: data.payTypeDesc,//支付方式 中文
        expirationTime: data.expirationTime, //倒计时
        expirationTimeText: "",//倒计时文字
        canEvaluate: data.canEvaluate,//是否可以进行就诊评价
        canAppendEvaluate: data.canAppendEvaluate,//是否可以追加评价
        isPay: data.status == 100, //是否显示支付按钮
        confirmPay: data.status == 100 && this.uriPay,//是否立即显示支付弹窗
        canCancelReg:data.canCancelReg,//是否可以申请在线退号
      }
    )
    //支付倒计时
    if (data.expirationTime > 0) {
      new CountDown(data.expirationTime, (time, s, f, m) => {

        this.setState({
          expirationTime: time,
          expirationTimeText: f > 0 ? f + ":" + m : m + "秒"
        })

        if (time <= 0) {
          this.componentDidMount();
        }
      }).start();
    }

    this.getAdPositionType(data)// 请求广告
  }

  getAdPositionType(data) {
    let {corpId, deptName, patientId} = data
      , unionId = this.unionId
      , patientSex = ''
      , patientAge = ''

      , adThis = {
      _this: this
      , onSuccess(result) { // 广告获取成功
        if (result.success) {
          this._this.setState({
            adPositionTypeList: result.data
          })
        }
      }
    }
      , baseInfoThis = {
      _this: this
      , onSuccess(result) {
        if (result.success) {
          const {birthday, sex} = result.data
          let patientYear = new Date(birthday).getFullYear()
            , yearIng = new Date().getFullYear()
          patientSex = sex || ''
          patientAge = (yearIng - patientYear)
          let userId = result.data.userId||''
          Aolsee.getAdPositionType(deptName, patientId, patientAge, patientSex, unionId,userId)
            .subscribe(adThis)
            .fetch()
        }
      }
    }

    UserCenter.getBaseInfo(corpId, unionId, patientId)
      .subscribe(baseInfoThis)
      .fetch()
  }

  setEvaluate(isEvaluate) {
    this.setState({
      isEvaluate: isEvaluate,
      evaluateReady: true
    })
  }

  //渲染订单状态
  renderStatus() {
    /***
     {
       '100':待支付
       '101':支付成功-his失败
       '200':已预约
       '201':已挂号
       '301':挂号失败，退款中
       '302':挂号失败，退款成功
       '303':挂号失败，退款失败
       '400':已取消
       '401':已过期(12.26新增)
       '605':手动退费成功
       '606':手动退费失败
       '700':已停诊
     }
     payStatus: //支付状态
     {
       '100':未支付,
       '200':支付成功,
       '201':支付失败,
       '500':已退费
     }
     */


    let {status, payStatus, evaluateReady, cancelReasonType, isEvaluate, cancelReasonList, expirationTimeText, expirationTime, regMode, statusDes, statusDesc, canEvaluate, createDate, medDateBeg, medDateEnd,corpId} = this.state;
    let isYuYue = regMode == 1;
    let isGuahao = regMode == 2;

    let cancelReasonText = '';
    if (status == 400) {
      const cancelItem = cancelReasonList.filter(z => z.type === cancelReasonType)[0];
      cancelReasonText = (cancelItem && cancelItem.name) || '';
    }

    var statusTextMap = {
      '100': {
        //title: "待确认",
        title: "待付款",
        des: `订单将在<span class="des-info">${expirationTimeText}</span>后取消，请尽快完成支付`
      },
      '101': {
        title: "待确认",
        des: "已支付，等待医院处理"
      },
      '200': {
        //title: "预约成功",
        title: "待取号",
        des: `请在 <span class="des-info">${util.dateFormatGMT(corpId==2001?medDateEnd:medDateBeg)}</span> 前完成取号`
      },
      '201': {
        title: "挂号成功",
        //des: "请携带就诊人所绑定的就诊卡，按约定的时间地点进行候诊"
        des: "无须取号，请到候诊区等候叫号就诊"
      },
      '301': {
        title: "已取消",
        des: "挂号失败，退款中"
      },
      '302': {
        title: "已取消",
        des: "挂号失败，退款成功"
      },
      '303': {
        title: "已取消",
        des: "挂号失败，退款失败"
      },
      //todo 这里需要分为主动退号 和其他退号方式
      '400': {
        title: "已取消",
        des: `取消原因：${cancelReasonText}`
      },
      '401': {
        //title: "已取消",
        title: "未取号",
        //401  payStatus 100 超时取消 200主动取消
        //des:{"100":"订单超时，该订单已失效","200":"您已取消了订单"}[payStatus] || "订单已取消"
        //des: "未在规定时间内取号，系统取消了订单"
        des: "您未在约定时间前取号，系统会取消订单。"
      },
      '404': {
        title: "已取消",
        des: "订单超时，该订单已失效，请重新选择号源挂号"
      },
      '605': {
        title: "已取消",
        des: "手动退费成功"
      },
      '606': {
        title: "已取消",
        des: "手动退费失败"
      },
      '700': {
        title: "已取消",
        des: "非常抱歉，该医生已经停诊，请重新预约其他医生"
      }
    };

    let statusText = statusTextMap[status] || {title: statusDes, des: statusDesc};

    //手动添加退号提示文本
    if (statusDes == '已退号') {
      statusText = {title: '已退号', des: '您已退号成功'}
    }

    //等待确认
    let waitConfirmStatus = [100, 101];
    //成功
    let successStatus = [200, 201];
    //成功预约变成201表示已取号
    let successStatus201 = [201];
    //取消预约
    let cancelStatus = [301, 302, 303, 400, 401, 404, 605, 606, 700];  //新增404
    let notOffer = [401];
    let isCancelStatus = cancelStatus.indexOf(status) != -1;
    //完成预约
    let overStatus = [];
    let iconClassName = "icon-hook";

    let progress = [];

    if (isYuYue) {
      //预约
      progress = [
        {
          className: "",
          text: "等待确认"
        },
        {
          className: "",
          text: "取号就诊"
        },
        {
          className: "",
          text: "完成就诊"
        }
      ];
      if (status == 401) {
        progress = [
          {
            className: "",
            text: "预约成功"
          },
          {
            className: "",
            text: "预约取消"
          },
        ];
      }
      //等待确认状态
      if (waitConfirmStatus.indexOf(status) != -1) {
        iconClassName = "icon-data-y"
        progress[0] = {
          className: "step-waiting1",
          text: "等待确认"
        }
      }
      //已确认
      if (successStatus.indexOf(status) != -1) {
        iconClassName = "icon-data-ready"
        progress[0] = {
          className: "step-waiting2",
          text: "预约成功"
        }
        progress[1] = {
          className: "",
          text: "取号就诊"
        }
      }

      //已取号
      if (successStatus201.indexOf(status) != -1 && regMode == 1) {
        iconClassName = "icon-card"
        progress[0] = {
          className: "step-finish",
          text: "预约成功"
        }
        progress[1] = {
          className: "step-waiting1",
          text: "已取号"
        }

        statusText.title = "已取号"
        statusText.des = "取号成功，请前往就诊地点候诊"
      }

      if (canEvaluate) {
        iconClassName = "icon-hook"
        progress[0] = {
          className: "step-finish",
          text: "预约成功"
        }
        progress[1] = {
          className: "step-finish",
          text: "已取号"
        }
        progress[2] = {
          className: "step-finish",
          text: "完成就诊"
        }
        iconClassName = "icon-hook-gray"
        statusText.title = "已就诊"
        statusText.des = "您已完成就诊，祝您早日康复，也请对本次就诊服务进行评价。（以医院提供就诊状态为准）"
      } else if (isEvaluate) {
        iconClassName = "icon-hook-gray"
        statusText.title = "已就诊"
        statusText.des = "您已完成就诊，祝您早日康复，也请对本次就诊服务进行评价。（以医院提供就诊状态为准）"
      }


      if (notOffer.indexOf(status) != -1) {
        progress[0] = {
          className: "",
          text: "预约成功"
        }
        progress[1] = {
          className: "",
          text: "预约取消"
        }
      }
    }


    if (isGuahao) {
      progress = [
        {
          className: "",
          text: "等待确认"
        },
        {
          className: "",
          text: "完成就诊"
        }
      ];

      //等待确认状态
      if (waitConfirmStatus.indexOf(status) != -1) {
        iconClassName = "icon-data-y-wait"
        progress[0] = {
          className: "step-waiting1",
          text: "等待确认"
        }
      }
      //已确认
      if (successStatus.indexOf(status) != -1) {
        iconClassName = "icon-hook"
        progress[0] = {
          className: "step-waiting2",
          text: "挂号成功"
        }
        progress[1] = {
          className: "",
          text: "完成就诊"
        }
      }


      if (canEvaluate) {
        iconClassName = "icon-hook"
        progress[0] = {
          className: "step-finish",
          text: "挂号成功"
        }
        progress[1] = {
          className: "step-finish",
          text: "完成就诊"
        }
        statusText.title = "已就诊"
        statusText.des = "您已完成就诊，祝您早日康复，也请对本次就诊服务进行评价。（以医院提供就诊状态为准）"
        iconClassName = "icon-hook-gray"
      } else if (isEvaluate) {
        iconClassName = "icon-hook-gray"
        statusText.title = "已就诊"
        statusText.des = "您已完成就诊，祝您早日康复，也请对本次就诊服务进行评价。（以医院提供就诊状态为准）"
      }
    }

    if (isCancelStatus) {
      iconClassName = "icon-cross";
    }
    if (status == 401) {
      //iconClassName = "icon-401"
    }

    return (
      <div className="panel g-space">
        <div className="list-ord">
          <div className="list-item">
            <span className={`list-icon-sm ${iconClassName}`}/>
            <div className="list-content">
              <div className="list-title">{statusText.title}</div>
              <div className="list-brief" dangerouslySetInnerHTML={{__html: statusText.des}}></div>
            </div>
          </div>
        </div>
      </div>
    )

  }

  // 广告渲染
  renderAdPositionType() {
    let list = this.state.adPositionTypeList
    if (list.length > 0) {
      return (
        <ReactSwipe className="ad-banner" swipeOptions={{continuous: false}}>
          {
            list.map(function (item, key) {
              let {redirecUrl, imgUrl} = item
              redirecUrl = redirecUrl ? redirecUrl : ''
              return <div key={key}>
                { redirecUrl == '' ? <a className="ad-img"
                                        style={{backgroundImage: `url(${imgUrl})`}}
                  ></a> : <a className="ad-img" href={redirecUrl}
                             style={{backgroundImage: `url(${imgUrl})`}}
                  ></a> }
              </div>
            })
          }
        </ReactSwipe>
      )
    } else {
      return null
    }
  }

  //渲染就诊基本信息
  renderDetailsBaseInfo() {

    let {corpName, corpId, deptName, doctName, appoNo, medDateBeg, deptCode, doctCode, medAmPm, orderNo, medDateEnd, type, regType, address, regMode} = this.state;
    var medAmPmText = {"1": "上午", "2": "下午"}[medAmPm] || "";
    var regTimeText = regMode == 1 ?
      util.dateFormatGMT(medDateBeg, "yyyy-MM-dd") + " " + util.dateFormatGMT(medDateBeg, 'hh:mm') /*+ "~" + util.dateFormatGMT(medDateEnd, 'hh:mm')*/
      : util.dateFormatGMT(medDateBeg, "yyyy-MM-dd") + " " + util.dateFormatGMT(medDateBeg, 'hh:mm') + "~" + util.dateFormatGMT(medDateEnd, 'hh:mm');

    const urlInfo = {
      corpId,
      deptCode,
      regType,
      regMode,
      deptName,
      unionId: this.unionId,
      target: '_blank'
    };

    return (
      <div className="panel g-space">
        <div className="panel-title">{regMode == 1 ? '预约信息' : '挂号信息'}</div>
        <ul className="list-ord ">
          <li className="list-item list-item-middel">
            <a href={`./pages/index.html?corpId=${corpId}&unionId=${this.unionId}&target=_blank`}
               className="txt-arrowlink list-link-wrapper">
              <div className="list-brief-title">医院</div>
              <div className="list-content">{corpName}</div>
            </a>
          </li>
          <li className="list-item list-item-middel">
            <a
              href={`./appointment-select.html?corpId=${corpId}&deptCode=${deptCode}&regType=${regType}&regMode=${regMode}&deptName=${deptName}&unionId=${this.unionId}&target=_blank`}
              className="txt-arrowlink list-link-wrapper">
              <div className="list-brief-title">科室</div>
              <div className="list-content">{deptName}</div>
            </a>
          </li>
          {
            doctName ? (
                <li className="list-item list-item-middel">
                  <a
                    href={`./doctor.html?corpId=${corpId}&deptCode=${deptCode}&doctCode=${doctCode}&doctName=${doctName}&corpName=${corpName}&unionId=${this.unionId}&target=_blank`}
                    className="txt-arrowlink list-link-wrapper">
                    <div className="list-brief-title">医生</div>
                    <div className="list-content">{doctName}</div>
                  </a>
                </li>
              ) : null
          }
        </ul>
        <ul className="list-ord">
          <li className="list-item list-item-noborder">
            <div className="list-brief-title">门诊类型</div>
            <div className="list-content txt-nowrap">{REG_TYPE_TEXT[type]}</div>
          </li>
          {corpId==2001?null:<li className="list-item list-item-noborder">
            <div className="list-brief-title">序号</div>
            <div className="list-content txt-nowrap">{(appoNo || "未出") + "号"}</div>
          </li>}
          {corpId==2001?null:<li className="list-item list-item-noborder">
            <div className="list-brief-title">就诊时间</div>
            <div className="list-content txt-nowrap txt-prompt">{regTimeText}</div>
          </li>}
          {
            address ? <li className="list-item list-item-noborder">
                <div className="list-brief-title">就诊地点</div>
                <div className="list-content txt-nowrap">{address}</div>
              </li> : null
          }

          {
            util.is(regMode == 1 && orderNo, (
              <li className="list-item list-item-noborder">
                <div className="list-brief-title">取号密码</div>
                <div className="list-content txt-nowrap txt-prompt">{orderNo}</div>
              </li>
            ))
          }
        </ul>
      </div>
    )
  }

  //渲染就诊人信息
  renderPatientInfo() {
    let {patientName, cardNo, idNo, guarderIdNo} = this.state;
    return (
      <div className="panel g-space">
        <div className="panel-title">就诊人信息</div>
        <ul className="list-ord">
          <li className="list-item list-item-noborder">
            <div className="list-brief-title">就诊人</div>
            <div className="list-content txt-nowrap">{patientName}</div>
          </li>
          {
            cardNo ? <li className="list-item list-item-noborder">
                <div className="list-brief-title">绑定卡号</div>
                <div className="list-content txt-nowrap">{cardNo}</div>
              </li> : null
          }
          {idNo ?
            <li className="list-item list-item-noborder">
              <div className="list-brief-title">身份证号</div>
              <div className="list-content txt-nowrap txt-prompt">{idNo}</div>
            </li> :
            <li className="list-item list-item-noborder">
              <div className="list-brief-title">监护人身份证</div>
              <div className="list-content txt-nowrap txt-prompt">{guarderIdNo}</div>
            </li>
          }
        </ul>
      </div>
    )
  }

  //支付信息
  renderPayInfo() {
    let {id, createDate, regAmount, payStatus, benefitRegAmount, payTypeDesc, tradeMode} = this.state;
    let youhui = regAmount - benefitRegAmount;
    let isShowPayStatus = tradeMode != "HP";
    return (
      <div className="panel g-space">
        <div className="panel-title">订单信息
          {
            util.is(isShowPayStatus && payStatus == 100, <span className="txt-prompt panel-extra">未支付</span>)
          }
          {
            util.is(isShowPayStatus && payStatus == 200, <span className="txt-prompt panel-extra">已支付</span>)
          }
          {
            util.is(isShowPayStatus && payStatus == 201, <span className="txt-prompt panel-extra">支付失败</span>)
          }
          {
            util.is(isShowPayStatus && payStatus == 500, <span className="txt-prompt panel-extra">已退费</span>)
          }
        </div>
        <ul className="list-ord ">
          <li className="list-item list-item-noborder">
            <div className="list-brief-title">订单编号</div>
            <div className="list-content txt-nowrap">{id}</div>
          </li>
          <li className="list-item list-item-noborder">
            <div className="list-brief-title">下单时间</div>
            <div className="list-content txt-nowrap">{util.dateFormatGMT(createDate)}</div>
          </li>
          {
            payTypeDesc ? <li className="list-item list-item-noborder">
                <div className="list-brief-title">支付方式</div>
                <div className="list-content txt-nowrap">{payTypeDesc}</div>
              </li> : null
          }

        </ul>
        <ul className="list-ord">
          <li className="list-item ">
            <div className="list-content">
              <span className="txt-info">应付</span>
              <span>
                <span className="txt-size-sm">￥</span>
                {util.rmb(regAmount / 100)}
              </span>
              {
                youhui > 0 ? (<span>
              <span className="txt-info"> - 优惠</span>
              <span><span className="txt-size-sm">￥</span>{util.rmb((youhui) / 100)}</span>
            </span>) : null
              }
            </div>
            <div className="list-extra">
              <span className="txt-info">实付</span>
              <span className="txt-highlight">￥ {util.rmb(benefitRegAmount / 100)}</span>
            </div>
          </li>
        </ul>
      </div>
    )
  }

  renderTips() {
    let regMode = this.state.regMode;
    let tips = regMode == 1 ?
      [
        "1. 请于就诊时间前到达医院，找到自助机，凭本次预约对应就诊卡到医院自助机上自助取号。",
        "2. 首次预约请携带本人身份证在自助机上办理就诊卡，儿童就诊人凭监护人身份证办理就诊卡。"
      ] :
      [
        "1. 请携带本次挂号对应就诊卡，按约定时间地点候诊。",
        "2. 在线挂号如果发生错误，请拨打客服电话：0571-89916777"
      ];


    return (
      <div className="panel g-space">
        <div className="panel-title">就医提醒</div>
        <div className="panel-msg">
          {
            tips.map((text, index) => {
              return <p key={index}>{text}</p>
            })
          }
        </div>
      </div>
    )
  }
  firstClick(){
    this.setState({
      isBindweChatOfficialAccount:1
    })
  }
  secondClick(){
    let _this = this
    this.setState({
      isLoading:true
    })
    if (util.isInYuantuApp()) {
      hybridAPI.getWeixinCode().then((result)=>{
        if (result && result.ret == "SUCCESS") {
          var data = result.data ? JSON.parse(result.data) : null;
          UserCenter.bindWechat(data.code,data.appId).subscribe({
            onSuccess:(result)=>{
              _this.setState({
                  isLoading:false,
                  isBindweChatOfficialAccount:1
              })
              if(result.data){
                Alert.show('绑定成功',2000)
              }else{
                Alert.show('绑定失败',2000)
              } 
            },
            onError:(res)=>{
              _this.setState({
                isLoading:false,
                isBindweChatOfficialAccount:1
              })
              Alert.show(res.msg,2000)
            }
          }).fetch()
        }
      });
    }
  }
  callCar = () => {
    const {corpId} = this.state;

    if (util.isInYuantuApp() && util.version.gt(3, 2, 0) && corpLocations[corpId]) {
      hybridAPI.callCar(corpLocations[corpId]['LonLat'][1], corpLocations[corpId]['LonLat'][0], corpLocations[corpId]['name'], corpLocations[corpId]['address']);
    }
  };

  callCarBtn() {
    if (util.isInYuantuApp() && util.version.gt(3, 2, 0)) {
      return <button onClick={this.callCar} className="btn btn-secondary">一键约车</button>
    }
    return null;
  }

  render() {
    let {canCancelReg,isBindweChatOfficialAccount,doctName, id, regType, deptName, type, cancelReasonList, isEvaluate, regMode, deptCode, doctCode, status, medDateBeg, medEndTime, doctSkill, canAppointRegAgain, canAppointRegSecondTime, canCancel, canEvaluate, canAppendEvaluate, canPay, canQueue, canRegAgain, expirationTime, expirationTimeText, corpId, patientId, benefitRegAmount, isPay, confirmPay, uriPay,isLoading,cancelText, okText, confirmCallback, display, title, des} = this.state;

    let isCancel = false;

    if (regMode == 1 && (status == 200 || status == 100) && Date.now() < medDateBeg) {
      isCancel = true;
    }
    // else if(regMode == 2 && status == 100){
    //   isCancel = true;
    // }

    else if (regMode == 2 && status == 100) {
      isCancel = true;
    }
        
    //是否可以取消预约
    // let isCancel = regMode == 1 && (status  == 200 || status  == 100) && Date.now() < medDateBeg;
    // isCancel = isCancel
    let tipsKey = regMode == 2 ? "regdetails" : regMode == 1 ? "Reservationdetails" : null;
    let optType = regMode == 1 ? 6 : 3;
    
    let href = `./evaluate.html?${util.flat({
      id: this.id,
      unionId: this.unionId,
      corpId,
      deptCode,
      doctCode: doctCode || '',
      medEndTime,
      target: '_blank'
    })}`;

    const appendEvaluateHref = `./evaluate-extra.html?${util.flat({
      id: this.id,
      corpId,
      deptCode,
      doctCode: doctCode || '',
      unionId: this.unionId,
      medEndTime,
      target: '_blank'
    })}`;

    const appointHref = doctCode ? `./doctor.html?${util.flat({
        corpId,
        deptCode,
        doctCode,
        doctName: doctName || '',
        unionId: this.unionId,
        target: '_blank'
      })}` : `./appointment-select.html?${util.flat({
        corpId,
        deptCode,
        regType,
        regMode: 1,
        deptName,
        unionId: this.unionId,
        target: '_blank'
      })}`;

    const regHref = doctCode ? `./doctor.html?${util.flat({
        corpId,
        deptCode,
        doctCode,
        doctName: doctName || '',
        unionId: this.unionId,
        target: '_blank'
      })}` : `./appointment-select.html?${util.flat({
        corpId,
        deptCode,
        regType,
        regMode: 2,
        deptName,
        unionId: this.unionId,
        target: '_blank'
      })}`;


    const newQueue = specialConfig.newQueue.corpIds.indexOf(corpId.toString()) > -1;
      
    const queueUrl = newQueue ?
      `${config.TMS_DOMAIN}/tms/h5/transfer.php?transferKey=28&` :
      `${config.TMS_DOMAIN}/tms/h5/queuing.php?`;
    
    const queueHref = `${queueUrl}${util.flat({
      corpId,
      unionId: this.unionId,
      target: '_blank'
    })}`;
    let alertParam = this.state.isBindweChatApp==1?{
      firstText:'关闭弹窗',
      isShowHead:'true',
      btnNumber:1,
      firstColor:'#76acf8',
      tipContent:this.state.contentTip
    }:{
      firstText:'关闭弹窗',
      secondText:'绑定微信',
      isShowHead:'true',
      btnNumber:2,
      firstColor:'#aaa',
      secondColor:'#76acf8',
      tipContent:this.state.contentTip
    }

    return <div className="register-details-2">
      {tipsKey ? <TopTips corpId={corpId} tipsKey={tipsKey}/> : null}
      {this.renderStatus()}
      {this.renderDetailsBaseInfo()}

      {this.renderAdPositionType()}

      {this.renderPatientInfo()}
      {this.renderPayInfo()}
      {<Evaluate id={id} type={type} setEvaluate={this.setEvaluate.bind(this)} show={false}/>}
      {this.renderTips()}
      {util.isInYuantuApp()?(isBindweChatOfficialAccount==1?null:<AlertTip alertParams={alertParam} firstClick={this.firstClick.bind(this)} secondClick={this.secondClick.bind(this)} />):null}
      {
        (canAppointRegAgain || canAppointRegSecondTime || canCancel || canEvaluate || canPay || canQueue || canRegAgain || canCancelReg || status == 401 ) ?

          <div className="fixed-foot-wrapper">
            <div className="btn-wrapper g-footer register-btn-container" style={{minHeight: '50px'}}>
              {
                //挂号暂时隐藏取消订单按钮
                canCancel && status != 401 ?
                  <button className="btn btn-sm btn-secondary" onClick={this.onCancelAppoint.bind(this)}>
                    {regMode == 1 ? '取消预约' : '取消订单'}</button> : null
              }
              {
                util.is(canPay, <button className="btn btn-sm btn-secondary btn-highlight"
                                        style={{paddingLeft: '20px', paddingRight: '20px'}}
                                        onClick={this.onConfirmPay.bind(this)}>
                  去支付（还剩{expirationTimeText}）</button>)
              }

              {
                // 就诊评价和申请退号不能同时存在  
                canEvaluate?
                <a href={href}>
                  <button className="btn btn-sm btn-secondary">就诊评价</button>
                </a>:null
              }
              {
                util.is(canAppendEvaluate, <a href={appendEvaluateHref}>
                  <button className="btn btn-sm btn-secondary">追加评价</button>
                </a>)
              }
              {
                status == 401 ? <a href={appointHref}>
                    <button className="btn btn-sm btn-secondary">重新预约</button>
                  </a> : null
              }
              {
                util.is(canAppointRegAgain, <a href={appointHref}>
                  <button className="btn btn-sm btn-secondary">重新预约</button>
                </a>)
              }
              {
                util.is(canAppointRegSecondTime, <a href={appointHref}>
                  <button className="btn btn-sm btn-secondary">再次预约</button>
                </a>)

              }
              {
                util.is(canQueue, <a href={queueHref}>
                  <button className="btn btn-sm btn-secondary">排队叫号</button>
                </a>)
              }
              {
                util.is(canRegAgain, <a href={regHref}>
                  <button className="btn btn-sm btn-secondary">重新挂号</button>
                </a>)
              }
              {
                /*util.is(status == 401, <a href="./feedback.html?target=_blank">
                 <button className="btn btn-secondary" style={{borderColor: '#fd8f01', color: '#fd8f01'}}>我要申诉</button>
                 </a>)*/
              }
              {canCancelReg?
                  <button 
                          className="btn btn-sm btn-secondary"
                          onClick={()=>this.applyBackNumber()}>申请退号</button>
              :null}
            </div>
            {isLoading?<div className="loading-box">
              <div className="load-wrap">
                <div className="detail-loading loading"></div>
                <div className="load-msg">加载中</div>
              </div>
            </div>:null}
          </div> : null
      }
      {
        isCancel ? <Confirm ref='cancelDialog' title="取消订单" des="您确认要取消当前订单吗?"/> : null
      }
      {
        confirmPay ? <PayDialog
            corpId={corpId}
            optType={optType}
            patientId={patientId}
            price={benefitRegAmount}
            optParam={{outId: id, patientId, corpId,openId:this.openId}}
            onPayComplate={this.onPayComplate.bind(this)}
            onPayCancel={this.onPayCancel.bind(this)}
            expirationTime={expirationTime}
          /> : null
      }
      {
        util.is(canCancel, <Modal
          show={this.state.show}
          onCancel={() => this.setState({show: false})}
          position="bottom"
          header={<div className="my-reservation">
              <div className="reservation-modal-header">
                <div className="reservation-modal-header-cancel" onClick={() => this.setState({show: false})}>取消</div>
                <div className="reservation-modal-header-confirm" onClick={() => this.cancelAppoint()}>确认</div>
                <div>取消原因</div>
              </div>
          </div>}
        >
          <div className="list-ord list-radio" style={{fontSize: '14px'}}>
            {cancelReasonList.map((item, index) =>
              <label className="list-item list-nowrap" key={"a" + index}>
                <div className="list-content">
                  {item.name}
                </div>
                <div className="list-extra ">
                <span className="radio-wrapper">
                  <input defaultChecked={index === 0} type="radio" name="appoint" id={'label' + item.type}
                         value={item.type}/>
                </span>
                </div>
              </label>
            )}
          </div>
        </Modal>)
      }
      <Confirm2 title={title} des={des} cancelText={cancelText} okText={okText} display={display}
                 callback={confirmCallback}/>
    </div>
  }
  componentWillUnmount(){
    this.codeTime&&clearInterval(this.codeTime)
  }
  async cancelAppoint() {
    const domArr = Array.prototype.slice.call(document.getElementsByName('appoint'));
    const selectDom = domArr.filter(z => z.checked)[0];
    if (selectDom) {
      try {
        const result = await UserCenter.cancelAppointReg(this.id, selectDom.value, this.unionId).fetch();
        if (result.success) {
          window.location.reload();
        } else {
          Alert.show(result.msg, 1500);
        }
      } catch (e) {
        Alert.show(e.msg, 1500);
      }
    }
  }

  //取消预约按钮
  async onCancelAppoint() {

    /*let is = await Confirm.confirm(this.refs.cancelDialog);
     if (is) {
     BlockLoading.show();
     try {
     var result = await UserCenter.cancelAppoint(this.id, this.corpId).fetch();
     this.componentDidMount();
     } catch (e) {
     Alert.show(e.msg || "取消预约失败");
     }
     BlockLoading.hide();
     }*/

    this.setState({
      show: true,
    });
  }

  onPayComplate() {
    this.setState({
      confirmPay: false
    })
    this.componentDidMount();
    // location.reload();
  }

  onPayCancel() {
    this.uriPay = false;
    this.setState({
      confirmPay: false
    })
    this.componentDidMount();
    // location.reload();
  }

  //确认支付
  onConfirmPay() {
    this.setState({confirmPay: true})
  }

  //点击申请退号按钮
  applyBackNumber(){
    let _this = this
    this.setState({
      display: true,
      title: "是否确认申请退号?",
      des: true,
      confirmCallback: function (confirm) {
        _this.setState({
          display: false
        })
        if (confirm) {
          _this.confirmBack()
        }
      }
    })
  }

  confirmBack(){
      let {id} = this.state
      UserCenter.applyBackNumber(id)
      .subscribe({
        onSendBefore(){
          BlockLoading.show("正在操作,请稍后...");
        },
        onComplete(){
          BlockLoading.hide();
        },
        onSuccess:result=>{
          if(result.success){
            if(result.resultCode == 200){
                Alert.show('退号成功，钱款将15天内原路退回',2000)
                setTimeout(()=>{
                  location.reload()
                },2000)
            }
            if(result.resultCode == 201){
              Alert.show('已在医院退号，不能再次退号',2000)
              location.reload()
            }
          }
        },
        onError:result=>{
          if(!result.success){
            if(result.resultCode == 203){
              Alert.show('号源不存在，无法退号',2000)
              setTimeout(()=>{
                location.reload()
              },2000)
            }
            if(result.resultCode == 204){
              Alert.show('退号失败，请稍后重试',2000)
              setTimeout(()=>{
                location.reload()
              },2000)
            }
            if(result.resultCode == 205){
              Alert.show('已就诊，无法退号',2000)
              setTimeout(()=>{
                location.reload()
              },2000)
            }
            if(result.resultCode != 205 &&result.resultCode != 204 &&result.resultCode != 203){
              Alert.show(result.msg)
            }
          }
        }
      })
      .fetch()
  }

}