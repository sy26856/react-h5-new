
define("CountDown",function(require, exports, module){

  function CountDown(expirationTime, callback){
    this.callback = callback;
    this.expirationTime = Date.now() + expirationTime;
  }

  CountDown.prototype.start = function(){
    let self = this;
    this.exec();
    this.interval = setInterval(()=>{
      self.exec()
    }, 1000);
  }

  CountDown.prototype.exec = function(){
    let c = this.expirationTime - Date.now();
    if(c > 0){
      let s = parseInt(c/1000/60%60);
      let f = parseInt(c/1000/60);
      let m = parseInt(c/1000%60);
      this.callback && this.callback(c,s,f,m)
    }else{
      this.callback && this.callback(0,0,0,0)
      clearInterval(this.interval)
    }
  }

  module.exports = CountDown;

});


define(function(require, exports, module){

  var PageModule = require("component/PageModule");
  var VModule = require("component/VModule");
  var payPageModule = require("mods/pay/index");
  var payModule = require("mods/pay/pay");
  var condition = require("mods/condition/index")
  var registerStatus = require('pages/registerStatus')
  var PageTopTip = require("mods/page-top-tip/index");
  var CountDown = require("CountDown")

  //诊断结果
  var prescribedReport = require("prescribedReport");

  var page = VModule.render({
    init:function(){

      //订单id
      this.id = this.query.id;
      this.corpId = this.query.corpId;

      //订单金额
      this.benefitRegAmount = 0;
      //患者id 通过详情接口获取
      this.patientId = null;

      this.state = {
        loading:true
      }

      this.module = this.initModule( this.state, '#J_DetailInfo' );

      this.loadPage();
      this.regEvent();

    },

    onActivation:function(){
      this.loadPage();
    },

    loadPage:function(){

      this.get("/user-web/restapi/reservation/reginfodetail",{
          corpId:this.corpId,
          id:this.id
      });
    },
    regEvent:function(){

      var self = this;

      $('#J_Esc').click(function(){
        self.util.dialog("你确定要取消预约吗？", function(okay){
          if(okay){
            self.cancelappoint();
          }
        })
      });

      $('#J_Pay').click(function(){
        self.pay();
      });
    },
    cancelappoint:function(){

      var self = this;

      var deleteModule = PageModule.render({
          init:function(id){
            this.util.waitAlert("请求中...");
            this.get("/user-web/restapi/reservation/cancelappoint", {id:id});
          },
          onSuccess:function(){
            window.location.reload();
          }
      });

      deleteModule.init( this.id )

    },

    getTypeText:function(type){
      return {
        "1":"普通挂号",
        "2":"专家挂号",
        "3":"名医挂号",
        "14":"急诊挂号",
        "15":"便民挂号",
        "16":"视频问诊挂号",
        "4":"普通预约",
        "5":"专家预约",
        "6":"名医预约",
        "54":"急诊预约",
        "55":"便民预约",
        "56":"视频问诊预约"
      }[type] || ""
    },

    getStatus:function(status, regMode, statusDes){

        var textMap = {
          "1_100":"待支付",
          "1_200":"预约成功",
          "1_201":"预约成功-已取号",
          "1_301":"退款中...",
          "1_302":"退款成功，预约失败",
          "1_400":"已取消",
          "1_401":"已过期",
          "1_605":"医院手动退费成功",
          "1_606":"医院手动退费失败",
          "1_700":"已停诊",
          "2_100":"待支付",
          "2_200":"挂号成功",
          "2_201":"挂号成功",
          "2_301":"退款中...",
          "2_302":"退款成功，挂号失败",
          "2_400":"已取消",
          "2_401":"已过期",
          "2_605":"医院手动退费成功",
          "2_606":"医院手动退费失败"
        }
        return textMap[regMode+"_"+status] || statusDes || status;
    },
    getPayStatusText(payStatus){
      //支付状态   100 未支付，200 支付成功，201 支付失败，500 已退费
      return {
        "100":"未支付",
        "200":"支付成功",
        "201":"支付失败",
        "500":"已退费"
      }[payStatus] || payStatus;
    },
    //过期时间倒计时
    payCountdown(expirationTime){

      new CountDown(expirationTime, (time, s,f,m)=>{
        if(time == 0){
          this.loadPage();
        }
        this.setState({expirationTime:Math.max(time, 0)});
      }).start();

    },
    onSuccess:function( result ){

      var data = result.data;
      
      // data.payStatus = 100;
      // data.expirationTime = 2500;

      let payStatus = data.payStatus;
      this.setState(this.util.vis({
        loading:false,
        success:true,
        status:data.status,//状态
        statusDes:data.statusDes, //状态描述
        type:data.type, //预约类型
        deptName:data.deptName, //可是名字
        regMode:data.regMode,// 1预约 2 挂号
        orderNo:data.orderNo, //预约号
        medDateBeg:data.medDateBeg, // 就诊开始时间
        medDateEnd:data.medDateEnd,// 就诊结束时间
        benefitRegAmount:data.benefitRegAmount, //订单金额
        patientId:data.patientId, //就诊人id
        corpId:data.corpId, //医院id
        corpName:data.corpName,//医院名
        doctName:data.doctName, //医生姓名
        patientName:data.patientName,
        appoNo:data.appoNo, // 挂号序号
        medAmPm:data.medAmPm, //1 , 2
        address:data.address, // 就诊地点
        info:data.info, //其他信息
        createDate:data.createDate, //创建时间
        oppatNo:data.oppatNo, //网关返回门诊号
        payStatus:data.payStatus, //支付状态
        cardNo:data.cardNo,  //就诊卡号
        transNo:data.transNo, //交易流水号
        expirationTime:data.expirationTime,//支付剩余时间
        tradeMode:data.tradeMode,//支付方式  CA：现金，DB：银行卡，MIC：医保卡，OC：银医通账户，ZFB：支付宝，WX:微信 不可空，
        payStyle:data.payStyle, //
        payTypeDesc:data.payTypeDesc
      }));

      //开启支付倒计时
      if(payStatus == 100 && data.status == 100){
        this.payCountdown(data.expirationTime);
      }
      //以下代码未能使用虚拟dom
      this.util.setNativeTitle(data.regMode == 1 ? "预约详情" : "挂号详情");
      // $('#createDate').text( this.util.dateFormat( data.createDate ) )

      //预约状态是已支付有 && 在取号时间之前 ==> 取消预约功能
      //data.status  == 200  && Date.now() < data.medDateBeg
      if( data.regMode == 1 && (data.status  == 200 || data.status  == 100) && Date.now() < data.medDateBeg){
        $('#J_Esc').removeClass("hide");
      }else{
        $('#J_Esc').addClass("hide");
      }

      if(data.regMode == 2){
        //初次就诊患者请前往医院自助机或人工窗口领卡
        PageTopTip.init('#J_TopTip', 'regdetails')
      }else if(data.regMode == 1){
        //初次就诊患者请前往医院自助机或人工窗口领卡
        PageTopTip.init('#J_TopTip', 'Reservationdetails')
      }
      //挂号状态 待支付 的订单显示支付表单
      //data.regMode == 2 &&
      if(data.status ==  100){
        $('#J_ShowCost').removeClass("hide");
        $('#J_Cost').text(this.util.rmb(data.benefitRegAmount/100));
        this.benefitRegAmount = data.benefitRegAmount;

        payPageModule.onReady = function(is){
          if( is ){
            $('#J_Pay').removeClass("hide")
          }
        }

        $('#J_PayForm').removeClass("hide");
        //保存患者id 用于支付
        this.patientId = data.patientId;
        //regMode 1 预约 2挂号
        let optType = data.regMode == 1 ? 6 : 3;
        payPageModule.init( data.corpId,optType , data.patientId, data.benefitRegAmount);
      }else{
        $('#J_ShowCost').addClass("hide");
        $('#J_PayForm').addClass("hide");
        $('#J_Pay').addClass("hide")
      }

      //视频问诊 todo
      //data.type = 56
      if(data.type == "56"){
        condition.init(false, data.diseaseDesc, data.diseaseImageUrl ? data.diseaseImageUrl.split(",") : []);
        prescribedReport.init(data)
      }

    },
    //过期时间
    expirationTimeText(expirationTime){
      let f = parseInt(expirationTime/1000/60);
      let m = parseInt(expirationTime/1000%60);
      return (f ? f+"分" :"")+m+"秒";
    },
    render( state ){

      let {
        type,orderNo,appoNo,corpName,patientName,
        deptName,doctName,benefitRegAmount,medDateBeg,medAmPm,
        medDateEnd,address, regMode, oppatNo ,
        cardNo,transNo, tradeMode, payStyle ,createDate,
        payStatus,expirationTime,status,
        payTypeDesc
      } = state;

      var statusText = registerStatus.getRegisterStatusText( state.status, state.regMode, state.statusDes )
      var medAmPmText = {"1":"上午","2":"下午"}[medAmPm] || "";
      var regTimeText = this.util.dateFormatGMT(medDateBeg, 'hh:mm') + "~" +this.util.dateFormatGMT(medDateEnd, 'hh:mm');
      //是否显示扩展的信息 就诊卡卡号等
      var isShowExtendInfo = (oppatNo||cardNo||transNo) ? true : false;
      var isShowExpirationTime = payStatus == 100 && status == 100 && expirationTime > 0;
      return `
        <div class="status">状态: ${statusText}</div>
        ${isShowExpirationTime > 0  ? 
          `<div class="ui-tips center" style="margin-top:0;">
            请在<em>${this.expirationTimeText(expirationTime)}</em>内完成支付，过期该订单号将会取消
            </div>` : ``
        }
        <div class="ui-form ui-form-small ui-border-tb">
            ${
              //取号密码有才显示
              regMode == 1 && orderNo ? `
                <div class="ui-form-item ui-form-item-show">
                    <label for="#">取号密码:</label>
                    <div class="text">${orderNo}</div>
                </div>
              `:``
            }
            <div class="ui-form-item ui-form-item-show">
                <label for="#">医院名称:</label>
                <div class="text">${corpName}</div>
            </div>
            <div class="ui-form-item ui-form-item-show">
                <label for="#">就诊人:</label>
                <div class="text">${patientName}</div>
            </div>
            <div class="ui-form-item ui-form-item-show">
                <label for="#">类型:</label>
                <div class="text" id="type">${this.getTypeText(type)}</div>
            </div>
            <div class="ui-form-item ui-form-item-show">
                <label for="#">科室/医生:</label>
                <div class="text">
                    <span>${deptName}</span>
                    <span>${doctName}</span>
                </div>
            </div>
            <div class="ui-form-item ui-form-item-show">
                <label>序号:</label>
                <div class="text">
                    <span>${(appoNo || "未出")+"号"}</span>
                </div>
            </div>
            <div class="ui-form-item ui-form-item-show">
                <label>就诊时间:</label>
                <div class="text">
                    <span >${this.util.dateFormat(medDateBeg, 'M月d日')}</span>
                    <span >${medAmPmText}</span>
                    <span >${regTimeText}</span>
                </div>
            </div>
            ${
              address ? `
                <div class="ui-form-item ui-form-item-show">
                    <label for="#">就诊地点:</label>
                    <div class="text">${address}</div>
                </div>
              ` : ``
            }
            <div class="ui-form-item ui-form-item-show">
                <label>金额:</label>
                <div class="text">
                    <span><span class="y">￥</span>${this.util.rmb(benefitRegAmount/100)}</span>
                </div>
            </div>
            ${tradeMode ? `
              <div class="ui-form-item ui-form-item-show">
                  <label>支付方式:</label>
                  <div class="text">
                      <span>${payTypeDesc} 
                        ${tradeMode != "HP" ? `<span class="pay-status">${this.getPayStatusText(payStatus, payTypeDesc)}</span>` : ``}
                      </span>
                  </div>
              </div>
              ` : ``
            }
        </div>
        <div class="module ui-border-tb">
          <div class="ui-txt-info">
            ${cardNo ? `<p>就诊卡卡号: ${cardNo}</p>` : ``}
            ${oppatNo ? `<p>门诊号: ${oppatNo}</p>` : ``}
            ${transNo ? `<p>流水号: ${transNo}</p>` : ``}
            <p>创建时间: ${this.util.dateFormatGMT(createDate)}</p>
          </div> 
        </div>
      `
    },
    getTradeModeText:function(tradeMode){
      //CA：现金，DB：银行卡，MIC：医保卡，OC：银医通账户，ZFB：支付宝，WX:微信 不可空
      return {
        "CA":"现金",
        "DB":"银行卡",
        "MIC":"医保卡",
        "OC":"银医通账户",
        "ZFB":"支付宝",
        "WX":"微信",
        "HP":"到院支付"
      }[tradeMode] || tradeMode;
    },
    pay:function(){


      var feeChannel = payPageModule.getPayType();
      var self = this;
      if( feeChannel == 3 && payPageModule.getAccoutPayBalance() < this.benefitRegAmount ){
        this.util.alert("余额不足，不能支付");
        return ;
      }

      payModule.onPayComplate = function( isOkay, id, result, msg){
        if( isOkay ){
          window.location.reload();
        }else{
          self.util.alert(msg || "无法获得支付结果");
          // this.onError( result );
          window.location.href = "bill-detail.html?id="+id+"&target=_blank";
        }
        // setTimeout(function(){
        //     window.location.href = "bill-detail.html?id="+id;
        // }, 1500);
      };


      /**
        feeChannel 支付方式  //1、支付宝 2、微信 3、余额
        optType 业务类型 //1、充值 2、缴费 3、挂号 6预约
        optParam 业务参数
      */
      let optType = this.state.regMode == 1 ? 6 : 3;
      payModule.pay(feeChannel, optType, {
        corpId:this.corpId,
        patientId:this.patientId,
        outId:this.id
      });

    }
  });

  page.init();

  module.exports = page;



});


//如果是线上问诊的需要显示处方
define("prescribedReport",function(require, exports, module){
  var PageModule = require("component/PageModule");

  //0初始状态  3问诊中 1问诊结束  2医生已拉取处方单和医嘱  4已经支付 5用户主动挂断 6药品已发出（自取或者快递）
  var EXTRA_STATUS_DEFUALT = 0;
  var EXTRA_STATUS_END = 1;
  var EXTRA_STATUS_OK = 2;
  var EXTRA_STATUS_ING = 3;
  var EXTRA_STATUS_4 = 4;
  var EXTRA_STATUS_5 = 5;
  var EXTRA_STATUS_6 = 6;

  // //缴费单状态(100 待支付，101 支付成功-His失败，200 成功，401 已过期，402 已作废)

  let PAYMENT_STATUS_100 = 100;
  let PAYMENT_STATUS_101 = 101;
  let PAYMENT_STATUS_200 = 200;
  let PAYMENT_STATUS_401 = 401;
  let PAYMENT_STATUS_402 = 402;

  //视频问诊的药单支付状态
  let PAYMENT_STATUS_TEXT = {
    [PAYMENT_STATUS_100] : "待支付",
    [PAYMENT_STATUS_101] : "支付成功-His失败",
    [PAYMENT_STATUS_200] : "支付成功",
    [PAYMENT_STATUS_401] : "已过期",
    [PAYMENT_STATUS_402] : "已作废"
  }


  var page = PageModule.render({

    init:function(data){
      var extraStatus = data.extraStatus;
      var status = data.status//只有订单状态200的时候才显示去诊间的按钮

      // console.log(extraStatus, status)
      //未就诊 显示 去就诊按钮
      if(
          (extraStatus == EXTRA_STATUS_DEFUALT || extraStatus == EXTRA_STATUS_ING || extraStatus == EXTRA_STATUS_5)
          //订单状态 == 200  或者 201
          && (status == 200 || status == 201 )
      ){
        // $('#J_PrescribedReport').html( this.renderGoNetworkClinic()  );
        $('#J_GoNetWorkClinic').removeClass("hide").attr("href","network-clinic.html?"+this.util.flat({appointRegLogId:data.id, "target":"_blank"}));
      }

      //问诊结束  或者  已拉去处方单  显示处方
      if(extraStatus != EXTRA_STATUS_DEFUALT && extraStatus !=EXTRA_STATUS_ING && extraStatus != EXTRA_STATUS_5){
        $('#J_PrescribedReport').html( this.render(data)  );
      }
    },
    //诊断结果
    renderDiagnosticResult(data){
      let {doctAdvise,extraStatus} = data;
      return `<div class="report-module ui-border-tb">
              <h5>临床（初步）诊断：</h5>
              ${
                //问诊技术医生还未开处方
                extraStatus == EXTRA_STATUS_END ? `<div class="tip">医生尚未下诊断，请耐心等候，可下拉刷新页面</div>` :
                extraStatus == EXTRA_STATUS_OK && doctAdvise ? `<div class="text">${doctAdvise}</div>` : `<div class="tip">医生未下诊断</div>`
              }
          </li>
      </div>`
    },

    //处方单
    renderPrescriptionForm(data){
      let {extraStatus,billNo} = data;
      let util = this.util;
      let paymentStatus = data.paymentStatus || "";
      let prescribedReport = data.prescribedReport;
      var total = 0;
      var isPay = paymentStatus == PAYMENT_STATUS_100;
      let expressCost = data.expressCost || 0;
      return `<div class="report-module ui-border-tb">
            <h5>电子处方：<span class="pay-status ${paymentStatus != PAYMENT_STATUS_200 ? "no" : ""}">${PAYMENT_STATUS_TEXT[paymentStatus] || paymentStatus}</span></h5>
            ${
              //有处方单
              prescribedReport && prescribedReport.length>0 ?
              `
              <div class="report">
                  ${
                    prescribedReport.map((item)=>{
                      total += item.itemPrice*item.itemQty
                      return `<div class="report-item">
                            <h2>${item.itemName} x${item.itemQty} <span class="he"><span class="y">¥</span>${item.itemPrice/100*item.itemQty}</span></h2>
                            <div class="des">
                                规格 ${item.itemSpecs} 单价:<span class="y">¥ </span>${item.itemPrice/100}
                            </div>
                        </div>`
                    }).join("")
                  }
                  <div class="total">
                    共${prescribedReport.length}件商品 合计${expressCost? `(含运费<span style="font-size:80%">¥</span>${expressCost/100})`:""}:
                    <span class="y">¥</span><span class="rmb">${(total+expressCost)/100}</span>
                  </div>
              </div>
              ` : `<div class="tip">医生尚未下处方，请耐心等候</div>`
            }
        </div>
        ${
          util.is(isPay, `<div class="ui-btn-wrap">
            <a class="ui-btn-lg ui-btn-primary" href="pay.html?billNo=${data.billNo}&corpId=${data.corpId}&patientId=${data.patientId}&target=_blank">
                去支付
            </a>
        </div>`)
        }
        `
    },
    //快递信息
    renderExpressInfo(data){
      // return "";
      //缴费才能看到快递
      // console.log( data.paymentStatus, PAYMENT_STATUS_200 )
      //expressAddress
      if(data.paymentStatus == PAYMENT_STATUS_200 ){
        //expressAddress
        //phone
        //recipient
        //快递单号不为空 才行

        // data.getType = 1
        // console.log(data.getType)
        if(data.getType == 2){

          if( data.expressCode ){
            return `<div class="report-module ui-border-tb">
                <ul class="list">
                    <li><span class="title">取药方式</span>：${data.expressCompany || "无"}</li>
                    <li><span class="title">运单编号</span>：${data.expressCode || "无"}</li>
                    <li><span class="title">收货地址</span>：${data.expressAddress} ${data.recipient} ${data.phone}</li>
                </ul>
            </div>`
          } else{

            return `
              <div class="report-module ui-border-tb">
                <div class="ui-tips center">未发货，等待录入运单信息</div>
              </div>
            `
          }
        }else{
          return `<div class="report-module ui-border-tb">
                <div class="ui-tips center">到院自取</div>
              </div>`
        }
      }

      return ""
    },
    render(data){

      var status = data.extraStatus// //0初始状态,1问诊结束,2医生已拉取处方单和医嘱 3问诊中
      var prescribedReport = data.prescribedReport;
      var html = ""
      // if(status != 0){
        html += this.renderDiagnosticResult(data);
        html += this.renderPrescriptionForm(data);
        //已支付的时候显示运单号
        html += this.renderExpressInfo(data);
      // }

      return html;
    },
    //渲染去网络诊间的逻辑
    renderGoNetworkClinic:function(){
      return "";//`<div class="ui-tips center">为避免错过就诊时间，请在当日就诊前1小时进入网络诊间</div>`
    }
  })


  module.exports = page;



})