
define(function(require, exports, module){

  var VModule = require("component/VModule");
  var vaccineList = require("vaccine-list");
  var SAVE_KEY = "vaccine";
  

  var page = VModule.render({
    init:function(){
      
      this.state = {
        loading:true
      };


      this.unionId = this.query.unionId;
      this.corpId = this.query.corpId || this.corpId;

      if(this.unionId != 60){
        $('#J_Page').html(`
          <section class="ui-notice" >
                <i></i>
                <p>当前城市未开通此服务，敬请期待</p>
          </section>
        `);
        return;
      }
      

      //获取上一次缓存的就诊人id
      this.cachePatientId = this.getcachePatientId();

      this.initModule(this.state, '#J_Page');
      
      this.moduleDidMount();
    },

    getcachePatientId(){

      return this.cache.getCacheModule(SAVE_KEY).get("patient").value;  
    },

    moduleDidMount(){
      //获取儿童就诊人列表
      this.setState({loading:true});
      this.get("/user-web/restapi/patient/getList", {
        unionId:this.unionId,
        //corpId: this.corpId,
        patientType:3 //1全部  2成人  3儿童
      });

    },
    //选择完就诊人回来
    onActivation(){
      var patientId = this.getcachePatientId();
      if(this.cachePatientId != patientId){
        this.cachePatientId = patientId;
        this.moduleDidMount();
      }
    },

    //匹配缓存中的就诊人
    matchingCachePatint(patientList, patientId){
      for(var i=0; i<patientList.length; i++){
        //显示上一次的就诊人疫苗计划
        if(patientList[i].id == patientId){
          //显示列表
          return patientList[i];
          break;
        }
      }
      return patientList[0];
    },

    onSuccess(result){
      var patientList = result.data;

      if(patientList.length){
        result.loading = false;
        this.setState(result);
        //当前列表和缓存中的就诊人匹配，否则显示第1个就诊人
        var patient = this.matchingCachePatint( patientList, this.cachePatientId );
        vaccineList.init(patient.id, patient.patientName);

      }else{
        //显示没有人
        this.setState({success:false, loading:false})
      }
    },
    onError(result){
      result.loading = false
      this.errorHandle(result);
      this.setState(result);      
    },
    //render函数理论上不会调用
    render(state){
      return "";
    },

    renderError(state){
      return `
        <div class="no-child">
          <div class="add-child">
            <div class="add-child-imge"></div>
            <div class="add-child-notice">您尚未添加0至7岁就诊人</div>
            <div class="add-child-prompt">请先添加就诊人并绑定就诊卡</div>
            <div class="ui-btn-wrap">
              <a class="ui-btn ui-btn-primary btn-add" 
                href="../add-patient.html?${this.util.flat({unionId:this.unionId,target:"_blank"})}"
              >
                添加就诊人
              </a>
            </div>
          </div>
        </div>
      `
    }
  });


  //页面
  page.init();
  window.aaaa = page
  module.exports = page;

});

//当前疫苗list
define("vaccine-list",function(require, exports, module){

  var VModule = require("component/VModule");
  var SAVE_KEY = "vaccine";

  var page = VModule.render({
    init:function(patientId, patientName){

      this.state = {
        loading:true
      };

      this.patientId = patientId;
      this.patientName = patientName;
      this.unionId = this.query.unionId;

      //第二次调用 不在初始化 module
      if(!this.module){
        this.initModule(this.state, '#J_Page');
      }
      
      this.moduleDidMount();
      
    },

    moduleDidMount(){

      //即将接种的针次
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
      //                 "isInoc":"0" //0表示未接种，1：已接种
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

      // this.onSuccess( result )

      this.setState({loading:true})
      this.get("/user-web/restapi/vaccine/schedule/next", {
        patientId:this.patientId,
        corpUnionId:this.unionId,
        unionId: this.unionId
      });
      
    },
    onSuccess(result){
      result.loading = false
      this.setState(result);
    },
    render(state){


      /**
        childInfo = {
          "name":"test",
          "birthday":"2016-01-01",
          "sex":"男",
          "institutionName":"接种机构编号"
        }
      */
      var childInfo = state.data.childInfo || {};
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
      var scheduleList = state.data.scheduleList || [];

      /**
          <div class="nobinding-card">
            <div class="nobinding-inner">
              <div class="nobinding-imge"></div>
              <div class="nobinding-notice">您尚未绑定就诊卡</div>
              <div class="nobinding-prompt">绑定后可享受便捷的预防接种服务</div>
              <div class="ui-btn-wrap">
                  <button class="ui-btn ui-btn-primary btn-nobinding">
                      立即绑定
                  </button>
              </div>
            </div>
          </div>
      */

      //1200 100 未绑定就诊卡

      var bindCard = state.data.bindCard;


      return `
          <div class="vaccine-manage ">
            <a class="user-message" href="../patient-list.html?${this.util.flat({unionId:this.unionId, selectView:"1", target:"_blank", saveKey:SAVE_KEY,patientType:3})}">
              <div class="user-name">${childInfo.name}</div>
              <div class="hospital-address">${childInfo.institutionName||"无"}</div>
              <div class="jump-corner"></div>
            </a>
            ${
                this.renderData(bindCard, scheduleList, childInfo)
            }
          </div>
      `
    },

    renderData(bindCard, scheduleList, childInfo){

      if(!bindCard){
        return `
          <div class="nobinding-card">
            <div class="nobinding-inner">
              <div class="nobinding-imge"></div>
              <div class="nobinding-notice">尚未绑定就诊卡</div>
              <div class="nobinding-prompt">绑定后可享受便捷的预防接种服务</div>
              <div class="ui-btn-wrap">
                  <a href="../add-patient.html?${this.util.flat({unionId:this.unionId, id:this.patientId, target:"_blank"})}" class="ui-btn ui-btn-primary btn-nobinding">
                      立即绑定
                  </a>
              </div>
            </div>
          </div>
        `
      }

      if(scheduleList.length){
        return `
          <div class="vaccine-plan-list">
            <div class="vaccine-plan-title">您的下一次接种疫苗为：</div>
          </div>
          <div class="vaccine-plan-inner">
            ${
              scheduleList.map((item)=>{
                return `
                  <div class="vaccine-item ${item.isInoc==0?"vaccine-no" : ""}">
                      <div class="vaccine-name">${item.vaccineName}</div>
                      <div class="ui-flex vaccine-message">
                        <div class="message-anyagent">${item.stepIndex}</div>
                        <div class="message-time">${item.estimateDate}</div>
                      </div>
                  </div>
                `
              }).join("")
            }
          <div class="ui-footer ui-footer-stable ui-btn-group ui-border-t btn-check">
              <a href="vaccine-all.html?${this.util.flat({unionId:this.unionId,patientId:this.patientId,target:"_blank"})}" class="ui-btn-lg ui-btn-primary">
                  查看接种计划
              </a>
          </div>
        `;
      }else{
        return `
          <section class="ui-notice" >
                <i></i>
                <p>暂无疫苗接种计划</p>
          </section>
        `;
      }
    }
  });

  module.exports = page;

});