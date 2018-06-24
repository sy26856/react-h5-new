import React, {PropTypes} from 'react';
import './left-slide.less'
export default class LeftSlide extends React.Component {

  static propTypes = {
    index: React.PropTypes.number,//每个列表项对应的索引
    isConfirm: React.PropTypes.bool,//操作项确认,一般是删除确认
    dump: React.PropTypes.func,//点击列表项,一般是做跳转
  };
  
  constructor(props) {
    super(props)
  }

  componentDidMount(){
    this.addEventListener(this.refs['sl-opts'].clientWidth)
  }

  componentDidUpdate(){
    let {isConfirm}=this.props
    if(!isConfirm){
      expandLi.style['-webkit-transform']='translate3d(0,0,0)' 
    }
  }

  componentWillUnmount(){
    delete window.expandLi
    this.refs['sl-content'].removeEventListener('touchstart')
    this.refs['sl-content'].removeEventListener('touchmove')
    this.refs['sl-content'].removeEventListener('touchend')
  }

  addEventListener(slideMaxWid){
    let listItem = this.refs['sl-content'],
        initX = 0, // 初始X坐标
        initY = 0, // 初始Y坐标
        endX = 0, // 结束时X坐标
        endY = 0, // 结束时Y坐标
        moveX = 0;// listItem 移动的距离
    listItem.addEventListener('touchstart',(e)=>{
        // 判断有无已经展开的li，如果有，是否是当前的li，如果不是，将展开的li收起
        if( window.expandLi ){
          if(expandLi.dataset.index!= listItem.dataset.index){
            if( Math.abs(endY-initY) < Math.abs(endX-initX) ){//上下滑
              e.preventDefault();
            }
            //收起
            expandLi.style['-webkit-transform']='translate3d(0,0,0)'
          }
        }

        initX = e.targetTouches[0].pageX;
        initY = e.targetTouches[0].pageY;
        moveX = listItem.offsetLeft;
        listItem.addEventListener('touchmove',(e)=>{
          let curY = e.targetTouches[0].pageY;
          let curX = e.targetTouches[0].pageX;
          let X = curX - initX; // 不断获取移动的距离
          let Y = curY - initY; 
          listItem.classList.remove('animate')

        if( Math.abs(Y)<Math.abs(X) ){
          e.preventDefault();
          if( moveX==0 ){//最右边
            if( X>0 ) {//右滑
              listItem.style['-webkit-transform']='translate3d(0,0,0)'
            }else if( X<0 ){//左滑
              if( X<-slideMaxWid ) X=-slideMaxWid;
              listItem.style['-webkit-transform']='translate3d('+X+'px,0,0)'
            }
          }
          // 最左
          else if( moveX <=-slideMaxWid){
            if( X>0 ) { // 右滑
                listItem.style['-webkit-transform']='translate3d(0,0,0)'
            }else { // 左滑
              listItem.classList.add('animated');
              listItem.style['-webkit-transform']='translate3d(0,0,0)'
            }
          }
        }
      })
    })

    listItem.addEventListener('touchend',(e)=>{
        endX = e.changedTouches[0].pageX;
        endY = e.changedTouches[0].pageY;
        let X = endX - initX;
        listItem.classList.add('animated');
        if(X<-slideMaxWid/2){
          listItem.style['-webkit-transform']='translate3d('+(-slideMaxWid)+'px,0,0)'
          window.expandLi=listItem
        }else if(Math.abs(X)<=1){//识别为点击操作
          this.props.dump?this.props.dump():null
        }else{
          listItem.style['-webkit-transform']='translate3d(0,0,0)'
        }
    })

  }

  render() {
      let {children,index}=this.props
      return <li className="sl-li">
                  <div className="sl-content" ref='sl-content' data-index={index}>
                    {children[0]}
                  </div>
                  <div className="sl-opts" ref='sl-opts'>
                    {children[1]}
                  </div>
              </li>
  }

}
