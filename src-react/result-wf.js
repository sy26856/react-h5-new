import React from 'react'
import  './result-wf.less'
import util from './lib/util'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import hybridAPI from './lib/hybridAPI'
import PackCenter from './module/PackCenter'
export default class ResultWf extends SmartBlockComponent{
    constructor(props){ 
        super(props)
        let query = util.query();
        this.reportId = query.reportId;
        this.name=query.name;
        this.idNo = query.idNo;  
        this.groupName = query.groupName;
        this.time = query.time;
        this.goback = query.goback;
        let resStatus=[
            {
                color:"#429fff",
                statusName:"偏轻"
            },
            {
                color:"#95d452",
                statusName:"正常"
            },
            {
                color:"#ffcd00",
                statusName:"偏重"
            },
            {
                color:"#ff5256",
                statusName:"过重"
            }
        ]
        this.state={
            loading:true,
            address:"",
            dataTime:"",
            slice:"",
            resultData:[],
            status:"",
            tags:[],
            resWeight:[],
            resPerset:[],
            resStatus:resStatus
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
        let resultData=data.resultData
        let resWeight=[],resPerset=[],perWeight
        resultData.filter((item,key)=>{
            if(item.childName=='体重'||item.childName=='体质指数(BMI)'){
                resWeight.push(resultData[key])
            }else{
                resPerset.push(resultData[key])
            }
        })
        this.setState({
            loading:false,
            success:true,
            heightData:data.heightData,
            address:data.addr,
            dataTime:data.gmtModify,
            tags:data.tags,
            slice:data.slice,
            perWeight:perWeight,
            resWeight:resWeight,
            resPerset:resPerset,
            status:data.status,
            remarks:data.remarks
        })
        let title = "健康分享",
            text = `${this.name}有一份来自体重体脂检测的健康数据要分享给你`,
            url = window.location.href,
            imageUrl = "//image.yuantutech.com/user/0c306d9a190c1bcde2d8f9ad31e29810-300-300.jpg",
            isShowButton = true,
            isCallShare = false,time=3;
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
        let {resWeight,resPerset,slice}= this.state;
        if(resWeight.length>0){
            let res = resWeight.map((item,key)=>{
                return item.childName=='体质指数(BMI)'?(
                    <div className="result-res-left" key={key}>
                        <p><span className="result-res-num">{item.value}</span>{item.unit}</p>
                        <p className="result-res-des">BMI</p> 
                    </div>
                ):(
                    <div className="result-res-left" key={key}>
                        <p><span className="result-res-num">{item.value}</span>{item.unit}</p>
                        <p className="result-res-des">{item.childName}</p> 
                    </div>
                )
            })
            return res
        }
    }
    renderPerset(){
        let {resPerset,slice,resStatus,status}= this.state,color,itemStatus;
        switch(status){
            case '正常':color='#95d452';itemStatus="正常";
                break;
            case '偏轻':color='#429fff';itemStatus="偏瘦";
                break;
            case '偏重':
            case '过重':color='#ffcd00';itemStatus="偏胖";
                break;
        }
        if(resPerset.length>0&&resPerset[0].value!=0){
            return <div className="result-contain">
                {resPerset.map((item,key)=>{
                    return item.childName=='体脂肪率'?
                    <div className="res-con-item" key={key}>
                        <div className="con-item-circle" style={{border:'2px solid '+color}}>
                            <p className="con-item-num">{item.value}</p>
                            <p className="con-item-unit">{item.unit}</p>
                            <p className="con-item-tip" style={{background:color}}>{itemStatus}</p>
                        </div>
                        <p className="con-item-des">{item.childName}</p>
                    </div>:
                    <div className="res-con-item" key={key}>
                        <div className="con-item-circle">
                            <p className="con-item-num">{item.value}</p>
                            <p className="con-item-unit">{item.unit}</p>
                        </div>
                        <p className="con-item-des">{item.childName}</p>
                    </div>
                })
            }
            </div>
        }
    }
    renderStatus(){
        let {status,resStatus}=this.state      
        let color,statusName;
        resStatus.map((item)=>{
            if(item.statusName==status){
                color=item.color;
                statusName=status;
            }
        })
        return (<div className="result-circle" style={{border:'12px solid '+color}}>{statusName}</div>)
    }
    render(){
        
        let {address,dataTime,slice,status,remarks,heightData} = this.state,secondVal,threeVal,firstVal;
        let listHref = "result-wfstatistics.html?idNo="+this.idNo+"&name="+this.name+"&reportId="+this.reportId+"&groupName="+this.groupName+"&target=_blank"
        let conHref = "wf-consult.html?idNo="+this.idNo+"&name="+this.name+"&reportId="+this.reportId+"&groupName="+this.groupName+"&target=_blank"
        let consultImg = '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/f8d0c8ffcbe3b4e02d8536f03bf916c1-40-40.png';
        let moreImg ='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/8f4d89f8b875be186c5a1c6d821e2ae5-60-60.png';
        let addressImg='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/667a78ecca21935a1f0b3dde9e96f013-38-46.png'
        let heightNum = parseInt(heightData)/100;
        firstVal = (18.5*Math.pow(heightNum,2)).toFixed(1)
        secondVal = (24.99*Math.pow(heightNum,2)).toFixed(1)
        threeVal = (28*Math.pow(heightNum,2)).toFixed(1)
        return(
            <div>
                <div className="result-box">
                    <div className="result-header">
                        {address?<p className="result-address"><span className="result-address-icon"><img src={addressImg}/></span>{address}</p>:null}
                        {dataTime?<p className="result-date">{dataTime}</p>:null} 
                        {this.renderStatus()}
                        <div className="result-refer">
                            <p className="result-refer-num first">{firstVal}</p>
                            <p className="result-refer-num second">{secondVal}</p>
                            <p className="result-refer-num three">{threeVal}</p>
                            <span className="result-refer-item color-blue">偏轻</span>
                            <span className="result-refer-item color-green">正常</span>
                            <span className="result-refer-item color-yellow">偏重</span>
                            <span className="result-refer-item color-red">过重</span>
                        </div>
                        <div className="result-res">
                            <div className="result-res-line"></div>
                            {this.renderResult()}
                        </div>
                        {this.renderPerset()}
                        <div className="result-descript">
                            <p className="res-des-tag">
                                {this.renderTag()}
                            </p>
                            {remarks?<p className="res-des-txt">{remarks}</p>:<p className="res-des-txt">您的点点滴滴，是最美的风景</p>}
                        </div>
                    </div>
                </div>
                <div>
                {this.goback?null:
                    <div className="result-wf-ref">
                        <a className="result-wf-a" href={listHref}>
                            <span className="result-wf-search">
                                <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/8f4d89f8b875be186c5a1c6d821e2ae5-60-60.png"/>
                            </span>
                            <span>更多体重体脂数据</span>
                            <span className="result-wf-goto"></span>
                        </a>
                    </div>   
                }
                    <div className="result-wf-ref">
                        <a className="result-wf-a" href={conHref}>
                            <span className="result-wf-search">
                                <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/f8d0c8ffcbe3b4e02d8536f03bf916c1-40-40.png"/>
                            </span>
                            <span>测量分析参考</span>
                            <span className="result-wf-goto"></span>
                        </a>
                    </div>
                    <div className="footer">
                        <img src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/174620071184395d766b1502695f6828-621-23.png"/>
                    </div>
                </div>       
            </div>
        )
    }
}