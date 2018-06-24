define(function(require, exports, module){

  var VModule = require("component/VModule");

  var page = VModule.render({

    init:function(){
  
      this.checkNativeSuper();
      this.appointRegLogId = this.query.appointRegLogId;

      this.state = {
        loading:true
      }

      this.module = this.intiModule( this.state, '#J_WaitInfo' );//.component();

      this.pull();

      this.startPull()

      this.regEvent()
    },
    regEvent:function(){
      $('#J_VoideTest').click(()=>{
          this.util.brige("videoTest",{}, function(){
            //正确不用处理
          }, function(){
            showDialog("请下载最新的慧医客户端");
          })
      })
    },

    startPull(){
      this.stopPull();
      this.inerval = setInterval(()=>{
        this.pull()
      }, 2000)
    },
    stopPull(){
      this.inerval && clearInterval( this.inerval );
    },
    //页面被激活
    onActivation:function(event){
      this.startPull();
    },
    //页面被转移到后台
    onPause:function(event){
      this.stopPull();
    },
    pull:function(){

      this.get("/user-web/restapi/videoAttend/user/showAttendStatus", {
        appointRegLogId:this.appointRegLogId
      });

    },
    component(){
      var self = this;
      return this.vTemplate((data)=>{
        return this.render(data)
      }, this.state);

    },
    //检查当前客户端是否支持视频问诊
    checkNativeSuper(){
      var util = this.util;

      this.isInYuantuApp = this.util.isInYuantuApp();
      
      if(!this.util.isInYuantuApp()){
        showDialog("请下载最新的慧医客户端");
        
      }else{
        // this.util.brige("hasBrigeMethod",{method:"joinVideoRoom"}, function(){
        //   //正确不用处理
        // }, function(){
        //   showDialog("请下载最新的慧医客户端");
        // })
      }

      function showDialog(text){
        util.dialog(text, function(okay){
            window.location.href="//nocache-s.yuantutech.com/tms/fb/app-download.html?target=_blank"; 
        },{
          cancel:false,
          okText:"下载慧医"
        })
      }

    },
    // onError:function(){
    //   this.setState({})
    //   this.module.setData({loading:false, data:{}})
    // },
    isOpenNative:false,
    onSuccess:function(result){

      var data = result.data || {};
      var extraStatus = data.extraStatus;// 3 医生开始呼叫  5用户主动挂断
      if(data && data.appoNo){
        this.setState(result.data);
      }else{
        this.setState({appoNo:null})
      }
      
      this.setState({loading:false, success:true})

      //当前用户可以查询到房间号表示医生开始呼叫患者就诊 extraStatus == 3 表示医生开始呼叫
      if(data && data.apiKey && data.roomId && extraStatus == 3 && !this.isOpenNative){
        this.stopPull()
        this.isOpenNative = true;
        var location = window.location;
        var jumpURL = [location.protocol,"//",location.hostname, location.pathname.replace(/\/[\w\-]+\.html$/,""), "/", "register-details-2.html?id=",this.appointRegLogId].join("")
        var option = {
          key:result.data.apiKey,
          room:result.data.roomId,
          title:"网络诊间",
          timeout:1000*60,
          jumpURL:jumpURL,
          caller:{name:(data.doctName || "医生"),headImage:"//image.yuantutech.com/user/e2725d04e88364af9fbfca1940a2011b-93-93.png"},
          callee:{name:"被呼叫者",headImage:"//image.yuantutech.com/user/36e4ec7d6de0d27bf517da602cab9778-93-93.png"}
        }

        this.util.brige("joinVideoRoom", option, function(){
          //正确开始视频
        }, (data)=>{

          this.isOpenNative = false;
          var text = {
            "FAIL":"视频失败",
            "TIMEOUT":"您未接听医生的呼叫",
            "NOT-AUTHORIZE":"请允许打开摄像头和麦克风",
            "REFUSE":"您拒绝医生的视频请求"
          }

          if( data.ret == "REFUSE" ){
            this.io.get("/user-web/restapi/videoAttend/user/endPatientVideoAttend", {appointRegLogId:this.appointRegLogId})
          }

          this.startPull()

          this.util.alert(text[data.ret] || data.msg || "视频失败")
          

        });
      }

    },

    render:function(data){
    //   data = {
    //     "regId": 0,
    //     "deptCode": "4002",
    //     "deptName": "国际门诊",
    //     "doctCode": "000402",
    //     "doctName": "王香兰",
    //     "corpId": 9999,
    //     "corpName": "虚拟测试医院",
    //     "appoNo": "1",
    //     "medDate": 1467907200000,
    //     "medBegTime": 1467950400000,
    //     "medEndTime": 1467950760000,
    //     "awaitPersonNum": "3",
    //     "isToday":true
    // }
      let {isToday,loading,doctName,deptName,corpName,appoNo,awaitPersonNum,apiKey,roomId,medBegTime,medEndTime} = data;
      
      if(loading){
        return `<div class="page wait"></div>`;
      }
      //不是今天就诊
      if(!isToday){
        return `
          <div class="no-paidui"></div>
          <h1>没有您的排队记录</h1>
          <div class="line-up-info">
            ${
              medBegTime ? `<p>您的预约时间为 <em>${this.util.dateFormat(medBegTime,"yyyy-MM-dd hh:mm")}</em></p>` : ""
            }
          </div>
        `
      }

      if(appoNo){
        return `
          <div class="paidui"></div>
          <h1>之前还有 <em>${awaitPersonNum}</em> 人等待</h1>
          <div class="line-up-info">
            <p>${doctName}-${deptName}-${corpName}</p>
            <p>您的预约号为 <em>${appoNo}</em> , 预约时段为 <em>${this.util.dateFormat(medBegTime,"hh:mm")}~${this.util.dateFormat(medEndTime,"hh:mm")}</em> </p>
            <p class="ui-txt-muted">${this.util.dateFormat(medBegTime,"yyyy-MM-dd")}</p>
          </div>
        `
      }

     //没有排队记录
      return `
        <div class="no-paidui"></div>
        <h1>没有您的排队记录</h1>
      `
    
    }
  });

  //页面
  page.init();

  module.exports = page;

});
