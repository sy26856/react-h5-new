import React from 'react';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import UserCenter from './module/UserCenter';
import Alert from './component/alert/alert';
import util from './lib/util';
import './my-doctors.less';
import JSBridge from './lib/JSBridge'
import cache from './lib/cache'

export default class MyDoctors extends SmartBlockComponent {
    constructor(props) {
        super(props);
        const query = util.query();
        this.unionId=query.unionId;
        this.state = {
            loading: true,
            index: query.index || (cache.get('index')||0),
            data:[]
        }
    }
    componentWillMount(){
        JSBridge.on("0", (result) => {
            if (result && result.ret == "SUCCESS") {
                var data = result.data ? JSON.parse(result.data) : null;
                cache.set('index',data.index)
                this.setState({
                    index: data.index
                })
            }
        });
        UserCenter.getSignInfoByLoginUser().subscribe({
            onSuccess:(result)=>{
                let data=result.data;
                this.setState({
                    data:data,
                    loading:false,
                    success:true
                })
            },
            onError:(err)=>{
                this.setState({
                    loading:false,
                    success:true
                })
            }
        }).fetch()
        
    }
    render() {
        let { data }=this.state;
        let status={
            '0':'未签约',
            '1':'已签约',
            '2':'已过期'
        }
    return(
        data.length?
            <div className="my-doctor">
            {data.map((item,index)=>{
                let img = item.doctLogo ? item.doctLogo : (item.sex == '女' ? ' https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/31a98050e46593f5313c3b120edf4817-174-174.png' : 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/782a09ba8a4a4de1bacda8f00f5a9522-174-174.png')
                if (index==this.state.index)
                {
                return(
                <div className="my-doctor" key={index}>
                    <ul className="list-ord">
                        <li className="list-item list-item-middel " onClick={()=>{
                            window.location.href='family-patient.html?unionId='+this.unionId+"&target=_blank"
                        }}>
                            <a className="txt-arrowlink list-link-wrapper" >
                                <div className="list-content" >选择就诊人</div>
                                <div className="list-extra" >{item.name}</div>
                            </a>
                        </li>
                    </ul>
                    <ul className="list-ord">
                        <li className="list-item list-item-middel" onClick={()=>{
                                window.location.href = 'family-doctors.html?corpId=' + item.corpId + '&deptCode=' + item.deptCode + '&doctCode=' + item.doctCode + '&unionId=' + this.unionId+"&target=_blank"
                        }}>
                            <a className="txt-arrowlink list-link-wrapper" >
                                <div className="list-content" >
                                        <div className="list-img" style={{ background:`url(https://paiban-img.oss-cn-hangzhou.aliyuncs.com/${img}) no-repeat center/cover`}}></div>
                                    <div className="list-title txt-nowrap">{item.doctName} <span className='doct-job'>{item.doctProfe}</span></div>
                                    <div className="list-brief">{item.corpName}</div>
                                </div>
                            </a>
                        </li>
                    </ul>
                    {item.signServiceBundleVOs.map((itm,ind)=>{
                    return <ul className="list-ord" key={ind}>
                        <li className="list-item  " onClick={() => {
                            window.location.href = 'service-pack.html?id=' + itm.id + '&target=_blank'
                        }}>
                            <a className="txt-arrowlink list-link-wrapper">
                                <div className="list-brief-title">签 约 项 目</div>
                                <div className="list-content ">{itm.title}</div>
                                <div className="list-right" >详情</div>
                            </a>
                        </li>
                        <li className="list-item  ">
                            <div className="list-brief-title">签 约 状 态</div>
                            <div className="list-content txt-nowrap">{status[itm.signStatus]}</div>
                        </li>
                        <li className="list-item  ">
                            <div className="list-brief-title">签 约 时 间</div>
                            <div className="list-content txt-nowrap">{util.dateFormat(itm.signTime, 'yyyy年MM月dd日')}</div>
                        </li>
                    </ul>
                    })}
                    <div className="bottom-btn">
                        <div className='bottom-left' onClick={()=>{
                            window.location = './create-consultation.html?' + util.flat({
                                doctCode:item.doctCode
                                , doctName: item.doctName
                                , deptCode: item.deptCode
                                , corpId: item.corpId
                                , unionId:this.unionId
                                , target: '_blank'
                            })
                        }}>在线问医生</div>
                        <div className='bottom-right' onClick={()=>{
                                Alert.show('暂不支持查询')
                                return;
                        }}>咨询记录</div>
                    </div>
                </div>)
                }
                })}
            </div>
           : <div className='no-doctor'>
                <div className='doc-list'>
                    <div className='list-img'>
                        <img src='https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/137b702a26d611b3dd1f2aa9749fda71-180-180.png'/>
                    </div>
                    <div className='font-none'>暂未找到已签约家庭医生的就诊人</div>
                    <div className='btn-box' onClick={()=>{
                        UserCenter.getPatientList(this.corpId, this.unionId, this.patientType).subscribe({
                            onSuccess: (result) => {
                                let data = result.data;
                                if (data.length == 5) {
                                    Alert.show('你已有五个就诊人')
                                    return;
                                } else {
                                    window.location.href = 'add-patient-29.html?target=_blank&unionId=' + this.unionId
                                }
                            },
                            onError: (err) => {
                                console.log(err.msg)
                            }
                        }).fetch()
                    }
                       }>手动添加</div>
                </div>
            </div>  
        )
    }
}