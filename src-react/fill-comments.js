'use strict'

import React from 'react'
import util from './lib/util'
import { SmartBlockComponent, SmartNoBlockComponent } from './BaseComponent/index'
import UserCenter from './module/UserCenter'
import Aolsee from './module/Aolsee'
import hybridAPI from './lib/hybridAPI'
import Alert from './component/alert/alert'
import Comment from './component/comment/Comment'

import './fill-comments.less'

export default class ArticleDetails extends SmartBlockComponent {
    constructor(props) {
        super(props);
        let query = util.query();
        this.id=query.id;
        this.unionId=query.unionId;
        this.state = {
            loading: true,
            success: false,
        }
    }

    componentDidMount() {
        this.setState({
            loading: false,
            success: true,
        })
    }
    submit(){
        if (this.refs.comment.value == '') {
            Alert.show('未填写评论')
            return
        } else {
            Aolsee.addComments({
                newsID: this.id,
                comment: this.refs.comment.value,
                unionId: this.unionId
            }, (res) => {
                this.setState({
                    loading:true
                })
                window.location.replace("./article-details.html?id="+this.id+"&unionId="+this.unionId+"&flag=1&target=_blank")
            })
        }
    }

    render() {
        return (
            <div className="fill-comments">
                <div className="comments-box">
                    <textarea className="comments" ref="comment" placeholder="请输入评论..."></textarea>
                    <button className="submit-btn" onClick={this.submit.bind(this)}>发布</button>
                </div>
            </div>)
    }
}