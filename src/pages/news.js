
define("pages/news",function(require, exports, module){


  var PageModule = require("component/PageModule");
  var MulitpeTab = require("mods/muliteTab/index");

  var page = PageModule.render({
    init:function(){
      var unionId = this.query.unionId;
      var corpId = this.query.corpId;

      if( !this.query.corpId &&  !this.query.unionId){
        this.util.alert("缺少corpId or unionId");
      }


      this.get("/user-web/restapi/common/corpNews/newsInfo", {
        corpId:corpId,
        unionId:unionId,
        types:"1,2,3,4,5,6,7,9"
      })



      this.uid = this.util.getUID();

    },
    //监听用户登录状态发生变化，需要刷新页面重新载入数据
    onActivation:function(){

       if( this.uid != this.util.getUID()){
          window.location.reload(true);
       }

    },
    initTabs:function(){
        var self = this;
        var tab = new MulitpeTab($('#J_Tabs'),{
            //tab之间的间距
            gap:20

        });

        tab.go(0);
        // 从0开始，这里初始化到第2个tab
        tab.addEventListener("onChange", function(index, prevIndex, $element){
          // console.log(index)
          self.filterType( $element.data("type") );
        });

    },
    filterType:function(type){
      if(type){
        // console.log(1)
        var list = this.cacheData.introsNews.filter(function(item){
          return item.classifyId == type;
        });
        this.renderList( list );
      }else{
        this.renderList( this.cacheData.introsNews );
      }
    },
    onSuccess:function( result ){
      if(result.success || result.success == "true"){
        // console.log( result.data )
        this.renderTabs( result.data );
        $('#J_Page').removeClass("wait");

      }else{
        this.onError(result);
      }
    },
    renderTabs:function( data ){
        //result.data
        data.classifys = data.classifys || [];
        data.introsNews = data.introsNews || [];
        this.cacheData = data;

        var classifys = []

        data.classifys.forEach(function(row){
            // && row.name != "卫计委之声"
            if(row.name.indexOf("常见问题") == -1 ){
                classifys.push( row )
            }
        })
        var tmpl = '{@each list as item}<li data-type="${item.id}" ><a>${item.name}</a></li>{@/each}';
        var html = this.juicer(tmpl , {list:classifys} );

        $('#J_TabList').html(html);

        if(data.classifys.length){
          this.initTabs();
        }
    },
    renderList:function(data){

      var self = this;
      var tmpl = '{@each list as item}'+
        '<div class="item-news">'+
          '<a href="../news-detail.html?id=${item.id}&target=_blank" class="ui-border-b">'+
            '<div class="img" style="background-image:url(${item.titleImg})"></div>'+
            '<div class="text">'+
              '<div class="h1">${item.title}</div>'+
              '<div class="sub ui-nowrap-flex">${item.summary}</div>'+
              '<div class="time">${dateFormat(item.gmtCreate)}</div>'+
            '</div>'+
          '</a>'+
        '</div>'+
      '{@/each}';


      //处理 假值
      this.juicer.register("dateFormat", function(value){
        return self.util.dateFormat(value, "MM-dd hh:mm")
      });

      if(data&&data.length){
        this.renderTo( tmpl, {list:data}, "#J_NewsList");
      }else{
        $("#J_NewsList").html('<div class="ui-tips center">没有资讯</div>');
      }
    }
  });


  //页面
  page.init();

  module.exports = page;

});
