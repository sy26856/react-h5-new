import React from 'react'
import  './result-bp.less'
import util from './lib/util'
import PackCenter from './module/PackCenter'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import hybridAPI from './lib/hybridAPI'
export default class ResultBp extends SmartBlockComponent{
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
        text = `${this.name}有一份来自血压检测的健康数据要分享给你`,
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
        // let tags = [{tagName:'饮酒'},{tagName:'熬夜'},{tagName:'吃太饱'}]
        if(tags.length>0){
            let tag = tags.map((item,key)=>{
                return item.tagName?(<span className="wf-tag" key={key}>{item.tagName}</span>):null
            })
            return tag
        }
    }
    renderResult(){
        let {resultData,slice}= this.state;
        // let resultData = [{childName:'收缩压',unit:'mmog/L',value:'165'},{childName:'舒张压',unit:'mmog/L',value:'165'},{childName:'心率',unit:'mmog/L',value:'165'}]
        if(resultData){
            resultData.splice(2,0,{});
            return(
                <div className="result-bp-res">
                    {resultData.map((item,key)=>{
                        return key==2?<div className="bp-res-line bp-res-item" key={key}></div>
                            :(
                            <div className="bp-res-item" key={key}>
                                <p className="bp-res-num">{item.value}</p>
                                <p className="bp-res-unit">{item.unit}</p>
                                <p className="bp-res-des">{item.childName}</p>
                            </div>
                        )}
                    )}
                </div>
            )
        }
    }
    renderStatus(){
        let {status}=this.state
        // let status="低血压"
        let data=[
            {
                color:'#429fff',
                statusName:"低血压"
            },
            {
                color:'#14d9cf',
                statusName:"正常高值"
            },
            {
                color:'#ffd00e',
                statusName:"轻度"
            },
            {
                color:'#ff5256',
                statusName:"中度"
            },
            {
                color:'#f2383c',
                statusName:"重度"
            },
            {
                color:'#95d452',
                statusName:"正常"
            }
        ]
        let color,statusName;
        data.map((item)=>{
            if(item.statusName==status){
                color=item.color;
                statusName=status;
            }
        })
        return (<div className="result-bp-circle" style={{border:'12px solid '+color}}>{statusName}</div>)
    }
    render(){
        let {address,dataTime,remarks} = this.state;
        let listHref = "result-bpstatistics.html?idNo="+this.idNo+"&name="+this.name+"&reportId="+this.reportId+"&groupName="+this.groupName+"&target=_blank"
        let conHref ="bp-consult.html?idNo="+this.idNo+"&name="+this.name+"&reportId="+this.reportId+"&groupName="+this.groupName+"&target=_blank"
        let addressImg='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/667a78ecca21935a1f0b3dde9e96f013-38-46.png'
        return(           
            <div>
                
                <div className="result-box">
                    <div className="result-header">
                        {address?<p className="result-address"><span className="result-address-icon"><img src={addressImg}/></span>{address}</p>:null}
                        {dataTime?<p className="result-date">{dataTime}</p>:null}
                        {this.renderStatus()}
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
                                    <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/8f4d89f8b875be186c5a1c6d821e2ae5-60-60.png"/>
                                </span>
                                <span>更多血压数据</span>
                                <span className="result-gbpo"></span>
                            </a>
                        </div>)
                }
                <div className="result-ref">
                    <a className="result-a" href={conHref}>
                        <span className="result-search">
                            <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/f8d0c8ffcbe3b4e02d8536f03bf916c1-40-40.png"/>
                        </span>
                        <span>测量分析参考</span>
                        <span className="result-gbpo"></span>
                    </a>
                </div>
                <div className="footer">
                    <img src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/174620071184395d766b1502695f6828-621-23.png"/>
                </div>
            </div>
        )
    }
}