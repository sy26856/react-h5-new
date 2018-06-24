
define(function(require, exports, module){

    var PageModule = require("component/PageModule");

    var page = PageModule.render({
        init:function(){
            this.corpId= this.query.corpId;
            this.unionId= this.query.unionId;
            this.date = this.query.date;
            this.patientId = this.query.patientId;
            this.patientName = this.query.patientName;
            this.patientHosId = this.query.patientHosId;

            this.registerData = this.cache.getCacheModule("zhuyuan-cache");
            this.hospitalize = this.registerData.get("hospitalize").value;

            this.renderPatient( this.patientName, this.hospitalize.idNo || "****");

            this.getCache("/user-web/restapi/inhos/inhosbilldetail", {
                unionId: this.unionId,
                corpId :    this.corpId,
                date    :     this.date,
                patientId :  this.patientId
            });

        },

        renderPatient: function(name, idNo){

            $('#inpatient-name').text(name);
            $('#inpatient-idNo').text("身份证:"+idNo);

            var list = this.hospitalize.items;
            var x = 0;
            for ( x in list){
                if ( list[x].patientHosId == this.patientHosId ){
                    $('#hos-name').text(list[x].corpName || '医院');
                    $('#patientHosId').text(list[x].patientHosId);
                    return true;
                }
            }

        },

        onSuccess:function( result ){

            var self = this;
            var patient = self.registerData.get("patient");
            self.renderPatient( patient.name, this.hospitalize.idNo );

            this.render( result.data );
            $('#J_Page').removeClass("wait");
            if ( $('#bottom-line').offset().top < $('.cost-span').offset().top) {
                $('.cost-span').removeClass("position-fix");
            }
        },
        render:function( data ){

            $('.detail-date').html(data.date);
            $('.daily-cost em').html(this.util.moneyFormat(data.dailyCost)+"元");
            var tmpl = 
                '{@each list as item}'+
                    '<tr>'+
                        '<td class="warp">${item.itemName}</td>'+
                        '<td>${item.itemPrice|moneyFormat,4}</td>'+
                        '<td>${item.itemQty}${item.itemUnits}</td>'+
                        '<td>${item.cost|moneyFormat}</td>'+
                    '</tr>'+
                '{@/each}';

            this.juicer.register("moneyFormat", this.util.moneyFormat);

            this.renderTo( tmpl, {list:data.items}, "#J_tablebody");

        }
    });

    page.init();


    module.exports = page;
});

