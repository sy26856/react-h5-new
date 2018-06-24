define(function(require, exports, module){

  var PageModule = require("component/PageModule");

  var page  = PageModule.render({

    init:function(){

      this.get("/user-web/restapi/common/corpNews/unionNotes",{
        corpId:this.query.corpId,
        unionId:this.query.unionId
      });

    },
    onSuccess:function( result ){

      $('#J_Page').removeClass("wait");
      $('#J_Content').html( result.data.privateNotes );
    }
  });

  page.init();
  
  module.exports = page;

});