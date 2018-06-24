import React from 'react';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import { SmartBlockComponent } from './BaseComponent/index'
import './my-inquisition.less';
import BlockLoading from './component/loading/BlockLoading';
import Alert from './component/alert/alert';
import LazyLoad from 'react-lazyload';

export default class MyInquisition extends SmartBlockComponent {
    constructor(props) {
        super(props);
        const query = util.query();
        this.unionId=query.unionId;
        this.corpId = query.corpId;
        this.state = {
            loading: true,
            data: []
        }
    }
    componentWillMount() {
        if(util.isLogin()){
            UserCenter.getListInquiryByCode('', '', this.corpId, '', 1, '').subscribe({
                onSuccess: (result) => {
                    this.setState({
                        loading: false,
                        success: true,
                        data: result.data
                    })
                },
                onError: (result) => {
                    console.log(result.msg)
                }
            }).fetch()
        }else{
            util.goLogin()
        }
    }
    
    
    render() {
        let {data}=this.state;
        let status=['待支付','待接诊','进行中','已取消','已完成']
        return (
            <div className="my-inquisition">
            {data.map((item,index)=>{
                let img = item.doctPictureUrl ? item.doctPictureUrl : (item.doctorSex == '女' ?'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/31a98050e46593f5313c3b120edf4817-174-174.png' : 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/782a09ba8a4a4de1bacda8f00f5a9522-174-174.png')
                    let href = item.graphicStatus == 1 || item.graphicStatus == 4 ? ("./inquire-details.html?doctName=" + item.doctName + "&rcDoctId=" + item.rcDoctId + "&doctCode=" + item.doctCode + "&deptCode=" + item.deptCode + "&corpName=" + item.corpName + "&regMode=" + item.regMode + "&docLogo=" + item.doctPictureUrl + "&doctSex=" + item.doctorSex + "&patient_sex=" + (item.patientSex == "女" ? 2 : 1) + "&id=" + item.id + "&unionId=" + this.unionId + "&corpId=" + this.corpId) : ("./chat-details.html?doctName=" + item.doctName + "&rcDoctId=" + item.rcDoctId + "&doctCode=" + item.doctCode + "&deptCode=" + item.deptCode + "&corpName=" + item.corpName + "&regMode=" + item.regMode + "&docLogo=" + item.doctPictureUrl + "&doctSex=" + item.doctorSex + "&patient_sex=" + (item.patientSex == "女" ? 2 : 1) + "&isFinished=" + (item.graphicStatus == 2 || item.graphicStatus == 3?1:2)+"&id=" + item.id+"&unionId="+this.unionId+"&corpId="+this.corpId)
                return <div className="panel g-space" key={index} onClick={()=>{
                    window.location.href=href+"&target=_blank"
                }}>
                    <div className="list-item">
                        <LazyLoad offset={100} once={true}>
                            <span className="icon-pic list-icon-lg" style={{ "background": `url(${img}) no-repeat center/cover` }}></span>
                        </LazyLoad>
                        <div className="list-content">
                            <div className="list-title">{item.doctName} {item.deptName}<span className='list-status'>{status[item.graphicStatus-1]}</span></div>
                            <div className="list-title list-con">{item.illnessDesc}</div>
                            <div className="list-title list-con">¥{util.rmb(item.inquiryFee / 100)}</div>
                        </div>
                    </div>
                    <div className="list-bottom">
                        <div className='list-left'>就诊人：{item.patientName}</div>
                        <div className="list-right">{util.dateFormat(item.submitDate,'yyyy-MM-dd hh:mm')}</div>
                    </div>
                </div>
            })}
            </div>
        )
    }
    
   
    
    
}