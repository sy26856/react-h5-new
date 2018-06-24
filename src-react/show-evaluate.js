/*
 * @Author: saohui 
 * @Date: 2017-08-17 09:09:11 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-18 16:25:07
 */
import React from 'react'
import { SmartBlockComponent } from './BaseComponent/index'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import PullUpRefresh from './component/PullUpRefresh/PullUpRefresh'
import './show-evaluate.less'

import EvaluateItem from './component/showEvaluate/EvaluateItem'
import TagList from './component/showEvaluate/TagList'

export default class ShowEvaluate extends SmartBlockComponent {
  constructor ( props ) {
    super( props )
    
    const query = util.query()
    this.unionId = query.unionId
    this.corpId = query.corpId
    this.doctCode = query.doctCode
    this.deptCode = query.deptCode

    this.type = this.doctCode ? 'doct' : 'dept'
    this.code = this.doctCode ? this.doctCode : this.deptCode

    this.state = {
      ...this.state
      ,loading: true
      ,success: true
      ,totalTag: 0
      ,tagList: []
      ,evaluateList: []
      ,totalEvaluate: 0
    }
  }

  onNextPage ({ pageSize, currentPage, packingLoadCtx }) {
    const { corpId, unionId, code, type } = this
    
    UserCenter.getDoctOrDeptEvaluateList( type, corpId, code, currentPage, pageSize, unionId )
      .subscribe( packingLoadCtx( this ))
      .fetch()
  }
  onSendBefore () {}
  onComplete () {}
  onSuccess ( result, { onFinished }) {
    // console.log( result )
    const { tagData, evaluateData } = result.data
    const { evaluateList } = this.state
    , resultEvaluateList = evaluateList.concat( evaluateData.evaluateList )

    if ( result.success ) {
      this.setState({
        loading: false
        ,success: true
        ,totalTag: tagData.totalTag
        ,tagList: tagData.tagList
        ,evaluateList: resultEvaluateList
        ,totalEvaluate: evaluateData.totalEvaluate
      })
    }
    
    if ( evaluateData.totalEvaluate == resultEvaluateList.length ) {
      onFinished()
    }
  }

  /***** render 区开始 *****/
  
  renderHeader () {
    const { tagList, totalEvaluate } = this.state

    return <TagList showMore={ true }>
      { tagList.map(( item, key) => {
        return <div key={ key } disabled={ item.color == 2 }>{ item.name +'('+ item.tagNum +')'}</div>
      })}
    </TagList>
  }
  renderBody () {
    const { evaluateList } = this.state
    
    return <div className="show-evaluate-container">
      { evaluateList.map(( item, key ) => {
          return <EvaluateItem
                key={ key }
                data={{
                  userName: item.patientName.slice( 0, 1 ) + '**'
                  ,point: item.totalEvaluate
                  ,content: item.evaluate
                  ,date: item.updateTime
                  ,append: item.appendEvaluate
                  ,appendDate: item.appendTime
                }}
                isShowAppend={ true }
                isEvalDataLineLt2={ false }/>
        })}
    </div>
  }

  render () {
    return <PullUpRefresh className="show-evaluate"
                          initPageSize={ 20 }
                          onNextPage={( e ) => this.onNextPage( e )}
                          >
      { this.renderHeader()}
      { this.renderBody()}
    </PullUpRefresh>
  }
}