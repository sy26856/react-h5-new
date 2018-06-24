"use strict";
import React from 'react'
import util from './lib/util'
import {BlockLoading} from './component/loading/index'
import UserCenter from './module/UserCenter'
import { SmartBlockComponent } from './BaseComponent/index'
import WebViewLifeCycle from './lib/WebViewLifeCycle'
import Alert from './component/alert/alert'
import cache from './lib/cache'
import hybridAPI from './lib/hybridAPI'
import './add-patientConfirm-29.less'
import Confirm from './component/confirm/Confirm2'
import PatientCard from './component/patientCard'
import { Title } from "./add-patientByCard-29";

export default class AddPatientVerify extends React.Component {
    constructor(props) {
        super(props);
        this.query = util.query();
        let birthday = this.query.birthDate;
        let d = new Date()
        d.setTime(birthday);
        let year = d.getFullYear();
        let month = d.getMonth() + 1;
        let day = d.getDate();
        birthday = year + "-" + (month < 10 ? "0" + month : month) + "-" + (day < 10 ? "0" + day : day);
        this.state = {
            step: 3,// 头部绑卡状态
            idType:this.query.guarderIdNo ? 2 :1 ,
            disabled: false,
            balance: this.query.balance,
            patientName: this.query.patientName || "",
            idNo: this.query.idNo || "",//身份证
            guarderIdNo: this.query.guarderIdNo || "",//身份证
            mobile: this.query.mobile || "",
            birthday:birthday|| "",
            sex: this.query.sex,
            cardNo: this.query.cardNo || "" , //卡号
            cardType:this.query.cardType,        
            unionId:this.query.unionId,   
            id:'',     
            patientId:this.query.patientId,
            value:this.query.value,
            valueIdNo: this.query.valueIdNo,
            valueGuarderIdNo: this.query.valueGuarderIdNo,
            valuePhone: this.query.valuePhone
        };
    }

    componentDidMount() {}

    //获取patientId
    subpatient(){
        let {idType,cardType,idNo,guarderIdNo,cardNo,patientName,mobile,birthday,sex,balance,unionId} = this.state
        cardNo=this.state.value;
        idNo = this.state.valueIdNo ? this.state.valueIdNo: '';
        guarderIdNo = this.state.valueGuarderIdNo ? this.state.valueGuarderIdNo: '';
        mobile=this.state.valuePhone;
        let data = {idType,cardType,idNo,guarderIdNo,cardNo,patientName,mobile,birthday,sex,balance,unionId}
        let _this = this;
        //根据卡信息获取就诊人patienId等信息
        UserCenter.updatePatient( "", _this.query.unionId,data)
        .subscribe({
            onSendBefore(){
                BlockLoading.show("查询中...");
            },
            onComplete(){
                BlockLoading.hide();
            },
            onSuccess(result){
              if (result.resultCode == 100) {
                _this.setState({
                    patientId:result.data
                })
                _this.bindCard(_this.state.patientId);
            }
            },
            onError(result){
                Alert.show(result.msg);

            }
        }).fetch();
    }

    //绑卡
    bindCard(patientId){
        var _this = this;
        UserCenter.addCardQD(_this.state.value,_this.state.cardType,patientId, _this.query.unionId).subscribe({
            onSuccess(result) {
                if (result.msg && result.data) {
                    Alert.show('绑卡成功!')
                    //区分是H5还是原生App
                    const isInYuantuApp = util.isInYuantuApp();
                    // , isGtVersion3140 = isInYuantuApp && util.version.gt( 3, 14, 0 )
                    // if(isInYuantuApp && isGtVersion3140){//在远图App中
                        if(isInYuantuApp){//在远图App中
                        let time = 3
                        let returnImmediately = true
                        hybridAPI.popToTimeViewController(false,time,returnImmediately)
                    }else{//在H5中
                        // const href = "./patient-list-29.html?unionId=" + _this.query.unionId + '&target=_blank&selectView='+_this.query.selectView;
                        // window.location.replace(href); 
                        window.history.go(-4)
                    }
                    
                }
            },
            onError(result) {
                Alert.show(result.msg);
            }
        }).fetch()
     }

     //确认完成,绑卡
   sub(){
        var _this = this;
        _this.subpatient();
    }

    //页面渲染
    render() {
        let disabled = this.state.disabled;
        let _idNo;
        _idNo = this.state.idType == 1 ? this.state.idNo:this.state.guarderIdNo;
        const hideIdNo =  _idNo
        let {
            valueIdNo,
            valueGuarderIdNo,
            valuePhone
        } = this.state;
        return (
            <div className="Input-card-information" id="add-patientConfirm-29">
                <Title step={this.state.step} warning="请确认以下信息，确认无误后点击确认完成" />
                <div className="bind-card-type">
                    <div className="bind-card-item bind-card-item-first">
                        <div>
                            {
                                this.state.idType == 2
                                    ? "儿童姓名"
                                    : "姓名"
                            }
                        </div>
                        <div>
                            {this.state.patientName}
                        </div>
                    </div>

                    {
                        this.state.idType ==2
                            ? (<div className="bind-card-item bind-card-item-first">
                                <div>
                                    儿童性别
                    </div>
                                <div className="id-input">
                                    {this.state.sex == 1|| this.state.sex == 0?'男':'女'}
                    </div>
                            </div>)
                            : null
                    }
                    {
                        this.state.idType ==2
                            ? (<div className="bind-card-item bind-card-item-first">
                                <div>
                                    儿童出生日期
                    </div>
                                <div className="id-input">
                                    {this.state.birthday}
                    </div>
                            </div>)
                            : null
                    }

                    <div className="bind-card-item bind-card-item-first">
                        <div>
                            {
                                this.state.idType ==2
                                    ? "监护人身份证"
                                    : "身份证"
                            }
                        </div>
                        <div className="id-input">
                            {
                                valueIdNo ? valueIdNo:valueGuarderIdNo
                            }
                </div>
                    </div>
                    <div className="bind-card-item">
                        <div>
                            手机号
                </div>
                        <div className="id-input" style={{color:'#333333'}}>
                            {this.state.valuePhone}
                </div>
                    </div>
                </div>
                <div style={styles.remmderTitle}>
                    <div style={styles.jiabushangqu}>就诊卡管理</div>
                    <div style={styles.cardInfo}>
                        <img style={styles.cardImg} src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/8ce2a141911dfc87dcfd65ec04dfb064-126-126.png" alt="" />
                        <div style={styles.reminderP}>
                            <p>{
                                this.state.cardType == 1 
                                ? "青岛区域诊疗卡"
                                : "青岛医保卡"
                            }  
                                {this.state.cardType == 1 ? <span>(尾号{this.state.value.substr(this.state.value.length - 4, this.state.value.length)})</span>:null}
                                </p>
                            <p>卡内余额 <span style={styles.red}>&yen;{this.state.balance / 100}</span> </p>
                        </div>
                    </div>
                </div>
                <div className="fixed-foot-wrapper">
                    <div className="btn-wrapper g-footer">
                        <button onClick={this.sub.bind(this)} disabled={disabled} className="btn btn-lg" id="J_SubmintBtn" >
                            确认完成
            </button>
                    </div>
                </div>
            </div>
        )
    }
}

const styles = {
    jiabushangqu: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "14px 16px",
        color: "#454545",
        borderBottom: "1px solid #eeeeee",
    },
    remmderTitle: {
        color:" #454545",
        backgroundColor: "#ffffff", 
        marginTop: "10px",
    },
    cardInfo: {
        padding: "14px 16px" ,
        display: "flex",

    },
    cardImg :{
        width: "42px",
        height: "42px",
    },
    reminderP: {
        display:"flex",
        flexDirection: "column",
        justifyContent: "space-between",
        color: "#454545",
        paddingLeft: "10px"
    },
    red: {
        color: "#ff5d61"
    }

}