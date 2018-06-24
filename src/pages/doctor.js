define(function(require, exports, module){


  var PageModule = require("component/PageModule");


  var scheduleInfo = PageModule.render({
    init:function(doctName){

      this.doctName = doctName;
      this.corpId = this.query.corpId;
      this.deptCode = this.query.deptCode;
      this.doctCode = this.query.doctCode;
      this.util.waitAlert("正在获取医生排班")
      this.get("/user-web/ws/query/doct/schedule",{
        corpId:this.corpId,
        deptCode:this.deptCode,
        doctCode:this.doctCode
      });

      // 如果是从search.html搜索过来的，我需要在localStorage保存一下搜索的状态
      if($(document)[0].referrer.indexOf('search.html') !== -1) {
        localStorage.setItem('isDetail', JSON.stringify({
          isDetail: true,
          corpId: this.corpId,
          searchContent: this.query.searchContent
        }))
      }
      // --- end

      // this.render({schdule:[]})
      //先渲染空数据
      $('#J_PaiBan').html( this.render({schdule:[],doct:{doctName:""}} )).removeClass("wait");
    },

    onSuccess:function(result){
      this.util.waitHide()
      $('#J_PaiBan').html( this.render(result.data) ).removeClass("wait");
      var contentHeight = $('#J_doctIntroContent').height()

      if(contentHeight >= 35){
        var i = 1;
        $('#J_FoldDoctIntro').removeClass("hide").click(function(){
            $('#J_doctIntroContent').toggleClass("fold");
            $(this).text(++i%2 ? "收起" : "查看全部");
        }).click();
      }
    },

    render(data){


      let schduleDate = this.getEmptyDates(data.today,8);
      let schduleMap = {};
      let doctName = data.doct ? data.doct.doctName : this.doctName;
      data.schdule.map((item)=>{
        schduleMap[item.date.replace(/\d+\-/, "")] = item;//item.data;
      })

      let parentData = {
        doctCode:data.doct.doctCode,
        doctName: data.doct.doctName,
        doctPY:data.doct.data,
        doctSimplePY: data.doct.doctSimplePY,
        doctProfe: data.doct.doctProfe,
        doctSpec: data.doct.doctSpec,
        doctIntro: data.doct.doctIntro,
        corpId: data.doct.corpId,
        corpCode: data.doct.corpCode,
        deptCode: data.doct.deptCode,
        deptName: data.doct.deptName,
        corpName:data.doct.corpName
      };

      return `
        <div class="module scheduling-box ui-border-tb">
            <h1><span class="icon paiban"></span>医生排班</h1>
            <div>
              <div class="scheduling-module left">
                <div class="scheduling-row head">
                  <div class="td ui-container ui-center"></div>
                </div>
                <div class="scheduling-row">
                  <div class="td ui-container ui-center">上午</div>
                </div>
                <div class="scheduling-row">
                  <div class="td ui-container ui-center">下午</div>
                </div>
              </div>
              <div class="scheduling-scroll">
                <div class="scheduling-module" style="width:${schduleDate.length*45-5}px">
                  <div class="scheduling-row head">
                    ${
                      schduleDate.map((item)=>{
                        return `<div class="td ui-container ui-center">${item.week}<em>${item.date}</em></div>`
                      }).join("")
                    }
                  </div>
                  <div class="scheduling-row">
                    ${
                      schduleDate.map((item)=>{
                        return this.renderSchduleItem(schduleMap[item.date], 1, doctName, parentData)
                      }).join("")
                    }
                  </div>
                  <div class="scheduling-row">
                    ${
                      schduleDate.map((item)=>{
                        return this.renderSchduleItem(schduleMap[item.date], 2, doctName, parentData)
                      }).join("")
                    }
                  </div>
                </div>
              </div>
            </div>
            `
    },
    //获取上午或者下午的排班
    getAcheduleAMPM(schduleData, AMPM){
      
      return schduleData.filter((item)=>{
        return item.medAmPm == AMPM;
      })[0]

    },
    //index == 0 当天显示挂号
    renderSchduleItem:function(schduleData, AMPM, doctName, parentData){
      //上午或者下午有数据，and 剩余可预约号大于0
      var schedule = null;
      if(schduleData && schduleData.data && (schedule = this.getAcheduleAMPM(schduleData.data, AMPM))/**&&schduleData.data[AMPM]*/){
      
        var medDate = schduleData.date;
        var fee = Number(schedule.regAmount) / 100.0;

        var href = "../info-confirm-2.html?" + this.util.flat({
            corpId:this.corpId, //医院id
            doctCode:this.doctCode, //医生代码
            medAmPm:schedule.medAmPm, //上午下午
            scheduleId:schedule.scheduleId,//排班id
            type:schedule.regType,//regType
            regType:schedule.regType,//regType
            medDate:medDate,//预约日期 2016-12-12
            regAmount:schedule.regAmount,//regAmount
            regMode:schedule.regMode,//regMode
            doctName:doctName,//医生姓名
            deptName:schedule.deptName,
            deptCode:schedule.deptCode,//科室代码
            // deptName:parentData.deptName,//科室名称
            corpName:parentData.corpName,//医院名字
            target:"_blank"
        })

        var restnum = schedule.restnum;
        var regMode = schedule.regMode;
        if (restnum > 0) {
            // 剩余号源大于0
            return `<a href="${href}" class="td ui-container ui-center">${regMode==2 ?  "挂号":"预约"}</a>`
        } else if (restnum == -1) {
                // 剩余号源==-1
        return `<div class="td ui-container ui-center">停诊</div>`
            } else if (restnum == 0) {
                // 剩余号源==0
                return `<div class="td ui-container ui-center">已满</div>`
            }else{
              //无排版
              return `<div class="td ui-container ui-center"></div>`
            }
      }else{
        return `<div class="td ui-container ui-center"></div>`
      }
    },
    //未来几天的日期
    getEmptyDates:function(startDate, length){

      var dates = [];
      var dayOfWeekList = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
      var weekAlias = ["今天","明天","后天"];

      startDate = startDate || new Date();
      length = length || 7;

      for(var i=0; i<length; i++){
        var date = new Date(startDate);
        var d = new Date( date.setDate(date.getDate()+i) )
        dates.push({
          date:this.util.dateFormat(d, "MM-dd"),
          week:weekAlias[i] || dayOfWeekList[d.getDay()]
        })
      }

      return dates;
    }

  })

  //doctor info
  var doctorInfo = PageModule.render({
    ///user-web/restapi/common/doctor/getDoctAccountInfo
    init:function(){
      this.corpId = this.query.corpId;
      this.deptCode = this.query.deptCode;
      this.doctCode = this.query.doctCode;
      //corpId=265&deptCode=8001&doctCode=000402
      this.get("/user-web/restapi/common/doctor/getDoctAccountInfo",{
        corpId:this.corpId,
        deptCode:this.deptCode,
        doctCode:this.doctCode
      });

    },
    onSuccess:function(result){
      if(result && result.data){
        let data = result.data;

        // deltel
        // data.logo = "https://paiban-img.oss-cn-hangzhou.aliyuncs.com/715b1978a34f48ed96c819499e1e0c3a.jpg";
        let doctInfo = this.util.vis({
          doctCode:data.doctCode,
          doctName:data.doctName,
          deptCode:data.deptCode,
          deptName:data.deptName,
          doctSpec:data.doctSpec,
          doctIntro:data.doctIntro,
          corpName:data.corpName,
          doctProfe:data.doctProfe,
          doctPictureUrl:data.doctPictureUrl || "//image.yuantutech.com/user/6f221bf830a0cc369894fc49e83d0f02-100-100.png"
        });

        $('#J_DoctorInfo').html( this.render(doctInfo) ).removeClass("wait");
        scheduleInfo.init(data.doctName);
      }else{
        this.onError();
      }
    },
    onError:function(){
      $('#J_DoctorInfo').html(
        `<section class="ui-notice" >
            <i></i>
            <p>医生信息不存在</p>
        </section>
        `
      ).removeClass("wait");
    },
    render:function(data){

      let {doctCode,doctName,deptCode,deptName,doctSpec,doctIntro, corpName,doctProfe,doctPictureUrl } = data;
      return `<div class="doctor-card ui-border-tb">
      <div class="ui-avatar">
              <span style="background-image:url(${doctPictureUrl})"></span>
          </div>
          <div class="doctor-info">
              <h1>${doctName}</h1>
              <p>${deptName}-${doctProfe}</p>
              <p>${corpName}</p>
          </div>
        </div>
        <div class="module ui-border-tb">
          <h1><span class="icon techang"></span>医生特长</h1>
          <div class="content">${doctSpec || "无"}</div>
        </div>
        <div class="module ui-border-tb">
          <h1><span class="icon jieshao"></span>医生介绍</h1>
          <div class="content" id="J_doctIntroContent">${doctIntro || "无"}</div>
          <div class="open-all ui-border-t hide" id="J_FoldDoctIntro">查看全部</div>
        </div>
        `
    }
  })

  doctorInfo.init();

  module.exports = doctorInfo;

});
