import PullUpRefresh from '../PullUpRefresh/PullUpRefresh'
import React, {
    PropTypes
} from 'react';
import util from '../../lib/util'
import { SmartBlockComponent, SmartNoBlockComponent } from '../../BaseComponent/index'
import Aolsee from '../../module/Aolsee'
import Alert from '../../component/alert/alert'

export default class Comment extends SmartBlockComponent {

    static propTypes = {
        newsID: PropTypes.string,
        unionId:PropTypes.string
    };
    constructor(props) {
        super(props);
        const query = util.query();
        this.state = {
            ...this.state,
            loading: false,
            success: true,
            currentPage:1,
            isNoData: false,
            comment:[],
            newsID: this.props.newsID,
            unionId:this.props.unionId
        };
    }
    onNextPage({ pageSize, currentPage, packingLoadCtx }) {
        let {newsID,unionId}=this.state;
        Aolsee.getPageComment(
            currentPage,
            newsID, 
            pageSize,
            packingLoadCtx,
            unionId
        )
        .subscribe(packingLoadCtx(this))
        .start()
    }
    onComplete(result,{onFinished}) {
        if (result.resultCode == 202) {
            util.goLogin()
        }
        const { records } = result.data
        const { comment } = this.state
            , commentList = comment.concat(records)
        if (result.success) {
            this.setState({
                loading: false
                , success: true
                , currentPage: this.state.currentPage + 1
                , comment: commentList
            })
        }
        if (result.data.totalRecordNum == commentList.length) {
            onFinished();
            if (result.data.totalRecordNum == 0) {
                this.setState({
                    isNoData: true
                })
            }
        }
    }

    renderNullData() {
        return <div className="notice">
            <span className="notice-icon icon-mail" style={{ backgroundImage: 'url(https://front-images.oss-cn-hangzhou.aliyuncs.com/i4/4f6ad6ed5bc792680bb4667506e33232-30-28.png)' }}>
            </span>
            <p>暂无相关评价</p>
        </div>
    }
    renderHeader() {
        return <div></div>
    }
    renderBody() {
        const { comment } = this.state

        return <div>
            {
                comment.map((item, index) => {
                    return <div className="listview-item listview-item-middel" key={index}>
                        <div className="listview-icon icon-hui-medical" style={{ 'background': `url(${item.logoImg}) no-repeat center/cover`, 'borderRadius': '50%' }}></div>
                        <div className="listview-content" >
                            <div className="listview-title txt-insign">{item.userNick}</div>
                            <div className="listview-brief ">{item.createTime}</div>
                            <div className="listview-msg ">{item.comment}</div>
                        </div>
                    </div>
                })
            }
        </div>
    }
    render(){
        let { currentPage, isNoData,comment}=this.state;
        return(
            <PullUpRefresh className = "show-evaluate"
                        initPageSize = { 10}
                        currentPage = { currentPage }
                        onNextPage = {(e) => this.onNextPage(e)}
                        finishedHtml = { isNoData? this.renderNullData() : null}
                        >
                {this.renderHeader()}
                {this.renderBody()}
            </PullUpRefresh>
        )
    }
    
}