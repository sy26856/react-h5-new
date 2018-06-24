
define(function(require, exports, module){

  var VModule = require("component/VModule");


  var page = VModule.render({
    init:function(){
      
      this.state = {
        loading:true
      };

      this.unionId = this.query.unionId;
      this.patientId = this.query.patientId;

      this.initModule(this.state, '#J_Page');
      

      //获取儿童就诊人列表
      this.get("/user-web/restapi/vaccine/schedule/all", {
        corpUnionId:this.unionId,
        patientId: this.patientId
      });

      //测试计划
      // var result = {
      //     "success": true,
      //     "resultCode": "100",
      //     "msg": "成功",
      //     "data": {
      //         childInfo:{
      //             "name":"test",
      //             "birthday":"2016-01-01",
      //             "sex":"男",
      //             "institutionName":"接种机构编号"
      //         },
      //         scheduleList:[
      //             {
      //                 "vaccineName":"疫苗名称",
      //                 "stepIndex":"针次",
      //                 "estimateDate":"2016-01-01",
      //                 "isInoc":"1" //0表示未接种，1：已接种
      //             },
      //             {
      //                 "vaccineName":"疫苗名称",
      //                 "stepIndex":"针次",
      //                 "estimateDate":"2016-01-01",
      //                 "isInoc":"0" //0表示未接种，1：已接种
      //             }
      //         ]
      //     },
      //     "startTime": 1470220741958,
      //     "timeConsum": 71
      // };

      // this.onSuccess(result);

    },
    onSuccess(result){
      result.loading = false
      this.setState(result);
    },
    //render函数不返回
    render(state){
      /**
        childInfo = {
          "name":"test",
          "birthday":"2016-01-01",
          "sex":"男",
          "institutionName":"接种机构编号"
        }
      */
      var childInfo = state.data.childInfo;
      /*
          scheduleList = [
            {
                "vaccineName":"疫苗名称"，
                "stepIndex":"针次",
                "estimateDate":"2016-01-01",
                "isInoc":"0" //0表示未接种，1：已接种
            }
          ]
      */
      var scheduleList = state.data.scheduleList;

      var isInocText = {"0":"未接种", "1":"已接种"};

      //没有返回list
      if(scheduleList.length == 0){
        return `<div class="ui-tips center">无疫苗接种计划</div>`;
      }


      return `
        <div class="vaccine">
          ${
            scheduleList.map((item)=>{
              return `
                <div class="ui-flex ui-flex-ver ui-flex-align-start vaccine-item ${item.isInoc==0?"vaccine-no": ""}">
                  <div class="ui-flex vaccine-details">
                      <div class="vaccine-name">${item.vaccineName}</div>
                      <div class="vaccine-state">${isInocText[item.isInoc] || item.isInoc}</div>
                    </div>
                    <div class="ui-flex vaccine-message">
                      <div class="message-anyagent">${item.stepIndex}</div>
                      <div class="message-time">${item.estimateDate}</div>
                    </div>
                    <div class="vaccine-icon"></div>
                </div>
              `
            }).join("")
          }
        </div>
      `
    },
  });


  //页面
  page.init();

  module.exports = page;

});
