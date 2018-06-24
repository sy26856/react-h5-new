import React from 'react';
import UserCenter from './module/UserCenter';
import Aolsee from './module/Aolsee';
import util from './lib/util';
import './news.less';
import SmartBlockComponent from './BaseComponent/SmartBlockComponent';

export default class News extends SmartBlockComponent {

  constructor(props) {
    super(props);
    this.state = {
      topList: null,
      loading: true,
      success: false
    };

    this.isLoading = false;

    const query = util.query();
    this.unionId = query.unionId;
    this.timer = null;
    this.currentPage = 1;
    this.totalPage = 1;
  }

  async componentDidMount() {
    this.setState({
      loading: true
    })
    try {
      this.addListener();

      const result = await Aolsee.getNewsClassify(this.unionId).fetch();
      const topList = result.data.filter(z => z.name.indexOf('常见问题') < 0);

      const activeId = topList[0] && topList[0].id;
      const result2 = activeId && await Aolsee.getNewsList(topList[0].id || '', this.currentPage, this.unionId).fetch();
      this.totalPage = result2 && result2.data && result2.data.totalPageNum;

      this.setState({
        result,
        topList,
        pageList: result2 && result2.data && (result2.data.records || []),
        success: true,
        loading: false,
        activeId: activeId || ''
      });

    } catch (e) {
      console.log(e);
    }
    this.setState({
      loading: false
    })
  }

  addListener = () => {

    window.addEventListener('scroll', () => {
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        const scrollHeight = document.body.scrollHeight;
        const scrollTop = document.body.scrollTop;
        const screenHeight = window.screen.height;

        const {activeId, pageList} = this.state;

        if (scrollHeight - scrollTop < screenHeight + 20 && !this.isLoading && this.totalPage >= this.currentPage) {

          const list = [...pageList];
          this.isLoading = true;

          this.totalPage > this.currentPage && Aolsee.getNewsList(activeId, this.currentPage + 1, this.unionId).subscribe({
            onSendBefore() {
              this.setState({ loading: true })
            },
            onSuccess: (result) => {
              this.currentPage < result.data.totalPageNum && this.currentPage++;
              this.setState({
                pageList: list.concat(result.data.records || []),
              });
              this.isLoading = false;
            },
            onComplete() {
              this.setState({ loading: false })
            },
            onError: () => {
              this.isLoading = false;
            }
          }).fetch();
        }
      }, 200)
    });
  };

  changeNews = async(data) => {
    this.currentPage = 1;
    this.setState({
      activeId: data.id
      ,loading: true
    });
    try {
      const result = await Aolsee.getNewsList(data.id, this.currentPage, this.unionId).fetch();
      window.scrollTo(0, 0);
      this.totalPage = result.data.totalPageNum;
      this.setState({
        pageList: result.data.records
      });
    } catch (e) {
      console.log(e);
    }
    this.setState({
      loading: false
    })
  };

  renderItem(data, i) {
    const urlInfo = {
      id: data.id,
      unionId: this.unionId,
      target: '_blank'
    };
    return (
      <div className="news-page-item" key={'p' + i}>
        <a href={`./news-detail.html?${util.flat(urlInfo)}`}>
          <div className="img" style={data.titleImg ? {backgroundImage: `url(${data.titleImg})`} : {}}></div>
          <div className="text">
            <div className="h1">{data.title}</div>
            <div className="sub ui-nowrap-flex">{data.summary}</div>
            <div className="time">{ data.publishTime }</div>
          </div>
        </a>
      </div>
    )
  }

  renderLoading() {
    return (
      <div ref="loading" className="render-loading-container">
        <div className="icon-h-loading render-loading-circle"></div>
      </div>
    );
  }

  renderNoMsg() {
    return (
      <div>
        <section className="ui-notice">
          <i></i>
          <p>没有资讯信息</p>
        </section>
      </div>
    );
  }

  render() {
    const {topList, activeId, pageList} = this.state;
    if (topList.length > 0) {
      return (
        <div>
          <div className="news-top">
            <div className="news-top-container">
              <ul>
                {
                  topList.map((z, i) =>
                    <li className="news-top-item" key={'t' + i}>
                      <a onClick={() => this.changeNews(z)}
                         className={activeId === z.id ? 'news-top-on' : ''}>{z.name}</a>
                    </li>
                  )
                }
              </ul>
            </div>
          </div>

          <div className="news-page-list">
            {
              pageList.length > 0 ? pageList.map((z, i) => this.renderItem(z, i)) : this.renderNoMsg()
            }
          </div>
        </div>
      );
    }
    return <div className="ui-tips center">没有资讯</div>
  }
}
