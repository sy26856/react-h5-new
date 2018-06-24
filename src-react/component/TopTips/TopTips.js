import React from 'react'
import UserCenter from '../../module/UserCenter'
// import {SmartComponent} from '../../BaseComponent'
import "./TopTips.less"
/**
  
  <TopTips corpId={corpId} tipsKey={tipsKey} />

**/

export default class TopTips extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      text:""
    }
  }
  async componentDidMount() {
    let {corpId, tipsKey} = this.props;
    try{
      let result = await UserCenter.getTopTips( corpId ).fetch();
      this.setState({
        text:result.data[tipsKey]
      })
    }catch(e){
      //
    }
  }

  render(){
    let text = this.state.text;
    if(text){
      return (
        <div ref="tips" className="sections-tips">
            <i className="ui-icon-bugle"></i>
            <div className="text">
                {text}
            </div>
        </div>
      )
    }

    return null
  }
}