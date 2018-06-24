import React from 'react';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import { SmartBlockComponent } from './BaseComponent/index'
import PayDialog from './component/pay/PayDialog'
import './inquire-details.less';
import BlockLoading from './component/loading/BlockLoading';
import Alert from './component/alert/alert';
import hybridAPI from './lib/hybridAPI'
import backRefresh from './hoc/backRefresh'

export default class InquireDetails extends SmartBlockComponent {
    constructor(props) {
        super(props);
        const query = util.query();
        this.id = query.id;
        this.regMode = query.regMode,
        this.corpId = query.corpId,
        this.deptCode = query.deptCode,
        this.doctCode = query.doctCode,
        this.corpName = query.corpName,
        this.doctName = query.doctName,
        this.unionId = query.unionId,
        this.rcDoctId = query.rcDoctId || '';
        this.doctSex = query.doctSex || ''
        this.doctLogo = query.docLogo || "" 
        this.patient_sex=query.patient_sex
        this.isGraphic = query.isGraphic
        this.flag = query.flag || '';
        this.state = {
            //success为true时才会render渲染页面
            loading: true,
            success:false,
            submit: false,
            show:false
        }
    }

    componentWillMount() { 
        UserCenter.getGcInquiryDetail(this.id).subscribe(this).fetch()
    }
    componentDidMount(){
        if (this.flag && util.isInYuantuApp()) {
            hybridAPI.popToTimeViewController(false, 2, false)
        }
    }
    onSuccess(result) {
        let data = result.data;
        if(util.isInYuantuApp()&&this.isGraphic == "true"){
            hybridAPI.createConsultation(data.rcDoctId, data.rcUserId, data.patientIm, data.doctIm, data.doctCode, data.doctName, data.deptCode, this.corpId, this.unionId, data.illnessImg, data.illnessDesc,data.id)
        }
        hybridAPI.setTitle('订单详情')
        document.getElementsByTagName('title')[0].innerText='订单详情'
        this.setState({
            data: data,
            loading: false,
            success: true
        })
    }
    onError(result){
        console.log(result.msg)
    }
    //订单状态
    renderState() {
        let { data } = this.state;
        var statusTextMap = {
            '1': {
                url: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/18ac34c44a00937823e11d0cb2923081-54-54.png",
                title: "待支付",
                des: "请在下单15分钟内支付，否则订单将自动取消。"
            },
            '2':{
                url: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/18ac34c44a00937823e11d0cb2923081-54-54.png",
                title: "待接诊",
                des:""
            },
            '3':{
                url: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/18ac34c44a00937823e11d0cb2923081-54-54.png",
                title: "进行中",
                des:""
            },
            '4': {
                url: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/b2bf0ad74171e6776e0835789c45edde-60-60.png",
                title: "已取消",
                des: "超时未支付订单已取消。"
            },
            '5': {
                url: "https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/b2bf0ad74171e6776e0835789c45edde-60-60.png",
                title: "已完成",
                des: ""
            }
            
        };
        return (
            <div>
                <div className="order-top">
                    <div className="order-top-img"><img src={statusTextMap[data.graphicStatus] ? statusTextMap[data.graphicStatus].url : 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/18ac34c44a00937823e11d0cb2923081-54-54.png'} /></div>
                    <div className="order-top-info">
                        <span className="order-state">{statusTextMap[data.graphicStatus].title}</span>
                        <span className="order-info">{statusTextMap[data.graphicStatus].des}</span>
                    </div>
                </div>
            </div>
        )
    }
    //订单类型
    renderType() {
        let { data } = this.state;
        return (
            <ul className="list-ord list-ord-first list-ord-margin">
                <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">订单类型</div>
                    <div className="list-content txt-nowrap">图文问诊</div>
                </li>
                <li className="list-item  list-item-noborder list-pay">
                    <div className="list-brief-title">订单金额</div>
                    <div className="list-content txt-nowrap">¥{util.rmb(data.inquiryFee/ 100)}</div>
                </li>
                <div className="border-line"></div>
            </ul>
        )
    }
    //订单信息
    renderInfo() {
        let { data } = this.state;
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
            </ul>
        )
    }
    //疾病信息
    renderDesc() {
        let { data } = this.state, imgs = [];
        if (data.illnessImg && data.illnessImg != "") {
            imgs = data.illnessImg.split(',')
        }
        return (
            <ul className="list-ord">
                <li className="list-item list-ord-item">
                    <div className="list-content">
                        <div className="list-title">病情描述</div>
                        <div className="list-brief list-help">{data.illnessDesc}</div>
                    </div>
                </li>
                {data.hopeForHelp ?
                    <li className="list-item list-ord-item">
                        <div className="list-content">
                            <div className="list-title">希望得到帮助</div>
                            <div className="list-brief  list-help">{data.hopeForHelp}</div>
                        </div>
                    </li> : null
                }
                {imgs.length > 0 ?
                    <li className="list-item list-ord-item">
                        <div className="list-content">
                            <div className="list-title">检验、照片症状</div>
                            {imgs.map((item, key) => {
                                return <div className="list-photo" key={key} style={{ background: `url(${item}) no-repeat center/cover` }}></div>
                            })}
                        </div>
                    </li> : ''
                }
            </ul>
        )
    }
    //诊断及建议
    renderCare() {
        let { data } = this.state;
        return data.status == '202' ? (
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
        ) : null
    }
    //订单支付
    renderPay() {
        let { data } = this.state;
        return (
            <ul className="list-ord list-ord-info">
                <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">订单号</div>
                    <div className="list-content txt-nowrap">{data.id}</div>
                </li>
                <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">下单时间</div>
                    <div className="list-content txt-nowrap">{util.dateFormat(data.submitDate, 'yyyy-MM-dd hh:mm:ss')}</div>
                </li>
                {data.payTypeDesc ? <li className="list-item  list-item-noborder">
                    <div className="list-brief-title">支付方式</div>
                    <div className="list-content txt-nowrap">{data.payTypeDesc}</div>
                </li> : null}
            </ul>
        )
    }
    //订单状态按钮操作
    renderButton() {
        let { data,show } = this.state
        var stateAgain = {
            "1": {
                clickOne: this.submitNone,
                clickTwo: this.submitPay,
                itemOne: '取消预约',
                itemTwo: "去支付"
            },
            "4": {
                clickOne: this.submitAgain,
                clickTwo: "",
                itemOne: '再次预约',
                itemTwo: ""
            }
        }
        return (
            <div>
                {stateAgain[data.graphicStatus] ? (stateAgain[data.graphicStatus].itemTwo ? <div className="btn-wrapper">
                    <div className="order-bottom-state" onClick={stateAgain[data.graphicStatus].clickOne.bind(this)}>{stateAgain[data.graphicStatus].itemOne}</div>
                    <div className="order-bottom-state order-bottom-pay" onClick={stateAgain[data.graphicStatus].clickTwo.bind(this)}>{stateAgain[data.graphicStatus].itemTwo}</div>
                </div> : <div className="btn-wrapper">
                        <button className="btn btn-block" onClick={stateAgain[data.graphicStatus].clickOne.bind(this)}>{stateAgain[data.graphicStatus].itemOne}</button>
                    </div>) : ''}
            </div>
        )
    }
    render() {
        let { submit, data,show } = this.state
        return (
            <div className="inquire-details">
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
                        optType={12}
                        regType={data.regType}
                        price={data.inquiryFee}
                        optParam={{ corpId: data.corpId, patientId: data.patientId, outId: data.id, fee: data.inquiryFee, regType: data.regType }}
                        onPayComplate={this.onPayComplate.bind(this)}
                        onPayCancel={this.onPayCancel.bind(this)}
                        expirationTime={data.expirationTime}
                        redirect={util.flatStr(util.h5URL("/inquire-datails.html?"), { corpId: data.corpId, unionId: this.unionId, pay: 1, id: data.id })}
                    /> : null
                }
                {
                    show ? <div className="modal-mask " >
                        <div className="modal-wrapper">
                            <div className="modal">
                                <div className="modal-body ">
                                    <div className="txt-insign">确定要取消预约吗？</div>
                                </div>
                                <div className="modal-footer">
                                    <div className="modal-button-group-h">
                                        <a className="modal-button" onClick={() => {
                                            this.setState({
                                                show: false
                                            })
                                        }}>取消</a>
                                        <a className="modal-button" onClick={this.cancelAppoint.bind(this)}>确定</a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div> : null
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
        UserCenter.cancelInquiry(data.id).subscribe({
            onSuccess: (result) => {
                this.setState({
                    show:false,
                    loading:true
                })
                window.location.reload()
            },
            onError: (result) => {
                Alert.show(result.msg)
            }
        }).fetch()
    }
    //再次预约按钮
    submitAgain() {
        let { data } = this.state;
        UserCenter.getDoctConsultationRecord(1, data.corpId, this.deptCode, this.doctCode, 1).subscribe({
            onSuccess:(result)=>{
                if (result.data.length > 0) {
                    let {rcDoctId,rcUserId,patientIm,doctIm,doctName,conversationStatus,patientSex,id} = result.data[0]
                    if (util.isInYuantuApp()) {
                        // 跳会话页 native，im 聊天页
                        hybridAPI.goConsultation(rcDoctId, rcUserId, patientIm, doctIm, doctName, conversationStatus, id)
                    } else {
                        window.location = './chat-details.html?' + util.flat({
                            doctCode: this.doctCode,
                            doctName: this.doctName,
                            deptCode: this.deptCode,
                            corpId:data.corpId,
                            unionId: this.unionId,
                            rcDoctId: this.rcDoctId,
                            doctSex: this.doctSex,
                            doctLogo: this.doctLogo,
                            corpName: this.corpName,
                            regMode: this.regMode,
                            regType: data.regType,
                            patient_sex: this.patient_sex == "女 " ? 2 : 1,
                            target: '_blank'
                        })
                    }
                }else{
                    window.location.replace(util.flatStr("./patient-audio.html?", {
                        isGraphic: true,
                        doctName: this.doctName,
                        rcDoctId: this.rcDoctId,
                        doctCode: this.doctCode,
                        deptCode: this.deptCode,
                        corpName: this.corpName,
                        regMode: this.regMode,
                        doctLogo: this.doctLogo,
                        doctSex: this.doctSex,
                        patient_sex: this.patient_sex,
                        corpId: data.corpId,
                        unionId: this.unionId,
                        target: "_blank"
                    }))
                }
            }
        }).fetch()
        
    }
    //去支付
    submitPay() {
        this.setState({
            submit: true
        })
    }
    //支付成功回调函数
    onPayComplate(isOkay) {
        let { data } = this.state;
        setTimeout(() => {
            this.setState({ submit: false })
            if (isOkay){
                if(util.isInYuantuApp()){
                    hybridAPI.createConsultation(data.rcDoctId, data.rcUserId, data.patientIm, data.doctIm, data.doctCode, data.doctName, data.deptCode, data.corpId, this.unionId, data.illnessImg, data.illnessDesc,data.id)
                }else{
                    window.location.replace(util.flatStr("./chat-details.html?", {
                        doctName: this.doctName,
                        rcDoctId: this.rcDoctId,
                        doctCode: this.doctCode,
                        deptCode: this.deptCode,
                        corpName: this.corpName,
                        regMode: this.regMode,
                        docLogo: this.doctLogo,
                        doctSex: this.doctSex,
                        patient_sex: this.patient_sex,
                        corpId: data.corpId,
                        unionId: this.unionId,
                        id: data.id,
                        target: "_blank"
                    }))
                }
            }else{
                window.location.replace(util.flatStr("./inquire-details.html?", {
                    doctName: this.doctName,
                    rcDoctId: this.rcDoctId,
                    doctCode: this.doctCode,
                    deptCode: this.deptCode,
                    corpName: this.corpName,
                    regMode: this.regMode,
                    docLogo: this.doctLogo,
                    doctSex: this.doctSex,
                    patient_sex: this.patient_sex,
                    corpId: data.corpId,
                    unionId: this.unionId,
                    id: data.id,
                    flag:1
                }))
            }
        }, 2000)
        
    }

    //取消支付
    onPayCancel() {
        this.setState({ submit: false })
    }
}