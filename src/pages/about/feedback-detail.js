define(function(require, exports, module){

  // var io = require("io");
  // var url = require("../libs/url");
  // var juicer = require("../libs/juicer");
  // var config = window.config;

  var PageModule = require("component/PageModule");


  var page = PageModule.render({
    init:function(){
        
      this.orderUrl = this.config.orderUrl; 
      this.extension = 'uid='+this.util.getUID();
      this.uid = this.util.getTID();//this.util.getUID();
      this._id = this.query._id;
      this.status = this.query.status;
      var self = this;
      if( !this.checkLogin() ){
        return ;
      };
      
      
      this.regEvent();
     
      this.get(self.orderUrl + "/query-detail", {
        _id: self._id
      });
      
      
    },
    regEvent:function(){
        var self = this;
        
        if(self.util.getPlatform() == "android" && self.util.isInYuantuApp()){
            var aUrl = $('#J_android')[0].href;
            $('#J_android')[0].href = aUrl+'&_id='+this._id;
            $('#J_android').addClass('active');   
        }
        
        $('#message-show').tap(function(e){
            e.stopPropagation();
            $('#reply-box').addClass('active');
        });
        
        $('html').tap(function(e){
             e.preventDefault();
             $('#reply-box').removeClass('active');
             $('#J_Textarea')[0].blur();
        });
        
        $('#J_Submit').click(function(){
            var text = $.trim( $('#J_Textarea').val() );
            if( !text ){
                self.util.alert("请填写反馈内容");
                return ;
            }

            self.util.alert("反馈提交成功");
            $('#J_Textarea').val('');
            self.submit(text);
            
        });
        
        $('#J_Close').click(function(){
          self.util.dialog("你确定要关闭问题吗？", function(okay){
            if(okay){
              self.closelist();
            }
          })
        });
        
        
      $('#reply-box').tap(function(e){
          e.stopPropagation();
      });
    },
    closelist:function(){
    //   var self = this;
      PageModule.render({
          init:function( id ){
              this.get(this.config.orderUrl + "/close", {_id:id});
          },
          onSuccess:function(){
              $('#btn_box').hide();
              $('#reply-box').hide();
              $('#J_Tips').html('问题已关闭');
          }
      }).init( this._id );
      
    //   this.io.get(self.orderUrl + "/close",{
    //       _id: self._id
    //   },function(){
          
    //   },function(){
          
    //   }); 
    },
    submit:function( text ){
        // var self = this;
        // var url = self.orderUrl + "/reply";
        
       var replyModule = PageModule.render({
          init:function( uid, _id, text, extension ){
              this.get(this.config.orderUrl + "/reply", {
                    uid: uid,
                    _id: _id,
                    content: text,
                    extension: extension
              });
          },
          onSuccess:function(){
              location.reload();
          }
      });
      
      replyModule.init( this.uid, this._id, text, this.extension );
      
        // this.io.get(url, {
        //         uid: self.uid,
        //         _id: self._id,
        //         content: text,
        //         extension: self.cid
        //     },function(){
        //         location.reload();
        //     }, function(){
        //         self.util.alert("网络错误，请稍后再试")
        //     });
    },
    onSuccess:function( result ){
      // console.log( result )
      // alert( result.data.length )
      $('#J_Page').removeClass("wait");

      var html = '<ul class="ui-list-cover ui-list ui-border-tb" id="list-ul">'+
                    '{@each data as item}'+
                    '{@if item.uid == "system"}'+
                        '<li class="system-list">'+
                            '<div class="ui-avatar">'+
                                '<span style="background-color:#00CCFF"></span>'+
                            '</div>'+
                            '<div class="J_Item ui-border-t ui-list-info">'+
                                '<div class="ui-border-l"></div>'+
                                '<h4>${item.content}</h4>'+
                                '<h5 class="ui-txt-info">${dateFormat(item.date)}</h5>'+
                            '</div>'+
                        '</li>'+  
                    '{@else}'+
                        '<li class="user-list">'+
                            '<div class="ui-avatar">'+
                                '<span style="background-color:#66CC66">我</span>'+
                            '</div>'+
                            '<div class="J_Item ui-border-t ui-list-info">'+
                                '<div class="ui-border-l"></div>'+
                                '<h4>${item.content}</h4>'+
                                '<h5 class="ui-txt-info">${dateFormat(item.date)}</h5>'+
                            '</div>'+
                        '</li>'+
                    '{@/if}'+
                '{@/each}'+
                '</ul>';
      var self = this;
      this.juicer.register("dateFormat", function(time){
           return self.util.dateFormat(time, "MM-dd hh:mm");   			
      });
      this.renderTo( html, result, $('#J_List') );
      if(result && result.data && result.data.length &&  result.data[0] &&result.data[0].status == 3){
            $('#btn_box').hide();
            $('#reply-box').hide();
             $('#J_Tips').html('问题已关闭');
      }
      
      
    }

  });

  page.init();

  module.exports = page;

});