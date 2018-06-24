define(function(require, exports, module){

  var VModule = require("component/VModule");
  var page = VModule.render({
    init:function(){

      //页面融合两个报告单的多个字段 比较复杂
      ////image.yuantutech.com/user/fe4b9a0d23f85537f8d43e761399ce1c-1500-536.png

      this.repId = this.query.repId;//检查报告单
      this.checkNo = this.query.checkNo; //影像报告单
      this.corpId = this.query.corpId;
      this.state = {
        loading:true
      }

      this.module = this.initModule(this.state, '#J_Page')

      if( this.repId ){
        this.get("/user-web/restapi/ytUsers/viewMyInspectDetail", {
          repId:this.repId,
          corpId:this.corpId
        });
      }else if( this.checkNo ){
        this.get("/user-web/restapi/ytUsers/viewPacsDetail", {
          checkNo:this.checkNo,
          corpId:this.corpId
        });
      }

    },
    onSuccess:function( result ){

      let {
        patientName,
        inspectTypeName, //报告单名字
        checkItem,
        corpName,
        checkUpDept, //检查科室
        inspectDate, //送检时间
        checkUpDoctor,  //检查医生
        checkUpDate, //结果时间
        checkUpDetailList,
        checkResult,
        checkDesc,
        auditDoctName,//检查医生
        checkNo,
        inspecDeptName,
        reportDate,
        inspecDate
      } = result.data;

      //为什么不直接设置，可以让字段更明显
      this.setState(this.util.vis({
        loading:false,
        success:true,
        patientName,
        inspectTypeName: inspectTypeName || checkItem,
        corpName,
        checkUpDept: checkUpDept || inspecDeptName,
        inspectDate: inspectDate || inspecDate,
        checkUpDate: checkUpDate || reportDate,
        checkUpDoctor: checkUpDoctor || auditDoctName,
        checkUpDetailList,
        checkResult: checkResult || "无",
        checkDesc:checkDesc || "无",
        auditDoctName,
        checkNo
      }))

    },
    render( state ){
      if( this.repId ){
        return this.renderTypeRep( state )
      }else if(this.checkNo){
        return this.renderTypeRep2( state )
      }else{
        return this.renderError(state)
      }
    },
    //报告单头部
    renderRepHeader( state ){
      let {
          patientName,
          inspectTypeName,
          corpName,
          checkUpDept,
          inspectDate,
          checkUpDoctor,
          checkUpDate,
          checkUpDetailList,
      } = state;
      return `
        <div class="header">
            <h1>${patientName}</h1>
            <p><span class="y-icon-inspect"></span>${inspectTypeName}</p>
            <p><span class="y-icon-address"></span>${corpName} ${checkUpDept}</p>
        </div>
        <div class="sub-info">
            <div class="start-time">
              <div class="title">送检时间</div>
              <div class="text">${this.util.dateFormat(inspectDate, "yy.MM.dd hh:mm")}</div>
            </div>
            <div class="doctor">
                <div class="title">检验医生</div>
                <div class="text">${checkUpDoctor}</div>
            </div>
            <div class="end-time">
                <div class="title">结果时间</div>
                  <div class="text">${this.util.dateFormat(checkUpDate, "yy.MM.dd hh:mm")}</div>
            </div>
        </div>
      `
    },
    //影像报告单
    renderTypeRep2(state){

      let {
          patientName,
          inspectTypeName,
          corpName,
          checkUpDept,
          inspectDate,
          checkUpDoctor,
          checkUpDate,
          checkUpDetailList,
          checkResult,
          checkDesc,
          auditDoctName,
          checkNo
      } = state;

      return `
        <div class="page-report-detail">
          ${this.renderRepHeader(state)}
          <div class="module ui-border-tb">
            <h1>检查所见</h1>
            <div class="content">
              ${checkDesc.split("；").join("；<br/>")}
            </div>
          </div>
          <div class="module ui-border-tb">
            <h1>检查结果</h1>
            <div class="content">
              ${checkResult.split("；").join("；<br/>")}
            </div>
          </div>
          <div class="module ui-border-tb">
            <div class="content">
              检查号：${checkNo} <br/>
              来源：${corpName}<br/>
              审核医生： ${auditDoctName}<br/>
            </div>
          </div>
        </div>
      `
    },
    //检查报告单
    renderTypeRep( state ){

      let {
          patientName,
          inspectTypeName,
          corpName,
          checkUpDept,
          inspectDate,
          checkUpDoctor,
          checkUpDate,
          checkUpDetailList,
      } = state;
      let util = this.util;
      return `
        <div class="page-report-detail">
          ${this.renderRepHeader(state)}
          <div class="tag-tips"><span class="high-icon">↑</span>高于参考值 <span class="low-icon">↓</span>低于参考值</div>
          <div class="report-items">
                <div class="item head">
                      <span class="first">检查项目</span>
                      <span class="second">结果</span>
                      <span class="last">参考值</span>
                </div>
                ${
                  checkUpDetailList.map((item)=>{
                    item = util.vis({
                      viewItemMark:item.viewItemMark,
                      itemName:item.itemName,
                      itemAbbr:item.itemAbbr,
                      itemRealValue:item.itemRealValue,
                      itemUnit:item.itemUnit,
                      itemRefRange:item.itemRefRange || "无"
                    });
                    let highClass = item.viewItemMark == 1 ? "high" : ""
                    let lowClass = item.viewItemMark == -1 ? "low" : ""
                    return `
                       <div class="item ${highClass} ${lowClass} ui-border-b">
                        <span class="first" >${item.itemName}${item.itemAbbr}</span>
                        <span class="second" >
                          ${item.itemRealValue}
                          ${item.itemUnit}
                          ${item.viewItemMark == 1 ? `<span class="high-icon">↑</span>` : ""}
                          ${item.viewItemMark == -1 ? `<span class="low-icon">↓</span>` : ""}
                        </span>
                        <span class="last" >${item.itemRefRange}</span>
                      </div>
                    `
                  }).join("")
                }
          </div>
        </div>
      `
    },
    renderError(){
      return `
        <section class="ui-notice" >
            <i></i>
            <p>没有查询到报告单</p>
       </section>
      `
    }
  });

  page.init();

  module.exports = page;

});
