import React from 'react'
import  './result-oxy.less'
import util from './lib/util'
import hybridAPI from './lib/hybridAPI'
import ResultBsList from './result-bslist'
import ResultOxyCount from './result-oxycount'
import './result-bstatistics.less'
export default class ResultOxystatistics extends React.Component{
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
                        isAction?<ResultOxyCount/>:<ResultBsList/> 
                    }
                </div>
            </div>
        )
    }
}