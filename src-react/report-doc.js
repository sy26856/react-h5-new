import React from 'react'
import util from './lib/util'
import Alert from './component/alert/alert'
import './report-doc.less'
import cache from './lib/cache' 
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import UserCenter from './module/UserCenter'
import hybridAPI from './lib/hybridAPI'

export default class ReportToDoc extends SmartBlockComponent{
    constructor(props){
        super(props)
        const query= util.query()
        
        this.unionId=query.unionId;
        this.corpId=query.corpId;
        this.doctCode=query.doctCode;
        this.openId=query.openId||'';//扫码手机号关联微信需要携带的参数
        this.appId=query.appId||'';
        
        this.state = {
            success:true,
            loading:true,
            doctInfo:{},//医生信息
            code:'',//手机验证码
            phoneNum:'',//手机号码
            isShowSend:true,//显示发送按钮 为false显示倒计时
        }
    if(util.isInYuantuApp()){
        let webViewLifeCycle = new WebViewLifeCycle()
        webViewLifeCycle.onActivation = () => {
          this.init()
        }
    }
   
        this.init()

    }
    
    init(){
        //获取医生信息
        UserCenter.getDoctByCodes(this.corpId,this.doctCode)
        .subscribe({
            onSuccess:result=>{
                if(result.success){
                    this.setState({
                        doctInfo:result.data,
                        loading:util.isLogin()?true:false
                    },()=>{
                        if(util.isLogin()){
                            this.sendSubmit()
                        }else{
                            if(util.isInYuantuApp()){
                                util.goLogin()
                            }
                        }
                    })
                }
            },
            onError:result=>{
                Alert.show(result.msg)
            }
        })
        .fetch()
    }


    //手机验证码输入受控
    handleVlue(e,type){
        if(type==1){
            this.setState({
                phoneNum:e.target.value
            })
        }else{
            this.setState({
                code:e.target.value
            })
        }
    }

    //发送验证码
    sendBindingCode(){
        this.setState({
            isShowSend:false
        },()=>{
            this.getCode()
        })

    }

    getCode(){
        let {phoneNum} = this.state
        let _this = this
        UserCenter.getValidateCode(phoneNum,this.unionId)
        .subscribe({
        onSuccess:result=>{
            if(result.success){
            Alert.show('发送成功',1000)
            this.setState({
                isShowSend:false,
            },()=>{
                _this.countdown()
            })
            }
        },
        onError:result=>{
            this.setState({
            isShowSend:true
            },()=>{
            Alert.show(result.msg,1500)
            })
        }
        })
        .fetch()
  }

  //倒计时
  countdown(){
    this.countTime = 60
    let t = setInterval(()=>{
      this.countTime--
      if( this.countTime <=0 ){
        this.setState({
          isShowSend:true
        })
        clearInterval(t)
      } else {
        this.refs.ctrText.innerText= this.countTime + 's后重发'
      }
    }, 1000)
  }

  //点击下一步,注册登录
  submit(){
    let {code} = this.state
    if(!code){
      Alert.show('请输入手机验证码')
      return
    }
    if(code.length != 6){
      Alert.show('验证码长度不正确,请重新输入')
      return
    }
    this.setState({
      isShowSend:true
    },()=>{
      this.sendSubmit()
    })
  }

  
  sendSubmit(){
    let {phoneNum,code,doctInfo}=this.state
    UserCenter.reportLogin(this.corpId,this.doctCode,phoneNum,code,this.openId,this.appId)
    .subscribe({
      onSuccess:result=>{
        if(result.success){
            this.setState({
                loading:false
            })
            //注册登录成功后的逻辑是:1.设置相关cache;2.判断是否有图文问诊正在进行
                cache.set('appKey',result.data.appKey);
                cache.set('patientToken',result.data.patientToken);
                cache.set('userId',result.data.userId);
                if(result.data.existsConversation){//存在会话
                    if(util.isInYuantuApp()){
                        hybridAPI.goConsultation(doctInfo.rcDoctId,'','','','',result.data.conversationStatus,result.data.orderId,2)
                    }else{
                            location.replace(util.flatStr('./chat-details.html?',{
                            doctName:doctInfo.doctName,
                            rcDoctId:doctInfo.rcDoctId,
                            docLogo:doctInfo.doctLogo,
                            unionId:this.unionId,
                            corpId:this.corpId,  
                            //1 可继续 2 结束
                            isFinished:result.data.hasOrderOn?1:2,
                            deptCode:doctInfo.deptCode,
                            doctCode:doctInfo.doctCode,
                            target:'_blank',
                            serverType:2
            
                        }))
                    }
                }else{
                    //跳转到疾病信息填写页面
                    location.replace(util.flatStr('./fill-info.html?',{
                        target:'_blank',
                        unionId:this.unionId,
                        corpId:this.corpId,
                        corpName:doctInfo.corpName,
                        doctCode:doctInfo.doctCode,
                        rcDoctId:doctInfo.rcDoctId,
                        deptCode:doctInfo.deptCode,
                        doctName:doctInfo.doctName,
                        docLogo:doctInfo.doctLogo
                    }))

                }
            
        }
      },
      onError(result){
          Alert.show(result.msg)
      },
    })
    .fetch()
}

    render(){
        let {code,phoneNum,isShowSend,doctInfo}=this.state
        if(util.isInYuantuApp()||util.isLogin()){
            return null
        }else{
            return(
                <div className='report-doc'> 
                    <div className="panel g-space">
                        <li className="list-item">
                            <span className="icon-pic list-icon-lg" 
                            style={{ "background": `url(${doctInfo.doctLogo}) no-repeat center/cover`,width:'48px',height:'48px',borderRadius:'50%' }}
                            ></span>
                            <div className="list-content">
                                <div className="list-title">
                                    <span>{doctInfo.doctName}</span> 
                                    <span className='doctProfe'>{doctInfo.doctProfe}</span>
                                </div>
                                <div className="list-title list-con" style={{fontSize:'12px',color:'#939393',marginTop:'5px'}}>{doctInfo.corpName} / {doctInfo.deptName}</div>
                            </div>
                        </li>    
                    </div>   
                    <div className="panel g-space" style={tipsSty}>
                        <div className='report-tips'>
                            <p>您好!</p>
                            <p>门诊后向我报到,可直接在线上联系.我将解答关于疾病,用药指导,报告解读等问题</p>
                        </div>
                    </div>
                    <div className="panel g-space" style={phoneSty}>
                        <div className='phone-tips'>请输入手机号码方便沟通</div>
                        <div className="ui-form-item ui-form-item-show ui-border-b">
                            <label className='sprite-phone'></label>
                            <input type="text" 
                                    className='txt-info'
                                    style={{paddingLeft:'50px',color:'#333'}}
                                    value={phoneNum}
                                    placeholder='请输入手机号'
                                    onChange={(e)=>this.handleVlue(e,1)}
                            />
                        </div>
                        <div className="list-item item-input" style={{borderTop:'none'}}>
                            <div className="item-input-title sprite-password"></div> 	
                            <div className="item-input-content">
                            <input  type="number" 
                                    placeholder="输入验证码" 
                                    maxLength="6" 
                                    style={{paddingLeft:'25px'}}
                                    value={code}
                                    onChange={(e)=>this.handleVlue(e,2)}
                                    />
                            </div>
                            {
                            isShowSend?
                                <button className="btn  btn-secondary btn-sm" onClick={()=>this.sendBindingCode()} ref="ctrText">发送验证码</button>
                                :
                            <button className="btn  btn-secondary btn-sm" disabled style={{color:'#999'}} ref="ctrText">60s后重发</button>
                            }
                        </div>
                    </div>
                    <div className="btn-wrapper" style={{marginTop:'20px'}}>
                        <button className="btn btn-block" 
                        style={btnStyle} 
                        onClick={()=>this.submit()}>下一步</button>
                    </div>
                </div>
            )
        }
    }
}

var btnStyle ={
    height:'39px',
    width:'90%',
    margin:'0 auto',
    backgroundColor: '#0084ff',
    borderRadius: '5px',
    fontSize: '15px',
    color: '#ffffff',
}

var tipsSty={
    backgroundColor:'#fff',
    padding:'30px 10px',
    boxSizing:'borderBox'
}

var phoneSty = {
    paddingLeft:'15px',
}