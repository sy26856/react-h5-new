/*
 * @Author: Saohui 
 * @Date: 2017-07-03 11:14:39 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-28 13:57:41
 */

import React from 'react'
import {SmartBlockComponent} from './BaseComponent/index'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import Alert from './component/alert/alert'
import BindTel from './component/BindTel/BindTel'
import './sign-in.less'
import './forget-pwd.less'

export default class ForgetPwd extends SmartBlockComponent {
  constructor(props) {
    super(props)
    
    const query = util.query()
    this.unionId = query.unionId
    this.redirecturl = query.redirecturl

    this.phone = ''
    this.code = ''

    this.state = {
      ...this.state
      ,loading: false
      ,success: true
    }
  }
  componentDidMount() {
    
  }

  submit( phone, code ) {
    const { unionId } = this
    this.phone = phone
    this.code = code

    UserCenter.checkValidateCode( phone, code, unionId )
      .subscribe(this)
      .fetch()
  }
  onSuccess(result) {
    if( result.success ){
      window.location.href = ( "forget-pwd-2.html?"+ util.flat({
        phoneNumber: this.phone
        ,code: this.code
        ,unionId: this.unionId
        ,redirecturl: this.redirecturl
        ,target: '_blank'
      }) )
    } else {
      Alert.show(result.msg, 1000)
    }
  }
  onError(result) {
    Alert.show(result.msg, 1000)
  }

  render() {
    const { unionId, redirecturl } = this

    return <div className="forget-pwd sign-in">
      <div className="main-body">
        <header className='main-header txt-prompt'>
          为确认您的身份，请先验证手机号
        </header>
        <section className="main-section">
          <BindTel btnTxt='下一步，重置密码' onSubmit={( phone, code ) => this.submit( phone, code )} unionId={ unionId } />
        </section>
      </div>
    </div>
  }
}