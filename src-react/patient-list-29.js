"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent} from './BaseComponent/index'
import './patient-list-29.less'
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import { BlockLoading } from './component/loading/index'
import Alert from './component/alert/alert'
import cache from './lib/cache'
import hybridAPI from './lib/hybridAPI'
import backRefresh from './hoc/backRefresh'
import Confirm from './component/confirm/Confirm2'
//导入左滑删除组件
import LeftSwipe from './component/swipe/leftSwipe'

//病人列表
//@backRefresh
export default class PatientList extends SmartBlockComponent {
  constructor(props) {
    super(props);
    this.query = util.query();
    this.corpId = this.query.corpId;
    this.unionId = this.query.unionId;
    this.selectView = this.query.selectView;
    this.regMode = this.query.regMode;
    this.referrer = this.query.referrer;
    this.flag=this.query.flag||'';
    this.saveKey = this.query.saveKey;//缓存的保存位置，默认会保存到 yuantu-cache
    this.patientType = this.query.patientType || 1; //1全部  2成人  3儿童
    this.lastSelectPatientId = this.query.lastSelectPatientId || '';
    // this.clientWidth = window.screen.width||document.documentElement.clientWidth || document.body.clientWidth ||'';
    this.clientWidth = window.screen.width;
    this.state = {
      lastSelectPatientId: this.lastSelectPatientId,
    }
    if(this.selectView == 1 && this.query.isFromInfoConfirm2){
      //从预约和挂号页面进来,先缓this.query信息
      cache.set('cacheFromInfoConfirm-2',JSON.stringify(this.query))
      if (util.isInYuantuApp()) {
        //如果是 远图 app 就把值通过 jsbrige存储到原生App
           hybridAPI.pushDataToParent(false, JSON.stringify(this.query))
       }
    }
  }

  componentDidMount() {
    if (!util.isLogin()) {
      util.goLogin();
    } else {
      let webViewLifeCycle = new WebViewLifeCycle();
      //通过history.back回来需要重新加载list
      webViewLifeCycle.onActivation = () => {
        this.initData();
      }
        this.initData();
      }
    }

  initData() {
    UserCenter.getPatientList(this.corpId, this.unionId, this.patientType)
      .subscribe(this)
      .fetch()
    }

  onSuccess(result) {
    let data = result.data;
    this.setState({
      success: true,
      loading: false,
      patientList: data || [],
    })
    //有就诊人列表才调用这个方法
    if(data.length != 0){
       this.leftSwipe()
    }
   
  }
  onError(result){
    Alert.show(result.msg,1000)
  }

  bindCardNum(item) {
    if (item.cardCount !== 0) {
      return (
        <div className="list-brief" style={{position:'absolute',top:'0',right:'45px',fontSize:'11px',color:'#666'}}>已绑定{ item.cardType == 1?'诊疗卡':'医保卡' }</div>
      );
    }
    return (
      <div className="txt-prompt list-brief" style={{position:'absolute',top:'0',right:'45px',fontSize:'11px',color:'#429fff'}}>未绑定就诊卡</div>
    )
  }

  getPatientList() {
    //配置Confirm组件数据
    let {disabled,cancelText, okText, confirmCallback, display, title, des} = this.state;
    let patientList = this.state.patientList;
    let list = patientList.map((item, key) => {
        let {id, idNo, idType, patientName, guarderIdNo} = item || {};
        const listItemStyle = {
          margin: "10px 0",
          padding: "12px",
          paddingLeft:'15px',
          height: '53px',
          backgroundColor: '#fff',
          position:'relative',
          minHeight: '0px',
          boxSizing:'contentBox!important',
          transform:'transition3d(0,0,0)',
          transition:'all .3s linear'
        };
        const selectStyle = {
          borderRadius: "3px",
          position: "absolute",
          marginTop: "-9px",
          boxSizing: "border-box",
          top: "50%",
          right: "14px",
          width: "22px",
          height: "22px",
        };
        //成人身份证隐私处理
      const hideIdNo = idNo ? idNo:'';
        //儿童监护人身份证隐私处理
      const hideGuarderIdNo = guarderIdNo ? guarderIdNo:'';
        //就诊人列表项
        return (
          <li className="list-item" style={listItemStyle} key={key} id="list-item"
              >
                  <a                   
                    onClick={(e) =>{this.select(e,item)}} 
                    className={`${this.selectView ? '' : 'txt-arrowlink'} list-link-wrapper`}>
                    <div className="list-content">
                    <div className="list-title">
                      <span style={{fontSize:'15px',fontFamily:'PingFangSC-Medium'}}>{patientName}</span>
                      {idType == 2 ?  
                        <span className="patient-type-label">儿童</span>  
                        :null}
                    </div>
                    <div className="list-brief" style={{fontSize:'14px',marginTop:'10px',color:"#666"}}>{idType == 1 ? 
                            <span><i>身份证: </i><i>{hideIdNo}</i></span>
                                : 
                          <span><i style={{marginRight:'16px'}}>监</i><i>证: </i><i>{hideGuarderIdNo}</i></span>
                            
                            }
                    </div>
                    {this.flag?'':this.unionId == 29 && this.bindCardNum(item)}
                    </div>
                  {this.selectView==1 ?
                  (
                  this.state.lastSelectPatientId == id ?
                    <img
                      style={selectStyle}
                      src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/d3c38023744f8139aed65e9389dcd466-46-46.png"/>
                    : <img
                          style={selectStyle}
                          src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/391fbebc6dfaf029631cd8f0c3a04c24-46-46.png"/>
                )
                : null}
            </a>
            {/* 默认隐藏的左滑删除按钮 */}
            <div className="dele_btn" id="deleBtn" onClick={(e)=>{this.delete(e,item)}}>删除</div>
            {item.default ? <div className="default-patient-icon"></div> : null}
          </li>
        )
      }) || [];
       //外层ul
       return (
        <div id="J_PatientList">
          <ul style={{border: "none", backgroundColor: 'none',overflow:'hidden',position:'relative'}} id="touchul">
            {list}
          </ul>
          <Confirm title={title} des={des} cancelText={cancelText} okText={okText} display={display}
                 callback={confirmCallback}/>
        </div>
      )
  }  
//跳转到绑卡帮助页面
goBindCardDetails(){
  window.location.href = './feedback-issue.html?issueId=5a5c2fc4d470e51e42c9f953&unionId=29&feedbackType=%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98&target=_blank&spm=100.1528.1000.4'
}
  select(e,item) {
    e.preventDefault();//阻止a标签默认跳转
    const _this = this
    var patientId = item.id,
        patientSex=item.sex,
        patientIdType = item.idType,
        patientName = item.patientName,
        patientIdNo = patientIdType == 1?item.idNo:item.guarderIdNo,
        patientCardCount = item.cardCount,
        patientCardType = item.cardType,
        patientPhoneNum = item.phoneNum,
        unionId= _this.unionId;
    const param= util.flat({
      id:patientId,
      idType:patientIdType,
      cardType:patientCardType,
      patientName,
      unionId,
      idNo:patientIdType == 1?item.idNo:'',
      guarderIdNo:patientIdType == 2?item.guarderIdNo:'',
      phoneNum:patientPhoneNum,
      target:'_blank',
      corpId:_this.corpId,
      sex:item.sex,
      birthday:item.birthday
    })
        //处理有0开头的身份证
    if (patientIdNo.indexOf("_") > -1) {
          patientIdNo = patientIdNo.replace("_", "");
        }
    if ( _this.selectView == 1 ) {
      _this.setState({
        lastSelectPatientId:patientId,
      })
      if( patientCardCount !== 0 ||this.flag ){//选中已绑卡的就诊人
        cache.set("needDefault", 'false');
        cache.set("patientSex", patientSex)
        cache.set('patientId',patientId)//默认就诊人id
        cache.set('patientIdType',patientIdType)//默认就诊人类型 1为成人  2为儿童
        cache.set('patientName',patientName)//默认就诊人名字
        cache.set('patientIdNo',patientIdNo)//默认就诊人身份证号码 儿童的话就是监护人身份证号码
        cache.set('patientCardCount',patientCardCount)//默认就诊人是否邦卡 0为绑卡 1绑卡
          if (util.isInYuantuApp()) {
           //如果是 远图 app 就把值通过 jsbrige返回到上一个界面
              hybridAPI.pushDataToParent(true, JSON.stringify({
              patientId: patientId,
              patientName: patientName,
              patientIdNo: patientIdNo,
              patientIdType:patientIdType,
              patientCardCount:patientCardCount,
              patientSex: patientSex,
              needDefault:'false',
              origin: "patient-list-29"
            }))
          } else {//非App环境,H5环境
            if (_this.referrer) {
              //如果当前页面没有登录，这里 referrer 会是登录页面
              //safari浏览器back回去上一个页面不会刷新 12.19
                  window.location.replace(_this.referrer)
             
            } else {
              const _referrer =  JSON.parse(cache.get('cacheFromInfoConfirm-2')).referrer
                 window.location.replace(_referrer)
            }
          }
        }
        else{//选中的就诊人没有绑卡,判断是否建档
          UserCenter.getCardUserCards(patientIdNo, patientName,patientIdType).subscribe({
            onSendBefore() {
              BlockLoading.show("请稍后...");
            },
            onComplete() {
              BlockLoading.hide();
            },
            onSuccess(result) {
              if (result.data.length > 0) {//建档,但未绑卡,跳转到绑卡页面
                window.location.href = "./add-patientByIdBindCard-29.html?" + param +'&selectView=' + _this.selectView + '&regMode=' + _this.regMode;
              }
            },
            onError(result) {//没有在医院建立档案,可预约,但不可挂号
              if(result.resultCode == 1000){
                if(_this.regMode == 1){
                  //预约选择就诊人
                  // Alert.show('该就诊人未在医院建立档案,可预约不能挂号！')
                  cache.set("needDefault", 'false');
                  cache.set('patientId',patientId)
                  cache.set('patientIdType',patientIdType)
                  cache.set('patientName',patientName)
                  cache.set('patientIdNo',patientIdNo)
                  cache.set('patientSex', patientSex)
                  cache.set('notRecord',true)
                  if (util.isInYuantuApp()) {
                    //如果是 远图 app 就把值通过 jsbrige返回到上一个界面
                       hybridAPI.pushDataToParent(true, JSON.stringify({
                       patientId: patientId,
                       patientName: patientName,
                       patientIdNo: patientIdNo,
                       patientIdType:patientIdType,
                       patientCardCount:patientCardCount,
                         patientSex: patientSex,
                       needDefault:'false',
                       notRecord:true,
                       origin: "patient-list-29"
                     }))
                   } else {
                     if (_this.referrer) {
                       //如果当前页面没有登录，这里 referrer 会是登录页面
                       //safari浏览器back回去上一个页面不会刷新 12.19
                          window.location.replace(_this.referrer)
                     } else {
                        let _referrer =  JSON.parse(cache.get('cacheFromInfoConfirm-2')).referrer
                        window.location.replace(_referrer)
                     }
                   }
                }else if(_this.regMode == 2){
                  //挂号选择就诊人
                  Alert.show('未建档,不能挂号,请重新选择!',1000)
                  return;
                }   
              }
            }
          }).fetch()
        }
      }
        else{//不是从预约和挂号进入
          if( patientCardCount > 0){
            window.location.href =  "patient-one-info-29.html?" + param;
            
          }else{
            //判断有无建档
            UserCenter.getCardUserCards(patientIdNo, patientName,patientIdType).subscribe({
              onSuccess(result) {
                if (result.data.length > 0) {//建档,但未绑卡,跳转到绑卡页面
                  window.location.href = "./add-patientByIdBindCard-29.html?" + param
                }
              },
              onError(result) {//没有在医院建立档案,跳到信息展示页面
                if(result.resultCode == 1000){
                  window.location.href =  "patient-one-info-29.html?" + param + '&notCard='+ true;
                }
              }
            }).fetch()
          }
      }
  }

//就诊人列表左滑
leftSwipe(){
  let deleBtn = document.querySelector('#deleBtn');
  let touchlis = document.querySelectorAll('#touchul li');
    if(this.query.selectView != 1){
      LeftSwipe.left_Swipe(touchlis,deleBtn)
        }
    }

    
//左滑点击删除,删除当前就诊人
delete(e,item){
    var self = this;
    this.setState({
      display: true,
      title: "删除就诊人后,所有医疗服务数据也一并删除,确认要删除吗？",
      des: true,
      confirmCallback: function (confirm) {
        self.setState({
          display: false
        })
        if (confirm) {
          UserCenter.deletePatient(item.corpId, item.unionId, item.id)
            .subscribe({
              onSuccess(result){
                if (result.success) {
                  Alert.show("删除成功",1000);
                  window.location.reload()
                }
              },
              onError(result){
                Alert.show(result.msg,1000);
              }
            })
            .fetch()
        }
      }
    })
}

  /**
   * 渲染区域
   **/
  render() {
    let {cancelText, okText, confirmCallback, display, title, des} = this.state;
    let href = "add-patient-29.html?target=_blank";
    let tipsText;
    if( this.selectView == 1 ){
      tipsText = '如有就诊卡请务必绑定,否则无法取号'
    }else{
      if( this.clientWidth > 360 ){
      tipsText = '绑卡时若未查询到就诊卡,请删除就诊人后重新添加'
      }else{
        tipsText = '绑卡时若未查询到就诊卡,请删除就诊...'
      }
    }
    href = this.unionId ? (href + "&unionId=" + this.unionId) : href;
    href = this.corpId ? (href + "&corpId=" + this.corpId) : href;
    href = this.regMode ? (href + "&corpId=" + this.regMode) : href;
    href = this.selectView ? (href + "&selectView=" + this.selectView) : href;
    const {patientList} = this.state;
    if (patientList.length > 0) {
      return (
        <div className="patient-list-29">
          <div className="sections-message" onClick={this.goBindCardDetails} ref="tips">
            <span className="sections-message-icon"></span>
            <span>
              {tipsText}
            </span>
            <span className="sections-message-to"></span>
          </div>
          <div className="page-patient-list">
            <div className="ui-tips center" style={{fontSize: '14px',fontFamily: 'PingFangSC-Regular',margin: '10px 0'}}>
            {/* 头部提示 */}
              最多添加 5 位就诊人
            </div>
              {this.getPatientList()}
            </div>
          {
            patientList.length < 5 ? <div className="btn-wrapper">
             <a href={href} className="addPatientLink">
                  <span className="addPatientLink-text">添加就诊人</span>
                </a>
              </div> : null
          } 
          <Confirm title={title} des={des} cancelText={cancelText} okText={okText} display={display}
                 callback={confirmCallback}/>
        </div>
      );
    }
    //patientList.length = 0的情况
    return (
      <div style={{overflow: 'hidden'}} className="patient-list-29">
        <div className="notice">
          <span className="notice-icon notice-no-patient"/>
          <p style={{marginBottom: '10px'}}>尚未添加就诊人</p>
          <a href={href} className="btn">添加就诊人</a>
        </div>
      </div>
    );
  }

}