import React from 'react'
import  './fill-info.less'
import Alert from './component/alert/alert'
import util from './lib/util'
import cache from './lib/cache'
import UserCenter from './module/UserCenter'
import DataCenter from './module/DataCenter'
import SelectPatient from './component/patient/SelectPatient'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import Modal from './component/modal/Modal'
import SearchBar from './component/searchbar/SearchBar'
import Loading from './component/loading/Loading'
import hybridAPI from './lib/hybridAPI'
import Picker from './component/Picker/Picker'

let list=[
    '先做检查,拿到结果后来找我',
    '用药定期复诊',
    '住院治疗',
    '暂不治疗,定期观察复诊',
    '其他'
]
export default class FillInfo extends SmartBlockComponent{
    constructor(props){
        super(props)

        const query=util.query()
        this.unionId=query.unionId;
        this.corpId=query.corpId;
        this.doctCode=query.doctCode;
        this.rcDoctId=query.rcDoctId;
        this.deptCode=query.deptCode;
        this.docLogo=query.docLogo;
        this.doctName=query.doctName;

        this.state = {
            success:true,
            loading:true,
            currentPatientName:'',//当前选中的就诊人姓名
            patientId:'',//患者id
            date:'',//最近就诊日期
            patients:[],
            value:'',//疾病名称
            showSelectPatient:false,//选择就诊人
            showSelectDate:false,//选择日期
            selectedKey:100,//点击被选中的key 
            selectedVal:'',//选择门诊建议
            sex:'',//患者性别
            color2:true,//未确诊被选中样式  为true没有被选中  为false 被选中
            color1:true,//已确诊被选中样式 为true没有被选中  为false 被选中
            istreat:false,
            show:false,//底部弹框是否显示
            searchValue:'',//搜索的疾病关键字
            showWait:false,
            data:[],//搜索的相关疾病数据
            isShow:false,//日期选择器 显示控制
            readOnly:false,//控制提交按钮样式 以及 是否可点击 false可点击  true不可点击
        }

        //在webview 点击返回页面步数
        if(util.isInYuantuApp()){
            hybridAPI.popToTimeViewController(false,2,false)
        }
        
        if(!util.isLogin()){
            util.goLogin()
        }
        
        this.appKey = cache.get('appKey');
        this.token = cache.get('patientToken');
    }

    componentDidMount(){
        this.getPatientList();
        this.init();
    }


    //融云初始化
    init() {
        let _this = this
        RongIMClient.init(this.appKey)
        //初始化自定义消息
        let messageName = "Custom"; 
        let objectName = "app:custom"; 
        let mesasgeTag = new RongIMLib.MessageTag(true,true);
        let prototypes = ['content'];
        RongIMClient.registerMessageType(messageName,objectName,mesasgeTag,prototypes);
        RongIMClient.setConnectionStatusListener({
            onChanged(status) {
                switch (status) {
                    case RongIMLib.ConnectionStatus.CONNECTED:
                        break;
                }
            }
        });
        RongIMClient.setOnReceiveMessageListener({
            onReceived(message) {}
        })

        RongIMClient.connect(this.token, {
            onSuccess() {},
            onTokenIncorrect() { Alert.show('token无效'); },
            onError(errorCode) { Alert.show('出现错误') }
        })

    }

    //发送自定义消息给医生
    sendMessageToDoc(id) {
        let {currentPatientName,date,value,selectedVal,sex,istreat}=this.state;
        let newInfo=[
            {'患者':currentPatientName},
            {'疾病名称':istreat?value:'未确诊'},
            {'当前治疗情况':selectedVal},
            {'就诊日期':date}
        ]
        let content= {
                newTitle:"患者诊后报到成功",
                newInfo,
                extra:[
                    '您已报到成功，待医生上线后可回复您的咨询。您可继续给医生留言或上传检查资料等',
                        '如有疑问，可点击咨询医生助手'
                ],
                type:'checkIn'
        }
        let _this = this
        //发送自定义消息
        var conversationType = RongIMLib.ConversationType.PRIVATE; 

        var msg = new RongIMClient.RegisterMessage.Custom({content});
        RongIMClient.getInstance().sendMessage(conversationType,this.rcDoctId, msg, {
        onSuccess(message){
            if(util.isInYuantuApp()){
                _this.goApp(id)
            }else{
                location.href = util.flatStr('./chat-details.html?',{
                    doctName:_this.doctName,
                    rcDoctId:_this.rcDoctId,
                    docLogo:_this.docLogo,
                    patient_sex:_this.state.sex,
                    target:'_blank',
                    unionId:_this.unionId,
                    corpId:_this.corpId,
                    deptCode:_this.deptCode,
                    doctCode:_this.doctCode,
                    serverType:2
                })
                }
        },
            onError(errorCode){
                Alert.show('消息发送失败,无法进入聊天页面')
            }
        });

    }
    
    //选择就诊人
    getPatientList(){
        UserCenter.getPatientList(this.corpId, this.unionId)
        .subscribe({
          onSuccess:(result)=>{
            let currentPatientName,sex,patientId;
            let patientList = result.data
            patientList.map((item, index)=>{
              if(item.default||index == 0){
                //选中第一个就诊人或者有默认就诊人
                currentPatientName = item.patientName
                sex = item.sex
                patientId=item.id
              }
            })
    
            this.setState({
                loading:false,
                patients:patientList,
                patientId,
                currentPatientName,
                sex,
            });
    
          },
          onError:(result)=>{
           Alert.show(result.msg)
          }
        })
        .fetch();
    }

    //更换就诊人
    changePatient(id, patientName, item){
       this.setState({
            currentPatientName:patientName,
            sex:item.sex,
            patientId:id,
            showSelectPatient:false
       })
    }

    //输入疾病受控
    handleChange(e){
        this.setState({
            value:e.target.value
        })
    }

    //选择疾病建议
    Onselect(val,key){
        let {selectedKey}=this.state
        if(selectedKey!=key){
            this.setState({
                selectedKey:key,
                selectedVal:val
            })
        }
    }

     //点击就诊过
     isTreat() {
        this.setState({
            istreat: true,
            color2: true,
            color1:false,
        })
    }

    //点击未就诊过
    isNoTreat() {
            this.setState({
                istreat: false,
                color2: false,
                color1:true,
                value:''
            })
    }

    //跳转慧医App聊天页面
    goApp(id){            
        hybridAPI.checkIn(this.rcDoctId,id,3,)
    }

    //提交
    submit(){
        let _this = this
        let {date,selectedVal,currentPatientName,value,patientId,istreat,color2,color1}=this.state
        if(!currentPatientName){
            Alert.show('请选择就诊人')
            return
        }
        if(!selectedVal){
            Alert.show('请选择疾病建议')
            return
        }
        if(istreat&&!value){
            Alert.show('请输入疾病名称')
            return
        }
        if(color1&&color2){
            Alert.show('请选择是否已确诊')
            return
        }
        if(!date){
            Alert.show('请输入最近就诊日期')
            return
        }
        //提交接口
        UserCenter.submitFillInfo(this.corpId,this.deptCode,this.doctCode,value,date,patientId,selectedVal)
        .subscribe({
        onSendBefore(){
            _this.setState({
                    readOnly:true
                })
            },
            onComplete(){
            
            },
          onSuccess:result=>{
              Alert.show('下单成功,正在跳转...')
              if(result.success){
                  this.sendMessageToDoc(result.data.id)
              }
          },
          onError:(result)=>{
           Alert.show(result.msg)
           _this.setState({
            readOnly:false
            })
          }
        })
        .fetch();
    }

    //疾病输入框获得焦点
    focus(){
            //底部弹出输入框
        this.setState({
            show:true,
            data:''
            },()=>{
                if(util.isInYuantuApp()){
                    hybridAPI.interceptRefreshLayout(true)
                }
            })
        
    }

    //点击选择就诊人
    selectePatient(){
        let {showSelectPatient}=this.state
            this.setState({showSelectPatient:!showSelectPatient})
    }

    //搜索疾病输入框受控
    changeValue = (z) => {
        let {data}=this.state
        const value = z.target.value
        , trimStr = value.replace(/(^\s*)|(\s*$)/g, "");
    
        this.setState({
          searchValue: trimStr,
          data:trimStr.length==0?[]:data,
        })
        
        clearTimeout(this.timer)
        this.timer = setTimeout(() => {
          if (value) {
            this.setState({
              showWait: true,
            })
            const self = this
            DataCenter.getTips(trimStr, this.unionId).subscribe({
              onSuccess(result) {
                self.setState({
                  data: result.data,
                  showWait: false
                })
              }
            }).fetch()
          }
        }, 1000)
    }

    //点击疾病信息
    getValue(val){
        let {value}=this.state
        this.setState({
            value:val,
            show:false,
        })
    }

    //取消选择搜索疾病
    cancelSearch(){
        this.setState({
            show: false
        })
    }

    //选择日期
    pickDate(){
        this.setState({
            isShow:true
        },()=>{
        if(util.isInYuantuApp()){//在远图App中
            hybridAPI.interceptRefreshLayout(true)
        }
            this.afterOpen()
        })
    }

    //日期选择组件弹出后
    afterOpen(){
        this.scrollTop = document.scrollingElement.scrollTop;
        document.body.style.position = 'fixed';
        document.body.style.top = -this.scrollTop + 'px';
      }

    //日期选择组件隐藏
    beforeClose() {
        document.body.style.position = 'static';
        document.scrollingElement.scrollTop = this.scrollTop;
      }

    //确认选择日期
    onConfirm(date){
        this.setState({
            isShow:false,
            date:`${date.first}-${date.second}-${date.thrid}`
        },()=>{
            if(util.isInYuantuApp()){//在远图App中
                hybridAPI.interceptRefreshLayout(false)
            }
            this.beforeClose()
        })
    }

    render(){
        let {
                patients,
                selectedKey,
                color1,
                color2,
                showSelectDate,
                currentPatientName,
                value,
                data,
                showWait,
                readOnly,
                show,
                date,
                isShow,
                istreat, 
                showSelectPatient}=this.state
        return(
            <div className="fill-info">
                <ul className="list-ord">
                    <li className="list-item">
                        <a className="txt-arrowlink list-link-wrapper"
                    onClick={()=>this.selectePatient()}
                    >
                            <div className="list-content">选择就诊人</div>
                            <div className="list-extra">{currentPatientName || "请选择就诊人"}</div>
                        </a>
                    </li>
                    <div style={{width:'100%',height:'10px',backgroundColor:'#f0f0f0'}}></div>
                    <li className="list-item">
                        <div className="list-content" style={{color:'#0084ff',fontFamily:'PingFangSC-Regular',fontSize:'14px'}}>
                        由于门诊患者较多，请填写以下信息，以便了解到您的问题，尽快回复您。
                        </div>
                    </li>
                    <li className="list-item">
                        <a className="txt-arrowlink list-link-wrapper"
                    onClick={()=>{
                        this.setState({showSelectDate:!showSelectDate})
                    }}

                    >
                            <div className="list-content">最近就诊日期</div>
                            {date?<div className="list-extra" onClick={()=>this.pickDate()} ref='date'>{date}</div>:
                            <div className="list-extra" onClick={()=>this.pickDate()} ref='date'>请选择日期</div>}
                        </a>
                    </li>
                    <li className="list-item">
                        <div className="list-content txt-nowrap list-txt-cc">
                            <div className="list-title txt-nowrap list-left">是否已确诊</div>
                            <div className={color2 ? "list-extra list-border" : "list-extra list-border list-back"} 
                            onClick={this.isNoTreat.bind(this)}
                            >未确诊</div>
                            <div className={color1? "list-extra list-border" : "list-extra list-border list-back"} 
                            onClick={this.isTreat.bind(this)}
                            >已确诊</div>
                        </div>
                    </li>
                    {
                        istreat?
                            <li className="list-item">
                                <a className="txt-arrowlink list-link-wrapper" onClick={()=>this.focus()}>
                                    <div className="list-content">疾病诊断</div>
                                    {
                                        value?<div className="list-extra">{value}</div>:
                                        <div className="list-extra">请输入疾病名称</div>
                                    }
                                </a>
                            </li>
                        :null
                    }
                    <div style={{width:'100%',height:'10px',backgroundColor:'#f0f0f0'}}></div>
                    <li className="list-item">
                        <div className="list-content">在门诊给您的建议:</div>                        
                    </li>
                    {
                        list.map((val,key)=>{
                        return <li className="list-item" key={key} onClick={()=>this.Onselect(val,key)}>
                                    <div className="list-content">
                                    <span className={'checkedSty '+(key==selectedKey?'selectedKey':'')}></span>
                                    <span style={{marginLeft:'30px'}}>{val}</span>
                                    </div>                        
                                </li>
                            })
                    }
                </ul>
                <div className="btn-wrapper" style={{marginTop:'20px'}}>
                    <button className="btn btn-block" 
                    style={btnStyle} 
                    id={readOnly?'btn_disabled':''}
                    onClick={!readOnly&&this.submit.bind(this)}>提交</button>
                </div>
                <SelectPatient
                    display={showSelectPatient}
                    patients={patients}
                    onChange={this.changePatient.bind(this)}
                    onCancel={()=>{
                        this.setState({showSelectPatient:!showSelectPatient})
                    }}
                />
                <Modal
                    show={show}
                    style={{height:'100%'}}
                    onCancel={() => this.setState({
                        show: false
                    },()=>{
                        if(util.isInYuantuApp()){
                            hybridAPI.interceptRefreshLayout(false)
                        }
                    })}
                    header={
                        <div className='search_top'>
                            <SearchBar
                            placeholder="搜索疾病、症状"
                            ref="searchBar"
                            style={{display:'flex'}}
                            onChange={this.changeValue}
                            ele={
                                <div className='search_cancel' onClick={()=>this.cancelSearch()}>
                                    <span>取消</span>
                                </div>
                            }
                            />
                        </div>
                    }
            >
            {/* 疾病显示区域 */}
            <ul className='ul_data'>
                {data.length!=0&&data.map((val,key)=>{
                    return <li key={key} onClick={()=>this.getValue(val)}>
                            {val}
                    </li>
                })}
                {
                   !showWait&&data.length == 0?
                   <div className="notice">
                    <span className="notice-icon icon-record"></span>
                     <p>暂无数据</p>
                   </div>
                    :null 
                }
                 <Loading display={showWait}/>
            </ul>
            </Modal>
            <Picker
            type={'date'}
            isShow={isShow}
            onCancel={() => this.setState({
                    isShow: false
                },()=>{
                        if(util.isInYuantuApp()){//在远图App中
                            hybridAPI.interceptRefreshLayout(false)
                        }
                        this.beforeClose()
                    }
                )}
            onConfirm={this.onConfirm.bind(this)}/>
            </div>
        )
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