import React from 'react'
import util from './lib/util'
import './chat-details.less'
import Alert from './component/alert/alert'
import Confirm from './component/confirm/Confirm2'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import UserCenter from './module/UserCenter'
import qiniu from './component/RongCloud/qiniu'
import upload from './component/RongCloud/upload'
import init_2 from './component/RongCloud/init'
import cache from './lib/cache'     
//移动端图片预览组件
import WxImageViewer from 'react-wx-images-viewer'
export default class ChatDetails extends SmartBlockComponent {
    constructor(props){
        super(props)
        const query = util.query()
        document.title = query.doctName + '医生'
        this.doctName = query.doctName
        this.doctId = query.rcDoctId

        this.unionId = query.unionId
        this.corpId = query.corpId
        this.doctCode = query.doctCode
        this.deptCode = query.deptCode
        this.corpName = query.corpName
        this.doctName = query.doctName
        this.regMode = query.regMode
        this.docLogo = query.docLogo||'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/d192eea2ee86e15b3016d0df4b8a999a-174-174.png'//医生头像
        this.patient_sex = query.patient_sex || '1'//患者性别 1男 2女

        this.patient_sex == 1?this.patientLogo = 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/e62b4b358cd9194444dc785facf70764-198-198.png':
        this.patientLogo = 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/17c992417182bad4897a50ec5f02de81-198-198.png'

        this.isFinished = query.isFinished,//1 不显示会话结束按钮,可继续发消息  2 显示会话结束,不可发消息   注意是字符串
        
        this.serverType = query.serverType||'1'//本次服务类型   为1默认  图文问诊  为2  报到
        this.state = {
            success: true,
            loading: true,
            textMes:'',//文字消息
            sendBtn:false,//输入框输入 点击发送按钮状态
            historyMesList:[],//消息历史记录列表
            customMessage:[],//历史记录中的自定义消息
            allMesList:[],//当前聊天所有的消息列表
            isShowEmojiList:false,//是否显示表情列表
            emojiList:[],//表情列表
            isPlay:false,//音频播放状态,默认暂停
            isShowExtends:false,//显示图片等拓展功能 默认不显示
            showloading:'',//是否显示加载中...
            hasMsg:false,//是否还有历史记录 默认没有
            isEndInquiry:false,//是否确认结束问诊
            isFinished:this.isFinished,//该问诊服务是否已完成 
            picList:[],//预览图片列表
            history_count:1,//第几次请求历史记录 默认第一次
            index: 0,//记录图片预览时 当前的图片索引
            isOpen: false,//是否结束预览图片,
            timeOut:false,//当前问答时间是否已达上限
            inquiryFee:'',//医生问诊价格
            helperId:'',//该医生是否关联医生助手 默认没有值 没有关联
        }

        this.appKey = cache.get('appKey');
        this.token = cache.get('patientToken');
    }
    
    componentDidMount(){
        this.init()
        //获取医生图文问诊价格
        if(this.state.isFinished==2){
            UserCenter.getInquiryFee(this.corpId,this.doctCode,this.doctId)
            .subscribe({
                onSuccess:result=>{
                    this.setState({
                        inquiryFee:result.data.inquiryFee
                    })
                },
                onError:result=>{
                    Alert.show(result.msg)
                }
            })
            .fetch()
        }
        //查询医生是否关联医生助手
        this.haveHelper()
    }

    haveHelper(){
        let {helperId}=this.state
        UserCenter.getDoctHelperInfo(this.doctId)
            .subscribe({
                onSuccess:result=>{
                if(result.success){
                    this.setState({
                        helperId:result.data.rcDoctId//慧医助手融云id,
                        })
                    }
                }
            })
            .fetch()
    }

    /**
     * 以下2个方法是内容区域滑动方法
     */

    //触摸开始
    touchstart(e){
        this.y = e.changedTouches[0].pageY
        this.setState({//图片,表情列表隐藏
            isShowExtends:false,
            isShowEmojiList:false,
        })
    }

    //触摸结束
    touchend(e){
        this.Y = e.changedTouches[0].pageY
        if(this.Y == this.y && e.target.id == 'goDoctor'&&this.serverType==1){
            //说明是点击医生头像,跳转到医生主页
            this.goDoctor()
        }
        if(this.Y == this.y && e.target.id == 'voice'){
            //说明是点击音频
            this.playVoice({content:e.target.dataset.content,duration:e.target.dataset.duration})
        }
        if(this.Y-this.y>=50&&this.refs.containerTop.scrollTop==0&&this.state.hasMsg){
            //加载更多历史记录条件:1.向下滑动距>50;2.页面在顶部;3.还有历史记录可加载
            this.setState({
                    showloading:true,//显示loading元素
                },()=>{
                    setTimeout(()=>{
                        this.getHistory(10)//发起请求历史记录
                    },1000)
                })
            } 
    }

     //点击医生头像去到医生主页
     goDoctor(){
       location.href = util.flatStr('./doctor.html?',{
            target:'_blank',
            unionId: this.unionId,
            corpId:this.corpId,
            doctCode:this.doctCode,
            deptCode : this.deptCode,
            corpName : this.corpName,
            doctName : this.doctName,
            regMode : this.regMode

        })
    }

    //初始化&接收消息
    init(){
        let _this = this
        let type = ['TextMessage','ImageMessage','VoiceMessage','CommandMessage']
        RongIMClient.init(this.appKey);  
        //初始化表情
        let config = {
            size: 24, 
            url: "//f2e.cn.ronghub.com/sdk/emoji-48.png", 
            lang: "zh", 
          };
          RongIMLib.RongIMEmoji.init(config); 

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
            onReceived(message){
                // 判断消息类型
                let arr;
                let picList_2 = _this.state.picList;
                switch(message.messageType){
                    case RongIMClient.MessageType.TextMessage://文字消息
                    let textMessage = RongIMLib.RongIMEmoji.symbolToEmoji(message.content.content)//转换原生表情
                    message.content.content = textMessage//更新转换后的内容
                    arr = [message]
                    break;
                    case RongIMClient.MessageType.ImageMessage://图片消息
                        arr = [message]
                        picList_2.push(message.content.imageUri)
                    break;
                    case RongIMClient.MessageType.VoiceMessage://音频消息          
                    arr = [message]
                    break;
                    case RongIMClient.MessageType.CommandMessage://命令消息  
                    console.log('CommandMessage命令',message)        
                   if(message.content.name == 'overInterrogation' ){
                       //来自医生的结束问诊请求
                       console.log('来自医生的结束问诊请求',message)
                        _this.confirm()
                        return
                   }
                    break;
                }
               
                let hasType = type.some((ele)=>{
                        if(ele==message.messageType){
                                return true
                        }
                    })
                if(hasType){
                     //逐一拼接接收到的消息
                    let allMesList_2  = _this.state.allMesList.concat(arr)
                    _this.setState({
                        allMesList:allMesList_2,
                        picList:picList_2,
                    },()=>{
                        // 内容过多时,将滚动条放置到最底端  
                        _this.refs.containerTop.scrollTop=_this.refs.containerTop.scrollHeight;
                    })
                }
                
            }   
        })
       
        // 5.连接融云服务器
        RongIMClient.connect(this.token, {
            onSuccess() {_this.getHistory()},
            onTokenIncorrect() {Alert.show('token无效');},
            onError(errorCode){Alert.show('出现错误')}
        })
      
    }

    //读取历史聊天记录
    getHistory(num){
        let _this = this
        let count = num || 10//每次读取记录条数
        let timestrap = null
        RongIMClient.getInstance().getHistoryMessages(RongIMLib.ConversationType.PRIVATE, this.doctId, timestrap, count, {
            onSuccess(list, hasMsg){
                let history_count_2 = _this.state.history_count
                let picList_2 = _this.state.picList
                let list_2 = [];
                let customMessage;//储存改造后的自定义消息
                for(let value of list){
                    if(value.messageType == 'TextMessage'){
                        value.content.content = RongIMLib.RongIMEmoji.symbolToEmoji(value.content.content)//转换原生表情
                    }
                    if(value.objectName == 'app:custom'){
                        customMessage=value.content.message.content.content.newInfo
                    }
                    list_2.push(value)
                }
                let historyMesList_2 = list_2.concat(_this.state.historyMesList)
                let list_reverse = list_2.reverse()
                if(_this.state.history_count == 1){
                    for(let value of list){
                        if(value.messageType == 'ImageMessage'){
                            picList_2.push(value.content.imageUri)
                        }
                    }
                }else{
                    for(let value of list_reverse){
                        if(value.messageType == 'ImageMessage'){
                            picList_2.unshift(value.content.imageUri)
                        }
                    }
                }
               
                _this.setState({
                    historyMesList:historyMesList_2,
                    loading:false,
                    picList:picList_2,
                    hasMsg,
                    showloading:false,
                    customMessage,
                    history_count:history_count_2+1,
                })

            },
            onError(error){Alert.show('拉取历史记录错误')}
          });
    }

    //文本框受控
    changeValue = (z) => {
        const value = z.target.value
        let _this = this 
        _this.setState({
            textMes:value,
            sendBtn:value?true:false
          },()=>{

          })
    
    }  
    
    //输入框获得焦点
    getFocus(e){
        this.setState({
            isShowEmojiList:false,
            isShowExtends:false,
        },()=>{
            setTimeout(()=>{
                this.refs.text.scrollIntoView(true)  //H5新属性解决键盘遮挡输入框
            },300)
            this.refs.containerTop.scrollTop=this.refs.containerTop.scrollHeight;
        })
    }

    //输入框失去焦点
    loseFocus(e){
        let {textMes}=this.state
        this.setState({
            sendBtn:textMes?true:false,
        })
    }
    
    //点击发送文字(含表情)消息
    sendTextMessage(){
        let {textMes} = this.state　
        let _this = this
            if(textMes == ''){
                Alert.show('您的输入不能为空')
                return 
              }
            let content_2 = RongIMLib.RongIMEmoji.symbolToEmoji(textMes)
            let msg=new RongIMLib.TextMessage({content:content_2});
            let conversationtype = RongIMLib.ConversationType.PRIVATE; // 私聊
            let targetId = _this.doctId
            RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
                        // 发送消息成功
                        onSuccess(message){
                          let allMesList_3 = _this.state.allMesList.concat([{content:{content:textMes},messageDirection:'1',sentTime:new Date().getTime()}])
                            _this.setState({
                                allMesList:allMesList_3,
                                textMes:'',//文本框置空
                                sendBtn:false,
                            },()=>{
                                _this.refs.text.value = ''//文本框置空
                                // 内容过多时,将滚动条放置到最底端  
                                _this.refs.containerTop.scrollTop=_this.refs.containerTop.scrollHeight;
                            })
                        },
                        onError(errorCode, message){Alert.show('发送失败')}
                    }
            )
    }

    //点击+号
    add(e){
        e.stopPropagation()
        this.setState({
            isShowExtends:true,
            isShowEmojiList:false
        },()=>{
            this.refs.containerTop.scrollTop=this.refs.containerTop.scrollHeight;
        })
    }

    //图片上传
    upload(){
        let _this = this
        let _files = this.refs.file.files;
        let config = { 
			domain: 'http://upload.qiniu.com',
			fileType: RongIMLib.FileType.IMAGE,
			getToken(callback){//获取getToken
				RongIMClient.getInstance().getFileToken(this.fileType, {
					onSuccess(data){
						callback(data.token);
					}
				});
			}
        };

        let callback = {
			onCompleted(data){ 
                var fileType = RongIMLib.FileType.IMAGE;
				RongIMClient.getInstance().getFileUrl(fileType, data.filename, null, {
					onSuccess(result){
						data.downloadUrl = result.downloadUrl;
                        _this.sendPicMessage(data.thumbnail,data.downloadUrl)
					},
				});
			} ,
            onProgress:function(){},
            onError	: function (errorCode) {Alert.show('图片上传错误')},
        };

        //上传到千牛
        for(let value of _files){
            init_2.initImage(config, function(uploadFile){
                uploadFile.upload(value, callback);
            });
        }
        
    }

    //发送图片消息
    sendPicMessage(_content,downloadUrl){
        let _this = this
        let picList_2 = _this.state.picList
        var msg = new RongIMLib.ImageMessage({content:_content,imageUri:downloadUrl});
        var conversationtype = RongIMLib.ConversationType.PRIVATE; 
        var targetId = _this.doctId; 
        RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
                onSuccess(message) {
                    picList_2.push(downloadUrl)
                    let allMesList_3 = _this.state.allMesList.concat([{content:{content:_content,imageUri:downloadUrl},extra:"附加要传递的值",messageDirection:'1',messageType:'ImageMessage',sentTime:new Date().getTime()}])
                            _this.setState({
                                allMesList:allMesList_3,
                                textMes:'',
                                picList:picList_2,
                                isShowExtends:false,//隐藏图片等功能
                            },()=>{
                                // 内容过多时,将滚动条放置到最底端  
                                _this.refs.containerTop.scrollTop=_this.refs.containerTop.scrollHeight;
                            })
                },
                onError(errorCode,message) {Alert.show('发送图片失败')}
            }
        );
    }

    //确认结束发送command命令消息给医生
    sendCommandMessage(){
        let _this = this
        let msg = new RongIMLib.CommandMessage({name:'overInterrogation'});
        let conversationtype = RongIMLib.ConversationType.PRIVATE; 
        let targetId = _this.doctId; 
        RongIMClient.getInstance().sendMessage(conversationtype, targetId, msg, {
                onSuccess(message) {
                    _this.setState({
                        isFinished:2
                    })
                },
                onError(errorCode,message) {
                    Alert.show('发送失败')
                }
            }
        );
    }

    //表情列表显示
    showEmojiList(){
        //获取 Emoji 列表
        let list = RongIMLib.RongIMEmoji.list;
        this.setState({
            isShowEmojiList:true,
            emojiList:list,
            isShowExtends:false
        },()=>{
            this.refs.containerTop.scrollTop=this.refs.containerTop.scrollHeight;
        })
    }

    //表情选择
    selectEmoji(item){
        let {textMes} = this.state
        this.setState({
            textMes:textMes + item.emoji,
            sendBtn:true,
        })
    }

    /**
     * 图片预览相关方法
     */

    //点击回到图片列表页
    onClose(){
        this.setState({
          isOpen: false
        })
    }

    //是否确认结束问诊
    confirm(){
        let _this = this;
        this.setState({
        display: true,
        title: "医生已给出诊断意见,申请结束问诊",
        des: true,
        confirmCallback(confirm) {
            _this.setState({
                display: false,
            })
            if (confirm) {
                //发送command命令
                _this.sendCommandMessage()
            }
        }
        })
    }

    //点击预览图片
    openViewer (url){
        let {picList}=this.state
        let index = picList.findIndex((ele)=>{
            return ele == url
        })
        this.setState({
            index,
            isOpen: true
        })
    }
    
    //音频播放与暂停
    playVoice(audioFile){
        RongIMLib.RongIMVoice.init();//初始化音频  
        let {isPlay} = this.state
        if(!isPlay){
            this.setState({
                isPlay:true
            })

            RongIMLib.RongIMVoice.preLoaded(audioFile.content, ()=>{
                    if(!isPlay){
                        // 播放声音
                        RongIMLib.RongIMVoice.play(audioFile.content, audioFile.duration);
                        setTimeout(()=>{//播放结束后暂停
                            this.setState({
                                isPlay:false
                            },audioFile.duration*1000)
                        })
                    }
                })
                
        }else{
            this.setState({
                isPlay:false
            },()=>{
                    //停止播放
                RongIMLib.RongIMVoice.stop(audioFile.content);
            })
        }
        
    }

    //点击跳转医生助手
    goHelper(){
        let {helperId}=this.state
        let href = util.flatStr('./report-doc-helper.html?',{
            helperId,
            unionId:this.unionId, 
            corpId:this.corpId,
            target:'_blank'
        })

        location.href=href
            
    }

    //点击继续问诊跳转到图文问诊信息填写页面
    continue(){
        location.href=util.flatStr('./patient-audio.html?',{ 
            corpId:this.corpId, 
            deptCode:this.deptCode, 
            doctCode:this.doctCode, 
            corpName:this.corpName,
            doctName:this.doctName,
            unionId:this.unionId, 
            isGraphic:true,
            doctLogo:this.docLogo,
            target:'_blank'
        })
    }

    render(){
        /**
             * 页面布局:
             * <div>
             *      <div>==>上部
             *          <div></div>==>顶部提示
             *          <div></div>==>加载更多
             *          <div>==>聊天历史记录
             *              <div>==>左边医生消息回复区域
             *                  <div></div>==>时间显示
             *                  <div></div>==>医生回复
             *              </div>
             *              <div>==>右边患者消息发送区域
             *                  <div></div>==>时间显示
             *                  <div></div>==>患者发送
             *              </div>
             *          </div>
             *          <div>==>当前正在聊天内容
             *              <div></div>==>左边医生消息回复区域
             *              <div></div>==>右边患者消息发送区域
             *          </div>
             *      </div>
             *      <div>==>底部
             *          <div></div>==>输入框菜单
             *          <div></div>==>表情/图片弹出框
             *      </div>
             * </div>
             */
            let{
                index,
                hasMsg,
                isOpen,
                isPlay,
                textMes,
                sendBtn,
                timeOut,
                picList,
                duration,
                helperId,
                emojiList,
                isFinished,
                inquiryFee,
                allMesList,
                showloading,
                isEndInquiry,
                isShowExtends,
                customMessage,
                historyMesList,
                isShowEmojiList,
                cancelText, okText, confirmCallback, display, title, des} = this.state
        //自定义消息app:custom改造
        let arr = []
        if(customMessage){
            /*可以这么做的原因是自定义消息对象只有一个属性
               [
                    {a:'1'},
                    {b:'2'}
                ]
            */
            for(let i=0,length = customMessage.length-1;i<=length;i++){
                for(let key in customMessage[i]){
                    arr.push([key,customMessage[i][key]])
                }
            }
        }
        return(
            <div className="chat-details">
                <div className="container_top"
                    ref="containerTop"
                    onTouchStart={this.state.hasMsg&&this.touchstart.bind(this)}
                    onTouchEnd={this.state.hasMsg&&this.touchend.bind(this)}>
                    {
                        this.serverType==1?
                        <div className="_top">
                            <div className="left_line line"></div>
                            <div className="top_tips">医生的回复仅为建议，具体诊疗请前往医院进行</div>
                            <div className="left_line line"></div>
                        </div>:null
                    }
                    {
                        showloading && hasMsg?<div className="history_tips">
                                <span className="icon-h-loading"></span>
                                <span style={{marginLeft:'10px'}}>加载中...</span>
                            </div>:null
                    }
                    <div className="chat_content" ref="chatContent">
                    {
                        historyMesList.map((item,key)=>{
                            if(item.messageDirection == 1){
                                return  <div key={key}>
                                            <div className="nickName">
                                                {
                                                    key == 0?
                                                    <span>
                                                        {util.dateFormat_2(item.sentTime)} 
                                                    </span>:
                                                    item.sentTime - historyMesList[key-1].sentTime> 600000?
                                                    <span>
                                                        {util.dateFormat_2(item.sentTime,historyMesList[key-1].sentTime)} 
                                                    </span>:null
                                                }
                                            </div>
                                            {
                                                item.objectName == 'app:custom'?
                                                <div>
                                                    <ul className='myInfo_list'>
                                                        <li>
                                                            <div>{item.content.message.content.content.newTitle}</div>
                                                        </li>
                                                        {
                                                            arr.map((list,key)=>{
                                                                return <li key={key}>
                                                                    <div>{list[0]}</div>
                                                                    <div>{list[1]}</div>
                                                                </li>
                                                            })
                                                        }
                                                    </ul>
                                                    <div className="information">
                                                        <div className="infor_1">
                                                            {item.content.message.content.content.extra[0]}
                                                        </div>
                                                        {helperId? <div className="infor_2">
                                                            {item.content.message.content.content.extra[1]}
                                                        </div>:null}
                                                    </div>
                                                </div> 
                                                :null
                                            }
                                            {
                                                item.objectName == 'app:custom'?null:
                                                <div className="content_right">
                                                    <span  className="avatar" style={{backgroundImage:`url(${this.patientLogo})`,backgroundSize:'100%'}}/>
                                                    <div className="content">
                                                        {item.messageType == 'ImageMessage'?
                                                            <img    src={item.content.imageUri} 
                                                                    className="bubble bubble_primary right" 
                                                                    id="pic"
                                                                    onClick={()=>this.openViewer(item.content.imageUri)}/>:
                                                            <div className="bubble bubble_primary right">
                                                                <div className="bubble_cont">
                                                                    <div className="plain">{item.content.content}</div>
                                                                </div>
                                                            </div>}
                                                    </div>
                                                    {
                                                        this.serverType==1&&item.content.extra&&item.content.extra.sign == '1'?
                                                        <div className="information_time">
                                                            <div className="infor_1_time">
                                                                医生会尽快处理您的问诊，请耐心等候
                                                            </div>
                                                            <div className="infor_2_time">
                                                                医生首次回复后，问答限时48小时
                                                            </div>
                                                        </div>
                                                        :null
                                                    }
                                            </div>
                                            }
                                        </div> 
                                }
                            if(item.messageDirection == 2){
                                return  <div key={key}>
                                                    <div className="nickName">
                                                        {
                                                            key == 0?
                                                            <span>
                                                            {util.dateFormat_2(item.sentTime)} 
                                                            </span>:
                                                            item.sentTime - historyMesList[key-1].sentTime> 600000?
                                                            <span>
                                                            {util.dateFormat_2(item.sentTime,historyMesList[key-1].sentTime)} 
                                                            </span>:null
                                                        }
                                                    </div>
                                                <div className="content_left" >
                                            <span  className="avatar"
                                                    id="goDoctor"
                                                    onClick={!hasMsg&&this.goDoctor.bind(this)}
                                                    style={{backgroundImage:`url(${this.docLogo})`,backgroundSize:'100%'}}
                                                    />
                                            <div className="content">
                                                
                                                {item.messageType == 'ImageMessage'?
                                                    <img    src={item.content.imageUri} 
                                                            className="bubble bubble_default left" 
                                                            id="pic"
                                                            onClick={()=>this.openViewer(item.content.imageUri)}/>:
                                                    item.messageType == 'VoiceMessage'?
                                                    <div className="bubble bubble_default left">
                                                        <div className="bubble_cont" 
                                                                id="voice" 
                                                                style={{width:`${item.content.duration * 15}px`,minHeight:'40px'}}
                                                                onClick={!hasMsg&&this.playVoice.bind(this,item.content)}
                                                                data-content={item.content.content}
                                                                data-duration={item.content.duration}>
                                                        </div>
                                                        <span className="voiceTime">{item.content.duration}''</span>
                                                        <div className="voiceGif">
                                                            <div className="gif_1_default"></div>
                                                            <div className="gif_2_default">)</div>
                                                            <div className="gif_3_default">)</div>
                                                        </div>
                                                    </div>:
                                                    item.messageType == 'TextMessage'?
                                                    <div className="bubble bubble_default left">
                                                        <div className="bubble_cont">
                                                            <div className="plain">{item.content.content}</div>
                                                        </div>
                                                    </div>:null
                                                }
                                            </div>
                                        </div>
                                                </div>
                            }
                        })
                    }
                    {
                        allMesList.map((item,key)=>{
                            if(item.messageDirection == 1){
                                return  <div key={key}>
                                            <div className="nickName">
                                                {
                                                        key == 0?
                                                        item.sentTime - historyMesList[historyMesList.length-1].sentTime> 600000?
                                                        <span>
                                                            {util.dateFormat_2(item.sentTime,historyMesList[historyMesList.length-1].sentTime)} 
                                                        </span>:null
                                                        :item.sentTime - allMesList[key-1].sentTime> 600000?
                                                        <span>
                                                            {util.dateFormat_2(item.sentTime)} 
                                                        </span>:null
                                                        
                                                }
                                                </div>
                                                <div className="content_right">
                                            <span  className="avatar" style={{backgroundImage:`url(${this.patientLogo})`,backgroundSize:'100%'}}/>
                                            <div className="content">
                                                {item.messageType == 'ImageMessage'?
                                                    <img src={item.content.imageUri} 
                                                        className="bubble bubble_primary right" 
                                                        id="pic"
                                                        onClick={()=>this.openViewer(item.content.imageUri)}/>:
                                                    <div className="bubble bubble_primary right">
                                                    <div className="bubble_cont">
                                                        <div className="plain">{item.content.content}</div>
                                                    </div>
                                                </div>}
                                                
                                        </div>
                                </div>
                                        </div>
                            }
                            if(item.messageDirection == 2){
                                return  <div key={key}>
                                            <div className="nickName">
                                                {
                                                        key == 0?
                                                        item.sentTime - historyMesList[historyMesList.length-1].sentTime> 600000?
                                                        <span>
                                                            {util.dateFormat_2(item.sentTime,historyMesList[historyMesList.length-1].sentTime)} 
                                                        </span>:null
                                                        :item.sentTime - allMesList[key-1].sentTime> 600000?
                                                        <span>
                                                            {util.dateFormat_2(item.sentTime)} 
                                                        </span>:null
                                                        
                                                }
                                            </div>
                                            <div className="content_left" key={key}>
                                            <span  className="avatar"
                                                    id="goDoctor"
                                                    onClick={!hasMsg&&this.goDoctor.bind(this)}
                                                    style={{backgroundImage:`url(${this.docLogo})`,backgroundSize:'100%'}}
                                                    />
                                            <div className="content">
                                            
                                                {item.messageType == 'ImageMessage'?
                                                    <img src={item.content.imageUri} 
                                                        className="bubble bubble_default left" 
                                                        id="pic"
                                                        onClick={()=>this.openViewer(item.content.imageUri)}/>:
                                                        item.messageType == 'VoiceMessage'?
                                                        <div className="bubble bubble_default left">
                                                            <div className="bubble_cont" 
                                                                    id="voice" 
                                                                    style={{width:`${item.content.duration * 15}px`,minHeight:'40px'}}
                                                                    onClick={!hasMsg&&this.playVoice.bind(this,item.content)}
                                                                    data-content={item.content.content}
                                                                    data-duration={item.content.duration}>
                                                            </div>
                                                            <span className="voiceTime">{item.content.duration}''</span>
                                                            <div className="voiceGif">
                                                                <div className="gif_1_default"></div>
                                                                <div className="gif_2_default">)</div>
                                                                <div className="gif_3_default">)</div>
                                                            </div>
                                                        </div>:
                                                    <div className="bubble bubble_default left">
                                                    <div className="bubble_cont">
                                                        <div className="plain">{item.content.content}</div>
                                                    </div>
                                                </div>}
                                            </div>
                                            {isFinished==2?<div className="wait_tips end">您已结束问诊</div>:null}
                                            </div>
                                        </div>  
                            }
                        })
                    }   
                    </div>
                    {this.serverType==1&&timeOut?<div className="timeOut">已达对话时间上限,问题已自动关闭</div>:null}
                </div>
                    {
                        isFinished==2 || timeOut ?
                        <div className='continue'>
                            <div className='continue_tips'>
                            {this.serverType==1?'问诊已结束':this.serverType==2?'免费咨询时间已用完，问诊已结束!':''}
                            </div>
                            <div className='continue_btn'>                            
                                <button onClick={()=>this.continue()}>继续问诊 {util.getIntAndFloat(inquiryFee/100)}元</button>
                            </div>
                        </div>
                        :
                        <div className="bottom" ref="bottom">
                            <div className="menu">
                                <textarea 
                                    className="text" 
                                    ref="text"
                                    value={textMes}
                                    onChange={this.changeValue}
                                    onFocus={(e)=>this.getFocus(e)}
                                    onBlur={(e)=>this.loseFocus(e)}/>
                                    <div className="emoji" onClick={()=>this.showEmojiList()}></div>
                                    {
                                        !sendBtn?<div className="add" onClick={(e)=>this.add(e)}>+</div>:
                                        <div onClick={()=>this.sendTextMessage()} className="sendBtn">发送</div>
                                    }
                            </div>
                            {
                                isShowEmojiList?
                                <div className="emojiList">
                                        {emojiList.map((item,index)=>{
                                            return <div key={index} style={{fontSize:'24px'}} onClick={()=>this.selectEmoji(item)} className="emoji_item">{item.emoji}</div>
                                        })}
                                </div>:null
                            }
                            {
                                isShowExtends?
                                <div className="extends">
                                    <input type="file" ref="file" accept="image/*" multiple className="pic" onChange={()=>this.upload()}/>
                                </div>:null
                            }
                        </div>
            
                    }         
                {isOpen?<WxImageViewer onClose={()=>this.onClose()} urls={this.state.picList} index={index}/> : null}
                <Confirm title={title} des={des} cancelText={cancelText} okText={okText} display={display}
                 callback={confirmCallback}/>
                 {helperId?<div className='helper' onClick={()=>this.goHelper()}></div>:null}
            </div>
        )
    }
}
