define(function(require, exports, module){


  var PageModule = require("component/PageModule");


  var page = PageModule.render({
    init:function(){

      this.type = this.query.type;
      this.deptCode = this.query.deptCode;
      this.corpId = this.query.corpId;
      this.deptName = this.query.deptName;
      this.parentDeptCode = this.query.parentDeptCode
      this.id = this.query.id;


      var self = this;
      this.get("/user-web/restapi/common/reservation/regDoctlist", {
        corpId:this.corpId,
        deptCode:this.deptCode,
        type:this.type,
        id:this.id
      });


    },
    onSuccess:function( result ){

      var data = result.data;
      var type = this.type;
      var corpId = this.corpId;

      var params = {
        type:this.type,
        corpId:this.corpId,
        deptCode:this.deptCode,
        deptName:this.deptName,
        parentDeptCode:this.parentDeptCode,
        id:this.id
      }

      var html = '<ul class="ui-list ui-border-tb ui-list-link">'+
        '{@each list as item}'+
        '<li class="ui-border-t">'+
            '<a href="../select-scheduling.html?doctCode=${item.doctCode}&'+this.util.flat(params)+'&target=_blank" >'+
                '<div class="ui-list-info">'+
                    '<h4 class="ui-nowrap">${string(item.doctName)}</h4>'+
                    '<p class="ui-nowrap">${string(item.doctTech)}</p>'+
                '</div>'+
            '</a>'+
        '</li>'+
        '{@/each}'+
      '</ul>'

      if( result.data && result.data.length ){
        this.renderTo(html, {list:data}, $('#J_DoctorList'));
      }

      $('#J_Page').removeClass("wait");

    }
  });

  page.init();

  module.exports = page;

});
