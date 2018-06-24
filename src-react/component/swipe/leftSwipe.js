 export default {

    // leftSwipe(parentElement,deleBtn){

    //         let touchLis = parentElement.children;
    //         let initX;//初始化X横坐标
    //         let moveX;//移动距离
    //         let X = 0;
    //         let objX = 0;
    //         //滑动距离 = 删除按钮的宽度 - (页面的宽度 - 单个列表项的宽度)/2
    //         let sideDistance = (document.body.clientWidth - touchLis[0].clientWidth)/2;//两边的距离
    //         let distance  = Math.abs(deleBtn.clientWidth - sideDistance);
    //         for(let i = 0,len = touchLis.length;i<len;i++){
    //           let touchLi = touchLis[i]
    //           let index = i;//记录当前滑动的索引
    //           objX =(touchLi.style.WebkitTransform.replace(/translateX\(/g,"").replace(/px\)/g,""))*1;
    //           let touchLi_btn = touchLi.children[1]
    //           touchLi_btn.style.display = 'none'
    //           touchLi.addEventListener('touchstart',function(e){
    //               //如果存在不是初始状态的li,先让这个li滑动到初始状态,在操作当前li
    //             for(let i = 0,len = touchLis.length;i<len;i++){
    //                 let _objX = touchLis[i].style.WebkitTransform.replace(/translateX\(/g,"").replace(/px\)/g,"")*1;
    //                 if( _objX =! 0 && i !== index){
    //                     touchLis[i].style.WebkitTransform = "translateX(" + 0 + "px)";
    //                     touchLis[i].children[1].style.display = 'none'
    //                 }
    //             }
    //             initX = e.targetTouches[0].pageX;
    //             if( objX == 0){//不在滑动过程中,在原始位置;
    //                 touchLi.addEventListener('touchmove',function(e){
    //                   moveX = e.targetTouches[0].pageX;
    //                           X = moveX - initX;
    //                           if (X > 0) {//禁止从初始位置向右滑,touchLi在初始位置
    //                             touchLi.style.WebkitTransform = "translateX(" + 0 + "px)";
    //                             touchLi_btn.style.display = 'none'
    //                           }
    //                           else if (X < 0) {//左滑
    //                               var left = Math.abs(X);
    //                               touchLi.style.WebkitTransform = "translateX(" + -left + "px)";
    //                               touchLi_btn.style.display = 'flex'
    //                               if(left > distance){//左滑最大距离是distance
    //                                   left = distance;
    //                                   touchLi.style.WebkitTransform = "translateX(" + -left + "px)";
    //                                   touchLi_btn.style.display = 'flex'
    //                               }
    //                           }
    //                 })
    //           }else if( objX < 0 ){//右滑过程中
    //               touchLi.addEventListener('touchmove',function(e){
    //                 moveX = e.targetTouches[0].pageX;
    //                         X = moveX - initX;
    //                         if (X > 0) {//右滑
    //                             var right = -distance + Math.abs(X);
    //                             touchLi.style.WebkitTransform = "translateX(" + right + "px)"
    //                             touchLi_btn.style.display = 'flex'
    //                             if(right > 0){//超过最大距离distance
    //                                 right = 0;//在最左边
    //                                 touchLi.style.WebkitTransform = "translateX(" + right + "px)";
    //                                 touchLi_btn.style.display = 'flex'
    //                             }
    //                         }else { //向左滑动
    //                           touchLi.style.WebkitTransform = "translateX(" + -distance + "px)"
    //                           touchLi_btn.style.display = 'flex'
    //                         }
          
    //               })
    //           }
          
    //       },
    //         touchLi.addEventListener('touchend',function(){//手指离开,不会停在中间,要么在初始位置,要么在最左边
    //           objX =(touchLi.style.WebkitTransform.replace(/translateX\(/g,"").replace(/px\)/g,""))*1;
    //                   if(objX>-40){
    //                     touchLi.style.WebkitTransform = "translateX(" + 0 + "px)";
    //                     touchLi_btn.style.display = 'none'
    //                   }else{
    //                     touchLi.style.WebkitTransform = "translateX(" + -distance + "px)";
    //                     touchLi_btn.style.display = 'flex'
    //                   }
    //             })
    //           )}
    //         },



    left_Swipe(touchlis,deleBtn){

        //初始化最大滑动距离...
        let sideDistance = (document.body.clientWidth - touchlis[0].clientWidth)/2;//li列表项两边的空隙
        let deleBtnWidth = deleBtn.clientWidth;//删除按钮的宽度
        let maxDistance  = Math.abs(deleBtnWidth - sideDistance);//最大滑动距离
        let expansion = null; //是否存在展开的列表项
        for(let i = 0,len = touchlis.length;i < len; i++){    
            let x, y, X, Y, swipeX, swipeY;
            const touchli = touchlis[i]
            touchli.style.overflow = 'hidden'
            touchli.addEventListener('touchstart', function(e) {
                x = e.changedTouches[0].pageX;
                y = e.changedTouches[0].pageY;
                swipeX = true;
                swipeY = true ;
                if(expansion && expansion != this ){   //判断其他li是否展开，如果展开则收起
                    expansion.style.WebkitTransform ='translateX(0px)';
                         expansion.style.overflow = 'hidden'       
                }        
            });
            touchli.addEventListener('touchmove', function(e){
                X = e.changedTouches[0].pageX;
                Y = e.changedTouches[0].pageY;      
                // 左右滑动
                if(swipeX && Math.abs(X - x) - Math.abs(Y - y) > 0){
                    // 阻止事件冒泡
                    e.stopPropagation();
                    if(X - x > 0){   //右滑
                        e.preventDefault();
                        this.style.WebkitTransform ='translateX(0px)'; 
                    }
                    if(x - X > 0){   //左滑
                        e.preventDefault();
                        this.style.WebkitTransform ='translateX('+ -maxDistance +'px)'; 
                        expansion = this;
                        this.style.overflow = '';
                    }
                    swipeY = false;
                }
                // // 上下滑动
                // if(swipeY && Math.abs(X - x) - Math.abs(Y - y) < 0) {
                //     swipeX = false;
                // }        
            });
            touchli.addEventListener('touchend',function(){
                let  objX = this.style.WebkitTransform.replace(/translateX\(/g,"").replace(/px\)/g,"")*1;
                if( objX >= 0 ){
                    this.style.overflow = 'hidden'
                }
            })
           
        }

    }
 }