import React from 'react';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import UserCenter from './module/UserCenter';
import Ajax from './lib/Ajax';
import util from './lib/util';
import './service-pack.less';

export default class ServicePack extends SmartBlockComponent {

    constructor(props) {
        super(props);
        const query = util.query();
        this.id=query.id;
        this.state = {
            loading: true,
            data:{}
        };
    }
    componentWillMount() {
        UserCenter.getSeverPack({
            id:this.id
        },(res)=>{
            this.setState({
                data:res.data,
                loading:false,
                success:true
            })
        })
    }
    render() {
        let { data} = this.state
        return (
            <div className="service-pack">
                <div className="service-image"><img src='https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/2a743823d3bf2fca4d8060869c937f55-1125-330.png'/></div>
                <div className="panel g-space">
                    <div className="panel-title">服务项目</div>
                    <div className="panel-title panel-con">{data.content}</div>
                </div>
            </div>
        );
    }
}