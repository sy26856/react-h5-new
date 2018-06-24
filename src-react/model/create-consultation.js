/*
 * @Author: saohui 
 * @Date: 2017-10-20 09:40:33 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-02-01 19:11:26
 */
import util from '../lib/util'
import UserCenter from '../module/UserCenter'
import Alert from '../component/alert/alert'
import { callPhotoUpload, createConsultation } from '../lib/hybridAPI'

export default {
  namespace: 'createConsultation'
  ,state: {
    success: true
    ,loading: false
    ,errorMsg: ''
    
    ,unionId: null
    ,corpId: null
    ,deptCode: null
    ,doctCode: null
    ,doctName: null
    ,doctSex:null
    ,doctLogo:null
    ,corpName:null
    ,regMode:null
    ,regType:null
    ,showSelectPatient: false

    ,patientList: []
    ,currentPatientId: null
    ,currentPatientName: null

    ,inputValue: ''
    ,inputValueHelp: ''
    ,inputValueInfo: ''
    ,imgs: []

    ,submitOk: false
  }
  ,reducers: {
    setQuery(state, { unionId, corpId, deptCode, doctCode, doctName, doctId, doctSex, doctLogo, corpName, regMode, regType } ) {
      return {
        ...state
        , unionId, corpId, deptCode, doctCode, doctName, doctSex, doctLogo, corpName, regMode, regType
      }
    }
    ,setLoading ( state, { loading, msg }) {
      return {
        ...state
        ,loading
        ,loadingMsg: msg
      }
    }
    ,showSelectPatient ( state ) {
      return {
        ...state
        ,showSelectPatient: true
      }
    }
    ,hideSelectPatient ( state ) {
      return {
        ...state
        ,showSelectPatient: false
      }
    }

    ,setCurrentPatient ( state, { currentPatientId, currentPatientName }) {
      return {
        ...state
        ,currentPatientId
        ,currentPatientName
      }
    }

    ,setInputValue ( state, { value }) {
      if ( value.length > 300 ) {
        Alert.show('文字描述不能大于300个字')
      }
      return {
        ...state
        ,inputValue: value.slice( 0, 300 )
      }
    }
    , setInputValueInfo(state, { value }) {
      return {
        ...state
        ,inputValueInfo: value
      }
    }
    , setInputValueHelp(state, { value }) {
      return {
        ...state
        , inputValueHelp: value
      }
    }

    ,addImg ( state, { url }) {
      return {
        ...state
        ,imgs: state.imgs.concat( url )
      }
    }
    ,removeImg ( state, { index }) {
      const { imgs } = state
      imgs.splice( index, 1 )
      return {
        ...state
        ,imgs
      }
    }

    ,savePatientList ( state, { patientList }) {
      return {
        ...state
        ,patientList
      }
    }
    ,setSubmitOk ( state ) {
      return {
        ...state
        ,submitOk: true
      }
    }
  }

  ,effects: {
    async appUpload ({}, { put, select }) {
      await put({ type: 'setLoading', loading: true, msg: '正在打开相册...'})

      setTimeout(async () => {
        // 因为上传是有 App 进行的，所以打开相册后 原生 App 的 loading 和这个 loading 会重叠，所以取消
        await put({ type: 'setLoading', loading: false })
      }, 1000 )

      let result = await callPhotoUpload()
      await put({ type: 'setLoading', loading: false })

      if ( result.ret === 'SUCCESS' ) {
        let uploadData = JSON.parse(result.data)
        let addressPrefix = 'http://image.yuantutech.com/' + uploadData.data.path + ''
        let addressPicName = uploadData.data.name
        let url = `${addressPrefix}${addressPicName}`

        await put({ type: 'addImg', url: 'loading' })
        await awaitMs( 3900 )
        const { imgs } = await select( async ({ createConsultation }) => createConsultation )
        await put({ type: 'removeImg', index: imgs.length - 1 })
        await put({ type: 'addImg', url })

      } else {
        Alert.show('上传图片失败', 1000)
      }
    }
    ,async upload ({}, { put }) {
      if ( util.isInYuantuApp()) {
        await put({ type: 'appUpload' })
      }
    }

    ,async getPatientList ({}, { select, put }) {
      if ( !util.isLogin()) {
        util.goLogin()
      }
      await put({ type: 'setLoading', loading: true, msg: '正在获取就诊人...' })
      const { corpId, unionId } = await select( async ({ createConsultation }) => createConsultation )

      try {
        let result = await UserCenter.getPatientList( corpId )
              .fetch()
        
        if ( result.data ) {
          await put({ type: 'savePatientList', patientList: result.data })
        }
      } catch (e) {
        console.error(e)
        
        if ( e.resultCode == 202 ) {
          util.goLogin()
        }
      }

      await put({ type: 'setLoading', loading: false })
    }
    ,async getDefaultPatient ({}, { select, put }) {
      let { patientList } = await select( async ({ createConsultation }) => createConsultation )
      
      if ( patientList.length == 0 && util.isLogin()) {
        await put({ type: 'getPatientList'})
        let { patientList } = await select( async ({ createConsultation }) => createConsultation )
        let defaultPatient = patientList.filter(( patient )=> {
          return patient.default == true
        })[0]
        
        defaultPatient && await put({
          type: 'setCurrentPatient'
          ,currentPatientName: defaultPatient.patientName
          ,currentPatientId: defaultPatient.id
        })
      }
    }
    ,async selectPatient ({}, { put, select }) {
      const state = await select( async ({ createConsultation }) => createConsultation )
      let patientList = state.patientList

      if ( patientList.length == 0 && util.isLogin()) {
        await put({ type: 'getPatientList'})
      }
      
      if ( !util.isLogin() ) {
        util.goLogin()
        return
      }
      await put({ type: 'showSelectPatient'})
    }

    ,async submit ({}, { select, put }) {
      const { unionId, corpId, deptCode, doctCode, doctName, inputValue, imgs, currentPatientId } = await select( async ({ createConsultation }) => createConsultation )

      // console.log({ unionId, corpId, deptCode, doctCode, inputValue, imgs, currentPatientId })

      if ( !currentPatientId ) {
        Alert.show('请选择就诊人')
        return
      }

      await put({ type: 'setLoading', loading: true })
      await put({ type: 'setSubmitOk'})
      let result;
      try{
          result = await UserCenter.createConsultation( corpId, deptCode, doctCode, inputValue, imgs, currentPatientId, unionId )
            // .mock('//rap.yuantutech.com/mockjsdata/25/user-web/restapi/submitInquiry')
              .subscribe({
                  onComplete: (res)=>{
                      result = res
                  }
              })
            .fetch()
      }catch(err){
          if ( !result.success ) {
            Alert.show( result.msg, 3000 )
        }

        await put({ type: 'setLoading', loading: false })
        return
      }
      await put({ type: 'setLoading', loading: false })

      if(result.resultCode === "1501"){
          Alert.show( result.msg, 3000 )
          return
      }

      try {
        await UserCenter.contactPatientDoct ( corpId, doctCode, currentPatientId )
            .fetch()
      } catch (e) {
        console.warn(e)
      }

      await put({ type: 'setLoading', loading: true, msg: '提交成功，正在跳转...' })

      let { rcDoctId, rcUserId, patientIm, doctIm } = result.data
      // 跳聊天
      await createConsultation(rcDoctId, rcUserId, patientIm, doctIm, doctCode, doctName, deptCode, corpId, unionId, imgs, inputValue )

      await put({ type: 'setLoading', loading: false })
    }
  }
  ,subscriptions: {
    init ({ dispatch }) {
      if ( util.countInstances( window.location.href, 'http' ) == 1 && window.location.href.indexOf('create-consultation.html') != -1 ) {
        const query = util.query()
        const unionId = query.unionId
        , corpId = query.corpId
        , deptCode = query.deptCode
        , doctCode = query.doctCode
        , doctName = query.doctName
        dispatch({ type: 'createConsultation/setQuery', unionId, corpId, deptCode, doctCode, doctName })
        dispatch({ type: 'createConsultation/getDefaultPatient' })
      }
    }
  }
}

function awaitMs ( ms ) {
  return new Promise( function ( resolve, reject ) {
    setTimeout(function() {
      resolve( ms )
    }, ms )
  })
}