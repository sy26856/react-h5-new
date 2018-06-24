
//define(function (require, exports, module) {

define(function(require, exports, module){

	var PageModule = require("component/PageModule");

	var page = PageModule.render({
		init:function(){
            
            this.orderUrl = this.config.orderUrl;
             
            this.extension = "uid="+this.util.getUID();
            this.uid = this.util.getTID();//this.util.getUID();
            var self = this;
			try{
				var phone  = cache.getCacheModule().get("phone");
				if(phone){
					$('#J_Phone').val( phone.value );
				}
				var text = this.query.text;
				if( text ){
					$('#J_Textarea').text( text );
				}
			}catch(e){}
				
			this.regEvent();

		},
		regEvent:function(){
			var self = this;
			var icons = $('#J_Level .icon')
			icons.click(function(){
				var index = $(this).data("index");
				icons.removeClass("on");
				$(icons.slice(0, index)).addClass("on");
				$('#J_LevelInput').val( index );
			});

			$('#J_Submit').click(function(){
				var text = $.trim( $('#J_Textarea').val() );
                var contactWay = $('#J_Phone').val();
                var type = $('#J_Select').val();
                if( !type ){
					self.util.alert("请选择问题类型");
					return ;
				}
				if( !text ){
					self.util.alert("请填写反馈建议");
					return ;
				}
                if( !contactWay ){
					self.util.alert("请填写联系方式");
					return ;
				}

				self.util.alert("反馈提交成功，感谢您对我们的支持");
				$('#J_Textarea').val('');
				self.submit(text);
				
			});
		},
		submit:function( text ){
            var self = this;
            var url = self.orderUrl + "/submit";
			this.get(url, {
                    uid: self.uid,
                    type: $('#J_Select').val(),
                    content: text,
                    enclosure: "",
                    extension: self.extension,
                    contact: $('#J_Phone').val()
                } );
		},
		onComplate:function(){
            var self = this;
            self.util.goBack(true);
        }
	});

	page.init();

	module.exports = page;
});