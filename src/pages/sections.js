define(function(require, exports, module){

  var VModule = require("component/VModule");
  var PageTopTip = require("mods/page-top-tip/index");

  var page = VModule.render({
    init:function(){

      var self = this;
      this.type = this.query.type;
      this.regMode = this.query.regMode;
      this.corpId = this.query.corpId;

      this.state = {
        type:this.type,
        corpId:this.corpId,
        loading:true,
        //搜索key
        searchKey:null,
        depts:[], //可是列表
        corp:{} //医院信息
      }

      this.module = this.initModule(this.state, '#J_Page');

      //保存上一个页面选择的数据 到 localStorage
      var registerData = this.cache.getCacheModule();
      registerData.set("type", this.type, "预约/挂号类型");
      registerData.set("regMode", this.regMode, "预约/挂号")

      // departmentlist2 用于在广州医院可选择医生
      this.get("/user-web/restapi/common/reservation/departmentlist2", {
        corpId:this.corpId,
        type:this.type
      });

      this.regEvent();

    },
    regEvent:function(){

        var self = this;
        $('.ui-searchbar').click(function(){
          $('.ui-searchbar-wrap').addClass('focus');
          $('.ui-searchbar-input input').focus();
        });

        $('.ui-searchbar-cancel').click(function(){
            $('.ui-searchbar-wrap').removeClass('focus');
            $('#J_SearchInput').val("");
            self.setState({
              searchKey:null
            })
        });

        $('#J_SearchClear').click(function(){
          $('#J_SearchInput').val("");
          self.setState({
            searchKey:null
          })
        });

        $('#J_SearchInput')[0].oninput = function(){
          // console.log(123)
          var key = $.trim($(this).val());

          self.setState({
            searchKey:key ? key : null
          })
        }

    },

    onSuccess:function( result ){

      let depts = result.data.depts;
      this.setState({
        success:true,
        loading:false,
        depts:result.data.depts,
        corp:result.data.corp
      });

      //选择科室列表 提示信息
      if(depts && depts.length){
        PageTopTip.init('#J_SectionTip', 'selectDept');
      }

    },

    render(state){

      var {searchKey, corp, depts, type, corpId} = this.state;
      var reg = searchKey ? new RegExp(searchKey,"i") : null;
      //不同的医院可能下一步到 选择医生  或者选择排版的页面
      var nextPage = corp.scheduleRule == 2 ? "select-doctor.html" :"../select-scheduling.html";
      
      //过滤
      if(searchKey){
        depts = depts.filter((item)=>{
          return reg.test(item.deptName) || reg.test(item.deptSimplePY) || reg.test(item.deptPY);
        })
      }

      if(depts.length == 0){
        return this.renderError()
      }
      
      return `
        <ul class="ui-list ui-list-text ui-list-link ui-border-tb">
            ${
              depts.map((item)=>{
                return `
                  <li class="ui-border-t">
                    <a href="${nextPage}?deptCode=${item.deptCode || ""}&type=${type}&corpId=${corpId}&deptName=${item.deptName||""}&parentDeptCode=${item.parentDeptCode || ""}&target=_blank">
                        <h4 class="ui-nowrap">${item.deptName} <span>(${item.deptSimplePY})</span></h4>
                    </a>
                  </li>
                `
              }).join("")
            }
        </ul>
      `
    },

    renderError(){
      return `
        <div id="J_KeshiList">
            <section class="ui-notice" >
                <i></i>
                <p>没有排班科室</p>
            </section>
        </div>
      `
    }
  });

  page.init();

  module.exports = page;

});



