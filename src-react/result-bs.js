import React from 'react'
import  './result-bs.less'
import util from './lib/util'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import hybridAPI from './lib/hybridAPI'
import PackCenter from './module/PackCenter'
export default class ResultBs extends SmartBlockComponent{
    constructor(props){ 
        super(props)   
        let query = util.query();
        this.reportId = query.reportId;
        this.name=query.name;
        this.idNo = query.idNo;
        this.groupName = query.groupName;
        this.goback = query.goback;
        this.state={  
            loading:true,
            address:"",
            dataTime:"",
            slice:"",
            resultData:[],
            status:"",
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
        this.setState({
            // loading:false,
            success:true,
            address:data.addr,
            dataTime:data.gmtModify,
            tags:data.tags,
            slice:data.slice,
            resultData:data.resultData,
            status:data.status,
            remarks:data.remarks
        })
        let title = "健康分享",
            text = `${this.name}有一份来自血糖检测的健康数据要分享给你`,
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
                return item.tagName?(<span className="result-bs-tag" key={key}>{item.tagName}</span>):null
            })
            return tag
        }
    }
    renderResult(){
        let {resultData,slice}= this.state;
        if(resultData.length>0){
            let res = resultData.map((item,key)=>{
                return (
                    <div className="result-bs-meter" key={key}>
                        <span>{slice}</span>
                        <span className="result-bs-num">{item.value}</span>
                        <span>{item.unit}</span>
                    </div>
                )
            })
            return res
        }
    }
    renderStatus(){
        let {status}=this.state
        let data=[
            {
                color:"#95d452",
                statusName:"正常"
            },
            {
                color:"#6053f8",
                statusName:"极低"
            },
            {
                color:"#429fff",
                statusName:"偏低"
            },
            {
                color:"#2f6deb",
                statusName:"低血糖"
            },
            {
                color:"#f3353b",
                statusName:"极高"
            },
            {
                color:"#ffcd00",
                statusName:"偏高"
            },
            {
                color:"#ff5256",
                statusName:"过高"
            }
        ]
        let color,statusName;
        data.map((item)=>{
            if(item.statusName==status){
                color=item.color;
                statusName=status;
            }
        })
        return (<div className="result-bs-normal" style={{border:'12px solid '+color}}>{statusName}</div>)
    }
    render(){
        let {address,dataTime,slice,status,remarks} = this.state;
        let listHref = "result-bstatistics.html?idNo="+this.idNo+"&name="+this.name+"&reportId="+this.reportId+"&groupName="+this.groupName+"&target=_blank"
        let conHref = "bs-consult.html?idNo="+this.idNo+"&name="+this.name+"&reportId="+this.reportId+"&groupName="+this.groupName+"&target=_blank"
        let consultImg = '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/f8d0c8ffcbe3b4e02d8536f03bf916c1-40-40.png';
        let moreImg ='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/8f4d89f8b875be186c5a1c6d821e2ae5-60-60.png'
        return(
            <div>
                <div className="result-bs">
                    {/* <p className="retult-bs-title">浙江省人民医院内科门诊－王凯医生－远图血糖仪</p> */}
                    {/* <p className="result-bs-adress"> */}
                        {address?<p className="result-bs-adress"><img className="address-img" src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/667a78ecca21935a1f0b3dde9e96f013-38-46.png"/>{address}</p>:null}
                        {dataTime?<p className="result-bs-adress">{dataTime}</p>:null}
                    {/* </p> */}
                    {this.renderStatus()}
                    {this.renderResult()}
                    <div className="result-bs-des">
                        <p>
                            {this.renderTag()}
                        </p>
                        {remarks?<p>{remarks}</p>:<p>您的点点滴滴，是最美的风景</p>}
                    </div>
                </div>
                {
                    this.goback?null:(
                        <div className="result-bs-ref">
                            <a className="result-bs-a" href={listHref}>
                                <span className="result-bs-search">
                                    <img src={moreImg}/>
                                </span>
                                <span>更多血糖数据</span>
                                <span className="result-bs-goto"></span>
                            </a>
                        </div> )
                }      

                <div className="result-bs-ref">
                    <a className="result-bs-a" href={conHref}>
                        <span className="result-bs-search">
                            <img src={consultImg}/>
                        </span>
                        <span>测量分析参考</span>
                        <span className="result-bs-goto"></span>
                    </a>
                </div> 
                <div className="bs-footer">
                    <img src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/174620071184395d766b1502695f6828-621-23.png"/>
                </div>         
            </div>
        )
    }
}