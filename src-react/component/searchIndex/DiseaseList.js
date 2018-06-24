import React, { PropTypes } from 'react';
import util from '../../lib/util'
import hybridAPI from '../../lib/hybridAPI'

export default class TipList extends React.Component {

    static propTypes = {
        tipsList: PropTypes.array,
        toDetail: PropTypes.func
    };
    constructor(props) {
        super(props)
        const query = util.query()
        this.param = util.flat(query);
        this.paramList = query
        console.log(this.paramList)
    }
    toDetail(words) {
        const { toDetail } = this.props;
        try {
            let searchIndex = localStorage.getItem('searchIndex') || '[]';
            searchIndex = JSON.parse(searchIndex);
            searchIndex.indexOf(words) == -1 && searchIndex.push(words);
            searchIndex.length > 30 && searchIndex.shift();
            const result = JSON.stringify(searchIndex);
            localStorage.setItem('searchIndex', result);
            toDetail(words);
            var str = words;
            str = str.replace(/<em>/g, '');
            str = str.replace(/<\/em>/g, '');
            var flag = true;
            var flag1 = false;
            var href='patient-audio.html?'+this.param+ '&preDiagnosis=' + str + '&istreat=' + flag + '&color1=' + flag1 + '&isVisit=1' ;
            let arr = Object.assign(this.paramList,{preDiagnosis:str,
                istreat:flag,color1:flag1,isVisit:1})
            if (util.isInYuantuApp()) {
                //如果是 远图 app 就把值通过 jsbrige返回到上一个界面
                hybridAPI.pushDataToParent(true, JSON.stringify(arr))
            } else{
                window.location.replace(href)
            }
        } catch (e) {
            console.log(e);
        }
    }

    render() {
        const { tipsList } = this.props;
        if (tipsList[0] == ' ') {
            return <div className="white-back" style={{width:'100%',height:'200px'}}></div>;
        }
        if (tipsList && tipsList.length > 0) {
            return (
                <ul className="list-ord">
                    {
                        tipsList.map((item, index) =>
                            <li className="list-item" key={`tip${index}`} onClick={() => this.toDetail(item)} style={{paddingLeft:'15px',marginLeft:'0'}}>
                                <div className="list-content">
                                    {item}
                                </div>
                            </li>
                        )
                    }
                </ul>
            );
        }
        return <div className="notice">
            <span className="notice-icon icon-record" />
            <p>未找到相关内容</p>
        </div>
    }
}

