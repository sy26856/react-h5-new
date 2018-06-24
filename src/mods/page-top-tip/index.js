
//显示PageTips
define('mods/page-top-tip/index',function(require, exports, module){

  var VModule = require("component/VModule");


  var page = VModule.render({
    init:function(element, tipKey){

      this.element = element;
      this.tipKey = tipKey;

      this.state = {
        loading:true,
        text:""
      }

      this.initModule(this.state, element)
      this.get('/user-web/restapi/common/corp/getGuideCopy', {corpId:this.query.corpId});
    },

    onSuccess(result){
      
      this.setState({
        loading:false,
        success:true,
        text:result.data[this.tipKey]
      });

    },

    renderLoading(){
      return ``;
    },

    render(state){
      let {text} = state;
      if(text){
        return `
          <div class="sections-tips">
              <i class="ui-icon-bugle"></i>
              <div class="text">
                  ${text}
              </div>
          </div>
        `
      }else{
        return ``;
      }
    },
    renderError(){
      return ``;
    }
  });

  module.exports = page;

});



