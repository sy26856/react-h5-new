"use strict";

import React from 'react'
import util from './lib/util'
import UserCenter from './module/UserCenter'
import {SmartBlockComponent} from './BaseComponent/index'
import Alert from './component/alert/alert'
import './patient-info-60.less'
import Confirm from './component/confirm/Confirm2'
import PatientCard60 from './component/patientCard/index60'
 
export default class AddPatient extends SmartBlockComponent {
  constructor(props) {
    super(props);
    this.query = util.query()
    this.corpId = this.query.corpId;
    this.unionId = this.query.unionId;
    this.id = this.query.id;
    let date = new Date(); //初始化出生日期为今天
    this.state = {
      show:false,
      cardInfoReady:false,
      idType:this.query.idType,
      cardType:this.query.cardType,
      year:date.getFullYear(),
      month:date.getMonth() + 1,
      day:date.getDate(),
      cardReady:false,
      balance:'',//就诊人列表不查余额,所以置空
      disabled:false,
      showId:this.id ? false : true,
      idNo:this.query.idNo,
      guarderIdNo:this.query.guarderIdNo,
      phoneNum:this.query.phoneNum,
      cardNo:this.query.cardNo||'',
      hasDetail:true,
      cardId:''//就诊卡id
    }
  }

  componentDidMount() {
    if (!util.isLogin()) {
      util.goLogin();
    } else if (this.id) {
      this.initData();
      this.setState({
        readOnly: true
      });
    } else {
      this.setState({
        success: true,
        loading: false,
        readOnly: false
      });
    }
  }

  initData() {
    var self = this;
    UserCenter.getBaseInfo(this.corpId, this.unionId, this.id)
      .subscribe(this)
      .fetch()
    let category = self.state.cardType
    if(!self.query.notCard){//区分未建档就诊人和已绑卡就诊人
      UserCenter.getNoBalanceList(this.id, true, category, this.corpId,this.unionId).subscribe({
      onComplete() {
        self.setState({
          cardReady: true
        });
      },
      onSuccess(result){
        self.setState({
          cardInfoReady: true,
          balance:result.data[0].balance,
          cardNo:result.data[0].cardNo,
          cardType:result.data[0].cardType,
          hasDetail:result.data[0].hasDetail,
          cardId:result.data[0].id
        })
      },
      onError(result){
        self.setState({
          cardInfoReady: true
        })
      }
    }).fetch();
    }
  }

  onSuccess(result) {
    let data = result.data || {};
    let year, month, day, birthday;
    if (data.birthday) {
      let date = new Date(data.birthday);
      year = date.getFullYear();
      month = date.getMonth() + 1;
      day = date.getDate();
      birthday = util.dateFormat(date, "yyyy-MM-dd");//格式化生日
    }
    this.setState({
      success: true,
      loading: false,
      birthday: birthday,
      idNo: data.idNo,
      guarderIdNo: data.guarderIdNo,
      id: data.id,
      phoneNum:data.phoneNum,
      idType: data.idType,
      patientName: data.patientName,
      phoneNum: data.phoneNum,
      sex: data.sex,
      isDefault: data.default,
      year,
      month,
      day
    })
  }

  setTips() {
    let {idType} = this.state;
      if (idType == 2) {
        //儿童
        return (
          <div className="panel-msg patient-notice-msg" style={{borderTop:'none',paddingTop:'0',color:'rgb(153,153,153)'}}>
            <p>就诊卡绑定后，除手机号码外就诊人信息不能更改</p>
          </div>
        )
      } else {
        //成人
        return (
          <div className="panel-msg patient-notice-msg" style={{'color':"#999",borderTop:'none',paddingTop:'0'}}>
            <p>1.就诊卡绑定后，除手机号码外就诊人信息不能修改。</p>
          </div>
        )
      }
  }

  getBirthday() {
    let {year, month, day,readOnly} = this.state;
    return (
      <div className="ui-form-item ui-form-item-show ui-border-b" id="J_Date">
        <label >出生日期</label>
        <input type="text" defaultValue={year+"-"+month+"-"+day}  className={readOnly ? "txt-info" : null} />
      </div>
    )
  }

  handleChangeDefault(){
    var self = this;
    let { guarderIdNo, id, idNo, idType, patientName, phoneNum, sex, isDefault,birthday } = this.state;
    let data = {
      guarderIdNo, id, idNo, idType, patientName, phoneNum, sex, isDefault: !isDefault,birthday
    }
    this.setState({
      display: true,
      title: !isDefault ? "是否将此人设为默认就诊人？" : "是否取消默认就诊人",
      des: true,
      confirmCallback: function (confirm) {
        if (confirm) {
          self.setState({
            display: false,
            isDefault:!isDefault
          })
          if (self.id) {
            UserCenter.updatePatient(self.corpId, self.unionId, data)
              .subscribe({
                onSuccess(result){
                  Alert.show("修改成功",1000);
                },
                onError(){   
                  Alert.show("修改失败",1000);
                }
              }).fetch()
          }
        } else {
          self.setState({
            display: false,
            isDefault: isDefault
          })
        }
      }
    })
  }

  //删除就诊人
  deletePatient() {
    var self = this;
    this.setState({
      display: true,
      title: "删除就诊人后，所有医疗服务数据也一并删除，确认要删除吗？",
      des: true,
      confirmCallback: function (confirm) {
        self.setState({
          display: false
        })
        if (confirm) {
          UserCenter.deletePatient(self.corpId, self.unionId, self.id)
            .subscribe({
              onSuccess(result){
                if (result.success) {
                  Alert.show("删除成功",1000);
                  util.goBack(true);
                }
              },
              onError(result){
                Alert.show(result.msg || "网络请求出错",1000);
              }
            })
            .fetch()
        }
      }
    })
  }

  //更新就诊人信息
  submit(){
    let {guarderIdNo, id, idNo, idType,patientName, phoneNum, sex, isDefault, birthday, cardType} = this.state;
    patientName = patientName ? patientName.trim() : '';
    let data = {
      guarderIdNo, id, idNo, idType, patientName, phoneNum, sex, isDefault, birthday
    }
    
    data.idNo = data.idNo ? data.idNo.toUpperCase() : "";
    data.guarderIdNo = data.guarderIdNo ? data.guarderIdNo.toUpperCase() : "";
    let self = this;

    if ( idType == 1 ) {
      delete data.guarderIdNo
    } else {
      delete data.idNo
    }
    if (!phoneNum || phoneNum.length!=11) {
      Alert.show("请正确填写手机号码",1000);
      return false;
    }
    UserCenter.updatePatient(this.corpId, this.unionId, data)
      .subscribe({
        onSendBefore() {
          self.setState({
            disabled: true,
          });
        },
        onSuccess(result){
          if (result.success && result.data) {
            if (self.id) {
              util.goBack(true);
            }
          }
        },
        onError(result){
          self.setState({
            disabled: false,
          });
          if (result.msg) {
            Alert.show(result.msg);
          } else {
            Alert.show("网络错误",1000);
          }
        }
      })
      .fetch()
  }

  changePhone(e){
    let phoneNum = e.target.value;
    this.setState({
      phoneNum:phoneNum
    })
  }

  render() {
    let {readOnly, birthday, cardNo,showId, hasDetail,cardId,cardInfo,balance, disabled, cardInfoReady,cardType,cancelText, okText, confirmCallback, display, title, des, guarderIdNo, id, idNo, idType, patientName, phoneNum, sex, isDefault, year, month, day} = this.state;
    const hideIdNo = idNo?idNo:'';
    const hideGuarderIdNo = guarderIdNo?guarderIdNo:'';
    {idType == 2 ? document.title = '儿童就诊人':document.title = '就诊人'}
    return (
      <div className="page-add-patient" id="patient-info-60">
        <div className="ui-form">
          <div className="ui-form-item ui-form-item-show  ui-border-b">
            <label > {idType == 2?'儿童姓名':'姓名'}</label>
            <input type="text" 
                   id="patientName" 
                   maxLength="20" 
                  defaultValue={patientName} 
                   className={readOnly ? "txt-info" : null} 
                   ref="patientName" />
          </div>
          {idType == 2 ?
            <div className="ui-form-item ui-form-item-show ui-border-b" id="sex">
              <label>儿童性别</label>
 
              <input type="text" id="J_Sex" defaultValue={sex == 1 || sex == 0
                    ? "男"
                    : "女"
                  } ref="sex"  className={readOnly ? "txt-info" : null}/>
            </div> : null
          }
          {idType == 2 ?
            this.getBirthday() : null
          }

          {idType == 1 ?
            <div className="ui-form-item ui-form-item-show ui-border-b" id="J_idNo">
              <label >身份证</label>
              <input type="text" 
                    defaultValue ={hideIdNo}
                     ref="idNo" 
                     className={readOnly ? "txt-info" : null}  
                     id="idNo" 
                     maxLength="25"
                     />
            </div> : null}
          {idType == 2 ?
            <div className="ui-form-item ui-form-item-show ui-border-b" id="J_GuarderIdNoInput">
              <label >监护人身份证</label>
              <input type="text" 
                     id="guarderIdNo" 
                     className={readOnly ? "txt-info" : null}
                     maxLength="25" 
                    defaultValue={hideGuarderIdNo}
                     ref="guarderIdNo"/>
            </div> : null
          }
          <div className="ui-form-item ui-form-item-show ui-border-b">
            <label >手机号码</label>
            <input 
                   type="text" 
                   defaultValue={phoneNum} 
                   onChange={this.changePhone.bind(this)} 
                   id="J_Phone" 
                   ref="phoneNum"/>
          </div>
          <div className="ui-form-item ui-form-item-switch ui-border-b">
            <p className="checkbox-name">
              设为默认就诊人
            </p>
            <label className="ui-switch">
              <input type="checkbox" checked={isDefault} onChange={this.handleChangeDefault.bind(this)}
                     ref="isDefault" id="J_Default"/>
            </label>
          </div>
        </div>
        <PatientCard60    
                          cardCount={this.query.cardCount}
                          cardType={cardType} 
                          guarderIdNo={guarderIdNo}
                          patientId={id}
                          balance={balance}
                          idType={idType}
                          unionId={this.unionId} 
                          corpId={this.corpId} 
                          hasDetail={hasDetail}
                          patientName={patientName} 
                          phoneNum={phoneNum}
                          cardNo={cardNo}
                          cardId={cardId}
                          idNo={idNo}/>
        <div className="panel g-space notice-top" id="J_BindCardTip">
          <div className="panel-title" style={{'color':'#333'}}>温馨提示</div>
          {this.setTips()}
        </div>
          <div className="fixed-foot-wrapper">
            <div className="btn-wrapper g-footer">
              <button className="delete" onClick={this.deletePatient.bind(this)}>删除</button>
              <button style={{backgroundColor:'#429fff',width:'50%',borderRadius:'0',height:'100%',padding:'none'}} className="btn btn-lg" id="J_SubmintBtn" onClick={this.submit.bind(this)}>
                保存
              </button>
            </div>
          </div> 
        <Confirm title={title} des={des} cancelText={cancelText} okText={okText} display={display}
                 callback={confirmCallback}/>
      </div>
    )
  }

}
