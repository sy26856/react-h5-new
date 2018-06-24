
//define(function (require, exports, module) {

define(function(require, exports, module){

	var PageModule = require("component/PageModule");

	var page = PageModule.render({
		init:function(){
            
            this.orderUrl = this.config.orderUrl;
             
            this.extension = "uid="+this.util.getUID();
            this.uid = this.util.getTID();//this.util.getUID();
            this._id = this.query._id;
            var self = this;
			try{
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
				if( !text ){
					self.util.alert("请填写反馈建议");
					return ;
				}

				self.util.alert("反馈提交成功，感谢您对我们的支持");
				$('#J_Textarea').val('');
				self.submit(text);
				
			});
		},
		submit:function( text ){
            var self = this;
            var url = self.orderUrl + "/reply";
			this.get(url, {
                    uid: self.uid,
                    content: text,
                    _id: self._id,
                    extension: self.extension,
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