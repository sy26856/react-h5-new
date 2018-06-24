/*
 * @Author: Saohui 
 * @Date: 2017-06-19 11:12:26 
 * @Last Modified by: saohui
 * @Last Modified time: 2017-08-21 16:00:48
 */
import util from '../lib/util'
import UserCenter from './UserCenter'


class RegisterToken {
  constructor(){
  }

  run(){
    if( !util.isLogin() ){
      this.onComplate({
        success: false
        ,msg: 'No login'
      })
      return ;
    }

    const query = util.query()
    this.corpId = query.corpId

    // app 版本大于2.1.6 才有次功能
    if( !util.version.gt(2,5,0) ){
      this.onComplate({
        success: false
        ,msg: 'versioin low'
      })
      return ;
    }
    console.log('start register device token')
    util.getDeviceToke((result)=>{
      if( result.data ){
        this.register(result.data)
      } else {
        this.onComplate({
        success: false
        ,msg: 'no deviceToke'
      })
      }
    }, ()=>{
      this.onComplate({
        success: false
        ,msg: 'getDeviceToke error'
      })
    })
  }

  register( deviceToken ){
    const platformType = util.getPlatform()
    , {corpId} = this
    UserCenter.setRegisterToken( 
      deviceToken
      , platformType
      , corpId
    )
      .subscribe(this)
      .fetch()
  }
  clear(){
    UserCenter.clearRegisterToken()
      .subscribe(this)
      .fetch()
  }

  onSuccess(result){
    this.onComplate(result)
  }
  onError(result){
    if( result && result.success != undefined ){
      this.onComplate( result )
    }else{
      this.onComplate( {
        success:false
        ,msg:"网路错误，请稍后再试"
      } )
    }
  }

  // 防止为定义
  onComplate(){}
}

export default new RegisterToken()