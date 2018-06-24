import React from 'react'
import util from './lib/util'
import './report-doc-helper.less'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import Alert from './component/alert/alert'
import qiniu from './component/RongCloud/qiniu'
import upload from './component/RongCloud/upload'
import init_2 from './component/RongCloud/init'
import cache from './lib/cache'    

//移动端图片预览组件
import WxImageViewer from 'react-wx-images-viewer'
export default class ReportDocHelper extends SmartBlockComponent {
    constructor(props){
        super(props)
        const query = util.query()

        this.helperId=query.helperId
        this.unionId = query.unionId
        this.patient_sex = query.patient_sex || '1'//患者性别 1男 2女

        this.patient_sex == 1?this.patientLogo = 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/e62b4b358cd9194444dc785facf70764-198-198.png':
        this.patientLogo = 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/17c992417182bad4897a50ec5f02de81-198-198.png'

        this.state = {
            success: true,
            loading: true,
            textMes:'',//文字消息
            sendBtn:false,//输入框输入 点击发送按钮状态
            historyMesList:[],//消息历史记录列表
            allMesList:[],//当前聊天所有的消息列表
            isShowEmojiList:false,//是否显示表情列表
            emojiList:[],//表情列表
            isPlay:false,//音频播放状态,默认暂停
            isShowExtends:false,//显示图片等拓展功能 默认不显示
            showloading:'',//是否显示加载中...
            hasMsg:false,//是否还有历史记录 默认没有
            picList:[],//预览图片列表
            history_count:1,//第几次请求历史记录 默认第一次
            index: 0,//记录图片预览时 当前的图片索引
            isOpen: false,//是否结束预览图片,
        }
        this.appKey = cache.get('appKey');
        this.token = cache.get('patientToken');
    }
    
    componentDidMount(){
        this.init()
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

    //初始化&接收消息
    init(){
        let _this = this
        let type = ['TextMessage','ImageMessage','VoiceMessage']
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
                    case RongIMLib.ConnectionStatus.CONNECTED:break}
            }
        });
        
         RongIMClient.setOnReceiveMessageListener({
          
            onReceived(message){
               
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
     
        RongIMClient.connect(this.token, {
            onSuccess() {_this.getHistory()},
            onTokenIncorrect() {Alert.show('token无效');},
            onError(errorCode){Alert.show('出现错误')}
        })
      
    }

    //读取历史聊天记录
    getHistory(num){
        let _this = this     
        let count = num || 5//每次读取记录条数
        let timestrap = null
        let type = ['TextMessage','ImageMessage','VoiceMessage']
        RongIMClient.getInstance().getHistoryMessages(RongIMLib.ConversationType.PRIVATE, this.helperId, timestrap, count, {
            onSuccess(list, hasMsg){
                let history_count_2 = _this.state.history_count
                let picList_2 = _this.state.picList
                let list_2 = [];
                console.log(list)
                for(let value of list){
                    let hasType = type.some((ele)=>{
                        if(ele==value.messageType){
                                return true
                        }
                    })
                    if(hasType){
                        if(value.messageType == 'TextMessage'){
                            value.content.content = RongIMLib.RongIMEmoji.symbolToEmoji(value.content.content)//转换原生表情
                        }
                        list_2.push(value)
                    }
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
        
            RongIMClient.getInstance().sendMessage(conversationtype, this.helperId, msg, {
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
        
        RongIMClient.getInstance().sendMessage(conversationtype, this.helperId, msg, {
                onSuccess(message) {
                    picList_2.push(downloadUrl)
                    let allMesList_3 = _this.state.allMesList.concat([{content:{content:_content,imageUri:downloadUrl},extra:"附加要传递的值",messageDirection:'1',messageType:'ImageMessage',sentTime:new Date().getTime()}])
                            _this.setState({
                                allMesList:allMesList_3,
                                textMes:'',
                                picList:picList_2,
                                isShowExtends:false,//隐藏图片等功能
                            },()=>{
                              
                                _this.refs.containerTop.scrollTop=_this.refs.containerTop.scrollHeight;
                            })
                },
                onError(errorCode,message) {Alert.show('发送图片失败')}
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
                        // setTimeout(()=>{//播放结束后暂停
                        //     this.setState({
                        //         isPlay:false
                        //     },audioFile.duration*1000)
                        // })
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
                picList,
                duration,
                emojiList,
                allMesList,
                showloading,
                isShowExtends,
                historyMesList,
                isShowEmojiList,} = this.state
        return(
            <div className="report-doc-helper">
                <div className="container_top"
                    ref="containerTop"
                    onTouchStart={this.state.hasMsg&&this.touchstart.bind(this)}
                    onTouchEnd={this.state.hasMsg&&this.touchend.bind(this)}>
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
                                            </div>
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
                                            <span  className="avatar helper"/>
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
                                                        historyMesList[historyMesList.length-1]?
                                                        item.sentTime - historyMesList[historyMesList.length-1].sentTime> 600000?
                                                        <span>
                                                            {util.dateFormat_2(item.sentTime,historyMesList[historyMesList.length-1].sentTime)} 
                                                        </span>:null: <span>{util.dateFormat_2(item.sentTime)}</span>
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
                                                        historyMesList[historyMesList.length-1]?
                                                        item.sentTime - historyMesList[historyMesList.length-1].sentTime> 600000?
                                                        <span>
                                                            {util.dateFormat_2(item.sentTime,historyMesList[historyMesList.length-1].sentTime)} 
                                                        </span>:null:<span>{util.dateFormat_2(item.sentTime)}</span>
                                                        :item.sentTime - allMesList[key-1].sentTime> 600000?
                                                        <span>
                                                            {util.dateFormat_2(item.sentTime)} 
                                                        </span>:null
                                                        
                                                }
                                            </div>
                                            <div className="content_left" key={key}>
                                            <span  className="avatar helper"/>
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
                                            </div>
                                        </div>  
                            }
                        })
                    }   
                    </div>
                </div>
                    {
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
            </div>
        )
    }
}