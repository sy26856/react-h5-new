define(function(require, exports, module){

  var PageModule = require("PageModule");

  var page = PageModule.render({
    init:function(){


      var self = this;

      this.id = this.query.id || "";
      this.corpId = this.query.corpId;

      this.getCache("/user-web/restapi/common/reservation/hospitalinfo", { corpId:this.corpId, id:this.id } );

      this.regTypes = [
          {
            type:"1",
            regMode:"2",
            icon:"//s.yuantutech.com/i4/2a20ccd11fd442a478e64ed8454bab9d-102-102.png",
            name:"普通挂号"
          },
          {
            type:"2",
            regMode:"2",
            icon:"//s.yuantutech.com/i4/6798ebaf71d1e63307dd0213b5dabc08-102-102.png",
            name:"专家挂号"
          },
          {
            type:"3",
            regMode:"2",
            icon:"//s.yuantutech.com/i4/f9ff46f0206efe237323010f5899b571-102-102.png",
            name:"名医挂号"
          },
          {
            type:"14",
            regMode:"2",
            icon:"//s.yuantutech.com/i4/2a20ccd11fd442a478e64ed8454bab9d-102-102.png",
            name:"急诊挂号"
          },
          {
            type:"15",
            regMode:"2",
            icon:"//image.yuantutech.com/user/0cd106c75a78112004971edf8d296c49-102-102.png",
            name:"便民挂号"
          },
          {
            type:"16",
            regMode:"2",
            icon:"//image.yuantutech.com/user/f80b09e238ebd33dae3068f546f38e4f-80-80.png",
            name:"视频问诊挂号"
          },

          //预约
          {
            type:"4",
            regMode:"1",
            icon:"//s.yuantutech.com/i4/2a20ccd11fd442a478e64ed8454bab9d-102-102.png",
            name:"普通预约"
          },
          {
            type:"5",
            regMode:"1",
            icon:"//s.yuantutech.com/i4/6798ebaf71d1e63307dd0213b5dabc08-102-102.png",
            name:"专家预约"
          },
          {
            type:"6",
            regMode:"1",
            icon:"//s.yuantutech.com/i4/f9ff46f0206efe237323010f5899b571-102-102.png",
            name:"名医预约"
          },
          {
            type:"54",
            regMode:"1",
            icon:"//s.yuantutech.com/i4/2a20ccd11fd442a478e64ed8454bab9d-102-102.png",
            name:"急诊预约"
          },
          {
            type:"55",
            regMode:"1",
            icon:"//image.yuantutech.com/user/0cd106c75a78112004971edf8d296c49-102-102.png",
            name:"便民预约"
          },
          {
            type:"56",
            regMode:"1",
            icon:"//image.yuantutech.com/user/f80b09e238ebd33dae3068f546f38e4f-80-80.png",
            name:"视频问诊预约"
          }
      ]


      var corpId = this.corpId;


      $('.ui-list .ui-list-thumb').click(function(){
        $(this).next().click();
      });

    },
    getRegTypeItemConfig:function(type){
      for(var i=0; i<this.regTypes.length; i++){
        if( this.regTypes[i].type == type ){
          return this.regTypes[i]
        }
      }
      return null
    },
    onSuccess:function( result ){


      var data = result.data;

      $('#J_Page').removeClass("wait");

      $('#J_HosImg').css("background-image", "url("+this.util.https(data.corpLogo)+")");
      $('#J_HosName').text( data.corpName );

      //把支持的服务按照 regMode 进行分类
      var functions = data.corpRegister || [];
      var item = null;
      var i =0;
      var guahaoTypes = []; // 2
      var yuyueTypes = []; // 1
      // functions.push("56")
      for(i=0; i<functions.length; i++){
        item = this.getRegTypeItemConfig( functions[i] )
        if(item && item.regMode == 2){
          guahaoTypes.push( item )
        }
        if(item && item.regMode == 1){
          yuyueTypes.push( item )
        }
      }

      var yuyueHTML = ""
      for(i=0; i<yuyueTypes.length; i++){
        yuyueHTML += this.renderItem( yuyueTypes[i], 1)
      }


      var guahaoHTML = ""
      for(i=0; i<guahaoTypes.length; i++){
        guahaoHTML += this.renderItem( guahaoTypes[i], 2)
      }


      $('#J_RegTypeList1').html( yuyueHTML )

      $('#J_RegTypeList2').html( guahaoHTML )

      guahaoTypes.length && $('#J_GuahaoModule').removeClass("hide");
      yuyueTypes.length && $('#J_YuyueModule').removeClass("hide");

      // //视频预约挂号
      // functions.indexOf(56) != -1 && ($('#J_funs3').removeClass("hide"),isShipin=true);

      // isShipin && $('#J_ShiPinModule').removeClass("hide");
      // //挂号预约时段提醒

      $('#J_AppointmentTimeCopy').text(data.appointmentTimeCopy);
      $('#J_RegisterTimeCopy').text(data.registerTimeCopy);

      //保存上一个页面选择的数据 到 localStorage
      var registerData = this.cache.getCacheModule();
      registerData.set("corpId", data.corpId, data.corpName);

    },
    renderItem:function(item, regMode){
      return `
        <li class="ui-border-t">
            <div class="ui-list-thumb">
                <span style="background-image:url(${item.icon})"></span>
            </div>
            <a class="ui-list-info" href="../sections.html?${this.util.flat({type:item.type, corpId:this.corpId, regMode:regMode, target:"_blank"})}" >
                <h4 class="ui-nowrap">${item.name}</h4>
            </a>
        </li>
      `

    }
  });

  page.init();

});
