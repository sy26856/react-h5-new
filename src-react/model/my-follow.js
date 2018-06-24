/*
 * @Author: saohui 
 * @Date: 2017-09-26 09:41:30 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-05-29 15:31:27
 */
import util from '../lib/util'
import UserCenter from '../module/UserCenter'
import Alert from '../component/alert/alert'

export default {
  namespace: 'myFollow'
  ,state: {
    success: true
    ,loading: true
    ,successCode: 1 // 1：只显示关注列表&上拉刷新；2：关注列表&曾挂号医生列表；3：给按钮去挂号；
    ,errorMsg: ''
    
    ,unionId: null
    
    ,followList: []
    ,currentPage: 0
    ,totalRecordNum: 999
    ,totalPageNum: 999
    ,isFinished: false

    ,registeredDoctList: []
    ,showRegisteredDoct: false
  }
  ,reducers: {
    setUnionId ( state, { unionId } ) {
      return {
        ...state
        ,unionId
      }
    }
    ,setFollowList ( state, { records, totalPageNum, totalRecordNum, currentPage }) {
      return {
        ...state
        ,totalPageNum
        ,totalRecordNum
        ,currentPage
        ,followList: state.followList.concat( records || [] )
      }
    }
    ,setFinished ( state ) {
      return {
        ...state
        ,isFinished: true
      }
    }
    ,setSuccess ( state, { success, successCode, errorMsg }) {
      return {
        ...state
        ,success
        ,loading: false
        ,successCode
        ,errorMsg: errorMsg || ''
      }
    }
    ,setRegisteredDoctList ( state, { records }) {
      return {
        ...state
        ,registeredDoctList: state.registeredDoctList.concat(( records || [] ).slice( 0, 5 ))
      }
    }
  }

  ,effects: {
    async getMyFollowList ({ unionId, onSuccess }, { put, select }) {
      // console.log('--> getPageList start')
      try {
        const { currentPage } = await select( async state => state['myFollow'] )

        const result = await UserCenter.getMyFollowList( currentPage + 1, 20 )
                          // .mock('http://rap.yuantutech.com/mockjsdata/4/restapi/myDoctor/getFollowDeptAndDoct?currentPage=')
                          .fetch()
        const data = result.data
        await put({ type: 'setFollowList', ...data })
        if ( data.totalPageNum <= data.currentPage ) {
          await put({ type: 'setFinished'})

          if ( data.totalRecordNum < 4 ) {
            await put({ type: 'getRegisteredDoctList'})
            onSuccess({ success: true, data: { isFinished: true } })
            return
          }
          onSuccess({ success: true, data: { isFinished: true } })
        } else {
          onSuccess({ success: true, data: { isFinished: false } })
        }
        await put({ type: 'setSuccess', success: true, successCode: 1 })
      } catch (e) {
        console.error(e)
        if ( e.msg ) {
          await put({ type: 'setSuccess', success: false, errorMsg: e.msg })
        }

        if ( e.resultCode == 202 ) {
          util.goLogin()
        }
      }

      // console.log('--> getPageList end')
    }
    ,async getRegisteredDoctList ({}, { put, select }) {
      const result = await UserCenter.getRegisteredDoctList()
                            // .mock('http://rap.yuantutech.com/mockjsdata/4/restapi/myDoctor/getRegisterDoctList?')
                            .fetch()
                            // console.log('getRegisteredDoctList', result )
      const { totalRecordNum } = await select( async state => state['myFollow'] )
      if ( totalRecordNum == 0 && result.data.length == 0 ) {
        await put({ type: 'setSuccess', success: true, successCode: 3 })
        return
      }
      if ( result.data.length > 0 ) {
        await put({ type: 'setRegisteredDoctList', records: result.data })
        await put({ type: 'setSuccess', success: true, successCode: 2 })
      } else {
        await put({ type: 'setSuccess', success: true, successCode: 1 })
      }
    }
    ,async alterFollow ({ index }, { put, select }) {
      const { unionId, registeredDoctList } = await select( async state => state['myFollow'] )
      const { deptCode, doctCode, state, corpId } = registeredDoctList[index]
      if ( state == 1 ) {
        Alert.show('取消关注请到医生/科室首页进行操作', 2500 )
        return
      } 
      let token = util.crateToken()
      const result = await UserCenter.alterFollowState( deptCode, doctCode, 1, corpId, unionId ,token)
                            .fetch()
      if ( result.data ) {
        Alert.show('关注成功', 2500 )
      }

      registeredDoctList[index].state = 1
      await put({ type: 'setRegisteredDoctList', records: [] })
    }
  }
  ,subscriptions: {
    getQuery ({ dispatch }) {
      if ( util.countInstances( window.location.href, 'http' ) == 1 && window.location.href.indexOf('my-follow.html') != -1 ) {
        const query = util.query()
        
        const unionId = query.unionId
        dispatch({ type: 'myFollow/setUnionId', unionId }) 
      }
    }
  }
}