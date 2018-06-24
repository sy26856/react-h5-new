define(function(require, exports, module){


	var PageModule = require("component/PageModule");


	var scheduleInfo = PageModule.render({
		init:function(deptName,corpName,deptCode){

			this.deptName = deptName;
			this.corpName = corpName;
			this.deptCode = deptCode;
			this.corpId = this.query.corpId;
			this.deptCode = this.query.deptCode;
			this.doctCode = this.query.doctCode;

			this.util.waitAlert("正在获取排班")
			this.get("/user-web/ws/query/doct/schedule",{
				corpId:this.corpId,
				deptCode:this.deptCode,
				doctCode:"0000"
			});

			// 如果是从search.html搜索过来的，我需要在localStorage保存一下搜索的状态
			if($(document)[0].referrer.indexOf('search.html') !== -1) {
			  localStorage.setItem('isDetail', JSON.stringify({
			    isDetail: true,
			    corpId: this.corpId,
			    searchContent: this.query.searchContent
			  }))
			}
			// --- end

			// this.render({schdule:[]})
			//先渲染空数据
			$('#J_PaiBan').html( this.render({schdule:[],doct:{deptName:""}} )).removeClass("wait");
		},

		onSuccess:function(result){
			this.util.waitHide();
			$('#J_PaiBan').html( this.render(result.data) ).removeClass("wait");
			var contentHeight = $('#J_doctIntroContent').height()
			console.log(contentHeight)
			if(contentHeight >= 35){
				var i = 1;
				$('#J_FoldDoctIntro').removeClass("hide").click(function(){
					$('#J_doctIntroContent').toggleClass("fold");
					$(this).text(++i%2 ? "收起" : "查看全部");
				}).click();
			}
		},

		render(data){

			let schduleDate = this.getEmptyDates(data.today,8);
			let schduleMap = {};
			let doctName = data.doct ? data.doct.doctName : this.doctName;
			this.doctCode = data.doct.doctCode;
			data.schdule.map((item)=>{
				schduleMap[item.date.replace(/\d+\-/, "")] = item;//item.data;
			})

			return `
	    	<div class="module scheduling-box ui-border-tb">
	        	<h1><span class="icon paiban"></span>科室排班</h1>
	        	<div>
		        	<div class="scheduling-module left">
	        			<div class="scheduling-row head">
	        				<div class="td  ui-center"></div>
	        			</div>
	        			<div class="scheduling-row">
	        				<div class="td ui-container ui-center">上午</div>
	        			</div>
	        			<div class="scheduling-row">
	        				<div class="td ui-container ui-center">下午</div>
	        			</div>
	        		</div>
		        	<div class="scheduling-scroll">
			        	<div class="scheduling-module" style="width:${schduleDate.length*45-5}px">
			        		<div class="scheduling-row head">
			        			${
				schduleDate.map((item)=>{
					return `<div class="td ui-container ui-center">${item.week}<em>${item.date}</em></div>`
				}).join("")
				}
			        		</div>
			        		<div class="scheduling-row">
			        			${
				schduleDate.map((item)=>{
					return this.renderSchduleItem(schduleMap[item.date], 1 ,doctName)
				}).join("")
				}
			        		</div>
			        		<div class="scheduling-row">
			        			${
				schduleDate.map((item)=>{
					return this.renderSchduleItem(schduleMap[item.date], 2,doctName)
				}).join("")
				}
			        		</div>
			        	</div>
		        	</div>
	        	</div>
	        	`
		},
		//获取上午或者下午的排班
		getAcheduleAMPM(schduleData, AMPM){

			return schduleData.filter((item)=>{
				return item.medAmPm == AMPM;
			})[0]

		},
		//index == 0 当天显示挂号
		renderSchduleItem:function(schduleData, AMPM, doctName ,index){
			//上午或者下午有数据，and 剩余可预约号大于0
			var schedule = null;
			if(schduleData && schduleData.data && (schedule = this.getAcheduleAMPM(schduleData.data, AMPM))/**&&schduleData.data[AMPM]*/){
				// var schedule = schduleData.data[AMPM]
				var medDate = schduleData.date;
				var fee = Number(schedule.regAmount) / 100.0;
				// schedule.type = this.state.regTypes[schedule.regType];
				var href = "../info-confirm-2.html?" + this.util.flat({
						corpId:this.corpId,
						// doctCode: this.doctCode,
						medAmPm:schedule.medAmPm,
						scheduleId:schedule.scheduleId,
						type:schedule.type,
						regType:schedule.regType,
						medDate:medDate,
						regAmount:schedule.regAmount,
						regMode:schedule.regMode,
						// doctName:doctName,
						deptName:this.deptName,
						corpName:this.corpName,
						deptCode:this.deptCode,
						target:"_blank"
					})

				var restnum = schedule.restnum;
				var regMode = schedule.regMode;
				if (restnum > 0) {
					// 剩余号源大于0
					return `<a href="${href}" class="td ui-container ui-center">${regMode==2 ?  "挂号":"预约"}</a>`
				} else if (restnum == -1) {
					// 剩余号源==-1
					return `<div class="td ui-container ui-center">停诊</div>`
				} else if (restnum == 0) {
					// 剩余号源==0
					return `<div class="td ui-container ui-center">已满</div>`
				}else{
					//无排版
					return `<div class="td ui-container ui-center"></div>`
				}
			}else{
				return `<div class="td ui-container ui-center"></div>`
			}
		},
		//未来几天的日期
		getEmptyDates:function(startDate, length){

			var dates = [];
			var dayOfWeekList = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
			var weekAlias = ["今天","明天","后天"];

			startDate = startDate || new Date();
			length = length || 7;

			for(var i=0; i<length; i++){
				var date = new Date(startDate);
				var d = new Date( date.setDate(date.getDate()+i) )
				dates.push({
					date:this.util.dateFormat(d, "MM-dd"),
					week:weekAlias[i] || dayOfWeekList[d.getDay()]
				})
			}

			return dates;
		}

	})

	//dept info
	var deptInfo = PageModule.render({
		//user-web/restapi/common/doctor/getDoctAccountInfo
		init:function(){
			this.corpId = this.query.corpId;
			this.deptCode = this.query.deptCode;
			//corpId=265&deptCode=8001&doctCode=000402
			this.get("/user-web/ws/query/deptInfo",{
				corpId:this.corpId,
				deptCode:this.deptCode
			});

		},
		onSuccess:function(result){
			if(result && result.data){
				let data = result.data;
				let deptInfo = this.util.vis({
					deptCode:data.deptCode,
					deptName:data.deptName,
					parentDeptCode:data.parentDeptCode,
					parentDeptName:data.parentDeptName,
					bigDeptName:data.bigDeptName,
					corpName:data.corpName,
					corpId:data.corpId,
					deptIntro:data.deptIntro
				});

				$('#J_DeptInfo').html( this.render(deptInfo) ).removeClass("wait");
				scheduleInfo.init(data.deptName,data.corpName,data.deptCode);
			}else{
				this.onError();
			}
		},
		onError:function(){
			$('#J_DeptInfo').html(
				`<section class="ui-notice" >
		        <i></i>
		        <p>科室信息不存在</p>
		    	</section>
    		`
			).removeClass("wait");
		},
		render:function(data){

			let { deptCode, deptName, parentDeptCode, bigDeptName, corpName, corpId, deptIntro } = data;

			// doctIntro = "爱丽丝的减肥的了减肥了减肥拉丝机都发来撒减肥的拉开解放路的设计费拉伸的房间卡死啦爱丽丝的减肥的了减肥了减肥拉丝机都发来撒减肥的拉开解放路的设计费拉伸的房间卡死啦爱丽丝的减肥的了减肥了减肥拉丝机都发来撒减肥的拉开解放路的设计费拉伸的房间卡死啦爱丽丝的减肥的了减肥了减肥拉丝机都发来撒减肥的拉开解放路的设计费拉伸的房间卡死啦"
			return `<div class="doctor-card ui-border-tb">
			<div >
	            <span class="deptLogo"></span>
	        </div>
	        <div class="doctor-info">
	            <h1>${deptName}</h1>
	            <p>${bigDeptName || deptName}</p>
	            <p>${corpName}</p>
	        </div>
        </div>
     
        <div class="module ui-border-tb">
        	<h1><span class="jieshao"></span>科室简介</h1>
        	<div class="content" id="J_doctIntroContent">${deptIntro || "无"}</div>
          <div class="open-all ui-border-t hide" id="J_FoldDoctIntro">查看全部</div>
        </div>
        `
		}
	})

	deptInfo.init();

	module.exports = deptInfo;

});
