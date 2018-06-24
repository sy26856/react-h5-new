define("test/ticket-admin-list",function(require, exports, module){

  var PageModule = require("component/PageModule");

    //登记设备 token 
  var page = PageModule.render({
    init:function(){
		var pageNum = Number(this.query.pageNum) || 1
      	this.regEvent(pageNum);
      	this.get(config.orderUrl+"/admin/query-all-list", {
			  pwd:config.pwd,
			  pageNum: pageNum,
			  pageSize:50
			})
  	},
  	regEvent:function(pageNum){
  		if( config.pwd ){
  			$('#J_Key').val( config.pwd )
  		}
		var href = window.location.href
		
		if(pageNum == 1){
			$('#J_Previous').addClass('disabled')
		}else{
			$('#J_Previous a').attr('href',href.replace(/pageNum\=\w?\d+/, "pageNum=" + (pageNum-1)))	
		}
		
  		$('#J_SubmitKey').click(function(){
  			var key = $('#J_Key').val();
  			if( key != ""){
  				window.localStorage.setItem("ticket-admin-key", key);
  				window.location.reload();
  			}
  		})
  		$('#J_ClearKey').click(function(){
  			window.localStorage.removeItem("ticket-admin-key");
  			window.location.reload();
  		})
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
		var pageNum = Number(this.query.pageNum) || 1
		var href = window.location.href.split('#')[0]
		
  		var tmpl = '{@each list as item,index}'+
  			'<tr>'+
	          '<td scope="row" style="text-align:center;">{@if item.status == 1}<span class="badge">New</span>{@else}${++index}{@/if}</td>'+
	          '<td>${item.type.slice(0,20)}</td>'+
	          '<td><div style="height:3em;overflow:hidden;line-height:1.5;">${(item.content).slice(0, 50)}</div></td>'+
	          '<td>${(item.contact).slice(0,20)}</td>'+
	          '<td>${formate(item.date)}</td>'+
	          '<td><a href="ticket-detail.html?id=${item._id}">查看详情</a></td>'+
	        '</tr>'+
	    '{@/each}'
		;

	    this.juicer.register("formate", function(value){
	     	 return self.util.dateFormat(value)
	    });

	    this.renderTo(tmpl, {list:result.data}, "#J_List");
		
		if(result.data.length < 50){
			$('#J_Next').addClass('disabled')
		}else{
			if(this.query.pageNum){
				$('#J_Next a').attr('href',href.replace(/pageNum\=\w?\d+/, "pageNum=" + (pageNum+1)))
			}else{
				if((/\?/).test(href)){
					$('#J_Next a').attr('href',href.replace(/\?/, "?pageNum=" + (pageNum+1) + '&'))
				}else{
					$('#J_Next a').attr('href',href + ("?pageNum=" + (pageNum+1)))
				}	
			}
		}
  	},
	  
  	onError:function( result ){
  		console.log( result )
  	}
  })
  
  page.init();

  module.exports = page;
  
})