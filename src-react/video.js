import React from 'react'
import  './result-oxy.less'
import util from './lib/util'
import hybridAPI from './lib/hybridAPI'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import './video.less'
export default class Video extends SmartBlockComponent{
    constructor(props){
        super(props)
        let query = util.query();
        this.groupName = query.groupName
        this.state={
            display:"block",
            isPlay:false,
            loading:true
        } 
    }
    onMouseEnter(){
        let show = this.refs.show;
        let  display="block"
        this.setState({
            display:display
        })
    } 
    componentDidMount(){
        this.setState({
            success:true,
            loading:false
        })
    }
    onMouseLeave(){
        let show = this.refs.show;
        let  display="none"
        this.setState({
            display:display
        })
    }
    onVideo(){
        let {isPlay} = this.state
        let video = this.refs.video;
        let self = this;
        if(isPlay){
            video.pause()
            setTimeout(()=>{
                self.setState({
                    display:"block"
                })
            },2000) 
        }else{
            video.play()
            setTimeout(()=>{
                self.setState({
                    display:"none"
                })
            },2000) 
        }
        this.setState({
            isPlay:!isPlay
        })
    }
    render(){
        let {display,isPlay,width} = this.state;
        let videoSrc,backGroundImg,descript,name,size
        switch(parseInt(this.groupName)){
            case 1:videoSrc='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/2177da9a4c8cb41924bc05363f8a5806-15475877';
                backGroundImg='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/700df93bb3d293bccb384229584e2a29-750-422.png'
                descript='该视频介绍了血氧仪的正确使用方法，包括产品各部分介绍、操作前准备、血氧仪与手机的链接方式及注意事项等。';
                name="血氧";
                size='14.76M'
                break;
            case 2:videoSrc='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/7825d973c31c9d2a063cafc98d0703ef-39831469';
                backGroundImg='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/c078f2e13ee357c3344625579e22a9a9-750-422.png';
                descript='该视频介绍了血糖仪的正确使用方法，包括产品各部分介绍、操作前准备、血糖仪与手机的链接方式及注意事项等。'
                name="血糖";
                size='37.99M'
                break;
            case 3:videoSrc='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/1ef9bd68dd03e03d345d71130fb857a0-343109917';
                backGroundImg='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/8eeddfd1130de7039b8dbd24a919cdd3-1125-630.png';
                descript='该视频介绍了体重体脂称的正确使用方法，包括体重体脂称的正确摆放，校正方法及测量的注意事项等。'
                name="体重体脂";
                size='327.2M'
                break;
            case 4:videoSrc='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/51980f330a526fb7f4b70ff0c20d3ccf-313072085';
                backGroundImg='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/4c7edbe2498d1a71238558ea99ee4d53-1125-630.png';
                descript='该视频介绍了血压计的正确使用方法，包括血压计的正确佩戴姿势、检测方法及注意事项等。'
                name="血压";
                size='298.57M'
                break;
        }
        let background={
            background:'url('+backGroundImg+') no-repeat left top',
            backgroundSize:'100% auto'
        }
        return(
            <div className="video-con">
                <div className="video-box" onMouseEnter={this.onMouseEnter.bind(this)} onMouseLeave={this.onMouseLeave.bind(this)} style={background}>
                    <video src={videoSrc} ref="video" width="100%" poster={backGroundImg}></video>
                    <div className="video-wrapper"></div>
                    <div className={isPlay?"video-play":"video-pause"} onClick={this.onVideo.bind(this)} ref="show" style={{display:display}}></div>
                </div>
                <div className="video-desc">
                    <h4>
                        <span className="video-mar">{name}</span>
                        <span>大小：</span>
                        <span>{size}</span>
                    </h4>
                    <p className="video-text">
                        {descript}
                    </p>
                </div>
            </div>
        )
    }
}