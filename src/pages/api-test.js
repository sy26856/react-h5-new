define(function(require, exports, module){

  var PageModule = require("component/PageModule");
  var apiList = require("pages/api-list");

  var userInfo = PageModule.render({
    init:function(){

      this.get("/user-web/restapi/ytUsers/getUserInfo");

    },
    getUserInfo:function(){
      
    },
    onSuccess:function( result ){
      
      if( result.success ){
        $('#J_User').val(result.data.phoneNum);
      }else{
        $('#J_User').val("未登录");
      }
    },
    onError:function(){

    }  
  });


  var testPage = PageModule.render({
    init:function(){
      this.apiMap = {};
      this.regEvent();
      this.render();
    },
    regEvent:function(){
      var self = this;
      $('#J_Test').click(function(){
        self.submit();
      });

      $('#J_ApiList').change(function(){
          self.changeApi( $(this).val() );
      });
    },
    render:function(){
      
      var tmpl = '{@each list as item}'+
      '<optgroup label="${item.name}">'+
          '{@each item.list as it}'+
          '<option value="${it.api}">${it.api}</option>'+
          '{@/each}'+
      '</optgroup>'+
      '{@/each}';
      for(var i=0; i<apiList.length; i++){
        var list = apiList[i].list;
        for(var j=0; j<list.length; j++){
          // console.log( apiList[i].list[j] )
          this.apiMap[ list[j].api ] = list[j];
        }
      }
      var html = this.juicer(tmpl, {list:apiList});

      $('#J_ApiList').html( html )
    
    },
    changeApi:function( api ){

      var apiObj  = this.apiMap[api];

      if( apiObj ){
        $('#J_API').val( apiObj.api );
        $('#J_APIname').val( apiObj.name )
        $('#J_Param').val( JSON.stringify( apiObj.param , "", "  ") );
      }
    },
    submit:function(){

      var hj = $('#J_HuanJing').val();
      var api = $('#J_API').val();
      var param = $('#J_Param').val();

      $('#J_Result').text("")

      if(!api){
        this.util.alert("没填api");
        return ;
      } 

      try{
        param = param ? JSON.parse(param) : null;
      }catch(e){
        param = null;
      }

      if(!param){
        this.util.alert("参数格式");
        return ;
      } 

      config.domainName = (hj == 0 ? "//api.daily.yuantutech.com" : "//api.yuantutech.com");

      if(hj == -1){
        config.domainName = "//127.0.0.1:8080";
      }

      if(window.location.href.indexOf("domain") != -1){
        try{
          config.domain = window.location.href.match(/domain=([\d.:]+)/)[1];
          config.domainName = "//"+config.domain;
        }catch(e){

        }
      }
      
      // console.log( config.domainName )
      this.get(api, param);

    },
    onComplate:function(result){
      if(result){
        $('#J_Result').text( JSON.stringify(result, "", "  ") );
      }else{
        $('#J_Result').text( "接口错误，请看请求" );
      }

    }
  })

  userInfo.init();
  testPage.init();

  module.exports = {};



});