define(function (require, exports, module) {


    var PageModule = require("component/PageModule");


    var page = PageModule.render({
        init: function () {
            //$('a').hide();
            //, {msgType:1}
            this.unionId = this.query.unionId
            this.get("/user-web/restapi/ytUsers/message",{
                unionId: this.unionId
            });
            // this.onSuccess({data:[
            //         {
            //             msgType:
            //         }
            //     ]})
            this.firstItem = {}
            
        },
        onSuccess: function (result) {
            //$('#J_Content').append( "<div>"+location.href+"</div>" );
            for ( var i in result.data) {
                var item = result.data[i];
                
                if(!this.firstItem[item.msgType]){
                    this.firstItem[item.msgType] = item
                }
            }
            
            for(var key in this.firstItem){
                var item = this.firstItem[key]
                var date = this.util.dateFormat(item.gmtCreate, "yyyy-MM-dd hh:mm");
                switch (item.msgType) {
                    case 1:
                        //$('#item-1').hide();
                        $('#item-1').css("display", "block");
                        $('#item-1').attr("href", "message-type-list.html?messageType=1&unionId=" + this.unionId + "&corpId="+item.corpId+"&target=_blank");
                        $('#date-1').html(date);
                        $('#msg-1').html(item.body);
                        break;
                    case 2:
                        $('#item-2').css("display", "block");
                        $('#item-2').attr("href", "message-type-list.html?messageType=2&unionId=" + this.unionId + "&corpId="+item.corpId+"&target=_blank");
                        $('#date-2').html(date);
                        $('#msg-2').html(item.body);
                        break;
                    case 3:
                        $('#item-3').css("display", "block");
                        $('#item-3').attr("href", "message-type-list.html?messageType=3&unionId=" + this.unionId + "&corpId="+item.corpId+"&target=_blank");
                        $('#date-3').html(date);
                        $('#msg-3').html(item.body);
                        break;
                    case 4:
                        $('#item-4').css("display", "block");
                        $('#item-4').attr("href", "message-type-list.html?messageType=4&unionId=" + this.unionId + "&corpId="+item.corpId+"&target=_blank");
                        $('#date-4').html(date);
                        $('#msg-4').html(item.body);
                        break;
                    case 40:
                        $('#item-40').css("display", "block");
                        $('#item-40').attr("href", "message-type-list.html?messageType=40&unionId=" + this.unionId + "&corpId="+item.corpId+"&target=_blank");
                        $('#date-40').html(date);
                        $('#msg-40').html(item.body);
                        break;
                }
            }
            if (result.data.length == 0 ){
                // console.log(result.data.length)
                $("#J_NoData").removeClass('hide');
            }else{
                $('#J_NoData').addClass("hide")
            }
            // $('#J_Page').removeClass("wait");
        }

    });


    //页面
    page.init();

    module.exports = page;

});