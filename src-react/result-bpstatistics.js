import React from 'react'
import  './result-oxy.less'
import hybridAPI from './lib/hybridAPI'
import util from './lib/util'
import ResultBsList from './result-bslist'
import ReactEcharts from 'echarts-for-react'
import PackCenter from './module/PackCenter'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import './result-bpstatistics.less'
export default class ResultBptatistics extends React.Component{
    constructor(props){
        super(props)  
        let query = util.query();
        this.idNo = query.idNo;
        this.name = query.name;
        this.groupName = query.groupName;
          
        this.state = {
            isAction:true
        }
    }
    changeCount(){
        this.setState({
            isAction:true
        })
    }
    changeList(){
        this.setState({
            isAction:false
        })
    }
    render(){
        let {isAction} = this.state
        return(
            <div style={{height:"100%"}}>  
                <div className="result-tab">
                    <div className={isAction?"result-tab-list action":"result-tab-list"} onClick={this.changeCount.bind(this)}>统计</div>
                    <div className={isAction?"result-tab-list":"result-tab-list action"} onClick={this.changeList.bind(this)}>列表</div>
                </div>
                <div className="result-statistic-con">
                    {
                        isAction?<ResultBpCount/>:<ResultBsList/> 
                    }
                </div>
            </div>
        )
    }
}
class ResultBpCount extends SmartBlockComponent{
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
                <MeterBpCount groupName={this.groupName} idNo={this.idNo} name={this.name} days={7} updateResult={this.updateResult.bind(this)}/>
                <MeterBpCount groupName={this.groupName} idNo={this.idNo} name={this.name} days={30} updateResult={this.updateResult.bind(this)}/>
                {data!=null?         
                    <div className="oxy-footer">
                        <img src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/174620071184395d766b1502695f6828-621-23.png"/>
                    </div>
                    :<div className="oxy-con-tip">
                        <img className="oxy-con-tip-img" src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/465d10359a91a2bdf5ff09530447a100-180-180.png"/>
                        <p className="oxy-con-tip-txt">暂无相关数据</p>
                    </div>
                } 
            </div>
        )
    }
}
class MeterBpCount extends SmartBlockComponent{
    constructor(props){
        super(props)
        this.state={
            loading:true,
            reportId: props.reportId,
            name: props.name,
            idNo: props.idNo,
            groupName: props.groupName,
            days:props.days,
            abnormalNum:"",
            totalNum:""
        }
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
    formatNumber(number){
        return number>10?number:('0'+number)
    }
    onSuccess(result) {
        let data = result.data;
        if(data!=null){
            this.setState({
                loading:false,
                success:true,
                objList:data
            })
        }else{
            this.setState({
                loading:false,
                success:true,
                objList:null
            })
        }
        
        this.props.updateResult(result)
    }
    onError(result){
        this.setState({
            loading:false,
            success:true,
            objList:null
        })
        this.props.updateResult(result)
    }
    renderCount(){
        let {objList,days} = this.state;
        let statusList = objList.statusList,
        minList = objList.minList,
        maxList = objList.maxList;
        let optList = [            
            {
                color:'#ffd00e',
                statusName:"轻度",
                statusNum:0
            },
            {
                color:'#ff5256',
                statusName:"中度",
                statusNum:0
            },
            {
                color:'#f2383c',
                statusName:"重度",
                statusNum:0
            },
            {
                color:'#429fff',
                statusName:"低血压",
                statusNum:0
            },
            {
                color:'#95d452',
                statusName:"正常",
                statusNum:0
            },
            {
                color:'#14d9cf',
                statusName:"正常高值",
                statusNum:0
            }
        ]
        if(objList){
                let data=[],color=[];
                optList.map((name,i)=>{
                    let number
                    statusList.filter((value,key)=>{
                        if(name.statusName==value.statusName){
                            return number = value.statusNum
                        }
                    })
                    data.push({value:number||0,name:name.statusName})
                    color.push(name.color)
                })
                let options = { 
                    series: [
                        {
                           type:'pie',
                           radius: ['65%', '80%'],
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
                                   show: false
                               }
                           },
                           labelLine: {
                               normal: {
                                   show: false
                               }
                           },
                           data:data
                        }
                    ]
                };
                return(
                    <div className="bp-detect-box">
                        <div className="bp-detect-head">
                            <div className="bp-con-header">
                                <p className="bp-header-title">总测量次数<span style={{color:"#333333",fontSize:"25px",marginLeft:"5px"}}>{objList.totalNum}</span></p>
                                <p className="bp-header-title">异常次数<span style={{color:"#ff5256",fontSize:"25px",marginLeft:"5px"}}>{objList.abnormalNum}</span></p>
                            </div>
                            <div className="bp-con-result">
                                <ReactEcharts option={options} style={{height: '180px', width: '100%'}} className='react-echarts' />
                                <div className="con-result-tip">
                                    <p className="con-result-day">近{days}天</p>
                                </div>
                            </div>
                            <ul className="bp-con-box-time">
                                <li className="bp-con-times">
                                { 
                                    optList.map((index,k)=>{
                                        let number
                                        statusList.filter((ind,j)=>{
                                            if(index.statusName == ind.statusName){
                                                return number = ind.statusNum
                                            }
                                        })
                                        return index.statusName=="正常"?(<p key={k} style={{color:'#98d854'}}>
                                            <span className="bp-result-color" style={{background:index.color}}></span>
                                            <span className="bp-result-text">{index.statusName}</span>
                                            <span className="bp-result-num">{number?number:'0'}</span>
                                        </p>):(<p key={k}>
                                            <span className="bp-result-color" style={{background:index.color}}></span>
                                            <span className="bp-result-text">{index.statusName}</span>
                                            <span className="bp-result-num">{number?number:'0'}</span>
                                        </p>)
                                    })
                                }
                                </li>                           
                            </ul>
                        </div>
                        <div className="bp-detect-con">
                            <div className="bp-con-left">
                                <h4 className="bp-con-title">最高值</h4>
                                {maxList.valueList.length>0?
                                    <div className="bp-con-per">
                                    {
                                        maxList.valueList.map((item,key)=>{
                                            return <p className="bp-con-item" key={key}><span className="bp-con-per-num">{item.value}</span>{item.unit}</p>
                                        })
                                    }
                                    </div>:<div className="bp-con-kon">- -</div>
                                }
                                <p className="bp-result-time">{maxList.maxTime}</p>
                            </div>
                            <div className="bp-result-line"></div>
                            <div className="bp-con-right">
                                <h4 className="bp-con-title">最低值</h4>
                                {minList.valueList.length>0?
                                    <div className="bp-con-per">
                                        {
                                            minList.valueList.map((item,key)=>{
                                                return <p className="bp-con-item" key={key}><span className="bp-con-per-num">{item.value}</span>{item.unit}</p>
                                            })
                                        }
                                    </div>:<div className="bp-con-kon">- -</div>
                                }
                                
                                <p className="bp-result-time">{minList.minTime}</p>
                            </div>
                        </div>  
                    </div> 
                )
            return renderObj
        }
    }
    render(){
        let {objList} = this.state;
        return(
            <div>
            {objList!=null?this.renderCount():null}
            </div>
        )
    }
}