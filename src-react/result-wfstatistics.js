import React from 'react'
import util from './lib/util'
import hybridAPI from './lib/hybridAPI'
import ResultBsList from './result-bslist'
import PackCenter from './module/PackCenter'
import ReactEcharts from 'echarts-for-react'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import './result-wfstatistics.less'

export default class ResultWfstatistics extends React.Component{
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
            <div style={{height:'100%'}}>  
                <div className="result-tab">
                    <div className={isAction?"result-tab-list action":"result-tab-list"} onClick={this.changeCount.bind(this)}>统计</div>
                    <div className={isAction?"result-tab-list":"result-tab-list action"} onClick={this.changeList.bind(this)}>列表</div>
                </div>
                <div className="result-statistic-con">
                    {
                        isAction?<ResultWfCount/>:<ResultBsList/> 
                    }
                </div>
            </div>
        )
    }
}
class ResultWfCount extends SmartBlockComponent{
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
class MeterCount extends SmartBlockComponent{
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
        this.queryDietByDays()
    }
    queryDietByDays(){
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
        let {objList,days} = this.state,minList=[],maxList=[];
        let statusList = objList.statusList,maxObj=objList.maxList.valueList,minObj=objList.minList.valueList;
        minObj.filter((item,key)=>{
            if(item.childName=='体重'||item.childName=='体质指数(BMI)'){
                minList.push(minObj[key])
            }
        })
        maxObj.filter((item,key)=>{
            if(item.childName=='体重'||item.childName=='体质指数(BMI)'){
                maxList.push(maxObj[key])
            }
        })
        let optList = [            
            {
                color:'#429fff',
                statusName:"偏轻",
                statusNum:0
            },
            {
                color:'#ffcd00',
                statusName:"偏重",
                statusNum:0
            },
            {
                color:'#ff5256',
                statusName:"过重",
                statusNum:0
            },
            {
                color:'#95d452',
                statusName:"正常",
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
                <div className="wf-detect-box">
                    <div className="wf-detect-head">
                        <div className="wf-con-header">
                            <p className="wf-header-title">总测量次数<span style={{color:"#333333",fontSize:"25px",marginLeft:"5px"}}>{objList.totalNum}</span></p>
                            <p className="wf-header-title">异常次数<span style={{color:"#ff5256",fontSize:"25px",marginLeft:"5px"}}>{objList.abnormalNum}</span></p>
                        </div>
                        <div className="wf-con-result">
                            <ReactEcharts option={options} style={{height: '180px', width: '100%'}} className='react-echarts' />
                            <div className="con-result-tip">
                                <p className="con-result-day">近{days}天</p>
                            </div>
                        </div>
                        <ul className="wf-con-box-time">
                            <li className="wf-con-times">
                            { 
                                optList.map((index,k)=>{
                                    let number
                                    statusList.filter((ind,j)=>{
                                        if(index.statusName == ind.statusName){
                                            return number = ind.statusNum
                                        }
                                    })
                                    return index.statusName=="正常"?(<p key={k} style={{marginBottom:'10px'}}>
                                        <span className="wf-result-color" style={{background:index.color}}></span>
                                        <span className="wf-result-text" style={{color:'#98d854'}}>{index.statusName}</span>
                                        <span className="wf-result-num" style={{color:'#98d854'}}>{number?number:'0'}</span>
                                    </p>):(<p key={k}>
                                        <span className="wf-result-color" style={{background:index.color}}></span>
                                        <span className="wf-result-text">{index.statusName}</span>
                                        <span className="wf-result-num">{number?number:'0'}</span>
                                    </p>)
                                })
                            }
                            </li>                           
                        </ul>
                    </div>
                    <div className="wf-detect-con">
                        <div className="wf-con-left">
                            <h4 className="wf-con-title">最高值</h4>
                            <div className="wf-con-per">
                                {maxList.length>0?maxList.map((item,key)=>{
                                    return item.childName=="体质指数(BMI)"?<div className="wf-con-per-kg" key={key}>
                                            <p className="wf-con-kg-num">{item.value}<span className="wf-con-kg-unit">{item.unit}</span></p>
                                            <p className="wf-con-kg-txt">BMI</p>
                                        </div>
                                        :<div className="wf-con-per-kg" key={key}>
                                            <p className="wf-con-kg-num">{item.value}<span className="wf-con-kg-unit">{item.unit}</span></p>
                                            <p className="wf-con-kg-txt">{item.childName}</p>
                                        </div>
                                    }):<div className="wf-con-per-kon">- -</div>
                                }
                            </div>
                            <p className="wf-result-time">{objList.maxList.maxTime}</p>
                        </div>
                        <div className="wf-result-line"></div>
                        <div className="wf-con-right">
                            <h4 className="wf-con-title">最低值</h4>
                            <div className="wf-con-per">
                                {minList.length>0?minList.map((item,key)=>{
                                    return item.childName=="体质指数(BMI)"?<div className="wf-con-per-kg" key={key}>
                                            <p className="wf-con-kg-num">{item.value}<span className="wf-con-kg-unit">{item.unit}</span></p>
                                            <p className="wf-con-kg-txt">BMI</p>
                                        </div>
                                        :<div className="wf-con-per-kg" key={key}>
                                            <p className="wf-con-kg-num">{item.value}<span className="wf-con-kg-unit">{item.unit}</span></p>
                                            <p className="wf-con-kg-txt">{item.childName}</p>
                                        </div>
                                    }):<div className="wf-con-per-kon">- -</div>
                                }
                            </div>
                            <p className="wf-result-time">{objList.minList.minTime}</p>
                        </div>
                    </div>  
                </div> 
            )
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