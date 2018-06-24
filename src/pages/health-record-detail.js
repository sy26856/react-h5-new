"use strict";
//define(function (require, exports, module) {

define(function(require, exports, module){

	var PageModule = require("component/PageModule");

	var page = PageModule.render({
		init:function(){
			
			this.get("/user-web/restapi/ytUsers/viewMyHealthyDataDetail", {
				id:this.query.id
			})

			this.keyMap = {
				weight:{text:"体重", unit:"kg"},
				bloodPressureSystolic:{text:"收缩压", unit:"mmHg"},
				bloodPressureDiastolic:{text:"舒张压", unit:"mmHg"},
				bloodGlucose:{text:"血糖", unit:"mmol"},
				bloodLipid:{text:"血脂", unit:"mmol/L"},
				pulse:{text:"脉搏", unit:"bpm"},
				bo:{text:"血氧", unit:"mmHg"},
				fetalheart:{text:"胎心", unit:"次/分钟"},
				chol:{text:"胆固醇", unit:"mmol/L"},
				ua:{text:"尿酸", unit:"umol/L"},
				fat:{text:"脂肪", unit:"CAL"},
				bmr:{text:"代谢", unit:"g/kg"},
				water:{text:"水分", unit:"ppm"},
				height:{text:"身高", unit:"cm"},
				bmi:{text:"bmi值", unit:"bmi"},
				waistline:{text:"腰围", unit:"cm"},
				hipline:{text:"臀围", unit:"cm"},
				whr:{text:"臀围比", unit:""},
				bmdT:{text:"骨密度", unit:"BMD"},
				bmdZ:{text:"骨密度", unit:"BMD"}
			}
		},
		onSuccess( result ){
			$("#J_Page").removeClass("wait");

			var self = this;
			var tmpl = '<div class="baogao">'+
				'<h1>${data["healthReportName"]}</h1>'+
				'<div class="ui-tips">就诊人：${data["patientUserName"]}，上传于：${hospitalName(data["hospitalName"],data["icpcode"])}</div>'+
				'<ul class="ui-list ui-list-text ui-border-tb">'+
					'{@each items as value,key}'+
	                	'<li class="ui-border-t"><h4>${keyText(key)}</h4> <div class="ui-txt-info" >${value} ${keyUnit(key)}</div></li>'+
	               	'{@/each}'+
	            '</ul>'+
	            '{@if length== 0}<div class="ui-tips center" style="margin-top:20px;">没有检查项</div>{@/if}'+
			'</div>'+
			'<div class="ui-tips center">更新于: ${time(data["gmtModify"])}</div>';

			var keyMap = this.keyMap;

        	this.juicer.register("time", function(time){
		        try{
		          return self.util.dateFormat(time, "yyyy-MM-dd hh:mm:ss");
		        }catch(e){
		          return "";
		        }

		     });

        	this.juicer.register("keyText", function(key){
        		return keyMap[key] ? keyMap[key].text : key;
		     });

        	this.juicer.register("keyUnit", function(key){
		        return keyMap[key] ? keyMap[key].unit : key;
		    });

		    this.juicer.register("hospitalName", function(hospitalName, icpcode){
		        return hospitalName || icpcode;
		    });

      

        	var items = {}
        	for(var key in result.data){
        		if(this.keyMap[key] && result.data[key]){
        			items[key] = result.data[key]
        		}
        	}
        	console.log( items )
        	
        	this.renderTo(tmpl, {data:result.data, items:items, length:Object.keys(items)}, "#J_List");
		}
	});

	page.init();

	module.exports = page;
});