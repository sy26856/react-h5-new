/*
 * @Author: saohui 
 * @Date: 2017-08-23 09:01:33 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-10-19 09:13:34
 */
import React from 'react'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import UserCenter from './module/UserCenter'
import Aolsee from './module/Aolsee'
import util from './lib/util'

import Header from './pageComponent/doctorOrDept/header'
import ShowEvaluate from './pageComponent/doctorOrDept/showEvaluate'
import Paiban from './component/paiban/Paiban'
import Profile from './pageComponent/doctorOrDept/profile'

import './doctor.less'

export default class Dept extends SmartBlockComponent {
  constructor ( props ) {
    super( props )

    const query = util.query()
    this.unionId = query.unionId || ''
    this.corpId = query.corpId
    this.deptCode = query.deptCode
    this.corpName = query.corpName

    this.regMode = query.regMode
    this.type = query.type || ''
    this.subRegType = query.subRegType || ''
    this.deptName = query.deptName || ''


    this.state = {
      ...this.state
      ,loading: true
      ,success: false
      ,deptData: {
        deptName: this.deptName || ''
        ,rate: 0
        ,corpName: this.corpName || ''
      }
      ,evaluateData: {
        totalTag: 0
        ,tagList: []
        ,totalEvaluate: 0
        ,evaluateList: []
      }
      ,adData: null
    }
  }

  componentDidMount () {
    const { unionId, corpId, deptCode } = this
    // 获取科室信息
    UserCenter.getDeptInfo( corpId, deptCode, unionId )
      .subscribe({
        onSuccess: ( result, isCache ) => {
          const { data } = result
          if ( result.success ) {
            // 因为此接口取了缓存，onSuccess 会被调用两次，排班只需要获取一次
            if ( !isCache ) {
              this.getSchedule( data )
            }

            this.setState({
              loading: false
              ,success: true
              ,deptData: data
            })
            
            // console.log('--> getDeptInfo onSuccess')
          }
        }
        ,onError: result => {
          this.getSchedule( this.state.deptData )
          this.setState({
            loading: false
            ,success: true
          })
        }
      })
      .fetch()
      
    

    // 获取科室评价
    UserCenter.getDoctOrDeptEvaluateList( 'dept', corpId, deptCode, 1, 1, unionId )
      .subscribe({
        onSuccess: result => {
          const { tagData, evaluateData } = result.data

          if ( result.success ) {
            this.setState({
              evaluateData: {
                totalTag: tagData.totalTag
                ,tagList: tagData.tagList
                ,totalEvaluate: evaluateData.totalEvaluate
                ,evaluateList: evaluateData.evaluateList
              }
            })
          }
        }
      })
      .fetch()
    
    
    // 获取广告位
    Aolsee.findAppAd( unionId, 44 )
      .subscribe({
        onSuccess: result => {
          if ( result.success ) {
            this.setState({
              adData: result.data.adList[0].contentList
            })
          }
        }
      })
      .fetch()

  }

  // 获取科室排班
  getSchedule ( dept ) {
    const { unionId, type, subRegType } = this

    const { corpId, deptCode, corpName, deptName } = dept

    // console.log('--> getSchedule')
    
    // 如果还没有请求过数据则请求一波
    if ( !dept.scheduleComponentCache ) {
      dept.scheduleComponentCache = <Paiban
        title="科室排班"
        corpId={ ''+ corpId }
        regMode={ this.regMode }
        corpName={ corpName }
        deptCode={ deptCode }
        deptName={ deptName }
        doctCode={ '0000'}
        type={ type }
        subRegType={ subRegType }
        getRegType={(regType, subRegType) => {}}
      />
    }
  }



  /***** render 区开始 *****/

  renderDeptProfile () {
    const { deptIntro } = this.state.deptData
    return <Profile title={ '科室简介' } content={ deptIntro } needMore={ true } />
  }
  renderschedule () {
    const { deptData } = this.state

    // console.log('--> renderschedule', deptData.scheduleComponentCache )
    return  <div className="g-space">
       { deptData.scheduleComponentCache }
    </div>
  }
  renderEvaluate () {
    const { unionId, corpId, deptCode } = this
    const evaluateData = this.state.evaluateData
    
    return <ShowEvaluate 
            evaluateData={ evaluateData }
            unionId={ unionId }
            corpId={ corpId }
            code={ deptCode }
            isDoct={ false }
          />
  }
  renderAd () {
    const { adData } = this.state
    return adData && adData.length > 0 ? <div className="panel g-space">
      { adData.map(( item, key ) => {
        return <a key={ key } href={ item.redirectUrl } className="img-link-wrapper list-link-wrapper">
          <img src={ item.url } alt="" />
        </a> 
      })}
    </div> : null
  }

  
  renderHeader () {
    const { deptName, deptCode, corpId, corpName, rate, state } = this.state.deptData
    
    return <Header 
            name={ deptName }
            corpId={''+ corpId }
            corpName={ corpName }
            deptCode={ deptCode }
            logoImg={ 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/0e6fcd961c6b84b5d866c737758c1eb8-116-116.png' }
            rate={ rate }

            needLink={ false }

            needFollow={ true }
            ctx={ this }
            state={ state }
          />
  }
  renderBody () {
    return <div>
      { this.renderDeptProfile()}
      { this.renderschedule()}
      { this.renderEvaluate()}
      { this.renderAd()}
    </div>
  }
  renderFooter () {
    return <div style={{ height: 10 }}></div>
  }

  render () {
    return <div className="doctor">
      { this.renderHeader()}
      { this.renderBody()}
      { this.renderFooter()}
    </div>
  }
}
