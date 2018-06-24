import React from 'react';
import './feedback-issue.less';
import Ticket from './module/Ticket';
import util from './lib/util';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';
import {markdown} from 'markdown';

export default class FeedBackIssue extends SmartBlockComponent {

  constructor(props) {
    super(props);
    const query = util.query();
    this.unionId = query.unionId || '';
    this.issueId = query.issueId || '';
    this.feedbackType = query.feedbackType || '';

    this.state = {
      loading: false,
      title: null,
      main: null
    }
  }

  componentDidMount() {
    Ticket.getIssueDetail(this.issueId, this.unionId).subscribe(this).fetch();
  }

  onSuccess(result) {
    this.setState({
      title: result.data.issueName,
      main: result.data.issueAnswer && decodeURIComponent(result.data.issueAnswer),
      loading: false,
      success: true,
    });
  }

  render() {
    const {title, main} = this.state;
    return (
      <div>
        <h1 className="feedback-issue-title">{title}</h1>
        <p className="feedback-issue-type">问题分类: {this.feedbackType}</p>
        <p
          className="feedback-issue-container"
          dangerouslySetInnerHTML={{__html: markdown.toHTML(main)}}
        />
      </div>
    );
  }
}
