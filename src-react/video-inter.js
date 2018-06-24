import React from 'react';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import { SmartBlockComponent } from './BaseComponent/index'
import './waiting-queue.less';
import cache from './lib/cache'
import BlockLoading from './component/loading/BlockLoading';
import './video-inter.less'
import JSBridge from './lib/JSBridge'
import LazyLoad from 'react-lazyload';

export default class WaitingQueue extends SmartBlockComponent {
    constructor(props) {
        super(props);
        let date = new Date();
        let tom = new Date(date.setDate(date.getDate()+1))
        let today = tom.getFullYear()+'-'+((tom.getMonth()+1)>10?(tom.getMonth()+1):'0'+(tom.getMonth()+1))+'-'+(tom.getDate()>10?tom.getDate():'0'+tom.getDate())
        ,toDate = (tom.getMonth()+1)+'月'+tom.getDate()+'日'
        const query = util.query();
        this.corpId=query.corpId;
        this.unionId=query.unionId;
        this.state = {
            //success为true时才会render渲染页面
            loading: true,
            corpName:'',
            data:[],
            deptCode:'',
            deptName:'',
            toDate:toDate,
            today:today,
            isActive:'video-sel-item',
            isAction:'video-sel-item',
            imgQueue:'//front-images.oss-cn-hangzhou.aliyuncs.com/i4/f63ce7e043f133f2cdbdfb022d989626-24-15.png',
            imgTime:'//front-images.oss-cn-hangzhou.aliyuncs.com/i4/f63ce7e043f133f2cdbdfb022d989626-24-15.png'
        }
    }
    componentWillMount() {
        cache.remove('patientId');
        cache.remove('patientName')
        JSBridge.on("0", (result) => {
            if (result && result.ret == "SUCCESS") {
                var data = result.data ? JSON.parse(result.data) : null;
                this.setState({
                    deptCode:data.deptCode,
                    deptName:data.deptName,
                    loading:true
                })
                this.ListViedoDoctor(data.deptCode)
            }
        });
    }
    componentDidMount(){
        let { deptCode} = this.state;
        this.ListViedoDoctor(deptCode)
        this.getMultiDeptsList2()
    }
    getMultiDeptsList2(){
        let regMode = 1,regType = 6;
        UserCenter.getMultiDeptsList2(this.corpId, regMode, regType, this.unionId).subscribe({
            onSuccess:(result)=>{
                this.setState({
                    corpName:result.data.corp.corpName
                })
            }
        }).fetch()
    }
    ListViedoDoctor(deptCode){
        let regMode = 1;
        let date = new Date();
        let todate = new Date(date.setDate(date.getDate() + 1));
        let startDate = todate.getFullYear() + '-' + ((todate.getMonth() + 1) > 10 ? (todate.getMonth() + 1) : '0' + (todate.getMonth() + 1)) + '-' + (todate.getDate() > 10 ? todate.getDate() : '0' + todate.getDate())
        let todate1 = new Date(date.setDate(date.getDate() + 7));
        let endDate = todate1.getFullYear() + '-' + ((todate1.getMonth() + 1) > 10 ? (todate1.getMonth() + 1) : '0' + (todate1.getMonth() + 1)) + '-' + (todate1.getDate() > 10 ? todate1.getDate() : '0' + todate1.getDate());
        let regType=6;
        UserCenter.ListViedoDoctor(this.corpId, deptCode, endDate, regMode, startDate, regType).subscribe({
            onSuccess:(result)=>{
                let data = result.data;
                this.setState({
                    data:data,
                    success: true,
                    loading:false
                })
            },
            Error:(result)=>{
                console.log(result)
            }
        }).fetch();
    }
    changeCheck(check){
        let { deptCode,deptName}=this.state;
        window.location.href='video-select.html?check=' + check + '&corpId=' + this.corpId + '&unionId=' + this.unionId + '&deptCode=' + deptCode + '&deptName=' + deptName  + '&referrer=' + `${encodeURIComponent(location.href)}` + '&target=_blank'
    }
    renderDocList(){
        let { data, corpName} = this.state;
        let doctorList =data&&data.map((item,key)=>{
            let href = 'doctor.html?corpId=' + this.corpId + '&corpName=' + corpName + '&unionId=' + this.unionId + '&regMode=' + item.regMode + '&deptCode=' + item.deptCode + '&doctCode=' + item.doctCode + '&regType=' + item.regType + '&scheduleId=' + item.scheduleId + '&regAmount=' + item.regAmount + '&doctName=' + item.doctName +'&flag=1'+ '&target=_blank';
            let sex = sex=='女'? '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/1548000c66fb7b77ac0194c92e221896-174-174.png'
                        :'//front-images.oss-cn-hangzhou.aliyuncs.com/i4/346a41bf7071900fff627fdde26410c1-174-174.png'
            return <li className="list-item list-item-pos " key={key}>
                    <a className="txt-arrowlink list-link-wrapper" href={href}>
                        <LazyLoad offset={100} once={true}>
                            <div style={{background:`url(${item.doctPictureUrl?item.doctPictureUrl:sex}) no-repeat center/cover`}} className="list-icon-sex"></div>
                        </LazyLoad>
                        <div className="list-content " >
                            <div className="list-title list-queue">{item.doctName}<span className="list-queue-name">{item.doctTech}</span></div>
                            <div className="list-small-name">{item.deptName}</div>
                        </div>
                    </a>
                    {item.restnum==0?<div className="list-item-more">
                            已满
                        </div> : <div className="list-item-abs">
                        可预约
                        </div>
                    }
                    
                </li>
        })
        return data.length>0?<ul className="list-ord video-queue-item">       
                 {doctorList}       
            </ul>:<div className="video-queue-empty">
                <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/465d10359a91a2bdf5ff09530447a100-180-180.png" />
                <p className="video-queue-txt">暂无可选医生</p>
            </div>
    } 
    render() {
        let {isAction,isActive,imgTime,imgQueue,corpName,deptCode,deptName} = this.state;
        return (
           <div className="video-inbox">
                <div className="video-content">
                    <div className="video-tip">
                        <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/a6c8435593d27501bd67382494af0387-782-189.png"/>
                    </div>
                    <div className="video-sel">
                        <div className={isActive} onClick={this.changeCheck.bind(this, 'queue')}>{deptName ? deptName :'全部科室'}<span className="video-sel-img"><img src={imgQueue} /></span></div>
                    </div>
                    {this.renderDocList()}
                </div>
                
           </div>
        )
    }
    
}

