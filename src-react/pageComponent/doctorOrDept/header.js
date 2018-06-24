/*
 * @Author: saohui 
 * @Date: 2017-09-19 09:04:19 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2018-05-29 15:31:52
 */
import React, { Component, PropTypes } from 'react'
import util from '../../lib/util'
import md5 from '../../lib/md5'
import Cover from '../../component/cover/Cover'
import '../../doctor.less'

import UserCenter from '../../module/UserCenter'
import Alert from '../../component/alert/alert'

export default class Header extends Component {

  static propTypes = {
    name: PropTypes.string
    ,profile: PropTypes.string
    ,deptCode: PropTypes.string
    ,corpName: PropTypes.string
    ,spec: PropTypes.string
    ,logoImg: PropTypes.string
    ,rate: PropTypes.number
    ,doctCode: PropTypes.string
    ,corpId: PropTypes.string
    ,unionId: PropTypes.string

    ,needLink: PropTypes.bool

    ,needFollow: PropTypes.bool
    ,ctx: PropTypes.object
    ,state: PropTypes.number
  }
  onSendBefore ( url, param ) {
    return
    const { ctx, state } = this.props
    const msg = state == 1 ? '取消关注中...' : '关注中...'
    ctx.onSendBefore( url, param, msg )
  }
  onComplete ( ...params ) {
    const { ctx } = this.props
    ctx.onComplete( ...params )
  }
  onError ( ...params ) {
    const { ctx } = this.props
    ctx.onError( ...params )
  }

  renderStar ( val ) {
    if ( !val ) {
      return <div className="star-wrapper">
        <span className="star-text">暂无评分</span>
      </div>
    }
    
    const isHalfVal = val%1 > 0 && val%1 <= .5
    , lightVal = ~~val + ( val % 1 == 0 || isHalfVal ? 0 : 1 )
    , halfVal = isHalfVal ? 1 : 0

    const stars = [1,2,3,4,5]
    // <span className="star-item star-light"></span> => 一颗星
    // <span className="star-item star-half-light"></span> => 半颗星
    // <span className="star-item"></span> => 不亮星
    return <div className="star-wrapper">
      {
        stars.map(( item, key ) => {
          const starClassName = item <= lightVal ? 'star-light' 
                                              : (( item == halfVal + lightVal ) ? 'star-half-light' : '')
          return <span key={ key } className={'star-item '+ starClassName }></span>
        })
      }
      <span className="star-text">{ val }</span>
    </div>
  }
  render () {
    const { name, profile, deptCode, corpName, spec, logoImg, rate, doctCode, corpId, unionId, state,   needLink,  needFollow, ctx } = this.props
    
    return <Cover isShare={ true }
          shareData={{
            title: name +': '+ ( corpName || '') + ( profile || '')
            ,text: spec
            ,url: location.href
            ,imageUrl: logoImg || 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/ec3eacb6fa6bfae5e95973ee3c712818-144-144.png'
          }}
          logoImg={ logoImg || 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/ec3eacb6fa6bfae5e95973ee3c712818-144-144.png' }
          >
      <div className="cover-title"><span dangerouslySetInnerHTML={{ __html: name }}></span>{ needFollow ? 
                      <button 
                        onClick={( e ) => {
                          e.stopPropagation()
                          const _state = state == 1 ? 0 : 1
                          , msg = _state == 1 ? '关注' : '取消关注' 
                          if ( !util.isLogin()) {
                            util.goLogin()
                            return false
                          }
                          let token = util.crateToken()
                          UserCenter.alterFollowState( deptCode, doctCode, _state, corpId, unionId,token)
                            .subscribe({
                              onSuccess: result => {
                                if ( result.data !== true ) {
                                  Alert.show( msg +'失败', 2500 )
                                  return
                                }
                                
                                Alert.show( msg +'成功', 2500 )
                                if ( doctCode ) {
                                  const doctorData = ctx.state.doctorData
                                  doctorData.state = _state
                                } else {
                                  const deptData = ctx.state.deptData
                                  deptData.state = _state
                                }
                                ctx.setState({
                                  loading:false
                                })
                              }
                            })
                            .fetch()
                          return false
                        }} className={'btn'+ (state == 1 ? '' : '-not') +'-follow'}>{( state == 1 ? '已' : '')}关注</button> 
                    : null }</div>
      <div className="cover-brief " dangerouslySetInnerHTML={{ __html: profile }}></div>
      <div className="cover-brief " dangerouslySetInnerHTML={{ __html: corpName }}></div>

      { this.renderStar( rate )}

      { needLink ? <a className="cover-link"
        href={'./doctor-profile.html?'+ util.flat({
          corpId
          ,doctCode
          ,unionId
          ,corpName
          ,name
          ,deptCode
          ,target: '_blank'
        })}>
        医生简介
      </a> : null }
    </Cover>
  }
}