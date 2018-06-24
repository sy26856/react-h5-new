import React from 'react';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import { SmartBlockComponent } from './BaseComponent/index'
import './waiting-queue.less';
import BlockLoading from './component/loading/BlockLoading';

export default class WaitingQueue extends SmartBlockComponent {
    constructor(props) {
        super(props);
        const query = util.query();
        this.corpId = query.corpId;
        this.unionId = query.unionId;
        this.appointLogId = query.appointLogId;
        this.state = {
            //success为true时才会render渲染页面
            loading: true,
        }
    }
    componentWillMount() {
        this.getWaitQueueInfo()
    }
    getWaitQueueInfo(){
        let inquiryType=2;
        UserCenter.getWaitQueueInfo(this.appointLogId,inquiryType).subscribe({
            onSuccess:(result)=>{
                this.setState({
                    success:true,
                    loading:false,
                    data:result.data
                })
            }
        }).fetch()
    }
    renderStatus(){
        let {data} = this.state;
        let month = util.dateFormat(data.medDate,'M');
        let day = util.dateFormat(data.medDate,'d')
        let dayAmDm = {
            '1':'上午',
            '2':'下午'
        }
        let patientStatus = {
            '1':{
                title:'排队中'
            },
            '2':{
                title:'正在叫号'
            },
            '3':{
                title:'已过号'
            },
            '4':{
                title:'已过号'
            },
            '5':{
                title:'叫号结束'
            },
            '6':{
                title:'完成'
            },
            '7':{
                title:'已过号'
            },
            '8':{
                title:'未开始'
            }
        }
        return <ul className="list-ord">
        <li className="list-item  list-item-noborder">
            <div className="list-brief-title">就诊日期</div>
            <div className="list-content txt-nowrap">{month}月{day}日 {dayAmDm[data.medAmPm]}</div>
        </li>
        <li className="list-item  list-item-noborder">
            <div className="list-brief-title">排队序号</div>
            <div className="list-content txt-nowrap">{data.orderNo}号</div>
        </li>
        <li className="list-item  list-item-noborder">
            <div className="list-brief-title">前面等待</div>
            <div className="list-content txt-nowrap">{data.waitNum}人</div>
        </li>
        <li className="list-item  list-item-noborder">
            <div className="list-brief-title">排队状态</div>
                <div className="list-content txt-nowrap">{patientStatus[data.queueStatus].title} {patientStatus[data.queueStatus].title=='排队中'?<span className='red'>*（预计等待{data.estimateMinute}分钟)*</span>:null}</div>
        </li>
    </ul>
    }
    render() {
        let {data} = this.state
        return (
           <div className="waiting-queue">
                <div className="panel g-space">
                    <div className="list-item list-item-border">
                        <div className="list-photo" style={{ background:`url(${data.doctLogo||'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/346a41bf7071900fff627fdde26410c1-174-174.png'}) no-repeat center/cover`}}>
                        </div>
                        <div className="list-info">
                            <div className="list-info-top">
                            <span className="list-info-name">{data.doctName}</span>
                            <span className="list-info-grade">{data.doctTech}</span></div>
                            <div className="list-info-mid">{data.deptName}</div>
                            <div className="list-info-bottom">{data.corpName}</div>
                        </div>
                    </div>
                    {this.renderStatus()}
                </div>
           </div>
        )
    }
    
}

