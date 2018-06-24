/*
 * @Author: saohui 
 * @Date: 2017-08-23 09:01:33 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-04-04 16:22:33
 */
import React from 'react'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import UserCenter from './module/UserCenter'
import Aolsee from './module/Aolsee'
import util from './lib/util'
import { goConsultation } from './lib/hybridAPI'

import Header from './pageComponent/doctorOrDept/header'
import Paiban from './component/paiban/Paiban'
import ShowEvaluate from './pageComponent/doctorOrDept/showEvaluate'
import Profile from './pageComponent/doctorOrDept/profile'
import ListenDoctor from './pageComponent/doctorOrDept/listenDoctor'
import Artical from './pageComponent/doctorOrDept/artical'
import Alert from './component/alert/alert'
 
import './doctor.less'

export default class Doctor extends SmartBlockComponent {
  constructor(props) {
    super(props)

    const query = util.query()
    this.unionId = query.unionId
    this.corpId = query.corpId
    this.doctCode = query.doctCode
    this.deptCode = query.deptCode
    this.corpName = query.corpName
    this.doctName = query.doctName
    this.regMode = query.regMode
    this.regType = query.regType
    this.state = {
      ...this.state
      , loading: true
      , success: false
      , inquiryFee:""
      , isDoctDataSuccss: false
      , doctorData: {
        doctName: this.doctName || ''
        , doctCode: this.doctCode
        , doctPictureUrl: ''
        , doctSpec: ''
        , doctProfe: ''
        , rate: 0
        , corpName: this.corpName || ''
        , deptCode: this.deptCode || ''
        , inquiryStatus: -1
      }
      , deptList: [
        { // 如果排班无此医生信息，则自行模拟一个
          corpId: this.corpId
          , deptCode: this.deptCode
          , corpName: this.corpName
          , deptName: '门诊排班'
        }
      ]
      , isGetDoctDataToSuccess: true
      , evaluateData: {
        totalTag: 0
        , tagList: []
        , totalEvaluate: 0
        , evaluateList: []
      }
      , isShow:false
      , adData: null
    }
  }

  componentDidMount() {
    const { unionId, corpId, doctCode, deptCode } = this
    //获取医生价格
    UserCenter.getInquiryFee(corpId, doctCode).subscribe({
      onSuccess: (result) => {
        if (result.data){
          this.setState({
            inquiryFee: result.data.inquiryFee
          })
        }
      },
      onError: (result) => {
      }
    }).fetch()
    // 获取医生信息
    UserCenter.getDoctorInfoAndDept(corpId, doctCode, deptCode, unionId)
      .subscribe({
        onSuccess: (result, isCache) => {
          const { data } = result
          if (result.success) {

            // 因为此接口取了缓存，onSuccess 会被调用两次，排班只需要获取一次
            if (!isCache) {
              this.initFirstSchedule(data.deptList)
            }

            this.setState({
              loading: false
              , success: true
              , doctorData: data.doctInfo
              , deptList: data.deptList
              , inquiryStatus: data.doctInfo.inquiryStatus
              , isDoctDataSuccss: !isCache
            },()=>{
              if (this.state.inquiryStatus == 2 || this.state.inquiryStatus==3){
                this.setState({
                  isShow:true
                })
              }
            })
          }
        }
        , onError: result => {
          this.setState({
            loading: false
            , success: true
            , isGetDoctDataToSuccess: false
          })
          this.initFirstSchedule(this.state.deptList)
        }
      })
      .fetch()

    // 获取医生评价
    UserCenter.getDoctOrDeptEvaluateList('doct', corpId, doctCode, 1, 1, unionId)
      .subscribe({
        onSuccess: result => {
          const { tagData, evaluateData } = result.data

          if (result.success) {
            this.setState({
              evaluateData: {
                totalTag: tagData.totalTag
                , tagList: tagData.tagList
                , totalEvaluate: evaluateData.totalEvaluate
                , evaluateList: evaluateData.evaluateList
              }
            })
          }
        }
      })
      .fetch()


    // 获取广告位
    Aolsee.findAppAd(unionId, 44)
      .subscribe({
        onSuccess: result => {
          if (result.success) {
            this.setState({
              adData: result.data.adList[0].contentList
            })
          }
        }
      })
      .fetch()
  }

  initFirstSchedule(deptList) {
    if (deptList.length > 0) {
      this.activeSchedule(deptList[0])
    }
  }

  // 获取医生排班
  activeSchedule(dept) {
    const { deptList } = this.state
    const { doctCode, doctName } = this.state.doctorData
    const { unionId} = this

    const { corpId, deptCode, corpName } = dept
    // 如果还没有请求过数据则请求一波
    if (!dept.scheduleComponentCache) {
      dept.scheduleComponentCache = <Paiban
        title="医生排班"
        corpId={'' + corpId}
        regMode={this.regMode}
        corpName={corpName}
        doctName={doctName}
        deptCode={deptCode}
        doctCode={doctCode || '0000'}
        getRegType={(regType, subRegType) => { }}
        isHideTitle={true}
      />
    }

    // 选中当前
    if (dept.active) {
      dept.active = false
    } else {
      deptList.forEach(function (deptItem) {
        deptItem.active = false
      }, this)
      dept.active = true
    }
    setTimeout(() => {
      this.setState({})
    })
  }


  // 获取医生文章
  nextDoctorNewsPage(obj, classifyId) {
    const { unionId, corpId, doctCode } = this

    if (!obj.loading) {
      obj.loading = true
      this.setState({
        loading: true
      })
      Aolsee.getNewsList(classifyId, obj.currentPage + 1, unionId, 6, corpId, doctCode)
        .subscribe({
          onSuccess: result => {
            const { currentPage, totalRecordNum } = result.data
            obj.currentPage = currentPage
            obj.loading = false
            obj.list = obj.list.concat(result.data.records)
            if (totalRecordNum == obj.list.length) {
              obj.isFinished = true
            }
            this.setState({
              loading: false
            })
          }
        })
        .fetch()
    }
  }

  async handleCosultaion() {
    const { corpId, deptCode, doctCode, doctName, inquiryStatus, id, sex, doctPictureUrl } = this.state.doctorData
    const { unionId } = this

    this.onSendBefore('','', '正在跳转...')
    try {
      let result = await UserCenter.getDoctConsultationRecord(1, corpId, deptCode, doctCode,1)
        // .mock('//rap.yuantutech.com/mockjsdata/25/user-web/restapi/ytDoctors/ListInquiryByCode')
        .subscribe({
          onError: (result) => {
            //未登录跳转
            if (result.resultCode === "202") {
              util.goLogin()
            }
          }
        })
        .fetch()
      if (result.data.length > 0) {
        // 判断是否有正在进行的问诊
        let { rcDoctId, rcUserId, patientIm,doctIm, doctName, conversationStatus, patientSex,id } = result.data[0]
        if(util.isInYuantuApp()){
          // 跳会话页 native，im 聊天页
          goConsultation(rcDoctId, rcUserId, patientIm,doctIm, doctName, conversationStatus,id)
        }else{
          window.location = './chat-details.html?' + util.flat({
            doctCode
            , doctName
            , deptCode
            , corpId
            , unionId
            , rcDoctId: rcDoctId
            , doctSex: sex
            , doctLogo: doctPictureUrl
            , corpName: this.corpName
            , regMode: this.regMode
            , regType: this.regType
            , patient_sex: patientSex=="女 "?2:1
            , target: '_blank'
          })
        }
      } else {
        switch (inquiryStatus) {
          case 1:
            // 未开诊
            goInquiryDoct('该医生今日未开诊')
            break
          case 2:
            // 开诊，但是号源已满
            goInquiryDoct('号源已满，请选择其它医生进行咨询')
            break
          case 3:
            // 正常状态，可提交在线咨询
            window.location = './create-consultation.html?' + util.flat({
              doctCode
              , doctName
              , deptCode
              , corpId
              , unionId
              ,doctSex:sex
              , doctLogo: doctPictureUrl
              ,corpName:this.corpName
              ,regMode:this.regMode
              , regType: this.regType
              , target: '_blank'
            })
            break
          default:
            // window.location = 可问诊的医生
            goInquiryDoct('当前医生未开通，正在跳转至可问诊的医生')
        }
      }
    } catch (e) {

    }

    function goInquiryDoct(info, timeout = 1000) {
      Alert.show(info, timeout)
      setTimeout(() => {
        window.location = 'yuantuhuiyi://huiyi.app/myInquiryOnline?' + util.flat({
          corpId, doctCode
        })
      }, timeout)
    }

    this.onComplete()
  }


  /***** render 区开始 *****/

  renderConsultation() {
    let { inquiryFee, isShow}=this.state;
    return isShow ? <div onClick={() => { this.handleCosultaion() }} className="list-item consultation-title">
      <a className="txt-arrowlink list-link-wrapper">
        <div className="list-content ">
          <div className="list-title " style={{ paddingLeft: 5 }}>在线问医生 {inquiryFee ? " ¥" + util.rmb(inquiryFee / 100):""}</div>
        </div>
      </a>
    </div> : null;
  }

  renderDoctorProfile() {
    const { doctSpec } = this.state.doctorData

    return <div className='panel g-space'>
      <Profile title={'医生擅长'} content={doctSpec} needMore={true} />
      {this.renderConsultation()}
    </div>
  }
  renderschedule() {
    const { deptList, isGetDoctDataToSuccess } = this.state

    return <div className="panel g-space">
      {isGetDoctDataToSuccess ? <div className="panel-title">门诊排班</div> : null}

      {deptList.length > 0 ? deptList.map((deptItem, key) => {
        return <div key={key} className="schedule-item" >
          <div onClick={() => {
            this.activeSchedule(deptItem)
          }} className={'panel-title schedule-title ' + (deptItem.active ? 'active' : '')}>{deptItem.deptName}</div>
          <div className={'table-rostering schedule-content ' + (deptItem.active ? 'active' : '')}>
            {deptItem.scheduleComponentCache}
          </div>
        </div>
      }) : <div className="panel-msg">无</div>}
    </div>
  }
  renderEvaluate() {
    const { unionId, corpId, doctCode } = this
    const evaluateData = this.state.evaluateData

    return <ShowEvaluate
      evaluateData={evaluateData}
      unionId={unionId}
      corpId={corpId}
      code={doctCode}
      isDoct={true}
    />
  }
  renderAd() {
    const { adData } = this.state
    return adData && adData.length > 0 ? <div className="panel g-space">
      {adData.map((item, key) => {
        return <a key={key} href={item.redirectUrl} className="img-link-wrapper list-link-wrapper">
          <img src={item.url} alt="" />
        </a>
      })}
    </div> : null
  }
  renderListenDoctor() {
    return <ListenDoctor nextDoctorNewsPage={(...params) => this.nextDoctorNewsPage(...params)} unionId={this.unionId} />
  }
  renderDoctorArtical() {
    return <Artical nextDoctorNewsPage={(...params) => this.nextDoctorNewsPage(...params)} unionId={this.unionId} />
  }

  renderHeader() {
    const { isDoctDataSuccss } = this.state
    const { doctName, doctProfe, deptCode, corpName, doctSpec, doctPictureUrl, rate, sex, state } = this.state.doctorData

    return <Header
      name={doctName}
      profile={doctProfe}
      spec={doctSpec}
      deptCode={deptCode}
      corpName={corpName}
      logoImg={doctPictureUrl || (sex == '女' ? 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/fe22e264886052a69a3fffabbebaace9-174-174.png' : 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/90e5757435f5c21c4cfc9d3483b7132a-174-174.png')}
      rate={rate}
      doctCode={this.doctCode}
      corpId={this.corpId}
      unionId={this.unionId}

      needFollow={isDoctDataSuccss}
      ctx={this}
      state={state}

      needLink={true}
    />
  }
  renderBody() {
    return <div>
      {this.renderDoctorProfile()}
      {this.renderschedule()}
      {this.renderEvaluate()}
      {this.renderAd()}
      {this.renderListenDoctor()}
      {this.renderDoctorArtical()}
    </div>
  }
  renderFooter() {
    return <div style={{ height: 10 }}></div>
  }

  render() {
    return <div className="doctor">
      {this.renderHeader()}
      {this.renderBody()}
      {this.renderFooter()}
    </div>
  }
}