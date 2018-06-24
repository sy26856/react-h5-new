import React from 'react';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import { SmartBlockComponent } from './BaseComponent/index'
import './video-select.less';
import BlockLoading from './component/loading/BlockLoading';
import hybridAPI from './lib/hybridAPI'
import backRefresh from './hoc/backRefresh'
import Confirm from './component/confirm/Confirm2'

export default class VideoSelect extends SmartBlockComponent {
    constructor(props){
        super(props);
        const query = util.query();
        this.corpId = query.corpId;
        this.unionId = query.unionId;
        this.deptCode = query.deptCode||'';
        this.deptName = query.deptName||'';
        this.year = query.year||'';
        this.month = query.month||'';
        this.day = query.day||'';
        this.referrer=query.referrer;
        this.state={
            loading:false,
            success:true,
            check:query.check,
            isActive:'',
            isAction:'active',
            isShow:true,
            imgQueue:'//front-images.oss-cn-hangzhou.aliyuncs.com/i4/f63ce7e043f133f2cdbdfb022d989626-24-15.png',
            imgTime:'//front-images.oss-cn-hangzhou.aliyuncs.com/i4/f63ce7e043f133f2cdbdfb022d989626-24-15.png'
        }
    }
    componentDidMount(){
        let {check} = this.state;
        this.changeCheck(check)
    }
    componentWillMount(){
        this.getMultiDeptsList2()
    }
    changeCheck(check){
        this.setState({
            isAction:'',
            isActive:'active',
            isShow:false,
        })
    }
    getMultiDeptsList2(){
        let regMode = 1,regType = 6;
        UserCenter.getMultiDeptsList2(this.corpId, regMode, regType, this.unionId).subscribe({
            onSuccess:(result)=>{
                let data = result.data;
                this.setState({
                    deptOutParams:data.multiDeptOutParams.deptOutParams
                })
            }
        }).fetch()
    }
    renderType(){
        let {deptOutParams} =this.state;
        let href1 = 'video-inter.html?corpId=' + this.corpId + '&unionId=' + this.unionId +'&regMode=1'
        return(
            <ul className="type-con">
                <li className="type-con-list">
                    <div className="type-con-href" onClick={() => {
                        if (util.isInYuantuApp()) {
                            //如果是 远图 app 就把值通过 jsbrige返回到上一个界面
                            hybridAPI.pushDataToParent(true, JSON.stringify({
                                corpId: this.corpId,
                                unionId: this.unionId,
                                deptCode: '',
                                deptName: ''
                            }))
                        } else {//非App环境,H5环境
                            window.location.replace(href1)
                        }
                    }}>全部科室</div>
                </li>
                {
                    deptOutParams&&deptOutParams.map((item,key)=>{
                        if(item.children.length>0){
                           return  item.children.map((itm,ind)=>{
                               let href = 'video-inter.html?corpId=' + this.corpId + '&unionId=' + this.unionId + '&deptCode=' + itm.deptCode + '&deptName=' + itm.deptName 
                                return <li
                                className="type-con-list" key={ind}>
                                    <div className="type-con-href" onClick={() =>{
                                        if (util.isInYuantuApp()) {
                                            //如果是 远图 app 就把值通过 jsbrige返回到上一个界面
                                            hybridAPI.pushDataToParent(true, JSON.stringify({
                                                corpId: this.corpId,
                                                unionId: this.unionId,
                                                deptCode: itm.deptCode,
                                                deptName: itm.deptName
                                            }))
                                        } else {//非App环境,H5环境
                                            window.location.replace(href)
                                        }
                                    }}>{itm.deptName}
                                    </div>
                                </li>
                            })
                        }
                    })
                }
            </ul>
        )
    }
    render(){
        let {isAction,imgQueue,imgTime,isActive,isShow}=this.state;
        return(
            <div className="video-select">
                <div className="video-top">
                    <div className="video-type video-noborder" onClick={this.changeCheck.bind(this,'queue')}>
                        <span className={isActive}>筛选科室</span>
                        <img src= {imgQueue}/> 
                    </div>
                </div>
                {this.renderType()}
            </div>
        )
    }
}