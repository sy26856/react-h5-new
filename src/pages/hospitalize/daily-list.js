define(function (require, exports, module) {

    var PageModule = require("component/PageModule");

    var page = PageModule.render({
        init: function () {

            this.unionId = this.query.unionId;
            this.corpId = this.query.corpId;
            this.patientId = this.query.patientId;
            this.patientName = this.query.patientName;
            this.patientHosId = this.query.patientHosId;

            this.registerData = this.cache.getCacheModule("zhuyuan-cache");
            this.hospitalize = this.registerData.get("hospitalize").value;

            this.regEvent();

            this.renderPatient(this.patientName, this.hospitalize.idNo || "****");
            this.renderHospitalizeInfo();

            var pageSize = 100;
            var pageNumber = 1;

            this.loadData(this.corpId, this.patientId, pageSize, pageNumber);


        },
        loadData: function (corpId, patientId, pageSize, pageNum) {

            $('#J_Page').addClass("wait");
            this.getCache("/user-web/restapi/inhos/inhosbilllist", {
                unionId: this.unionId,
                patientId: patientId,
                corpId: corpId,
                pageSize: pageSize,
                pageNum: pageNum,
                visitId: 1
            });

        },
        renderPatient: function (name, idNo) {

            $('#inpatient-name').text(name);
            $('#inpatient-idNo').text("身份证:" + idNo);
        },

        renderHospitalizeInfo: function () {

            var list = this.hospitalize.items;
            var x = 0;
            for (x in list) {
                if (list[x].patientHosId == this.patientHosId) {
                    var area = list[x].area == "null" ? "" : list[x].area;
                    var bedNo = (list[x].bedNo == "null" || !list[x].bedNo) ? "" : list[x].bedNo;
                    $('#hos-date').html(list[x].createDate);
                    $('#hospitalize-status').html(list[x].status);
                    $('#hos-name').html(list[x].corpName);
                    $('#hos-dept').html(list[x].deptName);
                    $('#hos-no').html(list[x].patientHosId);
                    $('#area').html(area);
                    $('#bed-no').html(bedNo);
                    $('#cost-sum').html((this.util.moneyFormat(list[x].cost) || "0") + "元");
                    return true;
                }
            }
        },
        //跳转到选择就诊人页面
        choosePatient: function () {
            var chooseUrl = window.location.origin + window.location.pathname.slice(0, window.location.pathname.indexOf("/pages/") + 7) + "patient-list.html?saveKey=zhuyuan-cache&selectView=1";

            if (this.util.isInYuantuApp()) {
                choiseUrl += "?backview=1";
                this.util.brige("openView", {
                    url: chooseUrl,
                    animation: "bottom-in"
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

            //在浏览器中当前页面选择完就诊人直接跳转到第一个界面
            if (this.patientId != this.registerData.get("patient").value) {
                window.history.back(true);
                return;
            }

            //删除上一次的选择记录
            //下一个界面选择的就诊人，会通过windvane传递过来
            lib.windvane.on(function (result) {

                if (result.ret == "SUCCESS") {
                    var data = result.data ? JSON.parse(result.data) : {};
                    //alert(data.patientId+ data.patientName);
                    self.util.brige("pushDataToParent", {
                        autoBack: true,
                        data: JSON.stringify({
                            patientId: data.patientId,
                            patientName: data.patientName,
                            origin: "daily-list"
                        })
                    });
                }
            });

        },
        onSuccess: function (result) {

            this.render(result.data);
            $('#J_Page').removeClass("wait");

        },
        render: function (data) {

            var self = this;

            self.renderPatient(this.patientName, this.hospitalize.idNo || "****");

            var len = 0;
            if (!data.items) {
                len = 0
            } else {
                len = data.items.length
            }
            var tmpl =
                '{@each list as item}' +
                '<a class="daily-item ui-border-tb ui-arrowlink" href="daily-detail.html?target=_blank&date=${item.tradeTime}&corpId='
                + self.corpId + '&unionId=' + self.unionId + '&patientId=' + this.patientId + '&patientName=' + this.patientName
                + '&patientHosId=' + this.patientHosId + '">' +
                '每日清单<em class="date-em">${item.tradeTime}</em>' +
                '<em class="daily-cost">${item.cost|moneyFormat}元</em>' +
                '</a>' +
                '{@/each}' +
                '{@if len == 0}<div style="height: 200px;"><div class="ui-notice"> <i></i> <p>没有日清单</p> </div></div>{@/if}';

            this.juicer.register("moneyFormat", this.util.moneyFormat);

            this.renderTo(tmpl, {list: data.items}, "#J_List");

        }
    });

    page.init();

    module.exports = page;
});