define(function(require, exports, module){

  var VModule = require("component/VModule");
  var MuliteTab = require("mods/muliteTab/index");

  var page = VModule.render({
    init:function(){

      this.unionId = this.query.unionId;
      this.corpId = this.query.corpId;

      this.tabIndex = this.cache.get("reportTabIndex") || 0;
      this.state = {
        loading:true,
        reportList:[],
      }

      this.tabKey = 0;

      this.module = this.initModule(this.state, '#J_Page');

      this.tab = new MuliteTab($('#J_Tabs'))

      this.tab.addEventListener("onChange", (index)=>{
        this.loadTabData(index); //0 检验报告  1影像报告
        this.cache.set("reportTabIndex", index)
      });


      this.tab.go(this.tabIndex);

    },
    loadTabData:function(index){
      this.tabKey = index 

      this.setState({loading:true})
      if(this.tabKey == 0){
        //检验报告单
        this.getCache("/user-web/restapi/ytUsers/viewPatientInspect", {corpId:this.corpId, unionId:this.unionId});
      }else{
        //印象报告单
        this.getCache("/user-web/restapi/ytUsers/viewPatientPacs", {corpId:this.corpId, unionId:this.unionId});
      }

    },
    onSuccess:function( result ){


      var reportList = result.data;

      var reportMap = {
        // "3":{
        //   checkUpDate:"",
        //   date:"2016年3月",
        //   checkItems:[
        //     {
        //       checkUpDate:1471922969000
        //       corpId:261
        //       inspectTypeName:"OGTT"
        //       patientName:"李好"
        //       repId:"20160823GBD050"
        //     }
        //   ]
        // }
      };


      //按月份分组
      reportList.map((item)=>{
        //需要兼容检验报告 和 影像报告2种格式
        var checkUpDate = item.checkUpDate || item.reportDate //0 和 1的格式不一样
        var date = new Date(checkUpDate);
        var month = date.getMonth()+1;
        // var repId = item.repId || item.checkNo;
        if(!reportMap[month]){
          reportMap[month] = {
            checkUpDate:checkUpDate, 
            date:checkUpDate ? this.util.dateFormat(date, "yyyy年MM月") : "无日期", 
            checkItems:[]
          };
        }

        reportMap[month].checkItems.push(this.util.vis({
          checkUpDate:checkUpDate,
          corpId:item.corpId,
          inspectTypeName:item.inspectTypeName || item.checkItem,
          patientName:item.patientName || "",
          repId:item.repId, //检验报告单
          checkNo:item.checkNo //影像报告单
        }))

      })
  

      //倒叙排列

      this.setState({
        loading:false,
        success:true,
        //把对象转换成数组，并且按照时间倒序排列
        reportList:this.util.forEach(reportMap, (item, key)=>{ return item }).sort((a, b)=>{  return b.checkUpDate - a.checkUpDate })
      })
      

    },
    render( state ){
     
      var {reportList} = state;
      var forEach = this.util.forEach;
      if(reportList.length == 0){
        return `
          <section class="ui-notice" >
              <i></i>
              <p>没有查询到报告单</p>
         </section>
        `
      }
      return reportList.map((item, key)=>{
        return `
          <ul class="ui-list y-ui-list ui-border-tb ui-list-link">
              <li class="title">
                  <div class="ui-list-info">
                      <h4 class="ui-nowrap">${item.date}</h4>
                  </div>
              </li>
              ${
                item.checkItems.map((item)=>{
                  return `
                    <li class="ui-border-t">
                      <a class="ui-list-info" href="report-detail.html?${ 
                          this.util.flat({
                            corpId:item.corpId,
                            repId:item.repId,
                            checkNo:item.checkNo,
                            target:"_blank"
                          }) 
                      }">
                        <h4 class="ui-nowrap">${item.patientName} - ${item.inspectTypeName}</h4>
                        <p class="ui-nowrap"><span class="y-icon-time"></span>
                          ${
                            item.checkUpDate ? this.util.dateFormat(item.checkUpDate, "MM月dd日") : "无"
                          }
                        </p>
                      </a>
                    </li>
                  `
                }).join("")
              }
          </ul>
        `
      }).join("");

    }
  });

  page.init();

  module.exports = page;

});