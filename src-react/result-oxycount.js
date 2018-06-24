import React from 'react'
import  './result-oxycount.less'
import util from './lib/util'
import ReactEcharts from 'echarts-for-react'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import PackCenter from './module/PackCenter'

class MeterCount extends SmartBlockComponent{
    constructor(props){
        super(props)
        this.state={  
            loading:true,
            reportId: props.reportId,
            name:props.name,
            idNo:props.idNo,
            groupName: props.groupName,
            days:props.days,
            resData:null
        }     
    }
    componentDidMount(){
        // this.handleDate()
    }
    componentWillMount(){
        this.queryByDays()       
    }
    queryByDays(){
        let {days,groupName,idNo,name} = this.state;
        PackCenter.queryByDays(days,groupName,idNo,name)
        .subscribe(this)
        .fetch()
    }
    onSuccess(result) {
        let data = result.data;
        if(data!=null){
            this.setState({
                loading:false,
                success:true,
                resData:data
            })
        }else{
            this.setState({
                loading:false,
                success:true
            })
        }
        this.props.updateResult(result);
    }
    onError(result){
        this.setState({
            loading:false,
            success:true
        })
        this.props.updateResult(result);
    }

    renderCount(){
        let {resData,days,groupName}=this.state;
        let datas=[],color=[]; 
        let oxyList = [
            {
                color:'#95d452',
                statusName:"正常",
                statusNum:'0'
            },
            {
                color:'#ffcd00',
                statusName:"氧失饱和",
                statusNum:'0'
            },
            {
                color:'#ff5256',
                statusName:"低氧血症",
                statusNum:'0'
            }
        ]
        if(resData){
            let statusList = resData.statusList;
            let normalTime=0,oxyTime=0,lowTime=0;
            oxyList.map((item,key)=>{
                let statusNum;
                statusList.filter((value,key)=>{
                    if(item.statusName==value.statusName){
                        return statusNum = value.statusNum;
                    }
                })
                datas.push({value:statusNum||0,name:item.statusName});
                color.push(item.color)
            })
            statusList.map((item)=>{
                if(item.statusName=="正常"){
                    normalTime = item.statusNum;
                }else if(item.statusName=="氧失饱和"){
                    oxyTime = item.statusNum;
                }else if(item.statusName=="低氧血症"){
                    lowTime = item.statusNum;
                }
            })
            var options = { 
                series: [
                    {
                        type:'pie',
                        radius: ['66%', '80%'],
                        silent:true,
                        legendHoverLink:false,
                        hoverAnimation:false,
                        avoidLabelOverlap: false,
                        color:color,
                        label: {
                            normal: {
                               show: false,
                               position: 'center'
                            },
                            emphasis: {
                                show: true,
                                textStyle: {
                                    fontSize: '20',
                                    fontWeight: 'bold'
                                }
                            }
                        },
                       labelLine: {
                           normal: {
                               show: false
                           }
                       },
                       data:datas
                    }
                ]
            }; 
            return(
                <div className="oxy-detect-box">
                    <div className="oxy-detect-head"> 
                        {/* <div className="oxy-con-tip">最近七天的测量数据</div> */}
                        <div className="oxy-con-header">
                            <p className="oxy-header-title">总测量次数<span style={{color:"rgb(51,51,51)",fontSize:"25px",marginLeft:"5px",fontWeight:"bold"}}>{resData.totalNum}</span></p>
                            <p className="oxy-header-title">异常次数<span style={{color:"rgb(255,82,86)",fontSize:"25px",marginLeft:"5px",fontWeight:"bold"}}>{resData.abnormalNum}</span></p>
                        </div>
                        <div className="oxy-con-result">
                            <ReactEcharts option={options} style={{height: '180px', width: '100%'}} className='react-echarts' />
                            <div className="oxy-con-position">近{days}天</div>
                        </div>
                        <ul className="oxy-con-times">
                            <li>
                                <span className="oxy-color-green"></span>
                                <p className="oxy-con-txt">正常</p>
                                <p className="oxy-con-tim">{normalTime||'0'}</p>
                            </li>
                            <li>
                                <span className="oxy-color-yellow"></span>
                                <p className="oxy-con-txt">氧失饱和</p>
                                <p className="oxy-con-tim" style={{color:"#ffcd00"}}>{oxyTime||'0'}</p>
                            </li>
                            <li>
                                <span className="oxy-color-red"></span>
                                <p className="oxy-con-txt">低氧血症</p>
                                <p className="oxy-con-tim" style={{color:"rgb(255,82,86)"}}>{lowTime||'0'}</p>
                            </li>
                        </ul>
                    </div>
                    <div className="oxy-detect-con">
                        
                        {
                            resData.maxList?(<div className="oxy-con-left">
                            <h4 className="oxy-con-title">最高值</h4>
                                <div className="oxy-con-per">
                                    {resData.maxList.valueList.length>0?resData.maxList.valueList.map((item,key)=>{
                                        return(
                                            <p className="oxy-con-shu" key={key}>
                                                <span className="oxy-result-per">{item.value}<i>{item.unit}</i></span>
                                                <span className="oxy-result-des">{item.childName}</span>
                                            </p>
                                        )
                                    }):<p  className="oxy-con-shu">- -</p>
                                    }
                                </div>
                                <p className="oxy-result-time">{resData.maxList.maxTime}</p>
                            </div>):null
                        }
                        <div className="oxy-con-line"></div>
                        {
                            resData.minList?(<div className="oxy-con-right">
                            <h4 className="oxy-con-title">最低值</h4>
                            <div className="oxy-con-per">
                                {resData.minList.valueList.length>0?
                                    resData.minList.valueList.map((item,key)=>{
                                        return(
                                            <p className="oxy-con-shu" key={key}>
                                                <span className="oxy-result-per">{item.value}<i >{item.unit}</i></span>
                                                <span className="oxy-result-des">{item.childName}</span>
                                            </p> 
                                        )
                                    }):<p className="oxy-con-shu">- -</p>
                                }
                            </div>
                            <p className="oxy-result-time">{resData.minList.minTime}</p>
                        </div>):null
                        }      
                    </div>
                </div>
            )
        }
        
    }
    render(){
        let {resData} = this.state;
        return(
            <div>
            {resData!=null?this.renderCount():null
            }
            </div>
            
        )
    }
}
export default class ResultCount extends SmartBlockComponent{
    constructor(props){
        super(props)
        let query = util.query();
        this.reportId = query.reportId;
        this.name=query.name;
        this.idNo = query.idNo;
        this.groupName = query.groupName;  
        this.state={
            loading:true,
            data:null
        }     
    }
    componentDidMount(){
        this.setState({
            loading:false,
            success:true
        })
    }
    updateResult(result){
        this.setState({
            data:result&&result.data||null
        })
    }

    render(){
        let {data}= this.state
        return(
            <div className="body">
                <MeterCount groupName={this.groupName} idNo={this.idNo} name={this.name} days={7} updateResult={this.updateResult.bind(this)}/>
                <MeterCount groupName={this.groupName} idNo={this.idNo} name={this.name} days={30} updateResult={this.updateResult.bind(this)}/>
                {data!=null?
                <div>
                    
                    <div className="oxy-footer">
                        <img src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/174620071184395d766b1502695f6828-621-23.png"/>
                    </div>
                </div>
                :<div className="oxy-con-tip">
                    <img className="oxy-con-tip-img" src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/465d10359a91a2bdf5ff09530447a100-180-180.png"/>
                    <p className="oxy-con-tip-txt">暂无相关数据</p>
                </div>} 
            </div>
        )
    }
}