import React from 'react'
import  './result-oxy.less'
import util from './lib/util'
import PackCenter from './module/PackCenter'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import hybridAPI from './lib/hybridAPI'
export default class ResultOxy extends SmartBlockComponent{
    constructor(props){
        super(props)
        let query = util.query() 
        this.idNo = query.idNo;
        this.name = query.name;
        this.reportId = query.reportId;
        this.groupName = query.groupName;
        this.goback = query.goback;
        this.state={  
            loading:true,
            address:"",
            dataTime:"",
            slice:"",
            value:"",
            resultData:[],
            tags:[]
        }
    }
    
    componentWillMount(){
        this.getReport()
    }
    getReport(){
        PackCenter.getReport(this.reportId,this.groupName)
        .subscribe(this)
        .fetch()
    }
    onSuccess(result) {
        let data = result.data;
        let value = data.resultData.length>0&&data.resultData[0].value
        this.setState({
            loading:false,
            success:true,
            address:data.addr,
            dataTime:data.gmtModify,
            tags:data.tags,
            slice:data.slice,
            resultData:data.resultData,
            status:data.status,
            remarks:data.remarks,
            value:value
        })
        let title = "健康分享",
        text = `${this.name}有一份来自血氧检测的健康数据要分享给你`,
        url = window.location.href,
        imageUrl = "//image.yuantutech.com/user/0c306d9a190c1bcde2d8f9ad31e29810-300-300.jpg",
        isShowButton = true,
        isCallShare = false,time=3

        if ((result.success || result.success === "true") && util.isInYuantuApp()) {
            hybridAPI.share(title, text, url, imageUrl, isShowButton, isCallShare)
            if(!this.goback){
                hybridAPI.popToTimeViewController(false,time,false);
            }
        }
    }
    renderTag(){
        let {tags} = this.state;
        if(tags.length>0){
            let tag = tags.map((item,key)=>{
                return item.tagName?(<span className="result-oxy-tag" key={key}>{item.tagName}</span>):null
            })
            return tag
        }
    }
    renderResult(){
        let {resultData,slice}= this.state;
        if(resultData){
            return(
                <div className="result-oxy-meter">
                    {resultData.length>2?null:<div className="oxy-meter-line"></div>}
                    {resultData.map((item,key)=>{
                        return (
                            <div className="oxy-meter-item" key={key}>
                                <p className="oxy-meter-item-op"><span className="oxy-meter-item-font">{item.value}</span>{item.unit}</p>
                                <p className="oxy-meter-item-op oxy-meter-des">{item.childName}</p>
                            </div>
                        )}
                    )}
                </div>
            )
        }
    }
    render(){
    
        let {address,dataTime,slice,status,remarks,value} = this.state;
        let style;
        if(status=="低氧血症"||(value&&value<90)){
            style={
                border:'12px solid #ff5256'
            }
        }else if(status=="氧失饱和"||(90<value&&value<=94)){
            style={
                border:'12px solid #ffcd00'
            }
        }else if(status=="正常"||(value>=95&&value<=99)){
            style={
                border:'12px solid #95d452'
            }
        }
        let listHref = "result-oxystatistics.html?idNo="+this.idNo+"&name="+this.name+"&reportId="+this.reportId+"&groupName="+this.groupName+"&target=_blank"
        let conHref = "oxygen-consult.html?idNo="+this.idNo+"&name="+this.name+"&reportId="+this.reportId+"&groupName="+this.groupName+"&target=_blank"
        return(
            
            <div>
                <div className="result-oxy">
                    {/* <p className="retult-oxy-title">浙江省人民医院内科门诊－王凯医生－远图血氧仪</p> */}
                    {/* <p className="result-oxy-adress"> */}
                        {address?<p className="result-oxy-adress"><img className="address-img" src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/667a78ecca21935a1f0b3dde9e96f013-38-46.png"/>{address}</p>:null}
                        {dataTime?<p className="result-oxy-adress">{dataTime}</p>:null}
                    {/* </p> */}
                    <div className="result-oxy-contain">
                        {status?<div className="result-oxy-normal" style={style}><span className="result-oxy-status">{status}</span></div>:null}
                        <div className="redult-oxy-parameter">
                            <div className="oxy-parameter-item">
                                <p className="oxy-parameter-per">
                                    <span className="oxy-parameter color-green"></span>
                                    <span>95%-99%</span>
                                </p>
                                <p className="oxy-parameter-text">正常</p>
                            </div>
                            <div className="oxy-parameter-item">
                                <p className="oxy-parameter-per">
                                    <span className="oxy-parameter color-yellow"></span>
                                    <span>90%-94%</span>
                                </p>
                                <p className="oxy-parameter-text">氧失饱和</p>
                            </div>
                            <div className="oxy-parameter-item">
                                <p className="oxy-parameter-per">
                                    <span className="oxy-parameter color-red"></span>
                                    <span>&lt;90%</span>
                                </p>
                                <p className="oxy-parameter-text">低氧血症</p>
                            </div>
                        </div>
                    </div>
                    {this.renderResult()}
                    <div className="result-oxy-des">
                        <p>
                            {this.renderTag()}
                        </p>
                        {remarks?<p>{remarks}</p>:<p>您的点点滴滴，是最美的风景</p>}
                    </div>
                </div>
                {
                    this.goback?null:(
                        <div className="result-oxy-ref">
                            <a className="result-oxy-a" href={listHref}>
                                <span className="result-oxy-search">
                                    <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/8f4d89f8b875be186c5a1c6d821e2ae5-60-60.png"/>
                                </span>
                                <span>更多血氧数据</span>
                                <span className="result-oxy-goto"></span>
                            </a>
                        </div>)
                }
                <div className="result-oxy-ref">
                    <a className="result-oxy-a" href={conHref}>
                        <span className="result-oxy-search">
                            <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/f8d0c8ffcbe3b4e02d8536f03bf916c1-40-40.png"/>
                        </span>
                        <span>测量分析参考</span>
                        <span className="result-oxy-goto"></span>
                    </a>
                </div>
                <div className="oxy-footer">
                    <img src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/174620071184395d766b1502695f6828-621-23.png"/>
                </div>
            </div>
        )
    }
}