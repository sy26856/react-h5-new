var clock = 0;

//设置第N天的闹钟 开启 关闭
function set(day){
    clock =clock^(1<<day);
    return clock;
}
//判断第N天的闹钟是否开启
function is(day){
    return ((1&(clock>>day)) == 1);
}
//查看二进制状态
function view(a){
    console.log(parseInt(a).toString(2))
}

//设置7天开启
console.log((set(1)));
console.log((set(2)));
console.log((set(3)));
console.log((set(4)));
console.log((set(5)));
console.log((set(6)));
console.log((set(7)));

// //验证
// console.log(is(1) == true)
// console.log(is(2) == true)
// console.log(is(3) == true)
// console.log(is(4) == true)
// console.log(is(5) == true)
// console.log(is(6) == true)
// console.log(is(7) == true)


// //设置7天关闭
// view(set(1));
// view(set(2));
// view(set(3));
// view(set(4));
// view(set(5));
// view(set(6));
// view(set(7));

// //验证
// console.log(is(1) == false)
// console.log(is(2) == false)
// console.log(is(3) == false)
// console.log(is(4) == false)
// console.log(is(5) == false)
// console.log(is(6) == false)
// console.log(is(7) == false)

// for(var i=0; i<33; i++){
// 	console.log(i, 1<<i)
// }
