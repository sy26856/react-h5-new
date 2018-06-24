import React from 'react'
import  './result-oxy.less'
import util from './lib/util'
import hybridAPI from './lib/hybridAPI'
import ResultBsList from './result-bslist'
import ResultOxyCount from './result-oxycount'
import './wf-consult.less'
export default class WfConsult extends React.Component{
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
        let {isAction} = this.state
        let imgSrc,color1,color2,color3,display1,display2,display3
        switch(isAction){
            case 1:imgSrc='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/cff5b44adbfb0ad72c44a4fdb0d7c5e9-750-5574.png';
                color1='#429fff';display1="block";display2="none";display3="none";
                break;
            case 2:imgSrc='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/b5e97f8ee2643650307f83919ce7f328-752-8027.png';
            color2='#429fff';display1="none";display2="block";display3="none";
                break;
            case 3:imgSrc='//front-images.oss-cn-hangzhou.aliyuncs.com/i4/71f104956cf4872d1b1b9d9e2fb0352b-750-1116.png';
                color3='#429fff';display1="none";display2="none";display3="block";
                break;
        }
        return(
            <div className="consult-box">  
                <div className="consult-tab">
                    <div className="consult-tab-item" onClick={this.clickFrist.bind(this)} style={{color:color1}}>成年人<span className="consult-line" style={{display:display1}}></span></div>
                    <div  className="consult-tab-item" onClick={this.clickSecond.bind(this)} style={{color:color2}}>未成年人<span className="consult-line" style={{display:display2}}></span></div>
                    <div className="consult-tab-item" onClick={this.clickThree.bind(this)} style={{color:color3}}>孕妇<span className="consult-line" style={{display:display3}}></span></div>
                </div>
                <div className="consult-con">
                    <img src={imgSrc}/>
                </div>
            </div>
        )
    }
}