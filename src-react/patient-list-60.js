"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent} from './BaseComponent/index'
import './patient-list-60.less'
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import { BlockLoading } from './component/loading/index'
import Alert from './component/alert/alert'
import cache from './lib/cache'
import hybridAPI from './lib/hybridAPI'
import backRefresh from './hoc/backRefresh'
import Confirm2 from './component/confirm/Confirm2'
//导入左滑删除组件
import LeftSwipe from './component/swipe/leftSwipe'

//病人列表
//@backRefresh
export default class PatientList extends SmartBlockComponent {
  constructor(props) {
    super(props);
    this.query = util.query();
    console.log('URL参数',this.query)
    let param = util.flat(this.query)
    this.corpId = this.query.corpId;
    this.unionId = this.query.unionId;
  
    this.selectView = this.query.selectView;
    this.referrer = this.query.referrer;
    this.saveKey = this.query.saveKey;//缓存的保存位置，默认会保存到 yuantu-cache
    this.patientType = this.query.patientType || 1; //1全部  2成人  3儿童
    this.countPatient = 0;
    this.lastSelectPatientId = this.query.lastSelectPatientId || '';
    this.state = {
      lastSelectPatientId: this.lastSelectPatientId
    }
  }

  componentDidMount() {
    if (!util.isLogin()) {
      util.goLogin();
    } else {
      let webViewLifeCycle = new WebViewLifeCycle();
      //通过history.back回来需要重新加载list
      webViewLifeCycle.onActivation = () => {
        console.log("onActivation");
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
    console.log(data)
    this.setState({
      success: true,
      loading: false,
      patientList: data || [],
    })
    //有就诊人列表才调用这个方法
    if(data.length > 0){
      this.leftSwipe()
   }
  }

  lastSelect(lastSelectPatientId, selectView) {
    if (selectView) {
      this.setState({
        lastSelectPatientId,
      });
      //发送请求修改默认就诊人
    }
  }

  bindCardNum(item) {
    let type ={
      '3':'医保卡',
      '4':'番禺民生卡',
      '6':'番禺医保卡'
    }
    if (item.cardCount !== 0) {
      return (
        <div className="list-brief" style={{position:'absolute',top:'0',right:'45px',fontSize:'11px',color:'#666'}}>已绑定{type[item.cardType]}</div>
      );
    }
    return (
      <div className="txt-prompt list-brief" style={{position:'absolute',top:'0',right:'45px',fontSize:'11px',color:'#429fff'}}>未绑定就诊卡</div>
    )
  }

  getPatientList(item) {

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
        //成人身份证隐私处理  后台已脱敏 
      const hideIdNo = idNo ? idNo:'';
        //儿童监护人身份证隐私处理 后台已脱敏 
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
                                : idType==2?
                          <span><i style={{marginRight:'16px'}}>监</i><i>证: </i><i>{hideGuarderIdNo}</i></span>
                          :<span><i>证件号: </i><i>{hideIdNo}</i></span>
                            
                            }
                    </div>
                    {this.bindCardNum(item)}
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
        </div>
      )
  }  

  addPatient(e) {
    let patientList = this.state.patientList || [];
    if (patientList.length >= 5) {
      e.preventDefault();
      Alert.show("最多添加5位就诊人");
    }
  }

  select(e, patientInfo) {
    if (this.selectView) {
      e.preventDefault();
      var patientId = patientInfo.id;
      var patientName = patientInfo.patientName;
      var patientIdNo = patientInfo.idNo || "";
      //处理有0开头的身份证
      if (patientIdNo.indexOf("_") > -1) {
        patientIdNo = patientIdNo.replace("_", "");
      }
      cache.set("patientId", patientId);
      cache.set("patientName", patientName);
      cache.set("needDefault", false);
      cache.set("patientIdNo", patientIdNo);
      if (util.isInYuantuApp()) {
        //如果是 远图 app 就把值通过 jsbrige返回到上一个界面
        hybridAPI.pushDataToParent(true, JSON.stringify({
          patientId: patientId,
          patientName: patientName,
          patientIdNo: patientIdNo,
          origin: "patient-list-60"
        }))
      } else {
        if (this.referrer) {
          //如果当前页面没有登录，这里 referrer 会是登录页面
          //safari浏览器back回去上一个页面不会刷新 12.19
          window.location.replace(this.referrer)
        } else {
          window.history.back(-1);
        }
      }
    }else{
      location.href=util.flatStr('./patient-info-60.html?',{
        ...patientInfo,
        unionId:this.unionId,
        corpId:this.corpId,
        target:'_blank'
      })
    }
  }

  //跳转到绑卡帮助页面
  goBindCardDetails(){
    window.location.href = './feedback-issue.html?issueId=5a5c2fc4d470e51e42c9f953&unionId=60&feedbackType=%E5%B8%B8%E8%A7%81%E9%97%AE%E9%A2%98&target=_blank&spm=100.1528.1000.4'
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
      this.setState({
        display: true,
        title: "删除就诊人后,所有医疗服务数据也一并删除,确认要删除吗？",
        des: true,
        confirmCallback: confirm=>{
          this.setState({
            display: false
          })
          if (confirm) {
            UserCenter.deletePatient(item.corpId, this.unionId, item.id)
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

  render() {
    let {cancelText, okText, confirmCallback, display, title, des} = this.state;
    let href = `add-patient-60.html?target=_blank&unionId=${this.unionId}&corpId=${this.corpId}&selectView=${this.selectView}`;
  
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
   
    const {patientList} = this.state;
    if (patientList.length > 0) {
      return (
        <div className="patient-list-60">
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
          <Confirm2 title={title} des={des} cancelText={cancelText} okText={okText} display={display}
                 callback={confirmCallback}/>
        </div>
      );
    }
    //patientList.length = 0的情况
    return (
      <div style={{overflow: 'hidden'}} className="patient-list-60">
        <div className="notice">
          <span className="notice-icon notice-no-patient"/>
          <p style={{marginBottom: '10px'}}>尚未添加就诊人</p>
          <a href={href} className="btn">添加就诊人</a>
        </div>
      </div>
    );
  }

}