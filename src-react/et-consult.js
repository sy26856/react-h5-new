import React from 'react'
import  './result-oxy.less'
import util from './lib/util'
import hybridAPI from './lib/hybridAPI'
import ResultBsList from './result-bslist'
import ResultOxyCount from './result-oxycount'
import './wf-consult.less'
export default class EtConsult extends React.Component{
    constructor(props){
        super(props)
        let query = util.query();
        this.idNo = query.idNo;
        this.name = query.name;
        this.groupName = query.groupName;
        this.state = {
            isAction:1
        }
    }
    clickFrist(){
        this.setState({
            isAction:1
        })
    }
    clickSecond(){
        this.setState({
            isAction:2
        })
    }
    clickThree(){
        this.setState({
            isAction:3
        })
    }
    render(){
        let imgSrc = '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/9455bce2840eed97e6eece57b96be140-1125-1949.png'
        return(
            <div className="consult-box">  
                <div className="con-consult">
                    <img src={imgSrc}/>
                </div>
            </div>
        )
    }
}