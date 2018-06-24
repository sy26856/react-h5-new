define(function(require, exports, module){


  var PageModule = require("component/PageModule");


  var page = PageModule.render({
    init:function(){

      this.get("/user-web/restapi/common/corpNews/newsDetail", {
        unionId:this.query.unionId,
        id:this.query.id
      });

    },
    onSuccess:function( result ){

      $('#J_NewsList').removeClass("wait");

      if(result.success || result.success == "true"){
        this.render(result.data);

        this.util.brige("share",{
          "isShowButton":true,
          "isCallShare":false , //是否立即唤醒分享
          "title": result.data.title,
          "text": result.data.summary,
          "url":window.location.href,
          "imageUrl": "https://image.yuantutech.com/user/0c306d9a190c1bcde2d8f9ad31e29810-300-300.jpg"
        }, function(e){
          // alert(JSON.stringify(e))
        }, function(e){
          // alert(JSON.stringify(e))
        }, 600000);

      }else{
        this.util.alert(result.msg);
      }
    },
    render:function( data ){

      $('#J_Title').html(data.title);
      $('#J_Time').text( this.util.dateFormat(data.gmtCreate, "MM-dd hh:mm") );
      $('#J_Category').text( data.classifyName );
      $('#J_Content').html( data.content || "" );

    }
  });


  //页面
  page.init();

  module.exports = page;

});
