/*
 * @Author: saohui 
 * @Date: 2017-08-31 10:20:41 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-27 11:32:08
 */
import React from 'react'
import util from './lib/util'
import md5 from './lib/md5'
import RegisterToken from './module/RegisterToken'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import UserCenter from './module/UserCenter'
import './oauth-login.less'


export default class OauthLogin extends SmartBlockComponent {
  constructor ( props ) {
    super( props )

    const query = util.query()
    this.queryParams = query
    this.queryParams.unionId = query.redirectUnionId || ''
    this.queryParams.corpId = query.redirectCorpId || ''

    this.redirectCorpId = query.redirectCorpId || ''
    this.redirectUnionId = query.redirectUnionId || ''
    this.redirectUrl = query.redirectUrl || ''
    this.redirectUrlKey = query.redirectUrlKey || ''


    this.hrefParams = util.flat({
      redirectCorpId: this.redirectCorpId,
      redirectUnionId: this.redirectUnionId,
      redirectUrl: this.redirectUrl,
      redirectUrlKey: this.redirectUrlKey,
    })

    
    this.state = {
      ...this.state
    }
  }

  componentDidMount () {
    UserCenter.authorizedLogin( this.queryParams )
      .subscribe( this )
      .fetch()
  }

  onSuccess ( result ) {
    // console.log( result )
    if( result.success ) {
      if( location.href.indexOf( '.yuantutech.com') == -1 ) {
        location.replace( 'https://s.yuantutech.com/tms/h5/huiyi.php?'+ this.hrefParams )
      } else {
        location.replace( '/tms/h5/huiyi.php?'+ this.hrefParams )
      }
    }
    this.setState({
      loadign: false
      ,...result
    })
  }
  onError ( result ) {
    this.setState({
      loadign: false
      ,...result
    })
  }

  /***** render 区域开始 *****/

  renderError () {
    return <div className="oauth-login">
      <div className="notice">
        <span className="notice-icon icon-user"></span>
        <p>授权登录失败</p>
        <p>{ this.state.msg || '' }, code: { this.state.resultCode }</p>
      </div>
      <div className="btn-wrapper">
        <a href={`/tms/h5/huiyi.php?${ this.hrefParams }`} className="btn continue-btn">继续浏览页面</a>
      </div>
      <footer className="main-footer">
        <a href="//s.yuantutech.com/tms/fb/join-h5.html">查看说明文档</a>
      </footer>
    </div>
  }
  render () {
    return <div className="oauth-login">
    </div>
  }
}