import React from 'react';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import { SmartBlockComponent } from './BaseComponent/index'
import PayDialog from './component/pay/PayDialog'
import './patient-order.less';
import BlockLoading from './component/loading/BlockLoading';
import Alert from './component/alert/alert';
import hybridAPI from './lib/hybridAPI'
import backRefresh from './hoc/backRefresh'

export default class PatientOrder extends SmartBlockComponent {
    constructor(props) {
        super(props);
        let date = new Date();
        let tom = new Date(date.setDate(date.getDate()))
        let today = tom.getFullYear() + '-' + ((tom.getMonth() + 1) > 10 ? (tom.getMonth() + 1) : '0' + (tom.getMonth() + 1)) + '-' + (tom.getDate() > 10 ? tom.getDate() : '0' + tom.getDate())
        const query = util.query();
        this.id = query.id;
        this.unionId = query.unionId || '';
        this.flag=query.flag||'';
        this.state = {
            //success为true时才会render渲染页面
            loading: true,
            data:{},
            today:today,
            submit:false,
            show:false
        }
    }
    componentWillMount() {
        UserCenter.reginfodetail(this.id).subscribe(this).fetch()
    }
    componentDidMount(){
        if (this.flag&&util.isInYuantuApp()) {
            hybridAPI.popToTimeViewController(false,3,false)
        }
    }
    onSuccess(result) {
        let data = result.data;
        this.setState({
            data:data,
            loading:false,
            success:true
        })
    }
    onError(result){
        
    }
    //订单状态
    renderState(){
        let {data,today} = this.state;
        var statusTextMap = {
            '100': {
                url:"https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/18ac34c44a00937823e11d0cb2923081-54-54.png",
                title: "待支付",
                des: "请在下单15分钟内支付，否则订单将自动取消。"
            },
            '202': {
                url: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/7c8c9dc4f0fd45067ca4c9d17ebeba2e-54-54.png",
                title: "已完成",
                des: "视频问诊已完成，请遵医嘱，祝您早日康复！"
            },
            '200': {
                url: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/c0079f8f28740296a24733124b5eb924-54-54.png",
                title: "已预约",
                des: "请在预约时间提示点击进入候诊队列等待医生视频呼叫，建议在WiFi环境下使用。如无法按时问诊，请至少提前一天取消预约。"
            },
            '401': {
                url: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/c0079f8f28740296a24733124b5eb924-54-54.png",
                title: "已预约",
                des: "请在预约时间提示点击进入候诊队列等待医生视频呼叫，建议在WiFi环境下使用。如无法按时问诊，请至少提前一天取消预约。"
            },
            '605': {
                url: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/b2bf0ad74171e6776e0835789c45edde-60-60.png",
                title: "已取消",
                des: "已取消预约。"
            },
            '700': {
                url: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/b2bf0ad74171e6776e0835789c45edde-60-60.png",
                title: "已取消",
                des: "医生停诊，订单已取消，钱款将原路返回。如有需要请重新预约"
            },
            '400': {
                url: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/b2bf0ad74171e6776e0835789c45edde-60-60.png",
                title: "已取消",
                des: "取消预约成功，钱款将原路返回。如有需要请重新预约。"
            }
            ,
            '404': {
                url: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/b2bf0ad74171e6776e0835789c45edde-60-60.png",
                title: "已取消",
                des: "已取消预约。"
            }
        };
        let href = 'waiting-queue.html?corpId='+data.corpId+'&unionId='+this.unionId+'&appointLogId='+this.id+'&target=_blank'
        return(
            <div>
                <div className="order-top">
                    <div className="order-top-img"><img src={statusTextMap[data.status]?statusTextMap[data.status].url:'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/18ac34c44a00937823e11d0cb2923081-54-54.png'} /></div>
                    <div className="order-top-info">
                        <span className="order-state">{statusTextMap[data.status]?statusTextMap[data.status].title:data.statusDes}</span>
                        <span className="order-info">{statusTextMap[data.status]?statusTextMap[data.status].des:''}</span>  
                    </div>
                </div> 
                {(data.status == '200' && util.dateFormat(data.medDate, 'yyyy-MM-dd') == today) || (data.status == '401' && util.dateFormat(data.medDate, 'yyyy-MM-dd') == today)?<div className="order-waiting">
                    <a href={href} className="waiting-queue">候诊队列</a>
                </div>:null}
            </div>
        )
    } 
    //订单类型
    renderType(){
        let {data}=this.state;
        return(
            <ul className="list-ord list-ord-first list-ord-margin">
                <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">订单类型</div>
                    <div className="list-content txt-nowrap">视频问诊</div>
                </li>
                <li className="list-item  list-item-noborder list-pay">
                    <div className="list-brief-title">订单金额</div>
                    <div className="list-content txt-nowrap">¥{util.rmb(data.regAmount/100)}</div>
                </li>
                <div className="border-line"></div>
            </ul>
        )
    }
    //订单信息
    renderInfo(){
        let {data} = this.state;
        return (
            <ul className="list-ord">
                <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">就诊人</div>
                    <div className="list-content txt-nowrap">{data.patientName}</div>
                </li>
                <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">医生</div>
                    <div className="list-content txt-nowrap">{data.doctName}</div>
                </li>
                <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">科室</div>
                    <div className="list-content txt-nowrap">{data.deptName}</div>
                </li>
                <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">医院</div>
                    <div className="list-content txt-nowrap">{data.corpName}</div>
                </li>
                <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">预约时间</div>
                    <div className="list-content txt-nowrap">{util.dateFormat(data.medDate,'yyyy-MM-dd')}</div>
                </li>
                <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">序号</div>
                    <div className="list-content txt-nowrap">{data.appoNo+'号 '+util.dateFormat(data.medDateBeg,'hh:mm')+'-'+util.dateFormat(data.medDateEnd,'hh:mm')}<span className="list-time">（时间为预估）</span></div>
                </li>
            </ul>
        )
    }
    //疾病信息
    renderDesc(){
        let {data} = this.state,imgs=[];
        if(data.illnessImg&&data.illnessImg!=""){
            imgs = data.illnessImg.split(',')
        }
        return(
            <ul className="list-ord">
                <li className="list-item list-ord-item">
                    <div className="list-content">
                        <div className="list-title">病情描述</div>
                        <div className="list-brief list-help">{data.illComplained}</div>
                    </div>
                </li>
                {data.hopeForHelp?
                <li className="list-item list-ord-item">
                    <div className="list-content">
                        <div className="list-title">希望得到帮助</div>
                        <div className="list-brief  list-help">{data.hopeForHelp}</div>
                    </div>
                </li>:null
                }
                {imgs.length>0?
                    <li className="list-item list-ord-item">
                        <div className="list-content">
                            <div className="list-title">检验、照片症状</div>
                            {imgs.map((item,key)=>{
                                return <div className="list-photo" key={key} style={{ background: `url(${item}) no-repeat center/cover`}}></div>
                            })}
                        </div>
                    </li> :''
                }
            </ul>
        )
    }
    //诊断及建议
    renderCare(){
        let {data}=this.state;
        return data.status=='202'?(
            <ul className="list-ord">
                <li className="list-item list-ord-item">
                    <div className="list-content">
                        <div className="list-title list-color">疾病诊断</div>
                        <div className="list-brief list-help">{data.doctorDiagnosis}</div>
                    </div>
                </li>
                <li className="list-item list-ord-item">
                    <div className="list-content">
                        <div className="list-title list-color">医生建议</div>
                        <div className="list-brief  list-help">{data.doctAdvice}</div>
                    </div>
                </li> 
            </ul>
        ):null
    }
    //订单支付
    renderPay(){
        let {data}=this.state;
        return(
            <ul className="list-ord list-ord-info">
                <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">订单号</div>
                    <div className="list-content txt-nowrap">{data.id}</div>
                </li>
                <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">下单时间</div>
                    <div className="list-content txt-nowrap">{util.dateFormat(data.updateTime, 'yyyy-MM-dd hh:mm:ss')}</div>
                </li>
                {data.payTypeDesc?<li className="list-item  list-item-noborder">
                    <div className="list-brief-title">支付方式</div>
                    <div className="list-content txt-nowrap">{data.payTypeDesc}</div>
                </li>:null}
            </ul>
        )
    }
    //订单状态按钮操作
    renderButton(){
        let {data}= this.state
        var stateAgain={
            "100":{
                clickOne: this.submitNone,
                clickTwo: this.submitPay,
                itemOne:'取消预约',
                itemTwo:"去支付"
            },
            "202":{
                clickOne: this.submitAgain,
                clickTwo: "",
                itemOne: '再次预约',
                itemTwo: ""
            },
            "200": {
                clickOne: this.submitNone,
                clickTwo: "",
                itemOne: '取消预约',
                itemTwo: ""
            },
            "401": {
                clickOne: this.submitNone,
                clickTwo: "",
                itemOne: '取消预约',
                itemTwo: ""
            },
            "400": {
                clickOne: this.submitAgain,
                clickTwo: "",
                itemOne: '重新预约',
                itemTwo: ""
            },
            "404": {
                clickOne: this.submitAgain,
                clickTwo: "",
                itemOne: '重新预约',
                itemTwo: ""
            },
            "700": {
                clickOne: this.submitAgain,
                clickTwo: "",
                itemOne: '重新预约',
                itemTwo: ""
            },
            "605": {
                clickOne: this.submitAgain,
                clickTwo: "",
                itemOne: '重新预约',
                itemTwo: ""
            },
        }
        return(
            <div>
                {stateAgain[data.status] ? (stateAgain[data.status].itemTwo ? <div className="btn-wrapper">
                    <div className="order-bottom-state" onClick={stateAgain[data.status].clickOne.bind(this)}>{stateAgain[data.status].itemOne}</div>
                    <div className="order-bottom-state order-bottom-pay" onClick={stateAgain[data.status].clickTwo.bind(this)}>{stateAgain[data.status].itemTwo}</div>
                </div> : <div className="btn-wrapper">
                        <button className="btn btn-block" onClick={stateAgain[data.status].clickOne.bind(this)}>{stateAgain[data.status].itemOne}</button>
                </div>):'' }
            </div>
        )
    }
    render() {
        let {submit,data,show} = this.state
        return (
            <div className="patient-order">
                {this.renderState()}
                {this.renderType()}
                {this.renderInfo()}
                {this.renderDesc()}
                {this.renderCare()}
                {this.renderPay()}
                {this.renderButton()}
                {
                submit ? <PayDialog
                    corpId={data.corpId}
                    patientId={data.patientId}
                    optType={11}
                    regType={data.regType}
                    price={data.regAmount}
                    optParam={{ corpId: data.corpId, patientId: data.patientId, outId: data.idStr, fee: data.regAmount,regType: data.regType }}
                    onPayComplate={this.onPayComplate.bind(this)}
                    onPayCancel={this.onPayCancel.bind(this)}
                    expirationTime={data.expirationTime}
                    redirect={util.flatStr(util.h5URL("/patient-order.html?"), { corpId:data.corpId, unionId: this.unionId, pay: 1, id: data.idStr})}
                /> : null
            }
            {
                show?<div className="modal-mask " >
                    <div className="modal-wrapper">
                        <div className="modal">
                            <div className="modal-body ">
                                <div className="txt-insign">确定要取消预约吗？</div>
                            </div>
                            <div className="modal-footer">
                                <div className="modal-button-group-h">
                                    <a className="modal-button" onClick={()=>{
                                        this.setState({
                                            show:false
                                        })
                                    }}>取消</a>
                                    <a className="modal-button" onClick={this.cancelAppoint.bind(this)}>确定</a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>:null
            }
            </div>
        )
    }
    //取消预约
    submitNone() {
        this.setState({
            show:true
        })
    }
    cancelAppoint(){
        let { data } = this.state, selectDom = '';
        UserCenter.cancelAppointReg(data.idStr, selectDom, this.unionId).subscribe({
            onSuccess: (result) => {
                if (data.status != "100") {
                    Alert.show('钱款将于3个工作日内返回', 3000)
                }
                this.setState({
                    loading: true,
                    show:false
                })
                setTimeout(() => {
                    window.location.reload()
                }, 2000);
            },
            onError: (result) => {
                Alert.show(result.msg)
            }
        }).fetch()
    }
    //重新预约、再次预约按钮
    submitAgain() {
        let {data}=this.state;
        window.location.replace('video-inter.html?corpId='+data.corpId+'&unionId='+this.unionId+'&target=_blank')
    }
    //去支付
    submitPay() {
        this.setState({
            submit:true
        })
    }
    //支付成功回调函数
    onPayComplate(isOkay) {
        let {data } = this.state;
        setTimeout(() => {
            this.setState({ submit: false })
            window.location.replace(util.flatStr("./patient-order.html?", {
                corpId:data.corpId,
                unionId: this.unionId,
                id: data.idStr,
                target: "_blank"
            }))
        }, 2000)
    }

    //取消支付
    onPayCancel() {
        let { data } = this.state;
        this.setState({ submit: false,loading:true })
        window.location.replace(util.flatStr("./patient-order.html?", {
            corpId:data.corpId,
            unionId: this.unionId,
            id: data.idStr,
            target: "_blank"
        }))
    }
}