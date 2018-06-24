import React from 'react'
import  './result-ot.less'
import util from './lib/util'
import PackCenter from './module/PackCenter'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import hybridAPI from './lib/hybridAPI'
export default class ResultOt extends SmartBlockComponent{
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
        text = this.groupName==5?`${this.name}有一份来自耳温检测的健康数据要分享给你`:`${this.name}有一份来自口温检测的健康数据要分享给你`,
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
                return item.tagName?(<span className="wf-tag" key={key}>{item.tagName}</span>):null
            })
            return tag
        }
    }
    renderResult(){
        let {resultData,slice}= this.state;
        if(resultData){
            return(
                <div className="result-ot-res">
                    {resultData.map((item,key)=>{
                        return (
                            <p key={key}>
                                <span className="result-ot-descri">{item.childName}</span>
                                <span className="result-ot-num">{item.value}</span>
                                <span className="result-ot-unit">{item.unit}</span>
                            </p>
                        )}
                    )}
                </div>
            )
        }
    }
    render(){
        let {address,dataTime,slice,status,remarks,value} = this.state;
        let style
        if(status=="偏低"||(value&&value<36)){
            style={
                border:'12px solid #429fff'
            }
        }else if(status=="正常"||(36<=value&&value<=37.2)){
            style={
                border:'12px solid #95d452'
            }
        }else if(status=="发热"||(value>=37.3&&value<=39)){
            style={
                border:'12px solid #ffcd00'
            }
        }else if(status=="高热"||(value>39)){
            style={
                border:'12px solid #ff5256'
            }
        }

        let listHref = "result-otstatistics.html?idNo="+this.idNo+"&name="+this.name+"&reportId="+this.reportId+"&groupName="+this.groupName+"&target=_blank"
        let conHref =this.groupName==6? "ot-consult.html?idNo="+this.idNo+"&name="+this.name+"&reportId="+this.reportId+"&groupName="+this.groupName+"&target=_blank":"et-consult.html?idNo="+this.idNo+"&name="+this.name+"&reportId="+this.reportId+"&groupName="+this.groupName+"&target=_blank"
        let addressImg='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/667a78ecca21935a1f0b3dde9e96f013-38-46.png'
        return(           
            <div>
                <div className="result-box">
                    <div className="result-header">
                        {address?<p className="result-address"><span className="result-address-icon"><img src={addressImg}/></span>{address}</p>:null}
                        {dataTime?<p className="result-date">{dataTime}</p>:null}
                        <div className="result-ot-circle" style={style}>{status}</div>
                        <div className="redult-ot-parameter">
                            <div className="ot-parameter-item">
                                <p className="ot-parameter-per">
                                    <span className="ot-parameter color-blue"></span>
                                    <span>&lt;36</span>
                                </p>
                                <p className="ot-parameter-text">偏低</p>
                            </div>
                            <div className="ot-parameter-item">
                                <p className="ot-parameter-per">
                                    <span className="ot-parameter color-green"></span>
                                    <span>36-37.2</span>
                                </p>
                                <p className="ot-parameter-text">正常</p>
                            </div>
                            <div className="ot-parameter-item">
                                <p className="ot-parameter-per">
                                    <span className="ot-parameter color-yellow"></span>
                                    <span>37.3-39.0</span>
                                </p>
                                <p className="ot-parameter-text">发热</p>
                            </div>
                            <div className="ot-parameter-item">
                                <p className="ot-parameter-per">
                                    <span className="ot-parameter color-red"></span>
                                    <span>&gt;39</span>
                                </p>
                                <p className="ot-parameter-text">高热</p>
                            </div>
                        </div>
                            {this.renderResult()}
                        <div className="result-descript">
                            <p className="res-des-tag">
                                {this.renderTag()}
                            </p>
                            {remarks?<p className="res-des-txt">{remarks}</p>:<p className="res-des-txt">您的点点滴滴，是最美的风景</p>}
                        </div>
                    </div>
                </div>
                {
                    this.goback?null:(
                        <div className="result-ref">
                            <a className="result-a" href={listHref}>
                                <span className="result-search">
                                    <img src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/8f4d89f8b875be186c5a1c6d821e2ae5-60-60.png"/>
                                </span>
                                <span>更多{this.groupName==5?"耳温":"口温"}数据</span>
                                <span className="result-goto"></span>
                            </a>
                        </div>)
                }
                <div className="result-ref">
                    <a className="result-a" href={conHref}>
                        <span className="result-search">
                            <img src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/f8d0c8ffcbe3b4e02d8536f03bf916c1-40-40.png"/>
                        </span>
                        <span>测量分析参考</span>
                        <span className="result-goto"></span>
                    </a>
                </div>
                <div className="footer">
                    <img src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/174620071184395d766b1502695f6828-621-23.png"/>
                </div>
            </div>
        )
    }
}