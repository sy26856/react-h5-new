;(function () {

    /**
     用于向服务器发送埋点
     */
    var track = {
        //每个页面只调用一次
        sendPV: function () {
            var uid = document.cookie.match(/[^u]uid=(\d+)/); //[1];
            uid = uid ? uid[1] : undefined;
            var uuid = document.cookie.match(/uuid=([0-9a-z]{8}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{4}-[0-9a-z]{12})/);
            uuid = uuid ? uuid[1] : undefined;
            var uuidTime = document.cookie.match(/uuidTime=(\d+)/); //[1];
            uuidTime = uuidTime ? uuidTime[1] : undefined;
            var refererSPM = window.location.search.match(/spm=([\w\.\-\_]+)/);
            refererSPM = refererSPM ? refererSPM[1] : undefined;
            var spm = document.querySelectorAll("meta[name=spm-id]");
            spm = spm.length ? spm[0].content : undefined;
            var performance = window.performance.timing;

            var param = {
                "spm": spm,
                "refererSPM": refererSPM,
                "referer": encodeURIComponent(document.referrer || document.referer || ""), // 来源URL
                "uid": uid, // 用户平台用户id
                "uuid": uuid,
                "uuidTime": uuidTime,
                "resolution": window.screen.width + "x" + window.screen.height,
                "connectEnd": performance.connectEnd, //    连接请求开始时间（1453187966860）
                "connectStart": performance.connectStart, //  连接请求结束时间（1453187966825）
                "domComplete": performance.domComplete, //   DOM完成时间(1453187967516)
                "domContentLoadedEventEnd": performance.domContentLoadedEventEnd, //  DOM事件完成时间(1453187967374)
                "domContentLoadedEventStart": performance.domContentLoadedEventStart, //    DOM时间开始时间（1453187967283）
                "domInteractive": performance.domInteractive, //    DOM Ready时间（1453187967283）
                "domLoading": performance.domLoading, //    DOM loading状态时间(1453187966969 )
                "domainLookupEnd": performance.domainLookupEnd, //   DNS查询结束时间 （1453187966825）
                "domainLookupStart": performance.domainLookupStart, // DNS查询开始时间1453187966825
                "fetchStart": performance.fetchStart, //    fetchStart缓存检查（1453187966487）
                "loadEventEnd": performance.loadEventEnd, //  文档onload结束（1453187967516）
                "loadEventStart": performance.loadEventStart, //    文档onload开始 1453187967516
                "navigationStart": performance.navigationStart, //   浏览器开始时间（1453187966487）
                "redirectEnd": performance.redirectEnd, //   重定向结束 0
                "redirectStart": performance.redirectStart, // 重定向开始 0
                "requestStart": performance.requestStart, //  文档请求开始的时间 1453187966860
                "responseEnd": performance.responseEnd, //   数据接收结束的时间 1453187967004
                "responseStart": performance.responseStart, // 数据接收开始时间 1453187966962
                "secureConnectionStart": performance.secureConnectionStart, // SSL握手时间 0
                "unloadEventEnd": performance.unloadEventEnd, //    前一个页面的卸载结束 0
                "unloadEventStart": performance.unloadEventStart //   前一个页面的卸载开始0
            };

            // console.log( param );

            // http://192.168.31.187:3000/
            var url = window.config.trackUrl;
            var paramStr = "";
            var xhr = new XMLHttpRequest();
            for (var key in param) {
                if (param[key] != undefined) {
                    paramStr += key + "=" + param[key] + "&"
                }
            }
            url += paramStr;
            xhr.open("GET", url, true);
            xhr.withCredentials = true;
            xhr.onload = function () {
                if (xhr.responseText) {
                    var ck = JSON.parse(xhr.responseText);
                    if (ck.uuid) {
                        document.cookie = "uuid=" + ck.uuid + ";path='/';expires=" + ck.expires
                    }
                    if (ck.uuidTime) {
                        document.cookie = "uuidTime=" + ck.uuidTime + ";path='/';expires=" + ck.expires
                    }
                }
            };
            xhr.send();
        }
    };

    window.addEventListener("load", function () {
        track.sendPV();
    });

    if (typeof define === 'function') {

        // AMD. Register as an anonymous module.
        define("track", function () {
            return track;
        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = track;
    } else {
        window.track = track;
    }
})();
