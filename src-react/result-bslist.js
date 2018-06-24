import React from 'react'
import util from './lib/util'
import PackCenter from './module/PackCenter'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import  './result-bslist.less'

export default class ResultList extends SmartBlockComponent{
    constructor(props){
        super(props);
        let date = new Date();
        this.state={
            loading:true,    
            isOpen:[],
            data:[],
            year:date.getFullYear()
        }
        let query = util.query();
        this.reportId = query.reportId;
        this.name=query.name;
        this.idNo = query.idNo;
        this.groupName = query.groupName;
    }
    BeforeYear(){
        let {year}=this.state;
        let getYear = year-1;
        this.setState({
            year:getYear
        })
        this.queryByDate(getYear)
    }
    AfterYear(){
        let {year} = this.state;
        let getYear = year+1;
        let date = new Date()
        let thisYear = date.getFullYear()
        if(getYear<=thisYear){
            this.setState({
                year:getYear
            })
            this.queryByDate(getYear)
        }
        
    }
    onClose(e){
        let {isOpen}=this.state;
        // let flag = isOpen[e].key
        if(isOpen.length>0){
            isOpen[e].isshow = !isOpen[e].isshow
            this.setState({
                isOpen:isOpen,
            })
        }       
    }
    componentWillMount(){
        let {year}=this.state;
        this.queryByDate(year)
    }
    queryByDate(year){
        PackCenter.queryByDate(year,this.groupName,this.idNo,this.name)
        .subscribe(this)
        .fetch()
    }
    onSuccess(result) {
        let data = result.data;
        let isOpen = data.map((item,index)=>{
            return {isshow:false}
        })
        this.setState({
            data:data,
            loading:false,
            success:true,
            isOpen:isOpen
        })
    }
    onError(result){
        this.setState({
            loading:false,
            success:true,
            data:[]
        })
    }
    // goResClick(reportId,index){
    //     let href;
    //     index++;
    //     switch(parseInt(this.groupName)){
    //         case 1:reportId!=this.state.reportId?(href = 'result-oxy.html?reportId='+reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false&target=_blank')
    //                 :(href = 'result-oxy.html?reportId='+reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false');
    //             break;
    //         case 2:reportId!=this.state.reportId?(href='result-bs.html?reportId='+reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false&target=_blank')
    //                 :(href='result-bs.html?reportId='+reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false');
    //             break;
    //         case 3:reportId!=this.state.reportId?(href='result-wf.html?reportId='+reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false&target=_blank')
    //                 :(href='result-wf.html?reportId='+reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false');
    //             break;
    //         case 4:reportId!=this.state.reportId?(href='result-bp.html?reportId='+reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false&target=_blank')
    //                 :(href='result-bp.html?reportId='+reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false');
    //             break;
    //         case 5:
    //         case 6:reportId!=this.state.reportId?(href='result-ot.html?reportId='+reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false&target=_blank')
    //                 :(href='result-ot.html?reportId='+reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false');
    //             break;
    //     }
    //     this.setState({
    //         href:href
    //         ,reportId:reportId
    //     })
    // }
    getList(){
        let {isOpen}=this.state;
        let {data} = this.state;
        var optList;
        switch(parseInt(this.groupName)){
            case 1:optList = [
                    {
                        color:'#999',
                        statusName:"正常"
                    },
                    {
                        color:'#ffcd00',
                        statusName:"氧失饱和"
                    },
                    {
                        color:'#ff5256',
                        statusName:"低氧血症"
                    }
                ]
                break;
            case 2:optList = [            
                    {
                        color:'#ffcd00',
                        statusName:"偏高"
                    },
                    {
                        color:'#ff5256',
                        statusName:"过高"
                    },
                    {
                        color:'#f3353b',
                        statusName:"极高"
                    },
                    {
                        color:'#429fff',
                        statusName:"偏低"
                    },
                    {
                        color:'#2f6cea',
                        statusName:"低血糖"
                    },
                    {
                        color:'#6053f8',
                        statusName:"极低"
                    },
                    {
                        color:'#999',
                        statusName:"正常"
                    }
                ];
                break;
            case 3:optList = [            
                    {
                        color:'#429fff',
                        statusName:"偏轻"
                    },
                    {
                        color:'#ffcd00',
                        statusName:"偏重"
                    },
                    {
                        color:'#ff5256',
                        statusName:"过重"
                    },
                    {
                        color:'#999',
                        statusName:"正常"
                    }
                ];
                break;
            case 4:optList = [  
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
                        color:'#999',
                        statusName:"正常"
                    }          
                ];
                break;
            case 5:
            case 6:
                optList = [            
                    {
                        color:'#429fff',
                        statusName:"偏低"
                    },
                    {
                        color:'#ffcd00',
                        statusName:"发热"
                    },
                    {
                        color:'#ff5256',
                        statusName:"高热"
                    },
                    {
                        color:'#999',
                        statusName:"正常"
                    }
                ];
                break;
        }
        if(data.length>0){           
            let result = data.map((item,key)=>{
                let list = item.resultData;
                return(
                    <li className="res-list-item" key={key} >
                        <div className="date-list-wrapper" onClick={this.onClose.bind(this,key)}>
                            <div className={isOpen.length>0&&isOpen[key].isshow?("icon open"):("icon close")}></div>
                            <div className="date-list-content">
                                <div className="date-list-title"><span className="number">{item.mouth}</span></div>
                                <div className="date-list-brief ">月</div>
                            </div>
                            <div className="date-list-content">
                                <div className="date-list-title"><span className="number">{item.totalNum}</span>次</div>
                                <div className="date-list-brief ">测量次数</div>
                            </div>
                            <div className="date-list-content">
                                <div className="date-list-title"><span className="unusual">{item.abnormalNum}</span>次</div>
                                <div className="date-list-brief ">异常次数</div>
                            </div>
                        </div>
            
                        {isOpen.length>0&&isOpen[key].isshow?
                            (<ul className="result-list-box">
                                {
                                    list.map((value,index)=>{
                                        let time=4;
                                        let date = value.gmtModify&&value.gmtModify.split(/\s+/)[0];
                                        let times = value.gmtModify&&value.gmtModify.split(/\s+/)[1];
                                        let reportList= value.reportList||[]
                                        let status = value.status;
                                        let color='';
                                        let href;
                                        switch(parseInt(this.groupName)){
                                            case 1:href = 'result-oxy.html?reportId='+value.reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false&target=_blank';
                                                break;
                                            case 2:href='result-bs.html?reportId='+value.reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false&target=_blank';
                                                break;
                                            case 3:href='result-wf.html?reportId='+value.reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false&target=_blank';
                                                break;
                                            case 4:href='result-bp.html?reportId='+value.reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false&target=_blank';
                                                break;
                                            case 5:
                                            case 6:href='result-ot.html?reportId='+value.reportId+'&groupName='+this.groupName+'&idNo='+this.idNo+'&name='+this.name+'&goback=false&target=_blank';
                                                break;
                                        }
                                        return(
                                            <li key={index}>
                                                <a className="result-list-item" href={href}>
                                                <div className="list-item-time">
                                                    <p>{date}日</p>
                                                    <p>{times}</p>
                                                </div>
                                                {this.groupName==2?<div className="list-item-xx">{value.slice}</div>:null}
                                                
                                                {reportList.map((ite,i)=>{
                                                    let color='#999'
                                                    optList.filter((opt,key)=>{
                                                        if(opt.statusName == status){
                                                            return color = opt.color
                                                        }
                                                    })
                                                    return this.groupName==3?(<div className="list-item-xx" key={i}><span style={{color:color,marginRight:'5px'}}>{ite.value}</span>{ite.unit?('('+ite.unit+')'):''}</div>):
                                                    (<div className="list-item-xx" key={i}><span style={{color:(i==0?color:"#999"),marginRight:'5px'}}>{ite.value}</span>({ite.unit})</div>)
                                                })}
                                                </a>
                                            </li>
                                        );
                                    })
                                }
                            </ul>):null   
                        }
                          
                </li>)
            })
            return result;
        }
    }
    render(){
        let {isOpen,year,data} = this.state;
        return(
            <div className="contain">
                
                    <div className="list-time">
                        <span className="list-time-left" onClick={this.BeforeYear.bind(this)}></span>
                        <span className="list-time-center">{year}年</span>
                        <span className="list-time-right" onClick={this.AfterYear.bind(this)}></span>
                    </div>
                    {data.length>0?(
                        <ul className="result-list">
                            {this.getList()}
                        </ul>
                    ):<div className="con-tip">
                        <img className="con-tip-img" src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/465d10359a91a2bdf5ff09530447a100-180-180.png"/>
                        <p className="con-tip-txt">暂无相关数据</p>
                    </div>
                }
                
            </div>
        )
    }
}