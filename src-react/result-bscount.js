import React from 'react'
// import echarts from 'echarts/lib/echarts'
import PackCenter from './module/PackCenter'
import util from './lib/util'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import ReactEcharts from 'echarts-for-react/lib'
import  './result-bscount.less'
 class MeterCount extends SmartBlockComponent{
    constructor(props){
        super(props)
        this.state={  
            objList:null,    
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
        PackCenter.queryDietByDays(days,groupName,idNo,name)
        .subscribe(this)
        .fetch()
    }
    formatNumber(number){
        return number>10?number:('0'+number)
    }
    onSuccess(result) {
        let data = result.data;
        if(data.length>0){
            this.setState({
                loading:false,
                success:true,
                objList:data
            })
        }
        this.props.updateRes(result)
    }
    onError(result){
        this.setState({
            loading:false,
            success:true,
            objList:null
        })
        this.props.updateRes(result)
    }
    renderCount(){
        let {objList,days} = this.state;
        let optList = [            
            {
                color:'#ffcd00',
                statusName:"偏高",
                statusNum:0
            },
            {
                color:'#ff5256',
                statusName:"过高",
                statusNum:0
            },
            {
                color:'#f3353b',
                statusName:"极高",
                statusNum:0
            },
            {
                color:'#429fff',
                statusName:"偏低",
                statusNum:0
            },
            {
                color:'#2f6cea',
                statusName:"低血糖",
                statusNum:0
            },
            {
                color:'#6053f8',
                statusName:"极低",
                statusNum:"00"
            },
            {
                color:'#95d452',
                statusName:"正常",
                statusNum:0
            }
        ]
        if(objList){
            let renderObj = objList.map((item,key)=>{
                let data=[],color=[];
                optList.map((name,i)=>{
                    let number
                    item.statusList.filter((value,key)=>{
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
                    <div className="bs-detect-box" key={key}>
                        <div className="bs-detect-head">
                            <div className="bs-con-header">
                                <p className="bs-header-title">总测量次数<span style={{color:"#333333",fontSize:"25px",marginLeft:"5px"}}>{item.totalNum}</span></p>
                                <p className="bs-header-title">异常次数<span style={{color:"#ff5256",fontSize:"25px",marginLeft:"5px"}}>{item.abnormalNum}</span></p>
                            </div>
                            <div className="bs-con-result">
                                <ReactEcharts option={options} style={{height: '180px', width: '100%'}} className='react-echarts' />
                                <div className="con-result-tip">
                                    <p className="con-result-day">近{days}天</p>
                                    <p className="con-result-diet">{item.dietName}</p>
                                </div>
                            </div>
                            <ul className="bs-con-box-time">
                                <li className="bs-con-times">
                                { 
                                    optList.map((index,k)=>{
                                        let number
                                        item.statusList.filter((ind,j)=>{
                                            if(index.statusName == ind.statusName){
                                                return number = ind.statusNum
                                            }
                                        })
                                        return index.statusName=="正常"?(<p key={k} style={{marginBottom:'10px'}}>
                                            <span className="bs-result-color" style={{background:index.color}}></span>
                                            <span className="bs-result-text" style={{color:'#98d854'}}>{index.statusName}</span>
                                            <span className="bs-result-num" style={{color:'#98d854'}}>{number?number:'0'}</span>
                                        </p>):(<p key={k}>
                                            <span className="bs-result-color" style={{background:index.color}}></span>
                                            <span className="bs-result-text">{index.statusName}</span>
                                            <span className="bs-result-num">{number?number:'0'}</span>
                                        </p>)
                                    })
                                }
                                </li>                           
                            </ul>
                        </div>
                        <div className="bs-detect-con">
                            <div className="bs-con-left">
                                <h4 className="bs-con-title">最高值</h4>
                                {item.maxList.valueList.length>0?
                                    <div className="bs-con-per">
                                        <p className="bs-con-min">{item.maxList.slice}</p>
                                        <p className="bs-con-min">
                                            <span className="bs-result-per">{item.maxList.valueList[0].value}</span>
                                            <span className="bs-result-des">{item.maxList.valueList[0].unit}</span>
                                        </p>
                                    </div>:<div className="bs-con-per">- -</div>        

                                }
                                
                                <p className="bs-result-time">{item.maxList.maxTime}</p>
                            </div>
                            <div className="bs-result-line"></div>
                            <div className="bs-con-right">
                                <h4 className="bs-con-title">最低值</h4>
                                {item.minList.valueList.length>0?
                                    <div className="bs-con-per">
                                        <p className="bs-con-min">{item.minList.slice}</p>
                                        <p className="bs-con-min">
                                            <span className="bs-result-per">{item.minList.valueList[0].value}</span>
                                            <span className="bs-result-des">{item.minList.valueList[0].unit}</span>
                                        </p>
                                    </div>:<div className="bs-con-per">- -</div>
                                }
                                
                                <p className="bs-result-time">{item.minList.minTime}</p>
                            </div>
                        </div>  
                    </div> 
                )
            })
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
            isShow:false
        }
    }
    componentWillMount(){
        this.setState({
            loading:false,
            success:true
        })
    }
    updateRes(result){
        if(result&&result.data.length>0){
            this.setState({
                isShow:true
            })
        }
        
    }
    render(){
        let {isShow} = this.state
        return(
            <div className="body">
                <MeterCount days={7} groupName={this.groupName} idNo={this.idNo} name={this.name} updateRes={this.updateRes.bind(this)}/>
                <MeterCount days={30} groupName={this.groupName} idNo={this.idNo} name={this.name} updateRes={this.updateRes.bind(this)}/>
                {isShow?
                <div>
                    <div className="bs-footer">
                        <img src="//front-images.oss-cn-hangzhou.aliyuncs.com/i4/174620071184395d766b1502695f6828-621-23.png"/>
                    </div>
                </div>
                :<div className="bs-con-tip">
                    <img className="con-tip-img" src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/465d10359a91a2bdf5ff09530447a100-180-180.png"/>
                    <p className="con-tip-txt">暂无相关数据</p>                
                </div>
                } 
                        
            </div>          
        )
    }
}