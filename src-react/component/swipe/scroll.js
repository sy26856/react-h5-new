export default {
    overScroll(el){
        el.addEventListener('touchstart', function() {
            var top = el.scrollTop,//元素被卷去的高度
                totalScroll = el.scrollHeight,//元素的总高度
                currentScroll = top + el.offsetHeight//当前高度 = 页面被卷去的高度 + 元素主体内容的高度
            if(top == 0) {//在滚动区域最顶部
                el.scrollTop = 1
            }else if(currentScroll == totalScroll) {//在滚动区域最底部
                el.scrollTop = top - 1
            }
        });
    
        el.addEventListener('touchmove', function(e) {
            if(el.offsetHeight < el.scrollHeight)//下滑
                e._isScroller = true
        })
    }
}