define(function(require, exports, module){

  /**
    //
    {

      success:true,
      msg:"",
      code:"",
      data:null, //
      data:{
        queues:[
          {
            currentOrderNo:10, //当前序号
            corpName:"",
            corpId:"",
            bigDeptName:"",
            bigDeptCode:"",
            smallDeptName:"",
            smallDeptCode:"",//
            depteAddress:""
            patient:{
              status:[0,1,2,3,4,5,6,7] //
              orderNo:1, //我的序号
              waitNum:10, //需要等待多时人
              username:"" //
              modifyTime:23456789
            }
          },
          {
            currentOrderNo:10, //当前序号
            corpName:"",
            corpId:"",
            bigDeptName:"",
            bigDeptCode:"",
            smallDeptName:"",
            smallDeptCode:"",//
            depteAddress:""
            deptAddress
            patient:{
              status:[0,1,2,3,4,5,6,7] //
              orderNo:1, //我的序号
              username:"" //
              modifyTime:23456789
            }
          },
          {
            currentOrderNo:10, //当前序号
            corpName:"",
            corpId:"",
            bigDeptName:"",
            bigDeptCode:"",
            smallDeptName:"",
            smallDeptCode:"",//
            depteAddress:""
            patient:{
              status:[0,1,2,3,4,5,6,7] //
              orderNo:1, //我的序号
              username:"" //
              modifyTime:23456789
            }
          }
        ]

      }
    }

    // 就诊中
    public static Integer STATUS_IN = 0;

    // 候诊中
    public static Integer STATUS_WAITING = 1;

    // 过号
    public static Integer STATUS_PASS = 2;

    // 就诊完成
    public static Integer STATUS_COMPLETE = 3;

    // 预就诊
    public static Integer STATUS_PRE_IN = 4;

    // 预就诊中
    public static Integer STATUS_PRE_IN_CONFIRM = 5;

    // 回诊
    public static Integer STATUS_BACK = 6;

    //弃号
    public static Integer STATUS_DELETE = 7;

  */
  //虚拟DOM模块
  var VModule = require("component/VModule");

  // 就诊中
  var STATUS_IN = 0; //正在叫号

  // 候诊中
  var STATUS_WAITING = 1; //进入候诊

  // 过号
  var STATUS_PASS = 2; //已过号

  // 就诊完成
  var STATUS_COMPLETE = 3;//完成就诊

  // 预就诊
  var STATUS_PRE_IN = 4; //等待就诊

  // 预就诊中
  var STATUS_PRE_IN_CONFIRM = 5; //4

  // 回诊 废弃
  // var STATUS_BACK = 6; // 4

  //弃号
  var STATUS_DELETE = 7; // 未定义

  var page = VModule.render({
    init:function(){

      this.cardNos = this.query.cardNos; //就诊卡卡号
      this.corpId = this.query.corpId; //医院 id
      this.unionId = this.query.unionId;
      this.cardNo = this.query.cardNo;
      this.cardType = this.query.cardType;

      this.state = {
        loading:true,
        success:false
      }

      this.module = this.initModule(this.state, '#J_Page');

      //findPatientForMobile?cardNos=12345,123456&corpId=261

      // setInterval(()=>{
      //   this.pull()
      // }, 10000);
      this.pull();
    },
    pull(){
      //http://api.uat.yuantutech.com/user-web/sync/message/notify
      //this.config.queueDomain + "/queue/api/findPatientForMobile"
      //cardNo=851131674&cardType=2&target=_blank&spm=100.1600.1000.1
      this.get(this.config.queueDomain + "/user-web/restapi/ytUsers/getPatientQueueInfo", {
        cardNos:this.cardNos,
        corpId:this.corpId,
        cardNo:this.cardNo,
        cardType:this.cardType,
        unionId:this.unionId,
      });
    },
    onSuccess:function(result){
      // console.log( result )
      /**
          waitNum;//患者前方等待人数
         corpName;//医院名称
         corpId;//医院编号
         bigDeptName;
         bigDeptCode;
         smallDeptCode;
         smallDeptName;
         deptAddress;//科室地址
         currentOrderNo;//此队列正在就诊人序号
         stauts;//患者状态
         orderNo;//患者序号
         username;//患者姓名
         waitingTime;//进入候诊时间
         preTime;//等待就诊时间
         callingTime;//正在叫号时间
         completeTime;//完成就诊时间
         DoctorName;//医生名字
         diagRoom;//诊室名称
      */
      this.setState( $.extend({loading:false}, result) )
    },
    onError:function(result){
      this.setState({loading:false, success:false})
      if(result && result.resultCode == "202"){
       this.util.goLogin()
      }
    },
    //http://queue.daily.yuantutech.com/queue/api/findPatientForMobile?cardNos=12345,123456&corpId=261
    //http://queue.daily.yuantutech.com/queue/api/findPatientForMobile?cardNos=12345%2C123456&corpId=261&ver=1.0&callback=jsonp1
    //必须实现render函数
    render(state){

      if(!(state && state.data && state.data && state.data.length)){
        return this.renderError(state)
      }

      var queues = state.data;
      // console.log(queues)
      // var status = queues.status;
      return `
        <div class="enter-order">
          <div class="update-time">
            <div class="inner-time">更新于 ${this.util.dateFormat(Date.now(),"hh:mm")}</div>
          </div>
          ${
            queues.map((item)=>{
              return  `
                <div class="order-card">
                  <div class="card">
                    ${
                      this.renderProgressBar( item )
                    }
                    ${
                      //已完成就诊不显示状态了
                      item.status != STATUS_COMPLETE ?
                      `
                        <div class="natice-card">
                          <div class="item">
                            <div class="item-notice">您的序号</div>
                            <div class="item-number">${item.orderNo ? `${item.orderNo}号` : '-'}</div>
                          </div>
                          <div class="item">
                            <div class="item-notice" >当前序号</div>
                            <div class="item-number">${item.currentOrderNo ? `${item.currentOrderNo}号` : '-'}</div>
                          </div>
                          ${
                            this.renderStatus( item )
                          }
                        </div>
                      ` : ""

                    }
                    <ul class="sick-list">
                      <li>
                        <span>就诊人</span>
                        <span>${item.username}</span>
                      </li>
                      <li>
                        <span>就诊医院</span>
                        <span>${item.corpName}</span>
                      </li>
                      <li>
                        <span>就诊科室</span>
                        <span>${this.renderBigDeptName(item.bigDeptName, item.smallDeptName, item.diagRoom)}</span>
                      </li>
                      <li>
                        <span>就诊地址</span>
                        <span>${item.deptAddress}</span>
                        <div class="icon"></div>
                      </li>
                    </ul>
                  </div>
                </div>
              `
            }).join("")

          }
        `;
      /**
       *
       <div class="provider">
       <span>本服务由远图互联智慧医疗服务平台提供</span>
       </div>
       *
       * **/

    },
    renderBigDeptName(){
      return Array.prototype.slice.apply(arguments).filter((a)=>{
        return !!a;
      }).join("-");
    },
    //渲染 过号 状态
    renderStatus(queue){
      //过号
      var status = queue.status;

      if(status == STATUS_PASS){
        return `
          <div class="item people over">
            <div  class="item-notice" >您已过号</div>
          </div>
        `
      }

      if(status == STATUS_COMPLETE){
        return `
          <div class="item people over">
            <div class="item-notice">就诊完成</div>
          </div>
        `
      }

      if(status == STATUS_IN){
        return `
          <div class="item people go">
            <div class="item-notice">前往就诊</div>
          </div>
        `
      }

      return `
        <div class="item people">
          <div  class="item-notice" >还需等待</div>
          <div class="item-number" >
            <span>${queue.waitNum}</span>
            <span>人</span>
          </div>
        </div>
      `
    },

    renderProgressBar(queue){
      // classname = success active over end
      var status = queue.status;
      var triageSign = queue.triageSign; // PRIMARY_TRIAGE 1次分诊 TWO_TRIAGE 二次分诊
      // triageSign == 1 的时候 没有 STATUS_PRE_IN  和   STATUS_PRE_IN_CONFIRM
      var classNames =  {
        //进入候诊
        "in":"item",
        "wait":"item", //等待就诊
        "ing":"item", //正在叫号
        "guohao":"item", //已过号
        "end":"item" //完成就诊
      }

      //进入候诊
      if(status == STATUS_WAITING){
        classNames.in = "item active"
      }

      //等待候诊
      if(status == STATUS_PRE_IN || status == STATUS_PRE_IN_CONFIRM ){
        classNames.in = "item success"
        classNames.wait = "item active"
      }

      //正在叫号
      if(status == STATUS_IN){
        classNames.in = "item success"
        classNames.wait = "item success"
        classNames.ing = "item active";
      }
      //已过号
      if(status == STATUS_PASS){
        classNames.in = "item success"
        classNames.wait = "item success"
        classNames.guohao = "item guohao";
      }

      //就诊完成
      if(status == STATUS_COMPLETE){
        classNames.in = "item end"
        classNames.wait = "item end"
        classNames.ing = "item end";
        classNames.end = "item end";
      }

      var waitingTime = queue.waitingTime ? this.util.dateFormat(queue.waitingTime,"hh:mm") : "--" ;//进入候诊时间
      var preTime = queue.preTime ? this.util.dateFormat(queue.preTime,"hh:mm") : "--" ;//等待就诊时间
      var callingTime = queue.callingTime ? this.util.dateFormat(queue.callingTime,"hh:mm") : "--" ;//正在叫号时间
      var passTime = queue.passTime ? this.util.dateFormat(queue.passTime,"hh:mm") : "--" ;//过号时间
      var completeTime = queue.completeTime ? this.util.dateFormat(queue.completeTime,"hh:mm") : "--" ;//完成就诊时间

      return `
        ${
          //已完成就诊
          status == STATUS_COMPLETE ?
          `
            <div class="order-end">
              <div class="end-message">本次就诊已完成</div>
            </div>
          ` : ""
        }
        <div class="order-schedule">
          <div class="${classNames.in}">
            <div class="line"></div>
            <div class="circle ">
              <div class="enter ">
                <span class="message">请在集中候诊区耐心等待</span>
              </div>
            </div>
            <div class="text ">
              <div class="title">开始候诊</div>
              <div class="time">${waitingTime}</div>
            </div>
          </div>
          ${

            triageSign == "TWO_TRIAGE" ? 
              `
                <div class="${classNames.wait}">
                  <div class="line"></div>
                  <div class="circle">
                    <div class="enter ">
                      <span class="message  ">请前往分诊处签到</span>
                    </div>
                  </div>
                  <div class="text">
                    <div class="title">等待就诊</div>
                    <div class="time">${preTime}</div>
                  </div>
                </div>
              ` : ""
          }
          ${
            //过号 显示过号 否则显示 正在叫号
            status == STATUS_PASS ?
            `
              <div class="${classNames.guohao}">
                <div class="line"></div>
                <div class="circle">
                  <span class="x">+</span>
                  <div class="enter ">
                    <span class="message">您已过号，请前往分诊台报道</span>
                  </div>
                </div>
                <div class="text">
                  <div class="title">已过号</div>
                  <div class="time">${passTime}</div>
                </div>
              </div>
            ` :
            `
              <div class="${classNames.ing}">
                <div class="line"></div>
                <div class="circle">
                  <div class="enter ">
                    <span class="message">请前往${queue.diagRoom}${queue.doctorName}医生处就诊</span>
                  </div>
                </div>
                <div class="text">
                  <div class="title">正在叫号</div>
                  <div class="time">${callingTime}</div>
                </div>
              </div>
            `
          }
          <div class="${classNames.end}">
            <div class="line"></div>
            <div class="circle"></div>
            <div class="text">
              <div class="title">完成就诊</div>
              <div class="time">${completeTime}</div>
            </div>
          </div>
        </div>
      `
    },
    renderError(){
      return `
        <div class="enter-order">
          <div class="error">
            <div class="message">
              <div class="logo"></div>
              <div class="text">没有找到您的挂号信息请确认是否挂号</div>
            </div>
          </div>
        </div>
      `
      /**
       *
       <div class="provider" style="position:fixed;bottom:0;width:100%;">
       <span>本服务由远图互联智慧医疗服务平台提供</span>
       </div>
       *
       * **/
    }

  })

  page.init();

  module.exports = page;

});
