//无缓存数据
import JSONPAsyncData from '../lib/JSONPAsyncData'
import AjaxAsyncData from '../lib/AjaxAsyncData'
import util from '../lib/util';
import PostAsyncDate from '../lib/PostAsyncDate'
import md5 from '../lib/md5'
//优先读取缓存数据
import JSONPCacheAsyncData from '../lib/JSONPCacheAsyncData'
import config from '../config'
import H5_VERSION from '../../h5-version';    

const isInYuantuApp = util.isInYuantuApp();

const IS_ONLINE = config.IS_ONLINE;
const API_DOMAIN = config.API_DOMAIN;
const API_DOC_DOMAIN = config.API_DOC_DOMAIN;
const AOLSEE_DOMAIN = config.AOLSEE_DOMAIN;
const PROTOCOL = config.PROTOCOL;

const deviceInfo = {
  invokerChannel: 'H5',
  invokerDeviceType: isInYuantuApp ? 'yuantuApp' : (util.isWeixin() ? 'weixin' : 'others'),
  invokerAppVersion: H5_VERSION
};

const query = util.query();
const uid = query.unionId || '';

//账单list
const API_BILL_LIST = "/user-web/restapi/pay/query/billlist";
//账单详情
const API_BILL_DETAIL = "/user-web/restapi/pay/query/billdetail"


function getAPIUri( path ){
  return API_DOMAIN.indexOf("http") == 0 ? API_DOMAIN+path : PROTOCOL+API_DOMAIN+path;
}


function getDocAPIUri(path) {
  return API_DOC_DOMAIN.indexOf("http") == 0 ? API_DOC_DOMAIN + path : PROTOCOL + API_DOC_DOMAIN + path;
}

function getURL(path){
  return AOLSEE_DOMAIN+path;
}

export default {
  myBills(pageSize, currentPage, unionId = uid, corpId){
    return new JSONPCacheAsyncData(getAPIUri(API_BILL_LIST), {currentPage, pageSize, unionId, corpId});
  },
  myCardBills(cardId, pageSize, currentPage, unionId = uid, corpId) {
    return new JSONPCacheAsyncData(getAPIUri(API_BILL_LIST), {
      cardId, 
      currentPage,
      pageSize,
      unionId,
      corpUnionId: unionId,
      corpId
    });
  },
  myBillsNoCache(pageSize, currentPage, unionId = uid) {
    return new JSONPAsyncData(getAPIUri(API_BILL_LIST), {currentPage, pageSize, unionId})
  },
  billDetail(id, corpId, unionId = uid){
    return new JSONPAsyncData(getAPIUri(API_BILL_DETAIL), {id, corpId, unionId});
  },
  getpaymentdetail(corpId, billNo, patientId){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/pay/getpaymentdetail"), {corpId, billNo, patientId});
  },
  getWXOpenId(code, corpId, optType){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/wx/getOpenId"), {code, corpId, optType})
  },
  getOpenIdParas(corpId, optType,unionId){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/wx/getOpenIdParas"), {corpId, optType,unionId})
  },
  //获取预约详情
  reginfodetail(id, corpId,unionId = uid){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/reservation/reginfodetail"), { id, corpId, unionId});
  },
  //预约挂号详情页添加弹窗
  appointRegInfoWindowMsg(id,unionId){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/reservation/appointRegInfoWindowMsg"),{id,unionId})
  },
  //绑定微信
  bindWechat(code,appId){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/ytUsers/bindWeChat"),{code,appId})
  },
  //获取当前支持的支付方式
  getPayTypes(corpId, optType, patientId,regType , unionId = uid){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/pay/type"), {corpId, optType, patientId,regType, unionId});
  },
  //新增,点击在线退号
  applyBackNumber(id){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/reservation/cancelRegAndRefund"), {id});
  },
  submitInquiry(corpId,deptCode,doctCode,hopeForHelp,illnessDesc,illnessImg,isVisit,patientId,preDiagnosis){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/submitInquiry"),{corpId,deptCode,doctCode,hopeForHelp,illnessDesc,illnessImg,isVisit,patientId,preDiagnosis})
  },
  //获取病人的住院情况
  getPatientinfo(corpId, patientId, queryInHosPatient,queryBalance){
    //queryInHosPatient 是否查询住院状态
    //queryBalance 是否查询余额
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/inhos/patientinfo"), {corpId, patientId,queryInHosPatient,queryBalance});
  },
  //test用
  testbtn(corpId, unionId, c, optParam){
    //queryInHosPatient 是否查询住院状态
    //queryBalance 是否查询余额
    optParam.corpId = corpId;
    optParam.unionId = unionId;
    optParam.c = c;
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/patient/getList"), optParam);

  },
  //获取用户卡列表
  getNoBalanceList(patientId, balance, category, corpId, unionId){
  /**
    unionId: self.unionId,
    patientId: patientId,
    corpId: self.unionId == 60 ? '' : self.corpId,
    balance: true,
    category: self.unionId == 29 ? 1 : ''
    **/
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/card/noBalanceList"), {
      patientId, balance, category, corpId, unionId
    })
  },
  //获取就诊卡余额
  getCardBannce(corpId, cardId){
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/card/get"), {corpId, id:cardId})
  },
  //服务端生成支付订单
  /**
   feeChannel 支付方式  //1、支付宝 2、微信 3、余额 5、到院支付
   optType 业务类型 //1、充值 2、缴费 3、挂号 5、预约
   optParam 业务参数
   */
  preCharge(feeChannel, optType, corpId, optParam, cardId,unionId = uid){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/account/preCharge"), Object.assign({}, optParam, {
      feeChannel,
      optType,
      corpId,
      unionId,
      cardId
    }));
  },

  //服务端生成支付订单
  /**
   feeChannel 支付方式  //1、支付宝 2、微信 3、余额 5、到院支付
   optType 业务类型 //1、充值 2、缴费 3、挂号 5、预约
   corpId
   optParam 业务参数
   */
  preChargeNew(feeChannel, optType, corpId, optParam){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/account/preChargeNew"), Object.assign({}, optParam, {
      feeChannel,
      optType,
      corpId
    }));
  },

  //获取订单的支付状态
  getPayStatus(id, corpId, unionId = uid){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/pay/query/status"), {id, corpId, unionId})
  },
  //通过长ID获取支付状态
  getPayStatusByOutId(outTradeNo, corpId, unionId){
    // return new Promise((reslove, reject)=>{
    //   reslove({
    //     success:true,
    //     data:{
    //       id:"123",
    //       status:"300"
    //     }
    //   })
    // });
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/pay/query/statusByOutTradeNo"), {
      outTradeNo,
      corpId,
      unionId
    })
  },

  //获取号院
  /**
   corpId:corpId,
   regType:regType,
   deptCode:deptCode,
   parentDeptCode:deptCode,
   doctCode:doctCode,
   regMode:regMode,
   medAmPm:medAmPm,
   medDate:medDate,
   scheduleId:scheduleId,
   **/
  getNumbersource(corpId, regType, deptCode, doctCode, regMode, medAmPm, medDate, scheduleId, unionId = uid){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/reservation/numbersource"), {
      corpId,
      regType,
      deptCode,
      // parentDeptCode,
      doctCode,
      regMode,
      medAmPm,
      medDate,
      scheduleId,
      unionId
    })
  },

  saveMyHealthyData(weight, bloodPressureDiastolic, bloodPressureSystolic, bloodGlucose, bloodLipid, idNo, unionId = uid) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/ytUsers/saveMyHealthyData"), {
      weight,
      bloodPressureDiastolic,
      bloodPressureSystolic,
      bloodGlucose,
      bloodLipid,
      idNo,
      unionId
    })
  },
  //获取预约挂号优惠信息
  ///user-web/restapi/reservation/getAppointRegBenefit
  getAppointRegBenefit(corpId, regType, deptCode, doctCode, regMode, medAmPm, medDate, scheduleId, patientId, regAmount, unionId = uid){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/reservation/getAppointRegBenefit"), {
      corpId,
      regType,
      deptCode, doctCode,
      regMode,
      medAmPm,
      medDate,
      scheduleId,
      patientId,
      unionId,
      regAmount
    }, 10000)
  },
  //预约 挂号

  appointCreateOrder(regMode, scheduleId, corpId, regType, deptCode, doctCode, medDate, appoNo, medAmPm, patientId, medBegTime, medEndTime, extend, optType, feeChannel, unionId = uid,diseaseDesc,diseaseImageUrl,hopeForHelp,isVisit,preDiagnosis){
    // regMode == 1
    let invokerDeviceType = deviceInfo.invokerDeviceType
    if (regMode == 1) {
      let url = "/user-web/restapi/reservation/appointCreateOrder";
      return new JSONPAsyncData(getAPIUri(url), {
        invokerDeviceType,
        regMode,
        scheduleId,
        corpId,
        regType,
        deptCode,
        doctCode,
        medDate,
        appoNo,
        medAmPm,
        patientId,
        medBegTime,
        medEndTime,
        extend,
        optType,
        feeChannel, 
        unionId,
        diseaseDesc,
        diseaseImageUrl,
        hopeForHelp,
        isVisit,
        preDiagnosis
      })
    }
    if (regMode == 2) {
      let url = "/user-web/restapi/reservation/regCreateOrder";
      return new JSONPAsyncData(getAPIUri(url), {
        invokerDeviceType,
        regMode,
        scheduleId,
        corpId,
        regType,
        deptCode,
        doctCode,
        medDate,
        appoNo,
        medAmPm,
        patientId,
        medBegTime,
        medEndTime,
        unionId,
        diseaseDesc,
        diseaseImageUrl,
        hopeForHelp,
        isVisit,
        preDiagnosis
      })
    }
  },

  //获取全局提示语
  getTopTips(corpId, unionId = uid){
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/common/corp/getGuideCopy"), {corpId, unionId});
  },

  //解除就诊人已绑定的卡片
  cancelBindCard(cardId, unionId){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/card/cancelBind"), {cardId, unionId})
  },

  //取消预约
  /*cancelAppoint(id, corpId, unionId = uid){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/reservation/cancelAppointReg"), {id, corpId, unionId})
  },*/

  //获取法律须知，隐私声明，关于我们
  getLawInfo(unionId) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/common/corpNews/unionNotes"), {unionId})
  },

  //获取问题列表
  getQuestionList(corpId, unionId, type, channel) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/common/corpNews/newsInfo"), {
      corpId,
      unionId,
      type,
      channel
    })
  },

  //老板获取资讯详情
  getOldNewsDetail(unionId, id) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/common/corpNews/newsDetail"), {unionId, id})
  },

  /*cancelAppoint(id){
   return new JSONPAsyncData(getAPIUri("/user-web/restapi/reservation/cancelAppointReg"), {id})
   },*/

  // 获取搜索结果
  getSearchResult(corpId, likeName, unionId = uid) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/common/doct/searchDoctSch"), {corpId, likeName, unionId})
  },
  //添加预约挂号评价
  addEvaluate(corpId, regId, doctSkill, hospitalEnvironment, serviceAttitude, evaluate, unionId = uid){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/corpEvaluate/addAppointRegLogEvaluate"), {
      corpId,
      regId,
      doctSkill,
      hospitalEnvironment,
      serviceAttitude,
      evaluate,
      unionId
    })
  },
  getEvaluate(sourceId, unionId = uid){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/corpEvaluate/getEvaluate"), {sourceId, unionId})
  },
  // 图文问诊订单详情页
  getGcInquiryDetail(id){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/getGcInquiryDetail"),{id})
  },
  cancelInquiry(id) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/cancelInquiry"), { id })
  },
  getInquiryFee(corpId, doctCode, rcDoctId) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/getInquiryFee"), { corpId, doctCode, rcDoctId })
  },
  //可问诊医生列表
  getListInquiryDoct(corpId, currentPage, deptCode, doctCode, inquiryStatus, pageSize, unionId) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/ListInquiryDoct"), { corpId, currentPage, deptCode, doctCode, inquiryStatus, pageSize, unionId })
  },
  //在线问诊列表
  getListInquiryByCode(conversationStatus, doctCode, corpId, deptCode, inquiryType, videoStatus) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/ListInquiryByCode"), {
      conversationStatus, doctCode, corpId, deptCode, inquiryType, videoStatus
    })
  },
  getDoctOrDeptEvaluateList ( type, corpId, code, currentPage, pageSize = 20, unionId = uid ) {
    /**
     * type {
     *  doct: code 为 doctCode
     *  dept: code 为 deptCode
     * }
     */
    const TYPE = {
      doct: 'doctCode'
      ,dept: 'deptCode'
    }

    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/reservation/listEvaluateInfo'), { 
      corpId
      ,[ TYPE[type] ]: code
      ,currentPage
      ,pageSize
      ,unionId
    })
  },
  //我的家庭医生
  getSignInfoByLoginUser() {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/ytUsers/getSignInfoByLoginUser'))
  },
  //签约包
  getSeverPack(params,success){
    return new AjaxAsyncData(getDocAPIUri("/cactus/api/bundle/detail"),'get', params, success)
  },
  //获取医生基本信息
  getDoctorInfo(corpId, deptCode, doctCode, unionId = uid){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/doctor/getDoctAccountInfo"), {
      corpId,
      deptCode,
      doctCode,
      unionId
    })
  },
  //家庭医生详情页也用这个接口
  getDoctorInfoAndDept ( corpId, doctCode, deptCode, unionId = uid ) {
    /**
     * unionId:  可选
     */
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/common/reservation/getDoctAccountInfo"), {
      corpId,
      deptCode,
      doctCode,
      unionId
    })
  },


  //获取科室基本信息
  getDeptInfo(corpId, deptCode, unionId = uid){
    return new JSONPCacheAsyncData(getAPIUri("/user-web/ws/query/deptInfo"), {corpId, deptCode, unionId});
  },
  //获取病人列表
  getPatientList(corpId, unionId = uid, patientType){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/patient/getList"), {corpId, unionId, patientType})
  },
  //获取病人信息
  getBaseInfo(corpId, unionId, patientId){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/patient/getbaseinfo"), {corpId, unionId, patientId})
  },
  //删除病人信息
  deletePatient(corpId, unionId, patientId){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/patient/del"), {corpId, unionId, patientId})
  },
  //修改或者增加病人信息
  updatePatient(corpId, unionId, date){

    if (date.id) {//修改病人信息
      console.log("updatePatient==>", date)
      return new JSONPAsyncData(getAPIUri("/user-web/restapi/patient/update"), {corpId, unionId, ...date})
    } else {//增加病人信息
      console.log("addPatient==>", date)
      return new JSONPAsyncData(getAPIUri("/user-web/restapi/patient/add"), {corpId, unionId, ...date})
    }

  },
  //增加病人信息
  // addPatient(corpId,unionId,date){
  // 	return new JSONPAsyncData(getAPIUri("/user-web/restapi/patient/add"),{corpId,unionId,...date})
  // },
  //根据corpId,unionId判断是否需要绑卡
  isNeedCard(corpId, unionId){
    if (unionId) {
      return new JSONPAsyncData(getAPIUri("/user-web/restapi/card/isNeedCardByUnionId"), {unionId})
    } else {
      return new JSONPAsyncData(getAPIUri("/user-web/restapi/card/isNeedCardByCorpId"), {corpId})
    }

  },
  //获取病人的卡列表
  getCardList(corpId, unionId, patientId){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/card/list"), {corpId, unionId, patientId})
  },
  //获取病人住院信息
  getInhosPatientInfo(unionId, corpId, patientId){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/inhos/patientinfo"), {unionId, corpId, patientId});
  },

  //获取病人住院每日清单列表
  getInhosBillList(unionId, corpId, patientId, pageSize, pageNum){
    var visitId = 1;
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/inhos/inhosbilllist"), {
      unionId,
      patientId,
      corpId,
      pageSize,
      pageNum,
      visitId
    })
  },

  //获取病人住院每日清单列表
  getInhosBillDetail(unionId, corpId, patientId, date){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/inhos/inhosbilldetail"), {unionId, corpId, patientId, date})
  },

  //获取二级科室
  getMultiDeptsList(corpId, type, unionId = uid) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/reservation/multiDeptsList"), {corpId, type, unionId});
  },

  //新预约挂号流程二级科室
  getMultiDeptsList2(corpId, regMode, regType, unionId = uid) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/reservation/multiDeptsList2"), {corpId, regMode, regType, unionId}, 30000);
  },

  //获取科室排班信息
  getSchedule(corpId, deptCode, doctCode, type = '', subRegType = '', unionId = uid) {
    return new JSONPAsyncData(getAPIUri("/user-web/ws/query/doct/schedule"), {
      corpId,
      deptCode,
      doctCode,
      type,
      subRegType,
      unionId
    }, 60000);
  },
  //医院挂号首页-获取医院信息
  getHospitalInfo(corpId, id, unionId = uid) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/common/reservation/hospitalinfo"), {corpId, id, unionId});
  },
  //获取科室、医生排班
  getScheduleInfoNew(corpId, type, deptCode, parentDeptCode, doctCode, id, unionId = uid) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/common/reservation/scheduleinfonew"), {
      corpId,
      type,
      deptCode,
      parentDeptCode,
      doctCode,
      id,
      unionId,
      ...deviceInfo
    });
  },
  getIndexArea(unionId) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/common/corp/unionHome"), {unionId, ...deviceInfo});
  },

  // 获取检查报告单
  getPatientInspect(unionId, corpId) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/ytUsers/viewPatientInspect"), {
      unionId,
      corpId, ...deviceInfo
    })
  },
  // 新-获取检查报告单
  getInspect(unionId, corpId) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/ytUsers/inspectList"), {
      unionId,
      corpId, ...deviceInfo
    });
  },
  // 获取影像报告单
  getPatientPacs(unionId, corpId) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/ytUsers/viewPatientPacs"), {
      unionId,
      corpId, ...deviceInfo
    })
  },
  // 新-获取影像报告单
  getPacs(unionId, corpId) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/ytUsers/pacsList"), {unionId, corpId, ...deviceInfo});
  },
  // 获取检查报告单详情

  getMyInspectDetail(repId, corpId, unionId = uid) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/ytUsers/viewMyInspectDetail"), {repId, corpId, unionId, ...deviceInfo})
  },
  // 获取影像报告单详情
  getPacsDetail(checkNo, corpId, unionId = uid) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/ytUsers/viewPacsDetail"), {checkNo, corpId, unionId, ...deviceInfo})
  },
  // 获取健康信息
  getMyHealthyData(currentPage, pageSize, unionId) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/ytUsers/viewMyHealthyData"), {
      currentPage,
      pageSize,
      unionId,
      ...deviceInfo
    })
  },
  // 获取健康信息-2
  // http://api.daily.yuantutech.com/user-web/restapi/ytUsers/healthDataList
  healthDataList(beginTime = '', endTime = '', unionId) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/ytUsers/healthDataList"), {
      beginTime,
      endTime,
      unionId, ...deviceInfo
    })
  },
  // 获取健康档案的详情
  getMyHealthyDataDetail(id, unionId) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/ytUsers/viewMyHealthyDataDetail"), {
      id,
      unionId, ...deviceInfo
    })
  },

  // 获取预约、挂号列表
  reginfo(unionId, corpId, currentPage, pageSize){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/reservation/reginfo"), {
      unionId,
      corpId,
      currentPage,
      pageSize
    });
  },
  // 获取医院详细介绍信息
  getCorpHome(corpId, unionId = uid) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/corp/corpHome"), { corpId, unionId });
  },
  //获取缴费列表
  getPaymentList(corpId, corpUnionId, unionId = uid) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/pay/getpaymentlist"), {corpId, corpUnionId, unionId});
  },
  //获取医生列表
  getDoctorList(corpId, deptCode, type, id, unionId = uid) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/reservation/regDoctlist"), {
      corpId,
      deptCode,
      type,
      id,
      unionId
    });
  },
  //新版app首页接口
  getAppIndex(unionId, invokerChannel) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/common/platform/appIndex"), {unionId, invokerChannel, ...deviceInfo});
  },

  //新版app医院列表接口
  getCorpList(functionId, unionId) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/common/corp/list"), {
      functionId,
      unionId, ...deviceInfo
    });
  },
  //新版app门诊缴费记录接口
  getPayList(corpId, unionId, ver = '1.0') {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/pay/list"), {corpId, unionId, ver});
  },
  //新版app报告单List接口
  getInspectList(corpId, unionId) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/ytUsers/inspectList"), {corpId, unionId});
  },
  //分院列表
  getLeafCorp(corpId, functionId, unionId = uid) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/corp/leafList"), {corpId, functionId, unionId});
  },
  //就医提醒接口
  getAttention(unionId) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/ytUsers/remindList"), {unionId});
  },
  //曾就诊医生列表
  getHistoryDoct(unionId) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/ytUsers/regedDoctList"), {unionId});
  },

  // 获取健康档案的详情2
  // http://api.daily.yuantutech.com/user-web/restapi/ytUsers/healthDataDetail
  healthDataDetail(id, sourceType, unionId) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/ytUsers/healthDataDetail"), {id, sourceType, unionId})
  },
  // 保存健康档案信息2
  // https://api.daily.yuantutech.com/user-web/restapi/ytUsers/saveHealthData
  saveHealthData(data, unionId) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/ytUsers/saveHealthData"), {
      data, unionId
    })
  },

  //过去就诊人绑卡的信息，包含已绑定的卡和可以绑定的卡片
  getPatientBindCardInfo(unionId, patientId){
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/card/bindInfoList"), {unionId, patientId})
  },
  //就诊卡添加就诊人身份验证修改
  validateByCard(unionId, cardNo, cardType, patientName, validateString, validateType) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/card/validateByCard"), { unionId, cardNo, cardType, patientName, validateString, validateType })
  },
  //身份证添加就诊人身份验证修改
  validateByPhoneAndID(cardType, guardIdNo, idNo, name, validateString, validateType) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/card/validateByPhoneAndID"), { cardType, guardIdNo, idNo, name, validateString, validateType })
  },
  //保险列表
  getInsurance() {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/ytUsers/getDolphinInsuranceList"));
  },

  //根据医生预约(新版预约挂号)
  listScheduleinfoByDoct(corpId, deptCode, regMode, regType, unionId = uid) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/reservation/listScheduleinfoByDoct"), {
      corpId,
      deptCode,
      regMode,
      regType,
      unionId,
      ...deviceInfo
    }, 10000);
  },

  //根据日期预约(新版预约挂号)

  listScheduleinfoByDate(corpId, deptCode, regMode, startDate, endDate, unionId = uid) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/reservation/listScheduleinfoByDate"), {
      corpId,
      deptCode,
      regMode,
      startDate,
      endDate,
      unionId,
      ...deviceInfo
    }, 10000);
  },

  //获取用户下就诊人爽约记录列表
  breakAppointmentList(unionId = uid) {
    return new JSONPCacheAsyncData(getAPIUri("/user-web/restapi/ytUsers/breakAppointmentList"), {unionId, ...deviceInfo});
  },

  //更新爽约记录申诉状态为申诉中
  updateApplyBreakAppointmentStatus(id, unionId = uid) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/ytUsers/updateApplyBreakAppointmentStatus"), {id, unionId, ...deviceInfo})
  },

  //通过二维码扫码进入的健康档案详情接口
  healthDataDetailQrCode(key, sourceType, unionId = uid) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/ytUsers/healthDataDetail"), {
      key,
      sourceType,
      unionId
    });
  },

  // 查看是否自动登入成功
  getUserInfo( unionId = uid ) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/ytUsers/getUserInfo'), {
      unionId
    })
  },
  // 登入接口
  getLogin( phoneNum, password, unionId, corpId ) {
    let resultSubmit = {
      phoneNum,
      password: md5(md5( password )),
      unionId
    }
    if( !unionId ){
      resultSubmit.corpId = corpId
    }
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/ytUsers/login'),resultSubmit)
  },
  // /user-web/restapi/device/addEx
  setRegisterToken(deviceToken, platformType, corpId) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/device/addEx'),{
      deviceToken,
      platformType,
      corpId
    })
  },
  clearRegisterToken () {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/device/addEx'))
  },
  checkIsReg(phoneNum, unionId = uid) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/ytUsers/checkIsReg'),{
      phoneNum, unionId
    })
  },
  getValidateCode(phoneNum, unionId = uid) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/ytUsers/getValidateCode'),{
      phoneNum, unionId, isApp: isInYuantuApp
    })
  },
  signUpUser(phoneNum, password, code, unionId = uid ) {
    password = md5(password)
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/ytUsers/reg'),{
      phoneNum, password, unionId,
      valCode: code
    })
  },
  checkValidateCode( phoneNum, code, unionId = uid ) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/ytUsers/checkValidateCode'),{
      phoneNum, unionId,
      valCode: code
    })
  },
  updatePassword( phoneNum, password, code, unionId = uid ) {
    password = md5( password )
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/ytUsers/updatePassword'),{
      phoneNum, password, unionId,
      valCode: code
    })
  },
  loginOut ( unionId = uid ) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/ytUsers/logout'),{
      unionId
    })
  },
  /*优化微信登录之前的获取getWechatAppId的接口,现在只用于获取非健康青岛公众号appId*/
  getWechatAppId ( corpId, unionId = uid ) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/ytUsers/getAppid'),{
      corpId
      ,unionId
    })
  },


  //新增,优化微信登录之后获取公众号appId(目前只适用于健康青岛)的接口
  getWechatGZHAppId ( corpId, unionId = uid ) {
    return new JSONPAsyncData(getURL('/open/getAppId'),{
      corpId
      ,unionId
    })
  },
  //优化之前微信授权接口
  loginByWechat ( code, appId, corpId, unionId = uid ) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/ytUsers/webOauthLogin'),{
      code
      ,appId
      ,corpId
      ,unionId
    })
  },
  //优化之后的接口,公众号授权(健康青岛)
  loginByWechatGZH ( appId, code ) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/ytUsers/weChatOfficialAccountsLogin'),{
      appId
      ,code
    })
  },
  bindPhoneNumToWechat ( phoneNum, phoneCode, appId, openId, openUnionid, corpId, unionId = uid ) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/ytUsers/bindPhoneNum'),{
      phoneNum
      ,phoneCode
      ,appId
      ,openId
      ,openUnionid
      ,unionId
    })
  },

  //获取全部服务窗
  getWindowService(unionId) {
    return new JSONPAsyncData(getAPIUri("/user-web/restapi/common/platform/windowService"), {
      unionId
    });
  },

  // 科室医生借口
  getDoctorListFromDept(corpId, deptCode, unionId){
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/reservation/regDoctlist'),{corpId, deptCode, schDoct: true, unionId})
  },

  errorSend(result) {
    return new JSONPAsyncData(`https://msgsend.yuantutech.com/frontgatewaymsg/sendMsg.do?msg=complete--${JSON.stringify(result)}`);
  },

  // getNoBalanceList(balance, corpId, patientId, unionId) {
  //   return new JSONPAsyncData(getAPIUri('/user-web/restapi/card/noBalanceList'), {balance, corpId, patientId, unionId});
  // },
  getRegPagesByStatus(unionId, corpId, statusType, currentPage, pageSize) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/reservation/getRegPagesByStatus'), {
      unionId,
      corpId,
      statusType,
      currentPage,
      pageSize
    })
  },
  //新版取消预约挂号接口
  cancelAppointReg(id, reasonId, unionId = uid) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/reservation/cancelAppointReg'), {
      id,
      reasonId,
      unionId
    });
  },

  getCardTypeList(unionId, corpId) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/cardType/list'), {
      corpId,
      unionId,
      needTied: 1,
    });
  },
  //获取卡片类型,青岛绑卡新接口
  getCardTypes(unionId) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/cardType/list'), {
      unionId,
    });
  },
  getBindCardValidate(cardNo, cardType, mobile, patientId, unionId) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/card/validate'), {
      cardNo,
      cardType,
      mobile,
      patientId,
      unionId,
    });
  },
  //青岛区域绑卡,验证就诊卡接口
  getBindCardValidateQD(cardNo, cardType,name,unionId) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/card/validate'), {
      cardNo,
      cardType,
      patientName:name,
      unionId
    });
},
//青岛绑卡-通过身份证查找到对应的用户信息
getCardUserCards(idNo, name,idType) {
  if(idType == null || idType == 1){
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/card/userCards'), {
      idNo,
      name
    });
  }else if(idType&&idType == 2){
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/card/userCards'), {
      guardIdNo:idNo,
      name
    });
  }
  
},
  getUserCardsByPatientId(guardIdNo, name, patientId	) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi//card/userCardsByPatientId'), {
      guardIdNo, name, patientId
    });
  },
  getCardRemind(unionId, corpId) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/card/getRemind'), {
      unionId,
      corpId
    });
  },
  //绑卡
  addCard(cardNo, cardType, mobile, patientId, unionId, validCode,idType) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/card/add'), {
      cardNo,
      cardType,
      mobile,
      patientId,
      unionId,
      validCode,
      idType
    });
  },
  //绑卡-青岛
  addCardQD(cardNo, cardType,patientId, unionId) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/card/add'), {
      cardNo,
      cardType,
      patientId,
      unionId,
    });
  },
  getCardDetail(id, unionId, corpId) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/card/get'), {
      corpId,
      id,
      unionId
    });
  },
  getAppIndexNew(unionId, invokerChannel) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/common/platform/appIndexNew'), {
      unionId,
      invokerChannel
    });
  },
  getEvaluateInfo(dateTime, unionId = uid) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/corpEvaluate/getEvaluateInfo'), {
      dateTime,
      unionId
    });
  },
  //添加预约挂号评价
  addAppointRegLogEvaluate(evaluate, hospitalEnvironment, isIncognito, regId, serviceAttitude, tagIds, totalEvaluate, unionId = uid) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/corpEvaluate/addAppointRegLogEvaluate'), {
      evaluate,
      hospitalEnvironment,
      isIncognito,
      regId,
      serviceAttitude,
      tagIds,
      totalEvaluate,
      unionId
    });
  },
  //添加额外评价
  addAppendEvaluate(evaluate, regId, tagIds, unionId = uid) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/corpEvaluate/addAppendEvaluate'), {
      evaluate,
      regId,
      tagIds,
      unionId
    });
  },

  authorizedLogin ( params ) {
    // console.log( params )
    // params = {
    //   appId: "60"
    //   ,unionId: 60
    //   ,corpId: 549
    //   ,cardNo: ""
    //   ,cardType:  '4'
    //   ,certNum: ""
    //   ,certType: ''
    //   ,custId: ''
    //   ,name: ''
    //   ,phone: "15868181785"
    //   ,redirectUnionId: "60"
    //   ,sign: "eZIEhUQTrdAQ4y2KqVcv4sf1dHNXONzhN0L7DGP8Q8s+Ajlu+LEbHhL7H3TAsqdmgK0cLo9BnNtJ↵Tv0NYa1R1n4/FRo0GY8ItQxaItSRJ7BvbsVPSn3E8mXKPbFa2rrfTRtpyf6P3Uxe3s1FHmD6R/HW↵eeFkpfWKDgw1kPIxJRMJmZ2z9E1JpZee68eDM4CP97doP3OBn2s63QNAE/xRwgGPgNCvGRI+/OLa↵xk79i+VCuJAtsrXqzSO0MDwkOYewIuyDfTBr2pAR2FccwH8GDfn8eKPsVvDvq0sDem5G48niIMPU↵1FdW8n/GeKM5VvW4edai3jYBaxP9mou47qhqe/OxMFTZ+wS4oVE0O/7xCJajhOZ2L9/qtRjLqc5/↵soC1QrqgmKdLUZ7Oewh1bnMexJj6rzSyz5T5k72MJzJ8Ctn9Q/MFB3i5CAIf9e/xOLf1LRivAznM↵7NaB/McDW06b1sl2kZQ+mebTiAGKuGKobn+yyugcgDWvymOFpuX7p5jODmd+FvsnWDaGSlM9WyHI↵067kqBsBWP2sfEMyWlMrvxhp2SiPEcwbYum58v/Rusmyi8YeqEuuJh2TqHRNeY6O6KiXWzIkzqfw↵ATsX0phMybfUgBrghjhALnedfO71/VlfVWZpr28MWslApWM0kaXcb0X2+4ccPf39/obayhuVmoa9↵Rsc+ZwE2HO+icsErs7WB4D4wKBrIaMklX8QiNN+FviHWo9IDEWmi+1clvgnRobxrvdhdLqoBWi86↵lAZs9pvIJUQgRwpNuY8ZEdJPPIkYRswKPnIyspKNaMSXG4EdRhcdMrv5fCDHzFjMtLoXKkdZ17f9↵vf+80xoCaDxx4bu0cQ=="
    //   ,t: 28660
    //   ,ver: "1.0"
    // }
    params.t = parseInt( Math.random()*100000)
    let request = new JSONPAsyncData( getAPIUri( '/user-web/restapi/common/ytUsers/loginOauth' ), params );

    /**
     * 由于 JSONPAsyncData 会把 ''、undefined、null 的参数删除，但是本接口 name 参数为必带参数，即使 name=''
     * 故重写去除无效参数函数
     */
    request.loadData = function () {
      var param = {};
      
      for (var key in this.param) {

        if ( this.param[key] !== 'undefined' && this.param[key] !== undefined && this.param[key] !== null ) {
          param[key] = this.param[key]
        } else {
          param[key] = ''
        }
      }
      return new Promise(( reslove, reject ) => {
        this.JSONP( this.url, param, reslove, () => {
          reject({ msg: '请求错误', succcess: false })
        })
      })
    }

    return request
  }


  ,/**
   * 获取用户的关注列表
   * 接口说明文档：http://rap.yuantutech.com/workspace/myWorkspace.do?projectId=4#292
   */
  getMyFollowList( currentPage, pageSize, unionId = uid ) {
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/myDoctor/getFollowDeptAndDoct'), {
      currentPage
      ,pageSize
      ,unionId
    })
  }
  ,/**
   * 获取曾挂号医生的列表
   * 接口文档：http://rap.yuantutech.com/workspace/myWorkspace.do?projectId=4#293
   */
  getRegisteredDoctList ( unionId = uid ) {
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/myDoctor/getRegisterDoctList'), {
      unionId
    })
  }
  ,alterFollowState (deptCode, doctCode, state, corpId, unionId,token ) {
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/myDoctor/alterFollowState'),{deptCode, doctCode, state, corpId, unionId,token})
  }

  // 在线咨询提交
  ,createConsultation ( corpId, deptCode, doctCode, illnessDesc, illnessImg, patientId, unionId = uid ) {
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/submitInquiry'), {
      corpId, deptCode, doctCode, illnessDesc, illnessImg, patientId, unionId 
    })
  }

  /**
   * 查询患者问诊记录
   * http://rap.yuantutech.com/workspace/myWorkspace.do?projectId=25#445
   * @export conversationStatus: 问诊状态 , 1.进行中 2.医生发起结束,待用户确认 3.会话结束
   */ 
  , getDoctConsultationRecord(conversationStatus, corpId, deptCode, doctCode, inquiryType, unionId = uid ) {
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/ListInquiryByCode'), {
      conversationStatus, corpId, deptCode, doctCode, inquiryType, unionId
    })
  }
  //图文问诊订单详情
  , getGcInquiryDetail(id) {
    return new JSONPAsyncData(getAPIUri('/user-web/restapi/getGcInquiryDetail'), {
      id
    })
  }

  ,contactPatientDoct ( corpId, doctCode, patientId, unionId = uid ) {
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/common/conectPatientDoct'), {
      corpId, doctCode, patientId, unionId
    })
  }
  ,ListViedoDoctor(corpId,deptCode,endDate,regMode,startDate,regType){
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/common/reservation/listVideoDoctor'), {
      corpId, deptCode, endDate, regMode, startDate, regType
    })
  }
  ,getWaitQueueInfo(appointLogId,inquiryType){
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/common/ytUsers/getWaitQueueInfo'), {
      appointLogId,inquiryType
    })
  },

  //患者向医生报到问诊服务接口
  getDoctByCodes(corpId,doctCode){
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/common/getDoctByCodes'), {
      corpId,doctCode
    })
  },
  submitFillInfo(corpId,deptCode,doctCode,illnessDesc,medDate,patientId,preDiagnosis){
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/registerInquiryEnter'), {
      corpId,deptCode,doctCode,illnessDesc,medDate,patientId,preDiagnosis
    })
  },
  reportLogin(corpId,doctCode,phoneNum,validCode,openId,appId){
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/common/preRegInquiryEnter'), {corpId,doctCode,phoneNum,validCode,openId,appId})
  },
  getReportDocList(inquiryType){
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/ListInquiryByCode'), {inquiryType})
  },
  getInquiryFee(corpId,doctCode,rcDoctId){
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/common/getInquiryFee'), {corpId,doctCode,rcDoctId})
  },
  checkConversion(corpId,doctCode){
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/checkConversion'), {corpId,doctCode})
  },
  getDoctHelperInfo(rcDoctId){
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/common/getDoctHelper'), {rcDoctId})
  },
  hasOrderOn(rcDoctId,rcUserId){
    return new JSONPAsyncData( getAPIUri('/user-web/restapi/hasOrderOn'), {rcDoctId,rcUserId})
  }
}
