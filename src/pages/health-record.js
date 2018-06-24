
//define(function (require, exports, module) {

define(function(require, exports, module){

	var PageModule = require("component/PageModule");

	var page = PageModule.render({
		init:function(){

			this.checkLogin();
			this.regEvent();

		},
		regEvent:function(){
			var self = this;
			$('#J_Submit').click(function(){
				self.submit();
			});
		},
		submit:function(){
			var patientNo = $.trim($('#J_Patient').val());
			var kg = parseFloat($("#J_kg ").val());
			var mmkg1 = parseFloat($("#J_mmkg1").val());
			var mmkg2 = parseFloat($("#J_mmkg2").val());
			var mmol = parseFloat($("#J_mmol").val());
			var mmoll = parseFloat($("#J_mmoll").val());
			// var regexp = /^\d+$/;
			if( !patientNo ){
				this.util.alert("请选择就诊人");
				return ;
			}
			if(!kg || !kg < 0){
				this.util.alert("请输入体重或输入有误")
				return ;
			}
			if(!mmkg1 || !mmkg1 < 0){
				this.util.alert("请输入收缩压或输入有误")
				return ;
			}
			if(!mmkg2 || !mmkg2 < 0){
				this.util.alert("请输入舒张压或输入有误")
				return ;
			}
			if(!mmol || !mmol < 0){
				this.util.alert("请输入血糖或输入有误")
				return ;
			}
			if(!mmoll || !mmoll<0){
				this.util.alert("请输入血脂或输入有误")
				return ;
			}	

			//健康档案
			this.get("/user-web/restapi/ytUsers/saveMyHealthyData",{
				weight:kg,
				bloodPressureDiastolic:mmkg2,
				bloodPressureSystolic:mmkg1,
				bloodGlucose:mmol,
				bloodLipid:mmoll,
				idNo:patientNo
			})

		},
		onSuccess:function( result ){

			this.util.alert("健康数据记录成功");

			setTimeout(()=>{
				this.util.goBack(true);
				// window.location.href = "health-record-list.html?target=_blank";
			}, 1500)
		
		}
	});

	var patientList = PageModule.render({
		init:function(){
			this.get("/user-web/restapi/patient/getList", {
		        corpId:this.query.corpId || this.corpId
		    });
		},
		onSuccess:function(result){

      		var list = result.data;
      		var html = "";
      		
      		if( list && list.length){ 
      			for(var i=0; i<list.length; i++){
      				html += '<option value="'+list[i].idNo+'">'+list[i].patientName+'</option>';
      			}
      		}else{
      			this.util.alert("没有可选择的就诊人");
      			html = "<option>-</option>"
      		}

      		$('#J_Patient').html(html)
		}
		// onError:function(result){
		// 	if(result && result.resultCode == "202"){
		// 		this.util.alert("请先登录");	
		// 	}else{
		// 		$('#J_Patient').html("<option>-</option>")
		// 	}
		// }
	})

	page.init();
	patientList.init();

	module.exports = page;
});