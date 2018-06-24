/**
    获取患者是否有就诊卡
*/

//
define("pages/patient-card",function(require, exports, module){

  var VModule = require("component/VModule");

  var cardModule  = VModule.render({
    init:function(unionId, patientId){

      this.unionId = unionId;
      this.patientId = patientId;
      this.state = {
        loading:true,
        success:null,
        bindCardList:[],
        canBindCardTypeList:[]
      }

      this.module = this.initModule(this.state, '#J_PatientCard');


      this.initData();

    },
    initData(){
      this.get("/user-web/restapi/card/bindInfoList", {
          unionId:this.unionId,
          patientId:this.patientId
      });
    },
    //页面回到前台，需要从新检查绑卡信息
    onActivation(){
      this.initData();
    },

    onError:function(){
      bindCardItemInit.init();
    },

    onSuccess:function( result ){
      //http://fbi.yuantutech.com:3100/mock/user-web/restapi/card/bindInfoList
      this.setState({
        loading:false,
        success:true,
        bindCardList:result.data.bindCardList || [], // 已绑定的卡片列表
        canBindCardTypeList:result.data.canBindCardTypeList || [], // 可以绑定的卡片列表
      })

    },
    render(state){
      let bindCardList = state.bindCardList;
      let canBindCardTypeList = state.canBindCardTypeList;

      return `
        <div>
            <div class="ui-tips center">与就诊人绑定的相关卡片</div>
            <div class="ui-form ui-medical-card">
                <ul class="ui-list ui-list-text ui-border-tb">
                  ${
                    bindCardList.map((item)=>{
                      if(item.cardType == 4){
                        return this.renderReadyCardType4(item)
                      }
                      if(item.cardType == 6){
                        return this.renderReadyCardType6(item)
                      }
                      return ""
                    }).join("")
                  }

                  ${
                    canBindCardTypeList.map((item)=>{
                      if(item.cardType == 4){
                        return this.renderBindCardType4(item)
                      }
                      if(item.cardType == 6){
                        return this.renderBindCardType6(item)
                      }
                      return ""
                    }).join("")
                  }
                </ul>
            </div>
        </div>
        `
    },
    //卡类型为4的
    renderReadyCardType4( card ){
      let {id, cardName, balance, cardNo, cardType} = card;
      let unionId = this.unionId;
      let patientId = this.patientId;
      balance = Math.max(balance, 0);
      return `
          <li class="ui-border-t ui-arrowlink">
              <a class="ui-medical-info" href="${ this.util.flatStr("./patient-card-detail.html?", {id,cardType,unionId,patientId,cardName,"target":"_blank"})}" >
                  <i class="medical-icon icon-card"></i>
                  <div class="info">
                      <h2>${cardName} <span class="card-number">(${cardNo.slice(-4)})</span></h2>
                      <p class="yu-e" >
                          卡内余额: <span class="number">${balance/100}元</span>
                      </p>
                  </div>
              </a>
          </li>
        `
    },
    //卡类型为6的
    renderReadyCardType6( card ){
      let {id, cardName, balance, cardNo, cardType} = card;
      let unionId = this.unionId;
      let patientId = this.patientId;

      return `
          <li class="ui-border-t ui-arrowlink">
              <a class="ui-medical-info" href="${ this.util.flatStr("../patient-card-detail.html?", {id,cardType,unionId,patientId,cardNo,cardName,"target":"_blank"})}" >
                  <i class="medical-icon icon-yibao"></i>
                  <div class="info">
                      <h2>${cardName} <span class="card-number">(${cardNo.slice(-4)})</span></h2>
                  </div>
              </a>
          </li>
        `
    },
    //卡类型为4的
    renderBindCardType4( card ){
      let {cardType, description, cardName} = card;
      return `
          <li class="ui-border-t ui-arrowlink">
              <a class="ui-medical-info" href="bind-card.html?cardType=${cardType}&description=${description}&unionId=${this.unionId}&patientId=${this.patientId}&target=_blank">
                  <i class="medical-icon icon-card"></i>
                  <div class="info no">
                      <h2>绑定${cardName}</h2>
                  </div>
              </a>
          </li>
        `
    },
    //医保个人账户绑定
    renderBindCardType6( card ){
      let {cardType, description, cardName, bindMedicareCardPostUrl,medicarePayParams} = card;
      // medicarePayParams.Signature = "4vtmK5qz3bypJaFhTjTqC2zj9RvXcG/hNdzoBEG1WWhKYZIIh+Vw3kZjGyRCRvCu";
      let medicarePayParamsKeys = ["Version", "Merchant", "TerminalCode", "ResponseUrl", "MerReserved", "Signature", "RedirectUrl"];//Object.keys(medicarePayParams);
      // medicarePayParams.Merchant = "102440153110004";
      // medicarePayParams.TerminalCode = "10000124"
      medicarePayParams.bindMedicareCardPostUrl = bindMedicareCardPostUrl;
      medicarePayParams.RedirectUrl = window.location.href;


      //远图android中有bug不能用新开窗口打开
      if(this.util.getPlatform() == "ios"){
        medicarePayParams.target="_blank"
      }


      return `
          <li class="ui-border-t ui-arrowlink"  >
              <form method="post"  action=${medicarePayParams["bindMedicareCardPostUrl"]} ref="form" >
                ${
                  medicarePayParamsKeys.map((key)=>{
                    return `<input type="hidden" name=${key}  value=${medicarePayParams[key]} />`
                  }).join("")
                }
                <a class="ui-medical-info" ref="card6" >
                    <i class="medical-icon icon-yibao"></i>
                    <div class="info no">
                        <h2>绑定${cardName}</h2>
                    </div>
                </a>
                <input type="submit" style="position:absolute;left:0;top:0;width:100%;height:100%;opacity:0;" value="提交" />
              </form>
          </li>
        `
    }
  });

  module.exports = cardModule;

});
