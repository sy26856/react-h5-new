/*
 * @Author: saohui 
 * @Date: 2017-09-26 09:30:52 

 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-04-21 09:09:36
 */

 /**
  * 路由声明文件
  */

 import Bill from './bill'
 import BillDetail from './bill-detail'
 import RegisterDetails from './register-details-2'
 import InfoConfirm2 from './info-confirm-2'
 import HybridTest from './hybrid-test'
 import Search from './search'
 import SearchDetail from './search-detail'
 import Law from './law'
 import Privacy from './privacy'
 import About from './about'
 import QaList from './qa-list'
 import NewsDetail from './news-detail'
 import Report from './report'
 //青岛新增,根据医院筛选报告单功能,单独写一个页面
 import Report29 from './report-29'
 import ReportDetail from './report-detail'
 //青岛地区报告单优化
 import ReportDetailQD from './report-detail-29'
 // 健康档案页面的ui改变
 import HealthRecordList from './health-record-list'
 import HealthRecordList2 from './health-record-list-2'
 import HealthRecord from './health-record'
 import HealthRecord2 from './health-record-2'
 import HealthRecordDetail from './health-record-detail'
 import HealthRecordDetail2 from './health-record-detail-2'

import Evaluate from './evaluate'
import ShowEvaluate from './show-evaluate'
import PatientList from './patient-list'
import PatientList29 from './patient-list-29'
import PatientList60 from './patient-list-60'
import PatientOneInfo29 from './patient-one-info-29'
import PatientOneInfo60 from './patient-info-60'
 
import AddPatient from './add-patient'
import AddPatient29 from './add-patient-29'
import AddPatient60 from './add-patient-60'
import AddPatientByCard29 from './add-patientByCard-29'
import addPatientVerifyId29 from './add-patientVerifyId-29'
import addPatientConfirm29 from './add-patientConfirm-29'
import addPatientById29 from './add-patientById-29'
import addPatientByIdBindCard29 from './add-patientByIdBindCard-29'
 
 import InhosRecords from './inhos-records'
 import InhosDailyList from './inhos-daily-list'
 import InhosDailyDetail from './inhos-daily-detail'
 
 import Sections from './Sections'
 
 import Dept from './dept'
 import Doctor from './doctor'
 import RegType from './reg-type'
 import SelectSheduling from './select-scheduling'
 import IndexArea from './index-area'
 
 import Recharge from './recharge'  //暂时中转到老的交互页
 import HospitalizeRecharge from './hospitalize-recharge'  //暂时中转到老的交互页
 
 import Rule from './rule'
 //慧医app改版后的医院选择页
 import IndexArea2 from './index-area2'
 import Index from './index'
 import AppointmentHospital from './appointment-hospital'
 import RegisterHospital from './register-hospital'
 import LeafCorp from './leaf-corp'
 import SearchIndex from './search-index'
 
 import Navigation from './navigation'
 import Feedback from './feedback'
 import FeedbackQuery from './feedback-query'
 import FeedbackDetail from './feedback-detail'
 
 import MyReservation from './my-reservation'
 import CorpInfo from './corp-info'
 import PayList from './pay-list'
 import SelectDoctor from './select-doctor'
 import BindCard from './bind-card'
 import bindCardChange29 from './bind-card-change-29'
 
 import PatientCardDetail from './patient-card-detail'
 
 import OrderList from './order-list'
 import InsuranceList from './insurance-list'
 
 import AppointmentSelect from './appointment-select'
 
 import BlackList from './black-list'
 import BlackDetail from './black-detail'
 import News from './news'
 
 import SignIn from './sign-in'
 import SingUp from './register'
 import ForgetPwd from './forget-pwd'
 import ForgetPwd2 from './forget-pwd-2'
 import My from './my'
 import Setting from './setting'
 import MyFollow from './my-follow'
 import WechatLogin from './wechat-login'
 
 import ApplicationList from './application-list'
 import FeedBackIndex from './feedback-index'
 
 import DoctorProfile from './doctor-profile'
 import DoctorList from './doctor-list'
 import FeedBackIssue from './feedback-issue'
 
 import EvaluateExtra from './evaluate-extra'
 import DiseaseDetail from './disease-detail'
 
 import OauthLogin from './oauth-login'
 import PayDetail from './pay-detail'
 
 //网页支付中转页面
 import PayStatus from './pay-status'
 
 //样式测试
 import StyleTest from './styletest'
 import MyTest from './my-test'
 import JavascriptCore from './javascript-core'
 
 import CreateConsultation from './create-consultation'
 
 
 // 诊疗包
 import ResultBstatistics from './result-bstatistics'
 import ResultOxy from './result-oxy'
 import ResultOxystatistics from './result-oxystatistics'
 import Video from './video'
 import ResultBs from './result-bs'
 import OxygenConsult from './oxygen-consult'
 import BsConsult from './bs-consult'
 import ResultWf from './result-wf'
 import ResultWfstatistics from './result-wfstatistics'
 import ResultOt from './result-ot'
 import WfConsult from './wf-consult'
 import OtConsult from './ot-consult'
 import ResultOtstatistics from './result-otstatistics'
 import EtConsult from './et-consult'
 import ResultBp from './result-bp'
 import BpConsult from './bp-consult'
 import ResultBpstatistics from './result-bpstatistics'
 
 
 //候诊队列
 import WaitingQueue from './waiting-queue'
 //患者端疾病信息
 import PatientAudio from './patient-audio'
 //患者端订单详情
 import PatientOrder from './patient-order'
 //视频问诊
 import VideoInter from './video-inter'
 import SearchDisease from './search-disease'
 //患者端视频问诊筛选
 import VideoSelect from './video-select'
        
 //青岛区域infor-confirm-29
 import InfoConfirm29 from './info-confirm-29'

 //番禺预约/挂号信息确认
import InfoConfirm60 from './info-confirm-60'
 //家庭医生
 import ServicePack from './service-pack'
 import MyDoctors from './my-doctors' 
 import FamilyDoctors from './family-doctors'
 import FamilyPatient from './family-patient'
 
 //医生问诊服务
 import FillInfo from './fill-info'
 import ReportToDoc from './report-doc'
 import ReportDocHelper from './report-doc-helper'
 import ReportDocList from './report-doc-list'
 
 //图文问诊
 import MyInquisition from './my-inquisition'
 import InquireDetails from './inquire-details'
 import OnlineInquisition from './online-inquisition'
 import ChatDetails from './chat-details'
 
 //资讯详情
 import ArticleDetail from './article-details'
 import FillComments from './fill-comments'
 
 export default function ( register ) {
   register('/bill-detail.html', BillDetail )
   register('/bill.html', Bill )
   register('/register-details-2.html', RegisterDetails )
   register('/info-confirm-2.html', InfoConfirm2 )
   //青岛区域
   register('/info-confirm-29.html', InfoConfirm29 )
   register('/info-confirm-60.html', InfoConfirm60 )
   register('/hybrid-test.html', HybridTest )
   // 医生与科室的搜索
   register('/search.html', Search )
   // 医生与科室搜索全部页
   register('/search-detail.html', SearchDetail )
   // 法律须知
   register('/law.html', Law )
   // 隐私声明
   register('/privacy.html', Privacy )
   // 关于我们
   register('/about.html', About )
   // 问题列表
   register('/qa-list.html', QaList )
   // 咨询详情
   register('/news-detail.html', NewsDetail )
   // 报告单
   register('/report.html', Report )
   //青岛新增,根据医院筛选报告单功能,单独写一个页面
   register('/report-29.html', Report29 )
   // 报告单详情
   register('/report-detail.html', ReportDetail )
   //青岛地区报告单优化
   register('/report-detail-29.html', ReportDetailQD )
   // 健康档案
   // 健康档案页面的ui改变
   register('/health-record-list.html', HealthRecordList )
   register('/health-record-list-2.html', HealthRecordList2 )
   register('/pay-detail.html', PayDetail )
   // 添加健康档案
   register('/health-record.html', HealthRecord )
   register('/health-record-2.html', HealthRecord2 )
   // 查看健康档案的详情
   register('/health-record-detail.html', HealthRecordDetail )
   register('/health-record-detail-2.html', HealthRecordDetail2 )
   
   // 评价
   register('/evaluate.html', Evaluate )
   register('/show-evaluate.html', ShowEvaluate )
   // 病人列表
   register('/patient-list.html', PatientList )
   register('/patient-list-29.html', PatientList29 )
   register('/patient-list-60.html', PatientList60 )
   register('/patient-one-info-29.html', PatientOneInfo29 )  
   register('/patient-info-60.html', PatientOneInfo60 )  
   
   // 添加病人
   register('/add-patient.html', AddPatient )
  register('/add-patient-29.html', AddPatient29 )  
  register('/add-patient-60.html', AddPatient60 )  
  register('/add-patientByCard-29.html', AddPatientByCard29 )  
  register('/add-patientVerifyId-29.html', addPatientVerifyId29 )  
  register('/add-patientConfirm-29.html', addPatientConfirm29 ) 
  register('/add-patientById-29.html', addPatientById29 )  
  register('/add-patientByIdBindCard-29.html', addPatientByIdBindCard29 )  
   
   // 住院记录
   register('/inhos-records.html', InhosRecords )
   // 住院记录日清单
   register('/inhos-daily-list.html', InhosDailyList )
   register('/inhos-daily-detail.html', InhosDailyDetail )
   
   register('/sections.html', Sections )
   
   register('/dept.html', Dept )
   register('/doctor.html', Doctor )
   register('/reg-type.html', RegType )
   register('/select-scheduling.html', SelectSheduling )
   register('/index-area.html', IndexArea )
   
   register('/navigation.html', Navigation );
   register('/feedback.html', Feedback );
   register('/feedback-query.html', FeedbackQuery );
   register('/feedback-detail.html', FeedbackDetail );
   register('/pay-status.html', PayStatus );
   register('/pay-status.php', PayStatus );
   
   
   register('/styletest.html', StyleTest )
   register('/my-test.html', MyTest )
   
   register('/my-reservation.html', MyReservation )
   register('/corp-info.html', CorpInfo )
   register('/pay-list.html', PayList )
   register('/leaf-corp.html', LeafCorp )
   register('/select-doctor.html', SelectDoctor )
   
   register('/order-list.html', OrderList )
   register('/insurance-list.html', InsuranceList )
   
   register('/index.html', Index )
   register('/index-area2.html', IndexArea2 )
   register('/appointment-hospital.html', AppointmentHospital )
   register('/register-hospital.html', RegisterHospital )
   register('/search-index.html', SearchIndex )
   
   
   register('/appointment-select.html', AppointmentSelect )
   
   register('/black-list.html', BlackList )
   register('/black-detail.html', BlackDetail )
   
   
   register('/recharge.html', Recharge )
   register('/recharge.php', Recharge )
   
   register('/hospitalize-recharge.php', HospitalizeRecharge )
   register('/hospitalize-recharge.html', HospitalizeRecharge )
   
   register('/recharge-test2.php', Recharge )//线上测试页面
   
   register('/rule.html', Rule )
   
    
   register('/application-list.html', ApplicationList )
   
   register('/news.html', News )
   register('/feedback-index.html', FeedBackIndex )
   register('/doctor-list.html', DoctorList )
   register('/doctor-profile.html', DoctorProfile )
   
   register('/bind-card.html', BindCard )
   register('/bind-card-change-29.html', bindCardChange29 )
   register('/patient-card-detail.html', PatientCardDetail )
   
   register('/feedback-issue.html', FeedBackIssue )
   register('/javascript-core.html', JavascriptCore )
   
   register('/evaluate-extra.html', EvaluateExtra )
   
   register('/sign-in.html', SignIn )
   register('/register.html', SingUp )
   register('/forget-pwd.html', ForgetPwd )
   register('/forget-pwd-2.html', ForgetPwd2 )
   register('/my.html', My )
   register('/setting.html', Setting )
   register('/my-follow.html', MyFollow )
   register('/wechat-login.html', WechatLogin )
   
   register('/oauth-login.html', OauthLogin )
   register('/oauth-login.php', OauthLogin )
   
   register('/disease-detail.html', DiseaseDetail )
 
   register('/create-consultation.html', CreateConsultation )
   // 诊疗包
   register('/result-bstatistics.html', ResultBstatistics )
   register('/result-oxy.html', ResultOxy )
   register('/bs-consult.html', BsConsult )
   register('/oxygen-consult.html', OxygenConsult )
   register('/result-bs.html', ResultBs )
   register('/result-oxystatistics.html', ResultOxystatistics )
   register('/video.html',Video )
   register('/result-wf.html',ResultWf)
   register('/result-wfstatistics.html',ResultWfstatistics)
   register('/result-ot.html',ResultOt)
   register('/wf-consult.html',WfConsult)
   register('/ot-consult.html',OtConsult)
   register('/et-consult.html',EtConsult)
   register('/result-bp.html',ResultBp)
   register('/bp-consult.html',BpConsult)
   register('/result-bpstatistics.html',ResultBpstatistics)
   register('/result-otstatistics.html',ResultOtstatistics)
   //家庭医生
   register('/service-pack.html', ServicePack)
   register('/my-doctors.html', MyDoctors)
   register('/family-doctors.html', FamilyDoctors)
   register('/family-patient.html', FamilyPatient)
 
   //视频问诊
   register('/patient-audio.html', PatientAudio)
   register('/patient-order.html', PatientOrder)
   register('/waiting-queue.html', WaitingQueue)
   register('/video-inter.html', VideoInter)
   register('/video-select.html', VideoSelect)
   register('/search-disease.html', SearchDisease)
 
   //患者向医生报到
   register('/fill-info.html', FillInfo)
   register('/report-doc.html', ReportToDoc)
   register('/report-doc-helper.html', ReportDocHelper)
   register('/report-doc-list.html', ReportDocList)
 
   //图文问诊
   register('/my-inquisition.html', MyInquisition)
   register('/inquire-details.html', InquireDetails)
   register('/online-inquisition.html',OnlineInquisition)
   register('/chat-details.html',ChatDetails)
 
   //资讯改造
   register('/article-details.html',ArticleDetail)
   register('/fill-comments.html', FillComments)
 
 }