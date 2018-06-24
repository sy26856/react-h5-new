define(function(require, exports, module){


  var PageModule = require("component/PageModule");
  // var  = require("cache");

  var page = PageModule.render({
    init:function(){

      this.type = this.query.type;
      this.deptCode = this.query.deptCode;
      this.deptName = this.query.deptName;
      this.parentDeptCode = this.query.parentDeptCode;
      this.doctCode = this.query.doctCode;
      this.id = this.query.id;


      // console.log( this.query )
      var self = this;
      ///restapi/common/reservation/scheduleinfonew
      ///user-web/restapi/common/reservation/scheduleinfo
      this.get("/user-web/restapi/common/reservation/scheduleinfonew", {
        corpId:this.corpId,
        type:this.type,
        deptCode:this.deptCode,
        parentDeptCode:this.parentDeptCode,
        doctCode:this.doctCode,
        id:this.id
      });

      var registerData = this.cache.getCacheModule();
      registerData.set("deptCode", this.deptCode , this.deptName);
      registerData.set("parentDeptCode", this.parentDeptCode, "父科室");

    },
    onSuccess:function( result ){

      var data = result.data;
      var type = this.type;
      var corpId = this.corpId;
      var corpName = data && data.corpInfo ? data.corpInfo.corpName : "";

      this.corpId = this.corpId;
      this.corpName = data && data.corpInfo ? data.corpInfo.corpName : "";


      $('#J_Page').removeClass("wait");

      if(data.schedules.length){
        //{list:data.schedules}
        // console.log(this.render(data.schedules))
        $('#J_DoctorList').html( this.render(data.schedules, data.regType, data.regMode) )
        // this.renderTo(html, {list:data.schedules}, $('#J_DoctorList'));
      }


    },
    getDate:function(date){
      try{
        var time = new Date( date );
        var dayArr = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
        // console.log( time )
        return self.util.dateFormat(time, "yyyy-MM-dd") + " " +(dayArr[time.getDay()] || "");
      }catch(e){
        return date;
      }
    },
    render:function(schedules, regType, regMode){

      var corpName = this.corpName;
      var type = this.type;
      var corpId = this.corpId;
      var ampm = {"1":"上午","2":"下午"}

      return schedules.map((item)=>{
          return `<div class="doctor-list">
            <div class="rili-tag">${this.getDate(item.date)}</div>
            ${
              item.data.map((it)=>{
                return `<div class="ui-form">
                    <div class="reservation-item ui-border-radius">
                        ${
                          //医生 详情暂时不显示
                          it.asDoc ?
                          `<a class="ui-form-item ui-form-item-show ui-border-b ui-form-item-link" href="doctor.html?${this.util.flat({corpId:corpId,doctCode:it.doctCode,deptCode:it.deptCode,target:"_blank"})}" >
                            <label>
                              ${it.doctName} <span class="doct-Tech">${it.doctTech || ""}</span>
                            </label>
                            <div class="item-text">${it.doctorProf || ""}</div>
                            <div class="ui-list-action">医生详情</div>
                          </a>
                          ` : `<a class="ui-form-item ui-form-item-show ui-border-b ui-form-item-link" href="dept.html?${this.util.flat({corpId:corpId,deptCode:it.deptCode,target:"_blank"})}" >
                            <label>
                              ${it.deptName || ""}
                            </label>
                            <div class="item-text">${it.doctorProf || ""}</div>
                            <div class="ui-list-action">科室详情</div>
                          </a>`
                        }
                        ${
                          it.listSchedule.map((schedule, index)=>{
                            return `
                              <a class="ui-form-item  ui-form-item-show
                                  ${index<it.listSchedule.length-1 ? `ui-border-b`:"" }
                                  ${schedule.restnum>0? ` ui-form-item-link` : ""} "
                                  ${
                                    /**
                                     corpId:this.corpId, //医院id
                                     doctCode:this.doctCode, //医生代码
                                     deptCode:parentData.deptCode,//科室代码
                                     medAmPm:schedule.medAmPm, //上午下午
                                     scheduleId:schedule.scheduleId,//排班id
                                     regType:schedule.regType,//regType
                                     medDate:medDate,//预约日期 2016-12-12
                                     regAmount:schedule.regAmount,//regAmount
                                     regMode:schedule.regMode,//regMode
                                     doctName:doctName,//医生姓名
                                     deptName:parentData.deptName,//科室名称
                                     corpName:corpName,//医院名字
                                      **/
                                    schedule.restnum>0?
                                      `href="../info-confirm-2.html?`+ this.util.flat(
                                          {
                                            corpId:corpId,
                                            doctCode:it.doctCode,
                                            deptCode:it.deptCode,
                                            medAmPm:schedule.medAmPm,
                                            scheduleId:schedule.scheduleId,
                                            regType:schedule.regType || regType,
                                            medDate:it.medDate,
                                            regAmount:schedule.regAmount,
                                            regMode:schedule.regMode || regMode,
                                            doctName:it.doctName,
                                            deptName:it.deptName,
                                            corpName:this.corpName,
                                            target:"_blank"
                                          }
                                        )
                                      : ``
                                  }
                              " >
                                  <label for="#">
                                  ${ ampm[schedule.medAmPm] || "" }
                                  </label>
                                  <div class="item-text">${schedule.regAmount/100}元</div>
                                  <div class="ui-txt-info">
                                    ${
                                      schedule.restnum > 0 ? "有号" : schedule.restnum == 0 ? "约满" : "停诊"
                                    }
                                  </div>
                              </a>
                              `
                          }).join("")
                        }
                    </div>
                </div>`
              }).join("")
            }
          </div>`
      }).join("")
    },
    onError:function(){

      $('#J_Page').removeClass("wait");

    }
  });

  page.init();

  module.exports = page;

});

