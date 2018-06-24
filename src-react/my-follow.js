/*
 * @Author: saohui 
 * @Date: 2017-08-21 09:27:36 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-10-11 13:38:22
 */
import React from 'react'
import { GiBlockComponent } from './BaseComponent'
import util from './lib/util'
import PullUpRefresh from './component/PullUpRefresh/PullUpRefresh'
import { FollowList, RegisteredDoct } from './pageComponent/myFollow/followList'
import ListNull from './pageComponent/myFollow/listNull'

import { connect } from 'gi-mini-dvajs'
import './my-follow.less'


class MyFollow extends GiBlockComponent {
  constructor(props){
    super(props);
    const query = util.query()
    this.unionId=query.unionId
  }
  
  renderFollowList () {
    const { followList } = this.props.myFollow
    
    return <FollowList list={ followList } unionId={this.unionId}/>
  }
  renderRegisteredDoct () {
    const { dispatch } = this.props
    const { registeredDoctList } = this.props.myFollow

    return <div >
      <div className='registered-doct-title'>关注以下曾挂号医生，就诊更便捷</div>
      <RegisteredDoct list={ registeredDoctList } dispatch={ dispatch } />
    </div>
  }

  renderListNull () {
    const { unionId } = this.props.myFollow

    return <div>
      <ListNull unionId={ unionId } />
    </div>
  }

  renderBody () {
    const { dispatch } = this.props
    const { followList, unionId, showRegisteredDoct, successCode } = this.props.myFollow

    return <PullUpRefresh onNextPage={async ({ packingLoadCtx }) => {
      const ctx = packingLoadCtx({
        onSuccess ( result, { onFinished }) {
          result.data.isFinished && onFinished()
        }
      })
      await dispatch({ type: 'myFollow/getMyFollowList', onSuccess: ctx.onSuccess, unionId })
    }} className='my-follow' finishedHtml={ successCode == 2 ? <div /> : null }>
      { this.renderFollowList()}
      { successCode == 2 ? this.renderRegisteredDoct() : null }
    </PullUpRefresh>
  }
  
  render () {
    const { successCode } = this.props.myFollow
    
    let ret = null
    switch ( successCode ) {
      case 1: 
      case 2:
        ret = this.renderBody()
      break;
      case 3:
        ret = this.renderListNull()
    }
    return ret
  }
}



function mapStateToProps ({ myFollow }) {
  const { success, errorMsg, loading } = myFollow
  return { 
    myFollow
    ,success
    ,loading
    ,errorMsg
    ,loading
  }
}

export default connect( mapStateToProps )( MyFollow )