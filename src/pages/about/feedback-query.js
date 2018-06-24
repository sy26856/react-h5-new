define(function(require, exports, module){

  // var io = require("io");
  // var url = require("../libs/url");
  // var juicer = require("../libs/juicer");
  // var config = window.config;

  var PageModule = require("component/PageModule");
  var md5 = require("libs/md5")

  var page = PageModule.render({
    init:function(){
        
      this.orderUrl = this.config.orderUrl;
      this.uid = this.util.getTID();
      var self = this; 
      
      if( !this.checkLogin() ){
        return ;
      };

      // tid 是后加上去的  如果cookie 里面没有需要重新登录
      if( !this.uid ){
        this.util.goLogin();
        return ;
      }
      
      this.get(self.orderUrl + "/query-list", {
        uid: self.uid
      });

    },
    //页面回来以后 尝试获取最新数据，并根据数据变化刷新页面
    onActivation:function(){

      this.init();
    },

    onSuccess:function( result ){
      var datamd5 = md5(JSON.stringify( result ));

      //如果数据无变化不更新数据
      if(this.datamd5 == datamd5){
        return ;
      }

      this.datamd5 = datamd5;

      $('#J_Page').removeClass("wait");

      var self = this;
      if(!result.data || !result.data.length){
        return ;
      }
      var html ='{@each data as item}'+
                    '<a href="feedback-detail.html?_id=${item._id}&status=${item.status}&target=_blank">'+
                        '<ul class="ui-list ui-list-pure ui-list-link ui-border-tb">'+
                            '<li class="ui-border-t">'+
                                '<h4 class="ui-nowrap">${item.content}</h4>'+
                                '<h5 class="ui-border-tt">{@if item.status == 2}<span class="have-massage">客服已回复</span>{@else if item.status == 3}已关闭{@else if item.status == 1}感谢您的反馈{@else if item.status == 0}客服已回复{@/if}, 提交时间&nbsp${dateFormat(item.date)}</h5>'+
                            '</li>'+
                        '</ul>'+
                    '</a>'+
                '{@/each}';
      
        this.juicer.register("dateFormat", function(time){
            
          return self.util.dateFormat(time, "MM-dd hh:mm:ss");
          			
        });
      this.renderTo( html, result, $('#J_List') );
    }

  });

  page.init();

  module.exports = page;

});