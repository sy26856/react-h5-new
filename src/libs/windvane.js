;(function(win, lib) {
    var Promise = win.Promise;
    var doc = win.document;
    var ua = win.navigator.userAgent;
    var isIOS = (/iPhone|iPad|iPod/i).test(ua);
    var isAndroid = (/Android/i).test(ua);
    var osVersion = ua.match(/(?:OS|Android)[\/\s](\d+[._]\d+(?:[._]\d+)?)/i);
    var wvVersion = ua.match(/WindVane[\/\s](\d+[._]\d+[._]\d+)/);
    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var WindVane = lib.windvane = win.WindVane || (win.WindVane = {});
    var WindVane_Native = win.WindVane_Native;
    var inc = 1, iframePool = [], iframeLimit = 3;

    var LOCAL_PROTOCOL = 'hybrid';
    var WV_PROTOCOL = 'wv_hybrid';
    var IFRAME_PREFIX = 'iframe_';
    var SUCCESS_PREFIX = 'suc_';
    var FAILURE_PREFIX = 'err_';
    var DEFERRED_PREFIX = 'defer_';
    var PARAM_PREFIX = 'param_';
    var CHUNK_PREFIX = 'chunk_';
    var CALL_GC_TIME = 60 * 1000 * 10;
    var CHUNK_GC_TIME = 60 * 1000 * 10;
    var PARAM_GC_TIME = 60 * 1000;

    function compareVersion(v1, v2) {
        v1 = v1.toString().split('.');
        v2 = v2.toString().split('.');

        for(var i = 0; i < v1.length || i < v2.length; i++) {
            var n1 = parseInt(v1[i],10),  n2 = parseInt(v2[i],10);

            if(window.isNaN(n1)) {
                n1 = 0;
            }
            if(window.isNaN(n2)) {
                n2 = 0;
            }
            if( n1 < n2 ) {
                return -1;
            }
            else if( n1 > n2) {
                return 1;
            }
        }
        return 0;
    }

    if (osVersion) {
        osVersion = (osVersion[1] || '0.0.0').replace(/\_/g, '.');
    } else {
        osVersion = '0.0.0';
    }

    if (wvVersion) {
        wvVersion = (wvVersion[1] || '0.0.0').replace(/\_/g, '.');
    } else {
        wvVersion = '0.0.0';
    }

    /**
     * @namespace  lib
     */
    
    /**
     * @namespace windvane
     * @memberOf lib
     */

    var WV_Core = {
        isAvailable: compareVersion(wvVersion, '0') === 1,

        /**
         * @method  call
         * @memberOf lib.windvane
         * @param  {String} obj       要调用的客户端类名
         * @param  {String} method    要调用的客户端方法名
         * @param  {Object} params    要传递给客户端的参数
         * @param  {Function} [success] 执行成功后的回调
         * @param  {Function} [failure] 执行失败后的回调
         * @param  {Number} [timeout]   执行超时，超时后自动以 {ret:['HY_TIMEOUT']}
         * @return {Promise}          如果当前运行环境支持Promise，则返回一个Promise实例。
         */
        call: function(obj, method, params, success, failure, timeout) {
            var sid;
            var deferred;

            if (typeof arguments[arguments.length - 1] === 'number') {
                timeout = arguments[arguments.length - 1];
            }

            if (typeof success !== 'function') {
                success = null;
            }

            if (typeof failure !== 'function') {
                failure = null;
            }

            if (Promise) {
                deferred = {};
                deferred.promise = new Promise(function(resolve, reject) {
                    deferred.resolve = resolve;
                    deferred.reject = reject;
                });
            }

            if (timeout > 0) {
                sid = setTimeout(function() {
                    WV_Core.onFailure(sid, {ret:'HY_TIMEOUT'});
                }, timeout);
            } else {
                sid = WV_Private.getSid();
            }

            WV_Private.registerCall(sid, success, failure, deferred);
            WV_Private.registerGC(sid, timeout);
            WV_Private.callMethod(obj, method, params, sid);

            if (deferred) {
                return deferred.promise;
            }
        },

        fireEvent: function(eventname, eventdata, sid) {
            // 当native需要通知js的时候（通信），用触发事件的方式进行
            var ev = doc.createEvent('HTMLEvents');
            ev.initEvent(eventname, false, true);
            ev.param = WV_Private.parseData(eventdata || WV_Private.getData(sid));
            
            doc.dispatchEvent(ev);
        },

        getParam: function(sid) {
            return WV_Private.getParam(sid);
        },

        setData: function(sid, chunk) {
            WV_Private.setData(sid, chunk);
        },

        onSuccess: function(sid, data) {
            // native代码处理成功后，调用该方法来通知js
            //alert(window.location.href)
            if( sid == "0" ){
                //native向h5发送信息
                this.fire(data, 'success');
                return ;
            }

            WV_Private.onComplete(sid, data, 'success');
        },

        onFailure: function(sid, data) {
            //hybrid://nativeClassname:1/methodName?{"a":1,"b":2}
            // native代码处理失败后，调用该方法来通知js
            WV_Private.onComplete(sid, data, 'failure');
        },

        EVER:"onever",
        READY:"onready",
        ACTIVEATION:"onactivation",
        PAUSE:"onpause",
        eventListener:{
            "onever":[],//任何没有定义的事件
            "onready":[], //页面加载完成
            "onactivation":[], //页面重新被激活
            "onpause":[] //页面到后台
        },
        //监听 native 回调
        on:function(eventType, func ){

            //之前接收客户端事件是没有eventType字段的，兼容老代码
            if( typeof eventType == "function" ){
                func = eventType;
                eventType = this.EVER;

            }

            if( typeof func == "function" ){
                this.eventListener[eventType].push( func );
            }

        },

        // off:function( func ){
        //     if( typeof func == "function"){
        //         for(var i=0; i<this.eventListener.length; i++){
        //             if( func == this.eventListener[i] ){
        //                 this.eventListener.splice(i, 1);
        //                 i--;
        //             }
        //         }
        //     }
        // },
        fire:function(data){

            var eventType = this.EVER;
            
            if( data && data.type == "event" ){
                eventType = data.name;
            }   

            var eventListener = this.eventListener[eventType] || [];

            for(var i=0; i<eventListener.length; i++){
                try{
                    eventListener[i](data);
                }catch(e){
                    console.log(e)
                }
            }
            
        }
    };

    var WV_Private = {
        params: {},
        chunks: {},
        calls: {},

        getSid: function() {
            return Math.floor(Math.random() * (1 << 50)) + '' + inc++;
        },

        buildParam: function(obj) {
            if (obj && typeof obj === 'object') {
                return JSON.stringify(obj);
            } else {
                return obj || '';
            }
        },

        getParam: function(sid) {
            // 因为ios下iframe协议，对于url长度有限制，所以增加一个参数的map。
            return this.params[PARAM_PREFIX + sid] || '';
        },

        setParam: function(sid, params) {
            this.params[PARAM_PREFIX + sid] = params;
        },

        parseData: function(str) {
            var rst;
            if (str && typeof str === 'string') {
                try {
                    rst = JSON.parse(str);
                } catch(e) {
                    rst = {ret:['WV_ERR::PARAM_PARSE_ERROR']};
                }
            } else {
                rst = str || {};
            }

            return rst;
        },

        setData: function() {
            // android下，回传函数会超长，通过分段set的方式来传递
            this.chunks[CHUNK_PREFIX + sid] = this.chunks[CHUNK_PREFIX + sid] || [];
            this.chunks[CHUNK_PREFIX + sid].push(chunk);
        },

        getData: function(sid) {
            if (this.chunks[CHUNK_PREFIX + sid]) {
                return this.chunks[CHUNK_PREFIX + sid].join('');
            } else {
                return '';
            }
        },

        registerCall: function(sid, success, failure, deferred) {
            if (success) {
                this.calls[SUCCESS_PREFIX + sid] = success;
            }

            if (failure) {
                this.calls[FAILURE_PREFIX + sid] = failure;
            }

            if (deferred) {
                this.calls[DEFERRED_PREFIX + sid] = deferred;
            }
        },

        unregisterCall: function(sid) {
            var sucId = SUCCESS_PREFIX + sid;
            var failId = FAILURE_PREFIX + sid;
            var defId = DEFERRED_PREFIX + sid;
            var call = {};

            if (this.calls[sucId]) {
                call.success = this.calls[sucId];
                delete this.calls[sucId];
            }
            if (this.calls[failId]) {
                call.failure = this.calls[failId];
                delete this.calls[failId];
            }
            if (this.calls[defId]) {
                call.deferred = this.calls[defId];
                delete this.calls[defId];
            }

            return call;
        },

        useIframe: function(sid, url) {
            var iframeid = IFRAME_PREFIX + sid;
            var iframe = iframePool.pop();

            if (!iframe) {
                iframe = doc.createElement('iframe');
                iframe.setAttribute('frameborder', '0');
                iframe.style.cssText = 'width:0;height:0;border:0;display:none;';
            }

            iframe.setAttribute('id', iframeid);
            iframe.setAttribute('src', url);

            if (!iframe.parentNode) {
                setTimeout(function() {
                    doc.body.appendChild(iframe);
                },5);
            }
        },

        retrieveIframe : function(sid) {
            var iframeid = IFRAME_PREFIX + sid;
            var iframe = doc.querySelector('#' + iframeid);

            if (iframePool.length >= iframeLimit) {
                doc.body.removeChild(iframe);
            } else {
                iframePool.push(iframe);
            }
        },

        callMethod: function(obj, method, params, sid) {
            // hybrid://objectName:sid/methodName?params
            params = WV_Private.buildParam(params);
            var uri = LOCAL_PROTOCOL + '://' + obj + ':' + sid + '/' + method + '?' + params;
            if (nihao.getPlatform() === 'ios' && nihao.version.gt(3, 4, 9)) {
              uri = LOCAL_PROTOCOL + '://' + obj + '-' + sid + '/' + method + '?' + params;
            }
            
            if (isIOS || true) {
                // iOS下用iframe调用
                this.setParam(sid, params);
                this.useIframe(sid, uri);
            } else if (isAndroid) {  //启用 代军
                // Android下用window.prompt调用调用
                var value = WV_PROTOCOL + ':';
                window.prompt(uri, value);
            }
        },

        registerGC: function(sid, timeout) {
            // 垃圾回收
            var that = this;
            var callGCTime = Math.max(timeout || 0, CALL_GC_TIME);
            var paramGCTime = Math.max(timeout || 0, PARAM_GC_TIME);
            var chunkGCTime = Math.max(timeout || 0, CHUNK_GC_TIME);

            setTimeout(function(){
                that.unregisterCall(sid);
            }, callGCTime);

            if (isIOS) {
                // ios下处理params的回收
                setTimeout(function(){
                    if (that.params[PARAM_PREFIX + sid]) {
                        delete that.params[PARAM_PREFIX + sid];
                    }
                }, paramGCTime);
            } else if (isAndroid) {
                // android下处理chunk的回收
                setTimeout(function(){
                    if (that.chunks[CHUNK_PREFIX + sid]) {
                        delete that.chunks[CHUNK_PREFIX + sid];
                    }
                }, chunkGCTime);
            }
        },

        onComplete: function(sid, data, type) {
            // console.log(sid, data, type)

            clearTimeout(sid);


            var call = this.unregisterCall(sid);
            var success = call.success;
            var failure = call.failure;
            var deferred = call.deferred;

            data = data ? data : this.getData(sid);
            data = this.parseData(data);

            var ret = data.ret;
            if (typeof ret === 'string') {
                data = data.value || data;
                if (!data.ret) {
                    data.ret = [ret];
                }
            }

            if (type === 'success') {
                success && success(data);    
                deferred && deferred.resolve(data);
            } else if (type === 'failure') {
                failure && failure(data);    
                deferred && deferred.reject(data);
            }
            
            if (isIOS) {    //iOS下回收iframe
                this.retrieveIframe(sid);
                if (this.params[PARAM_PREFIX + sid]) {
                    delete this.params[PARAM_PREFIX + sid];    
                }
            } else if (isAndroid) {
                if (this.chunks[CHUNK_PREFIX + sid]) {
                    delete this.chunks[CHUNK_PREFIX + sid];
                }
            }
        }
    };

    for (var key in WV_Core) {
        if (!hasOwnProperty.call(WindVane, key)) {
            WindVane[key] = WV_Core[key];
        }
    }
    //debug
    window.windVane = WindVane;
    window.WV_Private = WV_Private;
    if (typeof define === 'function') {

        // AMD. Register as an anonymous module.
        define("libs/windvane",function(){
            return windVane;

        });
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = WindVane;
        module.exports.windVane = WindVane;
    }
    

})(window, window['lib'] || (window['lib'] = {}));
