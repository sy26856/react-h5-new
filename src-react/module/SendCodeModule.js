/*
 * @Author: saohui 
 * @Date: 2017-09-05 09:45:05 
 * @Last Modified by: mikey.zhaopeng
 * @Last Modified time: 2017-12-28 15:08:03
 */
import Alert from '../component/alert/alert'
import UserCenter from './UserCenter'

export default class SendCodeModule {
  constructor (unionId, pageThis, isCheckTel = true) {
    this.isCheckTel = isCheckTel

    this.loading = false

    this._ctrText = '发送验证码'
    Object.defineProperty(this, 'ctrText', {
      get() {
        return this._ctrText
      }
      ,set(val) {
        this._ctrText = val
        pageThis.setState({
          btnCodeText: val
        })
      }
      ,enumerable: true
    })

    this.countTime = 0
    this.unionId = unionId

    this.handleClick.bind(this)
  }

  handleClick(e, phoneNum) {
    if( this.loading ){
      return ;
    }
    this.loading = true
    phoneNum = phoneNum.replace( /\s/g, '') // 把手机号的空格去掉

    if(/^\d{11}$/.test( phoneNum )){
      if ( this.isCheckTel ) {
        //验证是否已经注册
        this.checkIsReg( phoneNum, ( isReg )=>{
          if( isReg ) {
            this.sendCode( phoneNum )
          } else {
            this.loading = false
            Alert.show( '该手机未注册，可注册新用户' )
          }
        })
      } else { 
        this.sendCode( phoneNum )
      }
    } else {
      this.loading = false
      Alert.show("请输入11位手机号", 1000)
    }
  }

  checkIsReg(phoneNum, callBack) {
    const self = this
    , checkThis = {
      onSuccess(result) {
        // console.log( result )
        callBack( result.data || false )
      }
      ,onError() {
        callBack( false )
      }
    }
    Alert.show( '正在验证手机...', 1000 ) 
    UserCenter.checkIsReg(phoneNum, this.unionId)
      .subscribe(checkThis)
      .fetch()
  }

  sendCode(phoneNum) {
    Alert.show( '正在发送验证码...', 2000 )
    UserCenter.getValidateCode(phoneNum, this.unionId)
      .subscribe(this)
      .fetch()
  }
  countdown() {
    let self = this
    this.countTime = 60
    let t = setInterval(function(){
      self.countTime--
      if( self.countTime <=0 ){
        self.loading = false
        self.ctrText = '重新发送'
        clearInterval(t)
      } else {
        self.ctrText = self.countTime + 's后重发'
      }
    }, 1000)
  }

  onSuccess(result) {
    console.log('sendCode success')
    Alert.show( '验证码发送成功', 2000 )
    this.countdown()
  }
  onError(result) {
    this.loading = false
    if( result.resultCode == 412 ) {
      this.loading = true
      this.countdown()
    }
    Alert.show(result.msg, 1000)
  }
}