<?php 
	
	// http://daily.yuantutech.com/tms/fb/php-test.php?url=/pages/my.html?corpId=123
	$version = "1.1.21";


    $url = $_GET["url"];
    $param = $_GET["param"];

    $jumpUrl = "http://daily.yuantutech.com/yuantu/h5-cli/".$version.$url;

    header("Location:".$jumpUrl);

?>