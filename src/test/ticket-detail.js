define("test/ticket-detail",function(require, exports, module){

  var PageModule = require("component/PageModule");

    //登记设备 token 
  var page = PageModule.render({
    init:function(){

        this.ticketStatus = null;

      	this._id = this.query.id;
      	this.get(config.orderUrl+"/admin/query", {pwd:config.pwd, _id: this._id});
      	this.regEvent();
  	},
  	regEvent:function(){

  		var self = this;
  		$('#J_ReplySubmit').click(function(){
        
  			var str = $.trim($('#J_ReplyContent').val());
  			if( str != "" ){

          if(self.ticketStatus == 3){
            if( !window.confirm("用户已关闭问题，再次回复会重新打开问题") ){
              return ;
            }
          }
  				
          self.reply( str );
  			
        }
  		});
  	},
  	reply:function( content ){

  		this.io.get(config.orderUrl+"/admin/reply", {pwd:config.pwd, _id:this._id, content:content}, function(){
  			window.location.reload();
  		}, function(){
  			alert("失败");
  		});

  	},
  	onSuccess:function(result){
  		
  		/**
			{
				_id: "56e23534645597972f8111b0",
				uid: "11f147abe41a14940a9f0e3147c3e9b4",
				level: 1,
				date: "2016-03-11T03:02:12.980Z",
				status: 1,
				extension: "",
				ticketId: "",
				useragent: "Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1",
				contact: "13567154774",
				enclosure: "",
				content: "dsdfdfsdf",
				type: "挂号预约"
			}
  		*/

  		var self = this;
  		var mainTmpl = '{@each list as item,index}'+
  				'<div class="jumbotron {@if index == 0}main{@else}{@if item.uid != "system"}reply-user{@/if}{@/if}">'+
				  '<h3 id="J_Type">${item.type}</h3>'+
				  '<div id="J_Content" class="content">${item.content}</div>'+
          '{@if item.uid != "system"}'+
				  '<div class="info">'+
				  	'{@if item.level == 1}<span class="J_Time">状态:${strStatus(item.status)}</span><span class="J_Time">联系方式:${item.contact}</span>{@/if} <span class="J_Time">时间:${formate(item.date)}</span> <span>扩展信息:{@if item.extension}${item.extension}{@else}无{@/if}</span>'+
					'<br/>'+
				  '<span class="ua">${item.useragent}</div>'+
          '{@/if}'+
				'</div>'+
				'{@/each}';


	    this.juicer.register("formate", function(value){
	     	 return self.util.dateFormat(value)
	    });
      this.juicer.register("strStatus", function(value){
         return {
          1:"用户已回复",
          2:"客服已回复",
          3:"问题已解决",
          0:"无状态"
         }[value] || "无"
      });

	    this.renderTo(mainTmpl, {list:result.data}, "#J_Detail");

      this.ticketStatus = result.data[0].status;
  	},

    onError:function( result ){
      console.log( result )
    }
  })
  
  page.init();

  module.exports = page;
  
})