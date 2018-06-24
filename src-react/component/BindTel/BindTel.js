/*
 * @Author: saohui 
 * @Date: 2017-09-06 10:31:47 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-09-21 10:26:32
 */


import React, { Component, PropTypes } from 'react'
import { SmartBlockComponent } from '../../BaseComponent/index'
import util from '../../lib/util'
import Alert from '../alert/alert'
import Input from '../signForm/input'
import SendCodeModule from '../../module/SendCodeModule'

/**
 * 
 * @export props = {
     btnTxt: 绑定手机 => 按钮文字
     ,onSubmit: 提交时候的函数，回调会得到两个参数 
          @export phone 手机号
          @export code 验证码
     ,isCheckTel: 是否验证手机（是否已经注册） 默认是 true
   }
 * @class BindTel
 * @extends {Component}
 */
export default class BindTel extends Component {
  static propTypes = {
    btnTxt: PropTypes.string
    ,onSubmit: PropTypes.func
    ,isCheckTel: PropTypes.bool
    ,unionId: PropTypes.string
  }
  static defaultProps = {
    btnTxt: ''
    ,onSubmit: function () {}
    ,isCheckTel: true
    ,unionId: '29'
  }

  constructor(props) {
    super(props)
    
    const query = util.query()
    
    this.ctrCode = new SendCodeModule( props.unionId, this, props.isCheckTel )

    this.phone = ''
    this.code = ''

    this.state = {
      ...this.state
      ,loading: false
      ,success: true
      ,btnCodeText: this.ctrCode.ctrText
      ,maySubmit: false
    }
  }

  submit () {
    const { onSubmit } = this.props

    const {phone, code, unionId} = this

    const _phone = phone.replace( /\s/g, '') // 把手机号的空格去掉
    , _code = code.replace( /\s/g, '')

    if( !/^\d{11}$/.test( _phone) ){
      Alert.show('请输入11位手机号', 1000)
      return ;
    }
    if( !(_code && _code.length == 6) ){
      Alert.show('请输入正确的验证码', 1000)
      return ;
    }

    onSubmit && onSubmit( _phone, _code )
  }

  sendCode(e) {
    const {ctrCode, phone} = this
    ctrCode.handleClick(e, phone)
    // console.log(this.ctrCode)
  }

  judgeMaySubmit () {
    if( this.phone != '' && this.code != '' ) {
      this.setState({
        maySubmit: true
      })
    } else {
      this.setState({
        maySubmit: false
      })
    }
  }
  render() {
    const { btnTxt } = this.props
    const { btnCodeText, maySubmit } = this.state

    return <div>
      <Input onChange={ (e)=>{ this.phone = e.target.value; this.judgeMaySubmit(e) } } type="tel" defaultValue={''} placeholder="请输入您的手机号" bgUrl="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/00cc30bb1695595ae90a528990bf9b9b-54-72.png" maxLength={ 13 }></Input>
      <Input showBtn={true} btnChecked={ this.phone != ''} btnDisable={ this.ctrCode.loading } btnVal={btnCodeText} btnClick={ (e)=>{ this.sendCode(e) } } onChange={ (e)=>{ this.code = e.target.value; this.judgeMaySubmit(e) } } type="tel" placeholder="请输入6位验证码" bgUrl="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/81491471c25faa85c0558c1aad0d1bd8-63-72.png"></Input>
      <div className="btn-wrapper">
        <button onClick={(e)=>{ maySubmit && this.submit(e)}} className={"btn btn-block submit-btn" + ( maySubmit ? '' : ' btn-disabled') }>{ btnTxt || '绑定手机'}</button>
      </div>
    </div>
  }
}