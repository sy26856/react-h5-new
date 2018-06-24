import AsyncData from './AsyncData'
import JSONP from './JSONP'
/**
 * JSONP('http://api.flickr.com/services/feeds/photos_public.gne',{'id':'12389944@N03','format':'json'},'jsoncallback',function(json){
 *  document.getElementById('flickrPic').innerHTML = '<p>Flickr Pic:</p><img src="'+json.items[0].media.m+'">';
 * });
 *
 * */

//jsonp的异步请求
//增加了一个 SUCCESS 事件
export default class POSTAsyncData extends AsyncData {

  //增加一个异步success
  // SUCCESS = "success"
  // ERROR = "error2"
  constructor(url, param) {

    param = param || {};
    param.t = parseInt(Math.random() * 100000);

    super(url, param);
    this.SUCCESS = "success"
    this.ERROR = "error2"
    this.TOLOGIN = "tologin"
  }

  subscribe(observer, onSuccess = null, onError = null, onProgress = null) {
    observer.onSendBefore && this.on(this.SEND_BEFORE, function () {
      observer.onSendBefore.apply(observer, arguments)
    });

    observer.onComplete && this.on(this.COMPLETE, function () {
      observer.onComplete.apply(observer, arguments)
    });

    observer.onIOError && this.on(this.IO_ERROR, function () {
      observer.onIOError.apply(observer, arguments)
    });

    if (onSuccess) {
      this.on(this.SUCCESS, function () {
        onSuccess.apply(observer, arguments)
      });
    } else if (observer.onSuccess) {
      observer.onSuccess && this.on(this.SUCCESS, function () {
        observer.onSuccess.apply(observer, arguments)
      });
    }

    if (onError) {
      this.on(this.ERROR, function () {
        onError.apply(observer, arguments)
      });
    } else {
      observer.onError && this.on(this.ERROR, function () {
        observer.onError.apply(observer, arguments)
      });
    }

    observer.isLogin && this.on(this.TOLOGIN, function () {
      observer.isLogin.apply(observer, arguments)
    });

    if (onProgress) {
      this.onProgress = onProgress
    }

    return this;
  }

  fetch(event) {

    return new Promise((reslove, reject) => {
      //监听异步完成事件
      this.on(this.COMPLETE, (result) => {
        //验证返回数据是否正确
        if (result && result.resultCode == 202) {
          this.emit(this.TOLOGIN)
        } else if (result && result.success) {
          this.emit(this.SUCCESS, result);
          reslove(result)
        } else if (result && !result.success) {
          this.emit(this.ERROR, result);
          reject(result)
        } else {
          console.log("请求无效，ioerror会处理")
        }
      });

      //把io错误
      this.on(this.IO_ERROR, (e) => {
        // console.log("this.IO_ERROR")
        this.emit(this.COMPLETE, {msg: "网络错误,请稍后再试"});
        // this.emit(this.ERROR, {msg:"网络错误，请稍后再试", resultCode:404})
        reject({msg: "网络错误，请稍后再试", resultCode: 404})
      })

      //发送请求之前
      this.emit(this.SEND_BEFORE, this.url, this.param);

      this.loadData().then((result) => {
        //完成
        this.emit(this.COMPLETE, result, this.param);
      }, (e) => {
        //错误
        this.emit(this.IO_ERROR, e);
      })
      ;
    })

  }

  loadData() {
    return new Promise((resolve, reject) => {
      // let param = {};
      let formData = new FormData();
      let dataStr = Object.keys(this.param || {}).map((key) => {
        if (this.param[key] !== "undefined" && this.param[key] !== undefined && this.param[key] !== null) {
          formData.append(key,this.param[key])
          return `${key}=${this.param[key]}`
        }
      }) 
      dataStr = dataStr.join("&")
      for (let key in this.param) {

        if (this.param[key] !== "undefined" && this.param[key] !== undefined && this.param[key] !== null) {
          formData[key] = this.param[key]
        }
      }
      // JSONP(this.url, param, reslove, (e)=>{
      //   reject({msg:"请求错误"})
      // });

      let xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        let position = e.loaded || e.position;
        let totalSize = e.total || e.totalSize;
        this.onprogress && this.onprogress(((position / totalSize) * 100).toFixed());
      };

      xhr.onload = (e) => {
        let current = e.currentTarget;
        if (Math.floor(current.status / 100) === 2 || Math.floor(current.status / 100) === 3) {
          let res = current.responseText;
          if (typeof res === "string") {
            try {
              res = JSON.parse(res)
            } catch (e) {
              console.warn(this.url, e)
            }
          }
          resolve(res)
        } else {
          reject({msg: "请求失败", resultCode: current.status})
        }
      };

      xhr.onerror = (e) => {
        let current = e.currentTarget;
        reject({msg: "网络错误，请稍后再试", resultCode: current.status})
      }

      xhr.open("POST", this.url, true);
      xhr.withCredentials = true;
      console.log(formData)
      xhr.send(formData);
    });

  }


  onSuccess(callback) {
    this.on(this.SUCCESS, callback);
    return this;
  }

  onError(callback) {
    this.on(this.ERROR, callback);
    return this;
  }

}
