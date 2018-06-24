import React from 'react';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import { SmartBlockComponent } from './BaseComponent/index'
import './patient-audio.less';
import BlockLoading from './component/loading/BlockLoading';
//选择就诊人
import cache from './lib/cache'
import { connect } from 'gi-mini-dvajs';

//弹出提示信息
import Alert from './component/alert/alert';
//支付
import PayDialog from './component/pay/PayDialog'
import JSBridge from './lib/JSBridge'
import hybridAPI from './lib/hybridAPI'


class PatientAudio extends SmartBlockComponent {
    constructor(props) {
        super(props);
        const query = util.query();
        this.regMode = query.regMode||1, 
        this.scheduleId = query.scheduleId, 
        this.corpId = query.corpId, 
        this.regType = query.regType, 
        this.deptCode = query.deptCode, 
        this.medDate = query.medDate, 
        this.doctCode = query.doctCode, 
        this.corpName = query.corpName,
        this.doctName = query.doctName,
        this.unionId = query.unionId, 
        this.regAmount = query.regAmount,
        this.medAmPm = query.medAmPm;
        this.isGraphic =query.isGraphic;
        this.doctSex = query.doctSex||''
        this.doctLogo = query.doctLogo||""
        this.param = util.flat(query)
        this.state = {
            //success为true时才会render渲染页面
            loading: true,
            isLogin: true,
            istreat: query.istreat||false,
            color2: true,
            preDiagnosis:query.preDiagnosis || '',
            color1:query.color1 == 'false' ? query.color1 : true,
            //是否就诊过
            isVisit:query.isVisit||"",
            patientId: "", //就诊
            patientName: query.patientName||"",
            diseaseImageUrl:[],
            sourceList: [],//号源
            sourceValue: query.sourceValue||"",//格式化后的号源字符串
            sourceArr: [],//格式化前的号源数组
            showMask: false,//设置遮罩的显示状态,默认不显示
            //订单生成以后会获得 outId(订单id)
            submit: null,
            outId: null,
            //支付方式 1、支付宝 2、微信 3、余额 4、到院支付
            feeChannel: null,
            appoNo: query.appoNo||'',
            medBegTime: query.medBegTime||'',
            medEndTime: query.medEndTime||'',
            extend:query.extend||'',
            rcDoctId: query.rcDoctId || ''
        }
    }
    componentWillMount(){
        this.init()
        this.isGraphic=='true'?UserCenter.getInquiryFee(this.corpId,this.doctCode).subscribe({
            onSuccess:(result)=>{
                this.setState({
                    inquiryFee: result.data.inquiryFee
                })
            },
            onError: (result)=>{
                console.log(result.msg)
            }
        }).fetch():null
        JSBridge.on("0", (result) => {
            if (result && result.ret == "SUCCESS") {
                var data = result.data ? JSON.parse(result.data) : null;
                if (data.isVisit){
                    this.setState({
                        preDiagnosis: data.preDiagnosis,
                        istreat: data.istreat,
                        color1: data.color1,
                        isVisit: data.isVisit,
                        patientName: data.patientName,
                        sourceValue: data.sourceValue,
                        appoNo: data.appoNo,
                        extend: data.extend,
                        medBegTime: data.medBegTime,
                        medEndTime: data.medEndTime
                    })
                }else{
                    var needDefault = cache.get("needDefault");//默认就诊人改造
                    if (data.patientId && needDefault == "false") {
                        //设置就诊人
                        this.updateSelectPatient(data.patientId, data.patientName,data.patientSex);
                    }
                }
            }
        });
    }
    init() {
        let _this = this
        //1.引入融云sdk(script形式引入)
        //2.初始化
        RongIMClient.init(cache.get('appKey'));//融云申请的APPKEY 
        // RongIMClient.init('k51hidwqknkub')
        //3.设置连接监听状态 （ status 标识当前连接状态）
        RongIMClient.setConnectionStatusListener({
            onChanged(status) {
                switch (status) {
                    //链接成功
                    case RongIMLib.ConnectionStatus.CONNECTED:
                        console.log('链接成功');
                        break;
                }
            }
        });
        //4.消息监听器
        RongIMClient.setOnReceiveMessageListener({
            // 接收到的消息
            onReceived(message) {
            }

        })

        //token值
        const token = cache.get('patientToken');
        // const token = 'ZDiiFyMJyzZfvl98R06zOQF14vkcD/I6vLFDtvTT966FzkRest9CzER+ffIE9xKf1TEIwbEtajAng+xRdv8xTw==';
        // 5.连接融云服务器
        RongIMClient.connect(token, {
            onSuccess() {},
            onTokenIncorrect() { Alert.show('token无效'); },
            onError(errorCode) { Alert.show('出现错误') }
        })

    }

    //发送文字消息
    sendTextMessage() {
        let textMes = this.props.inputValueInfo//这里的内容就是患者填写的文字问诊信息　
        let _this = this
        //文字消息使用 RongIMLib.TextMessage
        let msg = new RongIMLib.TextMessage({ content: textMes,extra:{sign:'1',message: ['医生会尽快处理您的问诊，请耐心等候', '医生首次回复后，问答限时48小时']} });
        let conversationtype = RongIMLib.ConversationType.PRIVATE; // 私聊
        let targetId =this.state.rcDoctId; // 医生 Id
        // let targetId="444"
        RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
            // 发送消息成功
            onSuccess(message) {
                //发送成功使用replace携带参数跳转到聊天页面
                let href = "./chat-details.html?doctName=" + _this.doctName + "&rcDoctId=" + _this.state.rcDoctId + "&doctCode=" + _this.doctCode + "&deptCode=" + _this.deptCode + "&corpName=" + _this.corpName + "&regMode=" + _this.regMode + "&docLogo=" + _this.doctLogo + "&doctSex=" + _this.doctSex + "&patient_sex=" + cache.get('patientSex') + "&corpId=" + _this.corpId + "&unionId=" + _this.unionId + "&id=" + _this.state.outId + "&target=_blank"
                window.location.replace(href)               
            },
            onError(errorCode, message) { Alert.show('文字消息发送失败') }
        }
        )
    }

    componentDidMount() {
        if(this.isGraphic!="true"){
            this.getNumberSource()
        }
        let patientId = cache.get('patientId')
        let patientName = cache.get('patientName')
        let patientSex = cache.get('patientSex')
        if(!patientId&&!patientName){
            this.setPatient(patientId)
        }else{
            this.updateSelectPatient(patientId, patientName, patientSex)
        }
        this.setState({
            loading:false,
            success:true
        })
    }

    //点击就诊过
    isTreat() {
        this.setState({
            istreat: true,
            success: true,
            color2: true,
            isVisit:1,
            color1:false,
        })
    }
    //点击未就诊过
    isNoTreat() {
        this.setState({
            istreat: false,
            success: true,
            color2: false,
            preDiagnosis : "",
            isVisit:2,
            color1:true
        })
    }
    //就诊纪录，疾病诊断
    renderCareInfo() {
        let { istreat, color2, preDiagnosis,color1 } = this.state;
        preDiagnosis.length > 10 ? preDiagnosis = preDiagnosis.substr(0, 10)+'...' : preDiagnosis=preDiagnosis;
        return (
            <ul className="list-ord">
                <li className="list-item">
                    <div className="list-content txt-nowrap list-txt-cc">
                        <div className="list-title txt-nowrap list-left">是否到医院就诊过</div>
                        <div className={color2 ? "list-extra list-border" : "list-extra list-border list-back"} onClick={this.isNoTreat.bind(this)}>未就诊过</div>
                        <div className={color1==true ? "list-extra list-border" : "list-extra list-border list-back"} onClick={this.isTreat.bind(this)}>就诊过</div>
                    </div>
                </li>
                {istreat ? <li className="list-item list-item-middel " onClick={this.toSearch}>
                    <a className="txt-arrowlink list-link-wrapper" >
                        <div className="list-content" >
                            <div className="list-title txt-nowrap list-care">疾病诊断<span className='red'> * </span></div>
                        </div>
                        <div className="list-extra" >{preDiagnosis ? preDiagnosis : <span className="select">请输入诊断结果</span>}</div>
                    </a>
                </li> : null}
            </ul>
        )
    }
    //疾病诊断
    toSearch = () => {
        let { patientName, sourceValue, appoNo, extend, medBegTime, medEndTime}=this.state;
        const urlInfo = {
            unionId: this.unionId,
            target: '_blank',
        };
        window.location.href = './search-disease.html?corpId=' + this.corpId + '&unionId=' + this.unionId + '&regMode=' + this.regMode + '&deptCode=' + this.deptCode + '&doctCode=' + this.doctCode + '&regType=' + this.regType + '&scheduleId=' + this.scheduleId + '&regAmount=' + this.regAmount + '&medDate=' + this.medDate + '&patientName=' + patientName + '&sourceValue=' + sourceValue + '&medAmPm=' + this.medAmPm + '&appoNo=' + appoNo + '&extend=' + extend + '&medBegTime=' + medBegTime + '&medEndTime=' + medEndTime + '&isGraphic=' + (this.isGraphic ? this.isGraphic:'')+'&referrer=' + `${encodeURIComponent(location.href)}` + '&target=_blank';
    };

    //设置就诊人
    setPatient(patientId) {
        const _this = this;
        UserCenter.getPatientList(this.state.corpId, this.unionId)
            .subscribe({
                onSendBefore() {
                    BlockLoading.show("请稍等...");
                },
                onComplete() {
                    BlockLoading.hide();
                },
                onError() {
                    _this.setState({
                        isLogin: false,
                    });
                },
                onSuccess: (result) => {
                    if (result.data) {
                        var patientList = result.data;
                        var isSelect = false;
                        var needDefault = cache.get("needDefault");
                        _this.setState({
                            isLogin: true,
                        });
                        // 默认就诊人改造
                        //选择上次选择的就诊人
                        for (var i = 0; i < patientList.length; i++) {
                            if (patientId == patientList[i].id && needDefault == "false") {
                                isSelect = true;
                                this.updateSelectPatient(patientList[i].id, patientList[i].patientName, patientList[i].sex);
                                break;
                            }
                        }
                        //选择第一个就诊人
                        if (!isSelect) {
                            for (var i = 0; i < patientList.length; i++) {
                                if (patientList[i].default) {
                                    this.updateSelectPatient(patientList[i].id, patientList[i].patientName, patientList[i].sex);
                                }
                            }
                        }
                    }
                }
            })
            .fetch()
    }
    //更新用户选择的就诊人
    updateSelectPatient(patientId, patientName,patientSex) {
        this.setState({
            isLogin: true,
            patientId: patientId,
            patientName: patientName,
        })
        //localStorage
        cache.set("patientId", patientId);
        cache.set("patientName", patientName);
        cache.set("needDefault", true);
        cache.set("patientSex", patientSex);
    }
    //就诊人列表
    toPatientList(corpId, patientId,patientName) {
        const { isLogin } = this.state;
        //如果在远图app中，在点击就诊人的时候就判断是否登录。如果不在远图app中，那么先前往就诊人列表然后再判断登录状态
        if ((util.isLogin() && isLogin) || !util.isInYuantuApp()) {
            window.location.href = `./patient-list.html?corpId=${corpId}&lastSelectPatientId=${patientId ? localStorage.getItem("patientId") : ''}&selectView=1&unionId=${this.unionId}&referrer=${encodeURIComponent(location.href)}&flag=1&target=_blank`;
        } else {
            util.goLogin();
        }
    }
    //选择就诊人
    renderSelectPatient() {
        var { patientId, patientName,sourceValue } = this.state;
        let sourceList = this.state.sourceList;
        let sourceItem = null;
        return <div className='panel g-space'>
            <ul className="list-ord" >
                <li className="list-item">
                    <a
                        onClick={() => this.toPatientList(this.corpId, patientId, patientName)}
                        className="txt-arrowlink list-link-wrapper">
                        <div className="list-content" >
                        <div className="list-title txt-nowrap">选择就诊人</div>
                        </div>
                        <div className="list-extra">{patientName ? patientName:<span className="select">请选择</span>}</div>
                    </a>
                </li>
                {this.isGraphic=='true'?null:<li className="list-item list-item-middel " onClick={this.handleChangeSource.bind(this)} id="patientTime">
                    <a className="txt-arrowlink list-link-wrapper">
                        <div className="list-content" >
                            <div className="list-title txt-nowrap">选择时间段</div>
                        </div>
                        <div className="list-extra"><span className="select" ref="getSelectedTime">{sourceValue?<span style={{"color":'#333'}}>{sourceValue}</span>:'请选择'}</span></div>
                    </a>
                </li>}
            </ul>
        </div>
    }


//点击选择时间段
    renderTimeBox(){
        let sourceList = this.state.sourceList;
        let sourceItem = null;
        const {needSource, patientId, patientName, discountFee, submit, outId, expirationTime } = this.state;
        return(
            <div style={styles.tips} ref="tips">
                <div style={styles.title}>
                    <div onClick={this.cancelSourceList.bind(this)} className="cancel">取消</div>
                    <div style={{ color: '#333',"fontSize":'15px' }}>选择时间段</div>
                    <div ref="isConfirm" onClick={(e) => this.selectTime(e)} className="isConfirm">确认</div>
                </div>
                <div style={styles.sourceList} className="sourceList-item-overflow" ref="sourceList" id="sourceList">
                    {
                        sourceList.map((item, index) => {
                            sourceItem = util.vis({
                                appoNo: item.appoNo ? item.appoNo + "号" : "",
                                medBegTime: item.medBegTime,
                                medEndTime: item.medEndTime,
                                extend: item.extend ? item.extend : "",
                            });
                            return <div onClick={(e) => this.selectSourceItem(e,item.appoNo,item.medBegTime,item.medEndTime,item.extend)}
                                style={styles.sourceItem}
                                className="selectSourceItem"
                                key={item.appoNo || index}
                                ref="timeItem"
                                data-value={[item.appoNo || "", sourceItem.medBegTime, sourceItem.medEndTime, sourceItem.extend || ""].join(",")}>
                                {sourceItem.appoNo} {sourceItem.medBegTime}-{sourceItem.medEndTime}
                            </div>
                        })
                    }
                </div>
            </div> 
        )
    }
    //获取号源
    getNumberSource() {
        UserCenter.getNumbersource(this.corpId, this.regType, this.deptCode, this.doctCode, this.regMode, this.medAmPm, this.medDate, this.scheduleId)
            .subscribe({
                onSendBefore() {
                    BlockLoading.show("请稍等...");
                },
                onComplete() {
                    BlockLoading.hide();
                },
                onSuccess: (result) => {
                    var data = result.data;
                    if (data && data.needSource) {
                        this.setState({
                            //有号源就需要选择号源
                            needSource: true,
                            success: true,
                            loading: false,
                            sourceList: data.sourceList
                        })
                    } else {
                        this.setState({
                            //没有号源就不需要选择号源
                            loading: false,
                            success: true,
                            needSource: false
                        })
                    }
                },
                onError: (result) => {
                    Alert.show(result.msg, 1000)
                    this.setState({
                        loading: false,
                        needSource: false
                    });
                }
            }).fetch();
    }
    //是否需要选择号源
    isNeedSource() {
        return this.state.needSource;
    }
    //号源是否为空
    isSourceEmpty() {
        return this.state.sourceEmpty;
    }
    // 点击选择号源从下弹起div
    handleChangeSource() { 
        let tips = this.refs.tips;
        tips.style.bottom = "0px";
        tips.style.opacity = "1";
        //设置遮罩显示状态
        this.setState({
            showMask: !this.state.showMask
        })
        //禁用外层页面滚动条
        const isInYuantuApp = util.isInYuantuApp()
        if (isInYuantuApp) {//在远图App中
            hybridAPI.interceptRefreshLayout(true)
        } else {
            document.body.style.overflow = 'hidden'
            document.body.ontouchmove = function () {
                event.preventDefault
            };//阻止body的滑动事件
        }
    }
    //点击选择就诊时间
    selectSourceItem(e,appoNo,medBegTime,medEndTime,extend) {
        this.setState({
            appoNo:appoNo,
            extend:extend,
            medBegTime:medBegTime,
            medEndTime:medEndTime,
            sourceValue: e.target.innerText, //号源字符串
            sourceArr: e.target.dataset.value
        })
        let divs = e.target.parentElement.children
        for (let i = 0, length = divs.length; i < length; i++) {
            divs[i].style.backgroundColor = "#fff"
            divs[i].style.color = "#ccc"
            divs[i].style.border = "0"
            divs[i].style.padding = "0"
        }
        e.target.style.padding = "16px 0";
        e.target.style.color = "#333";
        e.target.style.borderBottom = "1px solid #eee"
        e.target.style.borderTop = "1px solid #eee"
    }
    //选中号源后点击确定
    selectTime() {
        this.refs.timeItem.style.padding = "16px 0"
        this.refs.timeItem.style.color = "#333"
        this.refs.timeItem.style.borderBottom = "1px solid #eee"
        this.refs.timeItem.style.borderTop = "1px solid #eee"
        let getSelectedTime = this.refs.getSelectedTime
        getSelectedTime.innerText = this.state.sourceValue
        getSelectedTime.style.color="#333"
        if (!getSelectedTime.innerText) {
            Alert.show('您未选择就诊时间!', 1000)
            return
        }
        //隐藏遮罩
        this.setState({
            showMask: !this.state.showMask
        })
        //号源弹出div隐藏
        let tips = this.refs.tips
        tips.style.bottom = '-286px'
        tips.style.opacity = "0";
        const isInYuantuApp = util.isInYuantuApp()
        if (isInYuantuApp) {//在远图App中
            hybridAPI.interceptRefreshLayout(false)
        } else {
            //恢复页面滚动条及上下拉功能
            document.body.style.overflow = 'scroll'
        }
    }
    //点击取消选择号源
    cancelSourceList() {
        let tips = this.refs.tips;
        tips.style.bottom = "-286px";
        tips.style.opacity = "0";
        this.setState({
            showMask: !this.state.showMask,
        })
        const isInYuantuApp = util.isInYuantuApp()
        if (isInYuantuApp) {//在远图App中
            hybridAPI.interceptRefreshLayout(false)
        } else {
            //恢复页面滚动条
            document.body.style.overflowY = 'scroll'
        }
    }
    
//病情描述
    renderInputTxt() {
        const { dispatch, inputValueInfo } = this.props
        return (
            <div className="panel g-space">
                <div className="panel-noborder">病情描述<span className='red'> * </span></div>
                <div className="textarea-wrapper">

                    <textarea value={ inputValueInfo }  placeholder="请准确详细的描述你的症状，身体状况，便于医生更加准确的分析（不少于十个字）"
                        onChange={(e) => {
                            dispatch({ type: 'createConsultation/setInputValueInfo', value: e.target.value })
                        }} ></textarea>
                </div>
            </div>
        )
    }
//希望获得的帮助
    renderInputHelp() {
        const { dispatch, inputValueHelp } = this.props
        return (
            <div className="panel g-space">
                <div className="panel-noborder">希望获得的帮助</div>
                <div className="textarea-wrapper">
                    <textarea value={ inputValueHelp } placeholder="请简单描述通过本次问诊希望获得的帮助，如用药健康、报告单解读、术后指导等" 
                        onChange={(e) => {
                            dispatch({ type: 'createConsultation/setInputValueHelp', value: e.target.value })
                        }}
                     ></textarea>
                </div>
            </div>
        )
    }
    //图片上传
    renderInputImg () {
        const { imgs, dispatch } = this.props
        let {imgClass}=this.state;
        let self=this;
        return util.isInYuantuApp()? <div className="image-picker-wrapper">
          <div className="item-input-title" style={{
            marginBottom: '15px',fontSize: "14px", color:"#666"
          }
          } > 添加检查或者症状相关图片
            <span style={{color: "#ff5256", fontSize: "12px"}}>*本人和医生可见， 非必填*
            </span>
            </div>
          <div className="image-picker">
            {
              imgs.map(( url, index ) => {
                return (
                  <div key={ index } className="image-picker-item" style={{border:'0px'}}>
                    <div className="image-picker-remove" style={{border:'0px'}} onClick={() => {
                      dispatch({ type: 'createConsultation/removeImg', index })
                    }}> </div>
                    <div className="image-picker-content" style={{border:'0px'}}>
                      { url == 'loading' ? <div className="upload-img-loading" style={{border:'0px'}}>
                        <span className="icon-loading"></span>
                            </div> : <div className='img-box' style={{ background: `url(${url}) no-repeat center/cover` }}></div>}
                    </div>
                  </div>
                )
              })
            }
            { imgs.length <= 4 ? <div className="image-picker-item image-picker-upload"
                                      onClick={() => {
                                      dispatch({ type: 'createConsultation/upload'})
                                    }}>
              <input type="file" className="image-picker-input"/>
            </div> : null }
          </div>
        </div>:null
      }
    render() {
        let { showMask, diseaseDesc}=this.state;
        return (
            <div className="patient-audio">
                <div className="mask" style={{ display: showMask ? 'block' : 'none' }}></div>
                {this.renderSelectPatient()}
                {this.renderCareInfo()}
                {this.renderInputTxt()}
                {this.renderInputHelp()}
                {this.renderInputImg()}
                {this.renderSubmit()}
                {this.renderTimeBox()}
            </div>
        )
    }


//下一步按钮
    renderSubmit() {
        var { needSource, patientId, patientName, submit, outId, expirationTime, inquiryFee } = this.state;
        let optType = this.isGraphic=="true"?12:11
        let price = this.isGraphic == "true" ? inquiryFee:this.regAmount
        return <div className="btn-wrapper">
            <div className="btn-after" onClick={this.submitInfo.bind(this)}>下一步</div> 
            { 
                submit ? <PayDialog
                    corpId={this.corpId}
                    patientId={patientId}
                    optType={optType}
                    regType={this.regType}
                    price={price}
                    isGraphic={this.isGraphic}
                    optParam={{ corpId: this.corpId, patientId: patientId, outId: outId, fee: price, regType: this.regType }}
                    onPayComplate={this.onPayComplate.bind(this)}
                    onPayCancel={this.onPayCancel.bind(this)}
                    expirationTime={expirationTime}
                    redirect={util.flatStr(this.isGraphic == "true" ? util.h5URL("/inquire-details.html?") : util.h5URL("/patient-order.html?"), { corpId:this.corpId, unionId: this.unionId, pay: 1, id: outId})}
                /> : null
            }
        </div>
    }
   
    submitInfo(){
        let { isVisit, patientId, appoNo, medBegTime, medEndTime, extend, patientName, sourceValue, preDiagnosis} =this.state;
        const {inputValueHelp,inputValueInfo,submitOk,imgs} = this.props
        let optType = this.isGraphic == "true" ? 12 : 11
        if(patientName==""){
            Alert.show('请选择就诊人')
            return;
        }
        if (this.isNeedSource()) {
            if (this.isSourceEmpty()) {
              Alert.show("号源被抢光了！");
              return;
            }
        }
        if(this.isGraphic!='true'&&sourceValue==""){
            Alert.show('请选择号源')
            return
        }
        if(isVisit==''){
            Alert.show('请选择是否就诊过')
            return
        }
        if (isVisit==1&&preDiagnosis==""){
            Alert.show('请输入疾病诊断')
            return
        }
        if(inputValueInfo.length<10){
            Alert.show('请简单描述一下你的病情，最少十个字')
            return
        }
        if (imgs.indexOf('loading') !=-1){
            Alert.show('图片上传中')
            return
        }
        if ( submitOk ) {
            Alert.show('只需要提交一次哦')
        }
        this.setState({
            loading:true
        })
        //禁用外层页面滚动条
        const isInYuantuApp = util.isInYuantuApp()
        if (isInYuantuApp) {//在远图App中
            hybridAPI.interceptRefreshLayout(true)
        } else {
            document.body.style.overflow = 'hidden'
            document.body.ontouchmove = function () {
                event.preventDefault
            };//阻止body的滑动事件
        }  
        if(this.isGraphic=='true'){
            UserCenter.submitInquiry(this.corpId,this.deptCode,this.doctCode,inputValueHelp,inputValueInfo,imgs,isVisit,patientId,preDiagnosis).subscribe({
                onSuccess:(result)=>{
                    if(result.data){
                        if(result.data.submitResult==false){
                            Alert.show("创建订单失败", 2000)
                        }else{
                            this.setState({
                                inquiryData: result.data,
                                outId:result.data.outId,
                                rcDoctId: result.data.rcDoctId,
                                submit:true,
                                loading:false
                            })
                        }
                    }else{
                        Alert.show(result.msg, 2000)
                    }
                    
                },
                onError:(res)=>{
                    this.setState({
                        loading: false
                    })
                    Alert.show(res.msg, 2000)
                }
            }).fetch()
        }else{
            UserCenter.appointCreateOrder(this.regMode, this.scheduleId, this.corpId, this.regType, this.deptCode, this.doctCode, this.medDate, appoNo, this.medAmPm, patientId, medBegTime, medEndTime, extend, optType,'', this.unionId ,inputValueInfo,imgs,inputValueHelp,isVisit,preDiagnosis).subscribe({
                onSuccess:(result)=>{
                    let data = result.data
                    this.setState({
                        outId:data.idStr,
                        loading:false,
                        submit:true
                    })
                },
                onError:(result)=>{
                    Alert.show(result.msg)
                    this.setState({
                        loading:false
                    })
                    setTimeout(()=>{
                        window.location.reload()
                    },2000)
                }
            }).fetch();
        }    
    }

    //获取支付状态的回调函数
    onPayComplate(isOkay) {
        let { outId, inquiryData } = this.state;
        const isInYuantuApp = util.isInYuantuApp()
        if (isInYuantuApp) {//在远图App中
            hybridAPI.interceptRefreshLayout(false)
        } else {
            //恢复页面滚动条及上下拉功能
            document.body.style.overflow = 'scroll'
        }
        setTimeout(() => {
            this.setState({ submit: false })
            let href
            if(isOkay){
                if(isInYuantuApp){
                    this.isGraphic == "true"?
                    hybridAPI.createConsultation(inquiryData.rcDoctId, inquiryData.rcUserId, inquiryData.patientIm, inquiryData.doctIm, inquiryData.doctCode, inquiryData.doctName, inquiryData.deptCode, inquiryData.corpId, this.unionId, inquiryData.illnessImg, inquiryData.illnessDesc,
                    inquiryData.id):window.location.href = util.flatStr("./patient-order.html?", {
                        corpId: this.corpId,
                        unionId: this.unionId,
                        id: outId,
                        flag: 1,
                        target: "_blank"
                    })
                }else{
                    this.isGraphic == "true" ?this.sendTextMessage():null
                    this.isGraphic == "true" ? "" :window.location.href = util.flatStr("./patient-order.html?", {
                        corpId: this.corpId,
                        unionId: this.unionId,
                        id: outId,
                        flag: 1,
                        target: "_blank"
                    })
                }
            }else{
                href = this.isGraphic == "true" ? "./inquire-details.html?doctName=" + this.doctName + "&rcDoctId=" + this.state.rcDoctId + "&doctCode=" + this.doctCode + "&deptCode=" + this.deptCode + "&corpName=" + this.corpName + "&regMode=" + this.regMode + "&docLogo=" + this.doctLogo + "&doctSex=" + this.doctSex + "&patient_sex=" + cache.get('patientSex') + "&":"./patient-order.html?"
                window.location.href = util.flatStr(href, {
                    corpId: this.corpId,
                    unionId: this.unionId,
                    id: outId,
                    flag: 1,
                    target: "_blank"
                })
            }
            
        }, 2000)
    }

    //取消支付
    onPayCancel() {
        let { outId} = this.state;
        const isInYuantuApp = util.isInYuantuApp()
        if (isInYuantuApp) {//在远图App中
            hybridAPI.interceptRefreshLayout(false)
        } else {
            //恢复页面滚动条及上下拉功能
            document.body.style.overflow = 'scroll'
        }
        this.setState({ submit: false,loading:true })
        if(!outId){
            return;
        }
        let href = (this.isGraphic == "true") ? ("./inquire-details.html?doctName=" + this.doctName + "&rcDoctId=" + this.state.rcDoctId + "&doctCode=" + this.doctCode + "&deptCode=" + this.deptCode + "&corpName=" + this.corpName + "&regMode=" + this.regMode + "&docLogo=" + this.doctLogo + "&doctSex=" + this.doctSex + "&patient_sex=" + cache.get('patientSex') + "&"):("./patient-order.html?");
        window.location.href = util.flatStr(href, {
            corpId: this.corpId,
            unionId: this.unionId,
            id: outId,
            flag: 1,
            target: "_blank"
        })
    }
}

//设置时间弹出框样式
const styles = {
    tips: {
        position: "fixed",
        height: "286px",
        bottom: "-286px",
        opacity: '0',
        width: "100%",
        zIndex: '9999',
        backgroundColor: "#ffffff",
        transition: " all .5s",
    },
    title: {
        display: "flex",
        height: "46px",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 15px",
        boxSizing: "borderBox",
        borderBottom: '1px solid #d2d2d2'
    },
    sourceList: {
        position: 'absolute',
        width: "100%",
        padding: '0',
        fontSize: "11px",
        boxSizing: "border-box",
        height: "216px", 
        overflowY: "scroll",
        WebkitOverflowScrolling: 'touch',
        cursor: "pointer",
    },
    sourceItem: {
        width: "100%",
        color: "#ccc",
        fontSize:"14px",
        textAlign: "center",
        marginTop:'15px',
        borderSizing: "borderBox"
    }

}
function mapStateToProps ({ createConsultation }) {
    return { 
      ...createConsultation
    }
  }
  
export default connect( mapStateToProps )( PatientAudio )