
//define(function (require, exports, module) {

define(function(require, exports, module){

	var PageModule = require("component/PageModule");
	var ScrollHooker = require("component/ScrollHooker");

	var page = PageModule.render({
		init:function(){
			var self = this;
			var currentPage = 1;
			//下拉分页
			this.scrollHooker = new ScrollHooker();
			this.scrollHooker.onEnd = function(){
        		$('#J_PullLoading').removeClass("hidden");
				self.renderPageList( currentPage++ );
			};

			self.renderPageList( currentPage++ );

		},
		renderPageList:function(currentPage){
			//alert( "currentPage"+currentPage )
			this.get("/user-web/restapi/common/ytUsers/getAllFeedBack", {
				currentPage:currentPage,
				pageSize:50
			});
		},
		onComplate:function(result){
			//$('#J_PullLoading').addClass("hide");
			this.supperClass.onComplate.call(this, result );
		},
		onSuccess:function(result){

			// var html = '<ul class="ui-list ui-list-text ui-border-tb">';
			// for(var i=0; i<result.data.length; i++){
			// 	var item = result.data[i];
			// 	try{
			// 		html += '<li class="ui-border-t">'+decodeURIComponent(item.suggestion).split("|").join("</br>")+'</li>';
			// 	}catch(e){}
			// }
			// html += '</ul>';

			var self = this;

			var tmpl = '<ul class="ui-list ui-list-text ui-border-tb">'+
				'{@each list as item}'+
				'<li class="ui-border-t">'+
					'{@each item.suggestion as it }'+
						'<div>${it}</div>'+	
					'{@/each}'+
					'<div>${dateFormat(item.gmtCreate)}</div>'+
				'</li>'+
				'{@/each}'+
			'<ul>';


			$('#J_Page').removeClass("wait");
			if( result.data.length ){

				result.data.map(function(item){
					// console.log(text)
					item.suggestion = (item.suggestion+"|userid:"+item.userId).split("|").map(function(item){
						return decodeURIComponent(item);
					});
			    });

			    //处理 假值
			    this.juicer.register("dateFormat", function(value){
			    	return self.util.dateFormat(value);
			    });
			    
			    // console.log( this.juicer.parse(tmpl) );
			    var html = this.juicer(tmpl, {list:result.data})

				if( html ){
		    		result.data.currentPage == 1 ? $('#J_List').html( html ) : $('#J_List').append( html );
				}
				if( result.data.currentPage >= (result.data.totalItem / result.data.pageSize) ){
					this.scrollHooker.recovery();
					$('#J_PullLoading').addClass("hide");
				}
			}
		}
	});

	page.init();

	module.exports = page;
});