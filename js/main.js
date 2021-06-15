
//  javascript file 
// copyright (c) 2021 James Leahy  All Rights Reserved.




var canvas = document.getElementById("chartId");

canvas.style.marginLeft="10px" ;
document.body.style.cursor = "crosshair";
//canvas.width = 570 ;
if(window.innerWidth < 650){
    canvas.width= window.innerWidth ;
}else{
    canvas.width = 900 ;
}
if(canvas.width < 500){
    canvas.height = 325 ;
}else{
    canvas.height = 600 ;
}
// var background = "#ffe495";
var ctx = canvas.getContext("2d");
//var background = "#f0f0f0";
var background = "papayawhip";
ctx.fillStyle = background;
var width = canvas.width ; 
var height = canvas.height ;
ctx.fillRect(0,0,width,height);
var xMargin = 60 ; 
var yMargin = 40 ;
var xAxisStart = 0 + xMargin ;
var yAxisStart = height -yMargin ;
var xAxisEnd = width -xMargin ;
var yAxisEnd = 10 ;

 clear_graph(ctx) // draw the grid 
 // variables for graph 
 var last_array = [];
 var date_array = [];
 var vol_array = [] ;
 var time_array = [] ;
 var high_array = [] ;
 var low_array = [] ;
 var open_array = [] ;
 var close_array = [] ;
 var change_array = [] ;
 var timecode_array = [] ;
 var iv_skew_array = [] ; 
 var a_array = [] ;  // iv for a symbol
 var b_array = [] ;  // iv for b symbol
 var a_price_array = [] ;  // price for a symbol
 var b_price_array = [] ;  // price for b symbol
 var price_diff_array = [] ;  // diff price for symbols
 var x_max ;
 var x_min ;
 var y_max ;
 var y_min ;
 var x2_max ;  // max and min for the second graph
 var x2_min ;  // ...
 var y2_max ;  // ...
 var y2_min ;  // ...
 var a_max ;
 var a_min ;
 var b_max ;
 var b_min ;
 var last_point ;
 var x1 ;    var x2 ;  var y1 ; var y2 ;
 var symb  ;
 var a_symb  ;  // a symbol
 var b_symb  ;
 var max_volume ;
 var vol_scale ;
 vol_base = 0 ;
 vol_height =  (height * .3) ; // use 1/3 of the graph
 var url ;
 var one_second = 0 ;
 var minute = 0 ;
 var daily ;
 var timer_val = 0
 var  last ;
 var change = "0";    var hi = "0";   var low = "0" ;
		     
 var webSocket   = null;
 var ws_protocol = "ws";
 var ws_hostname = "10.0.0.3";
 var ws_port     = 2001;
 var extended = true ;
 var request ;
 var response ;
 var start_tc ;
 var end_tc ;
 var sample_interval ;
    
// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
  // Great success! All the File APIs are supported.
 // alert('The File APIs are fully supported in this browser.');
} else {
  alert('The File APIs are not fully supported in this browser.');
}


var inDST = 0 ;  // in daylight savings time
var tzo = 0 ;  // timezone offset
Date.prototype.stdTimezoneOffset = function () {
     var jan = new Date(this.getFullYear(), 0, 1);
     var jul = new Date(this.getFullYear(), 6, 1);
     return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
 } ;
 Date.prototype.isDstObserved = function () {
     return this.getTimezoneOffset() < this.stdTimezoneOffset();
 } ;
 var today = new Date();
 if (today.isDstObserved()) { 
    // alert ("Daylight saving time!");
    inDST = 1 ;
 }


 function PreGetData(){
   clearInterval(timer_val)
   clear_graph(ctx) ;
   clear_array(last_array) ;
   clear_array(date_array) ;
   clear_array(vol_array) ;
   clear_array(time_array) ;
   clear_array(open_array) ;
   clear_array(high_array) ;
   clear_array(low_array) ;
   clear_array(change_array) ;
   clear_array(timecode_array) ;
   clear_array(a_array) ;
   clear_array(b_array) ;
   clear_array(a_price_array) ;
   clear_array(b_price_array) ;
   clear_array(iv_skew_array) ;	  
  }
  
 function GetData(p_symb){
   ws_hostname = document.getElementById("ws_id").value;   // get ip address
   ws_port = document.getElementById("ws_port").value;   // get port
   if(ws_hostname.length < 2){
	 alert("please enter IP address") ;
	 return ;
   }
   a_symb = document.getElementById("symb").value;

   if(a_symb.length < 1){
		 alert("please enter symbol")
    }
   if(typeof(p_symb) == "undefined"){
        symb = document.getElementById("a_symbol").value;
   }else{
       symb = p_symb ;
   }
   // set up the request

   request = "marketdata,quotes,symbol=" + symb.toUpperCase() ;
     // get data from tda on websocket
   var a_b = 0 ; // 0 = a, 1 = b
   openWSConnection(ws_protocol, ws_hostname, ws_port, a_b) ; 
}

  
  function process_data(bytes_response, a_b){
	  var array ;
	  if(a_b == 0){
		  array = a_array ;
	  }else{
		  array= b_array ;
	  }
      response = bytes_response.slice(2, bytes_response.length-1 );// get rid of b'
    var text = bytes_response.slice(2, 100)
    var text_end = bytes_response.slice(bytes_response.length -100, bytes_response.length)
    var json_response = JSON.parse(response);
    var nkey = Object.keys(json_response) ;  //
    var key_length = nkey.length ;
    var mykey = nkey[0] ;
    var array_length = nkey[0].length ;     // the symbols will have  data
    var json_data = json_response[mykey] ;
	var iv = json_data.volatility ;
	var timestamp = json_data.quoteTimeInLong   // timestamp
    var date_string = get_date_from_tc(timestamp) ;
    var time_string = get_time_from_tc(timestamp) ;
    var a_iv = iv ; // store in local var
    array.push(iv) ;    // array = a_array here
    a_price_array.push(json_data.mark) ;
    time_array.push(time_string) ;
    date_array.push(date_string) ;
    timecode_array.push(timestamp) ;
	if(key_length > 1){
         mykey = nkey[1] ;  // second symbol
         json_data = json_response[mykey] ;
	     iv = json_data.volatility ;
         b_array.push(iv) ;   // store the second symbol
         b_price_array.push(json_data.mark) ;
 		 iv_skew_array.push(iv -a_iv) ; // store the skew
 		 price_diff_array.push((b_price_array[b_price_array.length-1] - a_price_array[a_price_array.length-1]))
	}
    clear_graph(ctx) ;
    clear_graph(ctx2) ;
    width = canvas.width ; 
    height = canvas.height ;

    // redefine width and height for graph
    width = width - xMargin -xAxisStart ;
    height = height - yMargin ;

    get_y_min_max(a_array, b_array) ;
    line_color = "#00ff00" ;
    draw_line_graph(time_array, a_array, line_color, ctx) ;
    line_color = "#ff00ff" ;
    draw_line_graph(time_array, b_array,line_color, ctx) ;
    print_y_scale(ctx) ;
    print_x_scale(ctx) ;
	// do iv skew on upper graph
    get_skew_y_min_max(iv_skew_array) ;
    line_color = "#0000ff" ;
    draw_line_graph(time_array, iv_skew_array, line_color, ctx) ;
    print_left_y_scale(ctx) ;
    var date_str = date_array[date_array.length-1]
    ctx.fillText(date_str, width/3, height + yMargin-20 ); // print date on graph
    ctx.fillText(nkey[0] , width/2, 20 );   // print symbol on graph
    line_color = "#00ff00" ;
    ctx.strokeStyle = line_color ;
    ctx.beginPath() ;
    ctx.lineWidth = 2 ;
    ctx.moveTo(width/2-35,20);
    ctx.lineTo(width/2-15,20);
    ctx.stroke();   
    ctx.fillText(nkey[1] , width/2 + 160, 20 );   // print symbol on graph
    line_color = "#ff00ff" ;
    ctx.strokeStyle = line_color ;
    ctx.beginPath() ;
    ctx.lineWidth = 2 ;
    ctx.moveTo(width/2+130,20);
    ctx.lineTo(width/2+ 150,20);
    ctx.stroke();   
    // skew diff label
    ctx.fillText("Skew Diff" , xMargin + 100, 20 );  // print diff on graph
    line_color = "#0000ff" ;
    ctx.strokeStyle = line_color ;
    ctx.beginPath() ;
    ctx.lineWidth = 2 ;
    ctx.moveTo(xMargin + 60,20);
    ctx.lineTo(xMargin + 80,20);
    ctx.stroke();   
    fill_table() ;   // fill min, max of the ranges
}



  function draw_line_graph(xArray, yArray, line_color, ctx){
    last_row = yArray.length -1 ;
    x_min = 0 ;
    if(daily == true){
        x_max = xArray.length -1 ;
    }else{
	if(xArray.length-1 > 390){
           x_max = xArray.length -1 ;
        }else{ 	
	   x_max = 390
        }
    }
    x1 = 0 ;
    y1 = yArray[0] ;
    y2 = ((y1 - y_min )*(height -height/10 ))/(y_max - y_min) ;
    x2 = ((  x1 - x_min) * (width))/(x_max - x_min) ;
   // ctx.strokeStyle = 'black' ;
    ctx.strokeStyle = line_color ;
    ctx.beginPath() ;
    ctx.lineWidth = 2 ;
    ctx.setLineDash([]);
    ctx.moveTo(xMargin + x2,height - y2);
    for (i = 0; i <  last_row +1;  ++i){
        x1 = i ;
        y1 = yArray[i] ;
        y2 = ((y1 - y_min )*(height - height/10))/(y_max - y_min) ;
        x2 = ((  x1 - x_min) * (width-3))/(x_max - x_min) ;
        ctx.lineTo(xMargin + x2, height -y2);
        ctx.stroke();   
    }
 }


  function get_y_min_max(first_array, second_array){
     var comb_array ;
     comb_array = first_array.concat(second_array) ;  // combine arrays
     y_min = get_min(comb_array) ;
	 y_min = y_min - (0.1 * y_min) ;
     y_max = get_max(comb_array) ;
	 y_max = y_max + (0.1 * y_max) ;
  }	  

 function get_skew_y_min_max(array){
     y_min = get_min(array) ;
	 y_min = y_min - Math.abs((0.01 * y_min)) ;
     y_max = get_max(array) ;
	 y_max = y_max + Math.abs((0.1 * y_max)) ;
  }	  

function plot_bars(xArray,ctx){
    last_row = (last_array.length -1) ;
    x_min = 0 ;
    x_max = xArray.length -1 ;
    get_min_max() ;  // get y_min and y_max
    ctx.strokeStyle = 'rgb(255,000,0)';
    ctx.fillStyle = 'rgb(255,0,0)' ;
    ctx.lineWidth = 1;
    for (i = x_min; i <  last_row +1;  i = ++i){
        x1 = i ;
        y1 = low_array[i] ;
        y1_h = high_array[i] ;
        y2 = ((y1 - y_min )*(height - height/10))/(y_max - y_min) ;
        y2_h = ((y1_h - y_min )*(height - height/10))/(y_max - y_min) ;
        x2 = ((x1 - x_min) * (width-3))/(x_max - x_min) ;
        ctx.strokeStyle = 'rgb(255,000,0)';
    //    ctx.strokeStyle = 'rgba(000,000,000,1)';
        ctx.beginPath() ;
        ctx.moveTo(x2,height - y2);
        ctx.lineTo(x2, height -y2_h);
        ctx.stroke();   
        // do closing tick
        var x2_r ;
        x2_r = x2+ 4 ;
        y1 = last_array[i] ;
        y2 = ((y1 - y_min )*(height - height/10))/(y_max - y_min) ;
        ctx.strokeStyle = 'rgb(0,0,0)';
        ctx.beginPath() ;
        ctx.moveTo(x2,height - y2);
        ctx.lineTo(x2_r, height -y2);
        ctx.stroke();   
    }
}

 function plot_volume(x_array, y_array){
    max_volume = get_max(vol_array) ;
    min_volume = 0 ;
    x_min = 0 ;
    if(daily == true){
        x_max = x_array.length -1 ;
    }else{
	if(x_array.length-1 > 390){
           x_max = x_array.length -1 ;
        }else{ 	
	   x_max = 390
        }
    }
    last_row = y_array.length -1 ;
    x1 = 0 ;
    y1 = y_array[0] ;
    y2 =  ((y1 - 0 )*(vol_height))/(max_volume - 0) ;
    x2 = ((x1 - x_min) * (width-3))/(x_max - x_min) ;
    // Create a semi-transparent blue
  //  var semitransparentBlue = new RGBColour(0, 0, 255, 0.5);
  //  ctx.globalAlpha=0.1;
  //  ctx.strokeStyle = 'blue' ;
    var save_stroke = ctx.strokeStyle ;
  //  ctx.strokeStyle = 'rgba(000,1000,000,0.1)';
    ctx.strokeStyle = 'rgba(000,255,000,0.5)';
    ctx.lineWidth = .5;
    ctx.beginPath() ;
    ctx.setLineDash([]);
    ctx.moveTo(x2,vol_height - y2);
    for (i = 0; i <  last_row +1;  i = ++i){
        x1 = i ;
        y1 = y_array[i] ;
        y2 = ((y1 - 0 )*(vol_height ))/(max_volume - 0) ;
        x2 = ((x1 - x_min) * (width-3))/(x_max - x_min) ;
        ctx.moveTo(x2,height  );
        ctx.lineTo(x2, height -y2);
        ctx.stroke();   
    }
    ctx.strokeStyle = 'black' ;
    ctx.lineWidth = 1 ;
 }

 
 function print_y_scale(ctx){
     
  ctx.font = '12px Times New Roman';
  ctx.fillStyle = 'Black';
  var y_inc = 0 ;
  var tick_inc = 0 ;
  var inc = (height + yMargin)/10 ;   // use original height to line up with grid
  var tick = ((y_max - y_min) /8) ;
    for (i = 0 ; i < 9 ; i +=1) {
        y_inc = y_inc + inc ;
        tick_inc = y_min + (tick * i) ;
      //  yval = df.format(tick_inc) ;
         //2d.drawString(yval,plotWidth+5 ,height -(int)y_inc );
        ctx.fillText(tick_inc.toFixed(2) , width + xAxisStart + 2, yAxisStart - inc * i);
    }
 }


 function print_left_y_scale(ctx){    
    ctx.font = '12px Times New Roman';
    ctx.fillStyle = 'Blue';
    var y_inc = 0 ;
    var tick_inc = 0 ;
    var inc = (height + yMargin)/10 ;   // use original height to line up with grid
    var tick = ((y_max - y_min) /8) ;
    for (i = 0 ; i < 9 ; i +=1) {
        y_inc = y_inc + inc ;
        tick_inc = y_min + (tick * i) ;
        ctx.fillText(tick_inc.toFixed(3) , 10, yAxisStart - inc * i);
    }
  ctx.fillStyle = 'Black';
 }

 function print_x_scale(ctx){
      // print the x scale
    ctx.font = '12px Times New Roman';
    ctx.fillStyle = 'Black';
    var x_pos = 0 ;
    var axis_inc ;
   if(width < 500){
        axis_inc = 2 ;
    }else{
        axis_inc = 1 ;
    } 
    var j = (x_max - x_min) / 10 ;
    for (i = 0; i < 10; i += axis_inc){
        x_pos = x_min + i * j ;
        var dat = Date.parse(date_array[Math.floor(x_pos+1)]) ;
        var options = { year: '2-digit', month: '2-digit', day: '2-digit' };
        // date_string = dat.toLocaleDateString("en-US", options);
        date_string = time_array[Math.floor(x_pos+1)] ;
        if(typeof(date_string) != "undefined"){
             date_string = time_array[Math.floor(x_pos+1)] ;
        }else{
             date_string = " " ;
        }                    
       
        ctx.fillText(date_string , xMargin +  width/10 * i, height + 15);
    }
  }

  
function draw_vertical_line(xPoint, xArray){
    x_min = 0 ;
    x_max = xArray.length -1 ;
    x1 = xPoint ;
    x2 = ((x1 - x_min) * (width))/(x_max - x_min) ;
    ctx.setLineDash([2,2]);
    ctx.beginPath() ;
    ctx.moveTo(x2,height  );
    ctx.lineTo(x2, yAxisEnd) ;
    ctx.stroke() ;
    ctx.setLineDash([]);    
      
  }
  
  
function get_time_from_tc(tc){
    var dat1 =  new Date(tc ) ;  //  in milliseconds 
    var h = dat1.getHours() ;   // 0 - 23
    var m = dat1.getMinutes() ;
    var mm = dat1.getMonth() ;  // 0 - 11
    var d = dat1.getDay() ;   //  day of week  0-6
    var dat = dat1.getDate() ;    // day of month
    var ys = (dat1.getFullYear()).toString().slice(2,4);
    var y = (dat1.getFullYear()) -2000 ; 
    var tzo = (new Date().getTimezoneOffset())/60 ;
    var time_string = dat1.getHours() + ":"+ ("0" +dat1.getMinutes()).slice(-2) ;   // use minutes for intraday
    var date_string = ("0" + dat1.getMonth()).slice(-2) + "/" +  ("0" + dat1.getDate()).slice(-2) + "/" + (dat1.getFullYear()).toString().slice(2,4); 
   return time_string ;
  }


function get_date_from_tc(tc){
    var dat1 =  new Date(tc ) ;  //  in milliseconds 
    var h = dat1.getHours() ;   // 0 - 23
    var m = dat1.getMinutes() ;
    var mm = dat1.getMonth() ;  // 0 - 11
    var d = dat1.getDay() ;   //  day of week  0-6
    var dat = dat1.getDate() ;    // day of month
    var ys = (dat1.getFullYear()).toString().slice(2,4);
    var utc_date = dat1.getUTCDate() ;  //tda timecode for daily data is off by 1 day when converted to local time. use UTC
    var y = (dat1.getFullYear()) -2000 ; 
    var tzo = (new Date().getTimezoneOffset())/60 ;  // tz offset from gmt
    var time_string = dat1.getHours() + ":"+ ("0" +dat1.getMinutes()).slice(-2) ;   // use minutes for intraday
    var date_string = ("0" + (dat1.getMonth()+1)).slice(-2) + "/" +  ("0" + dat1.getUTCDate()).slice(-2) + "/" + (dat1.getFullYear()).toString().slice(2,4); 
   return date_string ;
  }


function today_to_tc(){
   var date = new Date()
   var one_day = 24*60*60*1000
   var tc = date.getTime()
   var day_offset = document.getElementById("dayspinner").value;
   tc = tc + (day_offset * one_day) 
   return tc
}

 
function clear_graph(this_ctx){
  this_ctx.clearRect(0, 0, canvas.width, canvas.height);  
  // ctx.fillStyle = 'lightgray' ;
  this_ctx.fillStyle = background;
  this_ctx.lineWidth = 1;
  this_ctx.setLineDash([]);
  this_ctx.strokeStyle = 'black' ;
  width = canvas.width ; 
  height = canvas.height ;
  this_ctx.fillRect(0,0,width,height);  
   // restore the grid
  this_ctx.lineWidth = 1  ;
  this_ctx.beginPath() ;
  // x axis
  this_ctx.moveTo(xAxisStart, yAxisStart) ;
  this_ctx.lineTo(xAxisEnd, yAxisStart) ;
  this_ctx.stroke() ;
  // y axis
  this_ctx.lineTo(xAxisEnd, yAxisEnd) ;
  this_ctx.stroke() ;
  // first y axis
  this_ctx.moveTo(xAxisStart, yAxisStart) ;
  this_ctx.lineTo(xAxisStart, yAxisEnd) ; 
  this_ctx.stroke() ;
  var inc = height/10 ;
   // draw the grid lines
  for (var i = 0; i < 9; i++) {
    this_ctx.beginPath();
    this_ctx.setLineDash([2, 2]);
    this_ctx.moveTo(xAxisStart, yAxisStart - inc * i);
    this_ctx.lineTo(xAxisEnd, yAxisStart - inc * i);
    this_ctx.stroke();
  }
  this_ctx.setLineDash([]); 
}

var points = [40, 100, 1, 5, 25, 10];
function SortAscending(points_array){
       points_array.sort(function(a, b){return a - b});
}


function DoFunction(){
    var new_array = points.slice() ;   // copy array
    var max_val = get_max(points) ;
    var top = points[0] ;
    var top2 = new_array[0] ;
    var i = 0 ;
}


function get_min(array){
    var new_array = array.slice() ;   // copy array
    SortAscending(new_array) ;
    var top = new_array[0] ;
    return top ;
}

function get_max(array){
    var new_array = array.slice() ;   // copy array
    SortAscending(new_array) ;
    var end = new_array[new_array.length-1] ;
    return end ;
}

function get_min_max(){
 // get new min and max limits for partial array
 var new_array = low_array.slice(x_min, x_max +1) ;   // copy array
 y_min = get_min(new_array) ;
 new_array = high_array.slice(x_min, x_max + 1) ;
 y_max = get_max(new_array) ;
    
 }


 function clear_array(array){
     array.splice(0,array.length)  // remove all items from the array
  }


 function  setSample(){
	  sample_interval = document.getElementById("sample").value ;
  }
	  
  
function myTimer() {
    var d = new Date();
    var getting = ""  ;
	sample_interval = 30 ; // 30 seconds
	sample_interval =  document.getElementById("sample").value ;
    one_second = one_second + 1 ;
    minute = one_second % sample_interval ;
 //   minute = one_second % 4 ;
    document.getElementById("timer").innerHTML = d.toLocaleTimeString()  + "&nbsp;&nbsp;&nbsp  update in " + String(sample_interval - minute) + " seconds" ;
    if (minute == 0){  // get data every minute
        symb = document.getElementById("a_symbol").value;
        //document.getElementById("message").innerHTML = "getting data" ;
        GetData(symb)
       // document.getElementById("message").innerHTML = "got data" ;
        document.getElementById("timer").innerHTML = d.toLocaleTimeString()  + " Getting Data" ;
    }
    // add code to stop timer at end of day
}

function startTimer(){
    timer_val = setInterval(myTimer, 1000) ;
	document.getElementById("startButton").disabled = true;
	
}

  function stopTimer(){
    document.getElementById("startButton").disabled = false;
    clearInterval(timer_val)
  }	  

function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));  // exdays * 1 day in ms
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function checkCookie() {
    var user=getCookie("username");
    if (user != "") {
        alert("Welcome again " + user);
    } else {
       user = prompt("Please enter your name:","");
       if (user != "" && user != null) {
           setCookie("username", user, 30);  // set cookie for 30 units
       }
    }
}


function detectmob() {
    var wid = window.innerWidth ;
    var hei = window.innerHeight ;
    var opsys = window.navigator.platform ;
    var browser = window.navigator.userAgent ;
    document.getElementById("text1").innerHTML="width " + wid + '\xa0\xa0\xa0\xa0' + "height " + hei + 
       '\xa0\xa0\xa0' + opsys + '\xa0\xa0\xa0'    ;

    if(window.innerWidth <= 800 && window.innerHeight <= 600) {
     return true;
   } else {
     return false;
   }
}


 function fill_table(){
    var crlf = "\r\n";
    var td = "<td>" ;
  //  var td_c = "<td style='background-color: #ffffcc'>" ;
  //  var td_c = "<td style='background-color: #ccf495'>"   ;
    var td_c = '<td style="background-color: #228b88 ">'   ;
    var tdx = "</td>" ;
    var tr = "<tr>" ;
    var trx = "</tr>" ;
    var table_data = '<tr>' ;
    var line1 = "" ;    var line2 = "" ;     var line3 = "" ;
    var tbody = document.getElementById("body1") ;  // calls table body
    var cur_net ;
    var orig_net ;
    var dit = "ffff" ;
    var today = new Date() ; ;
    //var opendate = today.toLocaleDateString() ;
     a_min = get_min(a_array) ;
     a_max = get_max(a_array) ;
     b_min = get_min(b_array) ;
     b_max = get_max(b_array) ;
     var skew_min = get_min(iv_skew_array) ;
     var skew_max = get_max(iv_skew_array) ;
     var type_index = a_symb.toUpperCase().lastIndexOf("P");
	 var a_strike = a_symb.substring(type_index, a_symb.length) ;
     type_index = a_symb.toUpperCase().lastIndexOf("P");
	 var b_strike = b_symb.substring(type_index, a_symb.length) ;
	 table_data += "<td>" + "new data1" ;
     //td = td_c ;  // color first
     line1 += tr + td + a_strike + td + a_min + tdx + td + a_max + tdx 
              + trx ;
    td  = "<td>" ;
    line2 += line1 + tr + td + b_strike + td + b_min  + tdx + td + b_max + tdx 
              + trx ;
    //td = td_c ;
    line3 += line2  + tr + td + "diff" + tdx + td + skew_min.toFixed(2) + tdx 
              + td + skew_max.toFixed(2) + tdx + trx ;
    tbody.innerHTML = line3 ;

 }
  
/* The Black and Scholes (1973) Stock option formula */

function BlackScholes(PutCallFlag, S, X, T, r, v) {
var d1, d2;
d1 = (Math.log(S / X) + (r + v * v / 2.0) * T) / (v * Math.sqrt(T));
d2 = d1 - v * Math.sqrt(T);
if (PutCallFlag== "c")
return S * CND(d1)-X * Math.exp(-r * T) * CND(d2);
else
return X * Math.exp(-r * T) * CND(-d2) - S * CND(-d1);
}

/* The cummulative Normal distribution function: */

function CND(x){
var a1, a2, a3, a4 ,a5, k ;
a1 = 0.31938153, a2 =-0.356563782, a3 = 1.781477937, a4= -1.821255978 , a5= 1.330274429;
if(x<0.0)
   return 1-CND(-x);
else
    k = 1.0 / (1.0 + 0.2316419 * x);
return 1.0 - Math.exp(-x * x / 2.0)/ Math.sqrt(2*Math.PI) * k * (a1 + k * (-0.356563782 + k * (1.781477937 + k * (-1.821255978 + k * 1.330274429)))) ;
}


//var popCanvas = document.getElementById("popChart").getContext("2d");

 // websocket routines

/**
 * Open a new WebSocket connection using the given parameters
 */
  function openWSConnection(protocol, hostname, port, a_b) {
    var webSocketURL = null;
    webSocketURL = protocol + "://" + hostname + ":" + port;
    console.log("openWSConnection::Connecting to: " + webSocketURL);
    try {
        webSocket = new WebSocket(webSocketURL);
        webSocket.onopen = function(openEvent) {
            console.log("WebSocket OPEN: " + JSON.stringify(openEvent, null, 4));
            document.getElementById("incomingMsgOutput").value = "" 
	    onSendClick(request)
        };

        webSocket.onclose = function (closeEvent) {
            console.log("WebSocket CLOSE: " + JSON.stringify(closeEvent, null, 4));

        };

        webSocket.onerror = function (errorEvent) {
            console.log("WebSocket ERROR: " + JSON.stringify(errorEvent, null, 4));
        };

        webSocket.onmessage = function (messageEvent) {
            var wsMsg = messageEvent.data;
             console.log(typeof wsMsg ) 
             console.log("WebSocket MESSAGE: " + wsMsg);

            if (wsMsg.indexOf("error") > 0) {
                document.getElementById("incomingMsgOutput").value += "error: " + wsMsg.error + "\r\n";

            } else {
                document.getElementById("incomingMsgOutput").value +=  wsMsg + "\r\n";
 		       process_data(wsMsg, a_b) ;  // process the data
            }
        };

    } catch (exception) {
        console.error(exception);
    }
}

/**
 * Send a message to the WebSocket server
 */
function onSendClick(msg) {

    if (webSocket.readyState != WebSocket.OPEN) {
        console.error("webSocket is not open: " + webSocket.readyState);
        return;
    }

   // var msg = document.getElementById("message").value;
    webSocket.send(msg);
}


// get data from option form 
  // localStorage.removeItem("KEY");
  // localStorage.clear();
function get_passed_data(){
    var exp_dat = localStorage.getItem('exp_date');
    alert("exp date = " + exp_dat) ;
 }

