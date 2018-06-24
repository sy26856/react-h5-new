define(function (require, exports, module) {

    var PageModule = require("component/PageModule");

    var page = PageModule.render({
        init: function () {
            this.saveKey = "zhuyuan-cache";
            this.registerData = this.cache.getCacheModule(this.saveKey);
            var patient = this.patient = this.registerData.get("patient");
            this.patientIdNo = this.registerData.get("patientIdNo").value || "****";
            this.corpId = this.query.corpId;
            this.unionId = this.query.unionId;

            this.patientId = patient.value;

            this.regEvent();

            // if (!(patient && patient.value)) {
            //     $("#no-patient").css("display", "block");
            //     $("#J_Page").css("display", "none");
            //     return;
            //
            // }
            if (patient && patient.value){
                this.renderPatient(patient.name, this.patientIdNo);
                // this.loadData(patient.value, patient.name);
            }
            this.getPatient(this.patientId);


        },

        //加载默认就诊人
        getPatient(patientId){
        	  var self = this;
            PageModule.render({
                init: function () {
                    this.get("/user-web/restapi/patient/getList", {
                        unionId: this.query.unionId || this.unionId,
                        corpId: this.query.corpId || this.corpId
                    })
                },
                onSuccess(result){
                    if (result.data) {
                        var patientList = result.data;
                        var isSelect = false;
	                    var needDefault = this.cache.get("needDefault");
                        for (var i = 0; i < patientList.length; i++) {
                            if (patientId == patientList[i].id && needDefault=="false") {
                                isSelect = true;
                                lib.windvane.fire({
                                    ret: "SUCCESS",
                                    origin: "self",
                                    data: `{"patientId":"${patientList[i].id}","patientName":"${patientList[i].patientName}","patientIdNo":"${patientList[i].idType==1?patientList[i].idNo:patientList[i].guarderIdNo}","origin":"self"}`
                                });
                                break;
                            }
                        }

                        if (!isSelect) {
	                        for(var i=0; i<patientList.length; i++) {
		                        if (patientList[i].default) {
			                        isSelect = true;
			                        lib.windvane.fire({
				                        ret: "SUCCESS",
				                        origin: "self",
				                        data: `{"patientId":"${patientList[i].id}","patientName":"${patientList[i].patientName}","patientIdNo":"${patientList[i].idType==1?patientList[i].idNo:patientList[i].guarderIdNo}","origin":"self"}`
			                        });
		                        }
	                        }
                        }
                        if (!isSelect) {
                            $("#no-patient").css("display", "block");
                            $("#J_Page").css("display", "none");
                            $("#J_Patient").css("display", "none");
                            $(".line-span").css("display", "none");
                        }
                    }
                },
                onError(){

                }
            }).init();
        },

        loadData: function (patientId, patientName) {


            this.patientName = patientName;
            this.patientId = patientId;
            //alert( patientName )
            this.renderPatient(patientName, this.patientIdNo);

            this.getCache("/user-web/restapi/inhos/patientinfo", {
                patientId: patientId,
                unionId: this.unionId,
                corpId: this.corpId
            });

            $('#J_Page').addClass("wait");
        },
        //跳转到选择就诊人页面
        choosePatient: function () {

            var chooseUrl = window.location.origin + window.location.pathname.slice(0, window.location.pathname.indexOf("/pages/") + 7) + "patient-list.html?selectView=1&saveKey=" + this.saveKey;
            //console.log( chooseUrl )
            if (this.util.isInYuantuApp()) {
                chooseUrl += "&backview=1";//登录完成跳转到上一个页面并刷新
                this.util.brige("openView", {
                    url: chooseUrl,
                    animation: "left-in"
                });
            } else {
                //直接跳转 chrome 历史记录不会记录当前URL   Google Chrome 46.0.2490.71 (64-bit)
                setTimeout(function () {
                    window.location.href = chooseUrl;
                }, 500);
            }
        },

        //绑定页面事件
        regEvent: function () {
            var self = this;
            //删除上一次的选择记录
            //下一个界面选择的就诊人，会通过windvane传递过来
            lib.windvane.on(function (result) {
                if (result.ret == "SUCCESS") {
	                self.cache.set("needDefault",true);
                    var data = result.data ? JSON.parse(result.data) : null;
                    if (data.patientId && ( data.origin == "self" || data.origin == "daily-list" || data.origin == "patient-list" )) {

                        self.patientIdNo = data.patientIdNo || "****";
                        self.loadData(data.patientId, data.patientName);
                    }
                }
            });

        },
        onError: function (result) {
            var tmpl =
                '<div style="height: 200px;">' +
                '<div class="ui-notice">' +
                '<i></i>' +
                '<p>没有住院记录</p>' +
                '</div>' +
                '</div>';
            $("#J_List").html(tmpl);
            $('#J_Page').removeClass("wait");
            this.errorHandle(result);

        },

        onSuccess: function (result) {

            this.render(result.data);
            $('#J_Page').removeClass("wait");

            this.registerData.refresh();
            this.registerData.set("hospitalize", result.data)

        },
        renderPatient: function (name, idNo) {

            $("#no-patient").css("display", "none");
            $("#J_Patient").css("display", "block");
            $("#J_Page").css("display", "block");
            $(".line-span").css("display", "block");
						var href = `../patient-list.html?corpId=${this.corpId}&selectView=1&saveKey=zhuyuan-cache&target=_blank`;
            var tmpl =
                '<div class="inpatient-icon" style="background-image:url(//s.yuantutech.com/i4/47f8f9bb6c859be98888b0b13c20364a-92-92.png);"></div>' +
                '<div class="inpatient-info" id="J_Inpatient">' +
                '<div class="inpatient-name">' +
                '<em id="inpatient-name">${name}</em>' +
                '<a class="inpatient-choice" href='+href+'>切换就诊人</a>' +
                '</div>' +
                '<div class="inpatient-idNo" id="inpatient-idNo">${idNo}</div>' +
                '</div>';

            this.renderTo(tmpl, {name: name, idNo: idNo}, "#J_Patient");

        },
        render: function (data) {

            this.renderPatient(this.patientName || data.name, data.idNo || this.patientIdNo);
            var len = 0;
            if (data.items == undefined) {
                len = 0
            } else {
                len = data.items.length
            }

            var self = this;

            var patientName = this.patientName;
            var patitentId = this.patientId;


            var tmpl =
                '{@each list as item}' +
                '<a class="hospitalize-item ui-border-tb" href="daily-list.html?patientHosId=${item.patientHosId}&target=_blank&corpId=${item.corpId}&patientId=' + patitentId + '&patientName=' + patientName + '&unionId='+this.unionId + '">' +
                '<div class="hospitalize-body ">' +
                '<div class="hospital-name">${item.corpName}</div>' +
                '<div class="hospital-dept">${item.deptName}<span>费用合计: <em>¥${item.cost|moneyFormat}</em></span></div>' +
                '</div>' +
                '<div class="ui-border-t" style="height: 1px"></div>' +
                '<div class="hospitalize-title">入院日期:${item.createDate}</div>' +
                '<div>住院号: ${item.patientHosId} <em class="hospitalize-status">${item.status}</em> </div>' +
                // '<div class="hospitalize-title">' +
                // '入院日期:${item.createDate}' +
                // '<div class="hospitalize-status">${item.status}</div>' +
                // '</div>' +
                // '<div class="ui-border-t" style="height: 1px" ></div>' +
                // '<div class="hospitalize-body ">' +
                // '<div class="hospital-name">${item.corpName}  ${item.deptName}</div>' +
                // '<div class="hospital-bed ui-arrowlink">' +
                // '住院号: <em class="bed-no">${item.patientHosId}</em>' +
                // '病区: <em>${item.area}</em>' +
                // '床位: <em>${item.bedNo}</em>' +
                // '</div>' +
                // '<div class="hospital-cost">' +
                // '费用合计: <em class="cost-sum">${item.cost|moneyFormat}元</em>' +
                // '</div>' +
                // '</div>' +
                '</a>' +
                '{@/each}' +
                '{@if len == 0}<div style="height: 200px;"><div class="ui-notice"> <i></i> <p>没有住院记录</p> </div></div>{@/if}';

            this.juicer.register("moneyFormat", this.util.moneyFormat);

            this.renderTo(tmpl, {list: data.items, len: len}, "#J_List");

        }
    });

    page.init();

    module.exports = page;
});
