/**
  new CountDown(3000, callback).start()
*/
export default class CountDown {
  constructor(time, callback){
    this.callback = callback;
    this.expirationTime = Date.now() + time;
  }
  start(){
    let self = this;
    this.exec();
    this.interval = setInterval(()=>{
      self.exec()
    }, 1000);
    return this;
  }
  stop(){
    this.interval && clearInterval(this.interval);
    return this;
  }
  exec(){
    let c = this.expirationTime - Date.now();
    if(c > 0){
      let s = parseInt(c/1000/60%60);
      let f = parseInt(c/1000/60);
      let m = parseInt(c/1000%60);
      this.callback && this.callback(c,s,f,m)
    }else{
      this.callback && this.callback(0,0,0,0)
      clearInterval(this.interval)
    }

    return this;
  }
}