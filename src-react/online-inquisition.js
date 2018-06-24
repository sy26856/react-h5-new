import React from 'react';
import UserCenter from './module/UserCenter';
import util from './lib/util';
import { SmartBlockComponent } from './BaseComponent/index'
import './waiting-queue.less';
import cache from './lib/cache'
import BlockLoading from './component/loading/BlockLoading';
import Alert from './component/alert/alert';
import './online-inquisition.less'
import JSBridge from './lib/JSBridge'

export default class WaitingQueue extends SmartBlockComponent {
    constructor(props) {
        super(props);
        const query = util.query();
        this.corpId = query.corpId;
        this.unionId = query.unionId;
        this.state = {
            loading: true,
            corpName: '',
            data: [],
        }
    }
    componentWillMount() {
        UserCenter.getListInquiryDoct(this.corpId,"" ,'', '', 1, "", this.unionId).subscribe({
            onSuccess:(result)=>{
                this.setState({
                    loading:false,
                    success:true,
                    data:result.data.records
                })
            },
            onError:(result)=>{
                Alert.show(result.msg)
            }
        }).fetch()
        
    } 
    ListInquiryByCode(item){
        UserCenter.getDoctConsultationRecord(1, this.corpId, item.deptCode, item.doctCode, 1).subscribe({
            onSuccess: (result) => {
                 if (result.data.length > 0) {
                    window.location.href = "./chat-details.html?doctName=" + item.doctName + "&rcDoctId=" + item.rcDoctId + "&doctCode=" + item.doctCode + "&deptCode=" + item.deptCode + "&corpName=" + item.corpName + "&regMode=" + (item.regMode ? item.regMode : 1) + "&docLogo=" + item.doctPictureUrl + "&doctSex=" + item.doctorSex + "&patient_sex=" + (item.patientSex == "女" ? 2 : 1) + "&isFinished=false"+  "&unionId=" + this.unionId + "&corpId=" + this.corpId+"&target=_blank"
                }else{
                    window.location.href = "./patient-audio.html?isGraphic=true&doctName=" + item.doctName + "&doctCode=" + item.doctCode + "&deptCode=" + item.deptCode + "&corpName=" + item.corpName + "&regMode=" + (item.regMode ? item.regMode:1) + "&docLogo=" + item.doctPictureUrl  + "&unionId=" + this.unionId + "&corpId=" + this.corpId+"&target=_blank"
                }
            },
            onError: (result) => {
                Alert.show(result.msg)
            }
        }).fetch()
    }
    renderDocList() {
        let { data, corpName, inquireData } = this.state;
        let doctorList = data && data.map((item, key) => {
            let href = 'doctor.html?corpId=' + this.corpId + '&corpName=' + corpName + '&unionId=' + this.unionId + '&regMode=' + (item.regMode ? item.regMode:1) + '&deptCode=' + item.deptCode + '&doctCode=' + item.doctCode + '&regType=' + item.regType + '&scheduleId=' + item.scheduleId + '&regAmount=' + item.regAmount + '&doctName=' + item.doctName + '&flag=1' + '&target=_blank';
            let sex = sex == '女' ? '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/1548000c66fb7b77ac0194c92e221896-174-174.png': '//front-images.oss-cn-hangzhou.aliyuncs.com/i4/346a41bf7071900fff627fdde26410c1-174-174.png'
            let inquireHref;
            return <li className="list-item list-item-pos  list-item-middel" key={key} onClick={()=>this.ListInquiryByCode(item)}>
                <a className="txt-arrowlink list-link-wrapper" >
                    <div style={{ background: `url(${item.doctPictureUrl ? item.doctPictureUrl : sex}) no-repeat center/cover` }} className="list-icon-sex" onClick={()=>{
                        window.location.href=href
                    }}></div>
                    <div className="list-content " >
                        <div className="list-title list-queue">{item.doctName}<span className="list-queue-name">{item.doctProfe}</span></div>
                        <div className="list-small-name">{item.deptName}</div>
                        <div className="list-small-name list-font">{item.corpName}</div>
                    </div>
                    <div className="list-extra">在线问诊</div>
                </a>
            </li>
        })
        return data.length > 0 ? <ul className="list-ord video-queue-item">
            {doctorList}
        </ul> : <div className="video-queue-empty">
                <img src="https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/465d10359a91a2bdf5ff09530447a100-180-180.png" />
                <p className="video-queue-txt">暂无可选医生</p>
            </div>
    } 
    render() {
        return (
            <div className="online-inquisition">
                {this.renderDocList()}
            </div>
        )
    }

}

