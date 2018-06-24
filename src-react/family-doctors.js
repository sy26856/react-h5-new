import React from 'react';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import './family-doctors.less';

export default class FamilyDoctors extends SmartBlockComponent {

    constructor(props) {
        super(props);
        const query = util.query();
        this.corpId=query.corpId;
        this.doctCode=query.doctCode;
        this.deptCode=query.deptCode;
        this.unionId=query.unionId;
        this.state = {
            loading: true,
            data:''
        };
    }
    componentDidMount() {
        UserCenter.getDoctorInfoAndDept(this.corpId, this.doctCode, this.deptCode, this.unionId).subscribe({
            onSuccess: (result) => {
                let data = result.data;
                this.setState({
                    data:data.doctInfo,
                    loading:false,
                    success:true
                })
            },
            onError:(result)=>{
                console.log(result.msg)
            }
        }).fetch()
    }
    render() {
        let {data}=this.state;
        let img = data.doctPictureUrl ? data.doctPictureUrl : (data.sex == '女' ? ' https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/31a98050e46593f5313c3b120edf4817-174-174.png' :'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/782a09ba8a4a4de1bacda8f00f5a9522-174-174.png')
        return (
            <div className="family-doctor">
                <div className="panel g-space">
                    <div className="list-item">
                        <div className="list-icon" style={{background:`url(${img}) no-repeat center/cover`}}></div>
                        <div className="list-content">
                            <div className="list-title">{data.doctName}</div>
                            <div className="list-brief ">{data.corpName}</div>
                        </div>
                    </div>
                </div>
                <div className="panel g-space">
                    <div className="panel-title">家庭医生简介</div>
                    <div className="panel-title panel-con">
                        {data.doctIntro ? data.doctIntro:'暂无'}
                    </div>
                </div>
                <div className="panel g-space">
                    <div className="panel-title">擅长方向</div>
                    <div className="panel-title panel-con">{data.doctSpec ? data.doctSpec :'暂无'}</div>
                </div>
            </div>
        );
    }
}