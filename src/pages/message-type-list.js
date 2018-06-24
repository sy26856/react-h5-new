define(function (require, exports, module) {


    var PageModule = require("component/PageModule");


    var page = PageModule.render({
        init: function () {
            this.unionId = this.query.unionId
            this.get("/user-web/restapi/ytUsers/message", {
                msgType: this.query.messageType || 1,
                unionId: this.unionId
            });

            this.uid = this.util.getUID();
        },
        //监听用户登录状态发生变化，需要刷新页面重新载入数据
        onActivation:function(){
        
           if( this.uid != this.util.getUID()){
              window.location.reload(true);
           }
        
        },
        onSuccess: function (result) {

            var self = this;
            if (result.data.length == 0) {
                $('#J_Page').removeClass("wait");
                return;
            }
            this.render(result.data);
            $('#J_Page').removeClass("wait");


            //调用接口设置未读消息阅读状态未已读
            var ids = [];
            var  i = 0;
            for (i in result.data) {
                if (result.data[i].newMsg == 1) {
                    ids.push(result.data[i].id);
                }
            }
            if (ids.length > 0) {
                var idstr = ids.join(",");
                this.io.get("/user-web/restapi/ytUsers/message/setRead", {ids:idstr}, function(){
                    // lib.windvane.call("jsbrige", 'setBadge', {badge:badge}, callback);
                    self.util.brige("setBadge", {badge:0}, function(){});
                }, function(){});
                
            }

        },
        render: function (msgList) {
            var tmpl = '{@each List as msg}' +
                '<li class="msg-item">' +
                '<div class="msg-date">${msg.gmtCreate|dateFormat,"yyyy-MM-dd hh:mm"}</div>' +
                '{@if msg.msgType == 3}'+
                    '<a href="bill-detail.html?id=${msg.pointIdStr}&unionId=${msg.unionId}&corpId=${msg.corpId}&target=_blank">'+
                '{@else if msg.msgType == 40}'+
                    '<a href="' + window.config.tmsDomain + '/tms/h5/queuing.php?corpId=${msg.corpId}&cardNo=${msg.cardNo}&cardType=${msg.cardType}&target=_blank"} >'+
                '{@else}'+
                    '<a href="../register-details-2.html?id=${msg.pointIdStr}&unionId=${msg.unionId}&corpId=${msg.corpId}&target=_blank"} >'+
                '{@/if}' +
                '<div class="ui-border msg-span">' +
                '<div class="msg-title">${msg.title}</div>' +
                '<div class="msg-body">${msg.body}</div>' +
                '<div class="ui-border-t" style="height: 1px;"></div>  ' +
                '<div class="msg-detail ui-txt-highlight ui-flex ui-flex-pack-center">查看详情</div>' +
                '</div>' +
                '</a>' +
                '</li>' +
                '{@/each}';


            this.juicer.register("dateFormat", this.util.dateFormat);

            this.renderTo(tmpl, {List: msgList}, "#J_Content");
        }
    });


    //页面
    page.init();
    
    module.exports = page;

});