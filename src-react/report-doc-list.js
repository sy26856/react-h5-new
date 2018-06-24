import React from 'react'
import util from './lib/util'
import LazyLoad from 'react-lazyload'
import './report-doc-list.less'   
import Alert from './component/alert/alert'
import SmartBlockComponent from './BaseComponent/SmartBlockComponent'
import UserCenter from './module/UserCenter'
export default class ReportDocList extends SmartBlockComponent{
    constructor(props){
        super(props)

        const query=util.query()
        this.unionId=query.unionId
        
        this.inquiryType=3//患者向医生报到服务
        this.defaultLogo = 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/d192eea2ee86e15b3016d0df4b8a999a-174-174.png';
        this.state = {
            success:true,
            loading:true,
            list:[]
        }
        
        if(!util.isLogin()){
            util.goLogin()
        }

    }

    componentDidMount(){
        this.getList()
    }

    //报到医生列表
    getList(){
    
        UserCenter.getReportDocList(this.inquiryType)
        .subscribe({
            onSuccess:(result)=>{
                if(result.success){
                    this.setState({
                        list:result.data,
                        loading:false
                    })
                }
              },
              onError:(result)=>{
               Alert.show(result.msg)
              }
        })
        .fetch()
    }

    //点击跳转
    click(item){
        if(item.registerStatus==1){
            //未完成,跳转信息填写页面
            window.location.href=util.flatStr('./fill-info.html?',{
                unionId:this.unionId,
                corpId:item.corpId,
                doctCode:item.doctCode,
                rcDoctId:item.rcDoctId,
                deptCode:item.deptCode,
                docLogo:item.doctPictureUrl,
                doctName:item.doctName,
                target:'_blank',
                patientName:item.patientName,
                date:item.submitDate,
                illnessDesc: item.illnessDesc,
            })
        }else if(item.registerStatus==2){//已报到
            UserCenter.hasOrderOn(item.rcDoctId,item.userId)
            .subscribe({
                onSuccess:result=>{
                    location.href=util.flatStr('./chat-details.html?',{
                        unionId:this.unionId,
                        corpId:item.corpId,
                        doctCode:item.doctCode,
                        rcDoctId:item.rcDoctId,
                        deptCode:item.deptCode,
                        docLogo:item.doctPictureUrl,
                        doctName:item.doctName,
                        target:'_blank',
                        // 1 可继续聊天 2结束
                        isFinished:result.data.hasOrderOn?1:2,
                        serverType:2
                    })
                },
                onError:result=>{
                    Alert.show(result.msg)
                }
            })
            .fetch()
        }
    }
    
    render(){
        let {list}=this.state
        return(
            <div className='report-doc-list'> 
                {
                    list.length>0?
                        list.map((item,key)=>{
                            return  <div className="panel g-space" key={key} onClick={()=>this.click(item)}>
                                        <li className="list-item">
                                            <LazyLoad offset={100} once={true}>
                                            <span className="icon-pic list-icon-lg" 
                                                    style={{ "background": `url(${item.doctPictureUrl?item.doctPictureUrl:this.defaultLogo}) no-repeat center/cover`,borderRadius:'50%' }}/>
                                            </LazyLoad>
                                            <div className="list-content">
                                                <div className="list-title">{item.doctName} {item.doctProfe} <span className='rates_doc' style={{marginLeft:'10px'}}>{item.rates}</span><span className='list-status'> {item.registerStatus==1?'报到未完成':item.registerStatus==2?'已报到':null}</span></div>
                                                <div className="list-title list-con">{item.doctName} {item.deptName}</div>
                                            </div>
                                        </li>    
                                            <div className="list-bottom">
                                                <div className='list-left'>就诊人：{item.patientName}</div>
                                                <div className="list-right">{util.dateFormat(item.submitDate,'MM-dd hh:mm')}</div>
                                            </div>
                                    </div>    
                        })
                        :
                    <div className="notice">
                    <span className="notice-icon icon-record"></span>
                    <p>没有查询到报到记录</p>
                    </div>
                }
                    
            </div>
        )
    }
}