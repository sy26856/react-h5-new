
import React from 'react'
import {render} from 'react-dom'
import './oxygen-consult.less'
   

export default class OxygenConsult extends React.Component{
	render(){
		let oxyImg = '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/65ba13b8e9b8cd0ec485b19c94f361f2-1125-1808.png'
		return <div className="oxy-box"> 
				<div className="oxy-consult-box">
				<img className="oxy-img"src={oxyImg}/>
				</div>				
			 </div>;
	}   
}
