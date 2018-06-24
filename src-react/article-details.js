'use strict'

import React from 'react'
import util from './lib/util'
import { SmartBlockComponent, SmartNoBlockComponent } from './BaseComponent/index'
import UserCenter from './module/UserCenter'
import Aolsee from './module/Aolsee'
import hybridAPI from './lib/hybridAPI'
import Alert from './component/alert/alert'
import Comment from './component/comment/Comment'

import './article-details.less'

export default class ArticleDetails extends SmartBlockComponent {
    constructor(props) {
        super(props);
        let query = util.query();
        this.unionId = query.unionId || '';
        this.flag=query.flag||'';
        this.state = {
            loading:true,
            success:false,
            unionId: query.unionId,
            id: query.id,
            isInYuantuApp: util.isInYuantuApp(),
            doctWraperFixed: false,
            commentCount:0,
            currentPage:1,
            comment:[],
            star:false,
            flagShow:true,
            doctLogo:'',
            height: window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight
        }
    }

    componentDidMount() {
        if (this.flag && util.isInYuantuApp()) {
            hybridAPI.popToTimeViewController(false, 3, false)
        }
        this.getAllData()   
    }
    getAllData(){
        Aolsee.getNewsDetail(this.state.unionId, this.state.id)
            .subscribe(this)
            .fetch()
        this.initWindowScroll()
    }
    onSuccess(result) {
        this.initData(result);
    }
    onError() {
    }
    initData(result) {
        this.setState({
            loading: false,
            success: true,
            title: result.data.title,
            time: result.data.publishTime,
            category: result.data.classifyName,
            doct: result.data.doct || null,
            doctLogo: result.data.doct?result.data.doct.doctLogo: '',
            content: result.data.content || "",
            publisherLogo: result.data.publisher.publisherLogo || '',
            star: result.data.star,
            commentCount: result.data.commentCount,
            publisher: result.data.publisher||null,
            starCount: result.data.starCount
        })
        const titleDom = document.getElementsByTagName("title")[0];
        titleDom.innerText = result.data.title || "资讯详情";

        if (util.isInYuantuApp()) {
            hybridAPI.setTitle(result.data.title);
        }

        let title = result.data.title,
            text = result.data.summary,
            url = window.location.href,
            imageUrl = "https://image.yuantutech.com/user/0c306d9a190c1bcde2d8f9ad31e29810-300-300.jpg",
            isShowButton = true,
            isCallShare = false

        if ((result.success || result.success === "true") && util.isInYuantuApp()) {
            hybridAPI.share(title, text, url, imageUrl, isShowButton, isCallShare)
        }
    }


    initWindowScroll() {
        window.addEventListener("scroll", (e) => {
            let elementScrollTop = 0
            let doctWraperOffsetTop = this.refs.content.offsetHeight + this.refs.recommend?this.refs.recommend.offsetHeight:0 + 20;
            elementScrollTop = document.body.scrollTop||document.documentElement.scrollTop
            if (!doctWraperOffsetTop) return
            const { doctWraperFixed } = this.state
            if (elementScrollTop > doctWraperOffsetTop && !doctWraperFixed ) {
                this.setState({
                    doctWraperFixed: true,
                })
            } else if (elementScrollTop < doctWraperOffsetTop && doctWraperFixed) {
                this.setState({
                    doctWraperFixed: false,
                })
            }

        }) 
    }
    
    render() {
        let { title, time, category, content, isInYuantuApp, protocol, H5_DOMAIN,  doct, doctWraperFixed, commentCount, star, height, flagShow, publisher, doctLogo, publisherLogo, comment,starCount} = this.state;
        let img = doctLogo ? doctLogo : 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/90e5757435f5c21c4cfc9d3483b7132a-174-174.png';
        let photo = publisherLogo ? "https://yuantu-hz-img.oss-cn-hangzhou.aliyuncs.com/" + publisherLogo : 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/90e5757435f5c21c4cfc9d3483b7132a-174-174.png'
        let isStar = star ? 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/4f90a9df2e67af9cd9b8c1f2a09aa349-42-44.png' : 'https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/563b283748361f88705eb0e0612ac11e-44-44.png'
        return (
            <div className='article-details'>
                <div className="page">
                <div className="page-news-detail" id="J_NewsList" style={{marginBottom:10}} ref="content">
                    <h1 id="J_Title" dangerouslySetInnerHTML={{ __html: title }}></h1>
                    <div className="doct-info">
                        <div className="doct-img" style={{ 'background': `url(${photo}) no-repeat center/cover`}} onClick={()=>{
                            if (isInYuantuApp) {
                                window.location.href=`yuantuhuiyi://huiyi.app/singlePublisher?publisherId=${publisher.publisherId}&publisherType=${publisher.publisherType}`;
                            }
                        }}></div>
                        <div className="doct-box">
                            <div className="doct-name">{publisher.publisherName}
                            </div>
                            <div className="doct-time">{time}</div>
                        </div>
                    </div>
                    <div id="J_Content" className="content" dangerouslySetInnerHTML={{ __html: content }} style={{paddingTop:0,paddingBottom:0}}>
                    </div>
                </div>
                {doct?<div className="recommend-doct" ref="recommend">
                    <div className="recommend-title">
                        <div className="recommed-line"></div>
                        <div className="recommed-font">相关专家推荐</div>
                        <div className="recommed-line"></div>
                    </div>
                    <div className="recommend-list">
                        <div className="recommend-detail" onClick={()=>{
                            window.location.replace(`doctor.html?corpName=${doct.corpName}&unionId=${this.unionId}&doctName=${doct.doctName}&corpId=${doct.corpId}&doctCode=${doct.doctCode}&deptCode=${doct.doctCode}&regMode=1&target=_blank`)
                        }}>
                            <div className="recommend-img" style={{ 'background': `url(${img}) no-repeat center/cover`}}></div>
                            <span className='recommend-doctname'>{doct.doctName}</span>
                            <span className="recommend-doctprofe">{doct.doctProfe}</span>
                        </div>
                    </div>
                </div>:null}
                <div ref="doctWraper" className="listview listview-comment" style={{minHeight:height}}>
                    <div className="panel-title comment-hot">热门评论</div>
                    <Comment newsID={this.state.id}></Comment>
                </div>
            </div>
            <div className="comment-input">
                <div className="comment-text">
                    <div className="comment-edit" style={{ "background": "url(https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/28d88ecd5525f72b8c319a80d86672d6-26-28.png) no-repeat center/cover" }}></div>
                    <div className="fill-input" onClick={() => {
                        if (util.isLogin()) {
                            window.location.href="./fill-comments.html?id=" + this.state.id + "&unionId=" + this.unionId + "&target=_blank"
                        } else {
                            util.goLogin()
                            return
                        }
                        }}>写评论</div>
                </div>
                <div className="comment-logo" style={{ "background": "url(https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/5eeb014b7f025cf1b17fdd55f76ec7e1-44-44.png) no-repeat center/cover" }} onClick={() => {
                    if (commentCount) {
                        document.body.scrollTop = this.refs.doctWraper.offsetTop
                        document.documentElement.scrollTop = this.refs.doctWraper.offsetTop
                    } else {
                        if (util.isLogin()) {
                            window.location.href="./fill-comments.html?id="+this.state.id+"&unionId="+this.unionId+"&target=_blank"
                        } else {
                            util.goLogin()
                            return
                        }

                    }
                }}>
                    {commentCount ? <div className="comment-number">{commentCount}</div> : null}
                </div>
                <div className="comment-good" style={{ "background": `url(${isStar}) no-repeat center/cover` }} onClick={() => {
                    if (util.isLogin()) {
                        if (star) {
                            Aolsee.getUnstar({
                                newsID: this.state.id,
                                unionId: this.unionId
                            }, (res) => {
                                this.setState({
                                    starCount:starCount-1
                                })
                            })
                        } else {
                            Aolsee.getStar({
                                newsID: this.state.id,
                                unionId: this.unionId
                            }, (res) => {
                                this.setState({
                                    starCount: starCount + 1
                                })
                            })
                        }
                        this.setState({
                            star: !star
                        })
                    } else {
                        util.goLogin();
                        return
                    }
                }}>
                {starCount ? <div className="star-number">{starCount}</div> : null}
                </div>
            </div>}
        </div>) 
    }
}