
// 患者绑定的卡片
define("pages/patient-card-detail",function(require, exports, module){

  var PageModule = require("component/PageModule");

  var cardModule  = PageModule.render({
    init:function(){

        this.unionId = this.query.unionId;
        this.cardId = this.query.id;
        this.patientId = this.query.patientId;
				this.corpId = this.query.corpId;
        var self = this;
        //J_ChangeNewCardLink
        this.get("/user-web/restapi/card/list",{
            unionId:this.unionId,
	          corpId: this.corpId,
            patientId:this.patientId
        });

        $('#J_BindNewCard').bind("click", function(){
            window.location.href = 'bind-card.html?newCard=1&'+self.util.flat({unionId:self.unionId, patientId:self.patientId});
        })
    },
    onError:function(){

    },
    onSuccess:function( result ){
        /**
        gmtModify: 1462499849000,
        gmtCreate: 1462449374000,
        id: 3,
        status: 0,
        patientId: 503,
        cardNo: "1234567",//卡面号
        cardType: "4",//卡类型
        customId: "011302452051",//认证客户ID
        mobile: "15958115801",//预留手机号
        balance: -1 //余额
        */
        //如果卡片存在
        $('#J_Page').removeClass("wait");

        if(this.unionId == 60){
            $('#J_CardQA').removeClass("hide")
        }
        if( result.data &&  result.data.cardNo ){

            var tmpl = '<div class="ui-form ui-medical-card">'+
                '<ul class="ui-list ui-list-text ui-border-tb" id="J_PatientCard">'+
            '<li class="ui-border-t ">'+
                '<label class="ui-radio" for="J_FeeChannel1">'+
                    '<div class="ui-medical-info">'+
                        '<i class="medical-icon icon-card"></i>'+
                        '<div class="info">'+
                            '<h2>${cardName}</h2>'+
                            '<p class="yu-e" >余额: ${balance/100} 卡号:${cardNo}</p>'+
                        '</div>'+
                    '</div>'+
                '</label>'+
            '</li>'+
            '</ul></div>';

            $('#J_PatientCard').html( this.juicer( tmpl, result.data ) );
        }else{
            $('#J_PatientCard').html( '<div class="ui-tips center">卡片不存在</div>' );
        }
    }
  });


  cardModule.init();

  module.exports = cardModule;

});
