define(function(require, exports, module){

  var PageModule = require("component/PageModule");


  var page = PageModule.render({
    init:function(){

      this.unionId = this.query.unionId;
      //选择地址
      this.selectView = this.query.selectView;
      this.countPatient = 0;
      var self = this;
      // alert( document.cookie )
      //检查登录
      if( !this.checkLogin() ){
        return ;
      };

      this.get("/user-web/restapi/video/getAllAddress", {
        corpId:this.query.corpId || this.corpId
      });

    },

    regEvent:function(){

      var self = this;
      $('#J_List .J_Item').click(function(e){

        e.preventDefault();

        var addressid = $(this).attr("data-addressid");

        var registerData = self.cache.getCacheModule("yuantu-address");
        registerData.set("addressid", addressid);
        // alert(2)
        // if( self.util.isInYuantuApp() ){
        //   //如果是 远图 app 就把值通过 jsbrige返回到上一个界面
        //   self.util.brige("pushDataToParent",{
        //     autoBack:true,
        //     data:JSON.stringify({
        //       addressid:addressid
        //     })
        //   });
        // }else{
          self.util.goBack();
        // }
        
       
      });

    },

    onSuccess:function( result ){
      // console.log( result )
      // alert( result.data.length )
      $('#J_Page').removeClass("wait");

      $('#J_List').html( this.render( result.data ) )
       //如果是从当前界面选择患者 那么对list item 进行a标签点击拦截
      if( this.selectView ){
        this.regEvent();
      }
    },
    render:function( list ){
      if( list && list.length ){
        return `<ul class="ui-list ui-list-text ui-list-link ui-border-tb">
              ${
                list.map((item)=>{
                  return `<li class="ui-border-t">
                      <a href="add-address.html?${this.util.flat({id:item.id,target:"_blank"})}" data-addressid="${item.id}" class="J_Item">
                          <h4>${item.recipient} ${item.phone}</h4>
                          <div class="ui-txt-info">${item.address} ${item.postcode||""}</div>
                      </a>
                  </li>`
                }).join("")
              }
        </ul>`
      }else{
        return `<section class="ui-notice" >
                    <i></i>
                    <p>还没有收获地址</p>
                </section>`
      }
    }

  });

  page.init();

  module.exports = page;

});
