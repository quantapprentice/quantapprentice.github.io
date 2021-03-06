


var x_label = " x axis" ;  // text for chart 
var y_label = " y axis" ;
var z_label = "z axis" ;
var marker_size = 1.5 ;  // default
var chart_title = ""  // chart title
var x_axis_type = "linear" ;  // linear or datetime(timecode in ms)

var data1 =  [[1, 6, 5], [8, 7, 9], [1, 3, 4], [4, 6, 8], [5, 7, 7], [6, 9, 6], [7, 0, 5], [2, 3, 3], [3, 9, 8], [3, 6, 5], [4, 9, 4], [2, 3, 3], [6, 9, 9], [0, 7, 0], [7, 7, 9], [7, 2, 9], [0, 6, 2], [4, 6, 7], [3, 7, 7], [0, 1, 7], [2, 8, 6], [2, 3, 7], [6, 4, 8], [3, 5, 9], [7, 9, 5], [3, 1, 7.4], [4, 4, 2], [3, 6, 2], [3, 1, 6], [6, 8, 5], [6, 6, 7], [4, 1, 1], [7, 2, 7], [7, 7, 0], [8, 8, 9], [9, 4, 1], [8, 3, 4], [9, 8, 9], [3, 5, 3], [0, 2, 4], [6.8, 0, 2], [2, 1, 3], [5, 8, 9], [2, 1, 1], [9, 7, 6], [3, 0, 2], [9, 9.2, 0], [3, 4, 8], [2, 6, 1], [8, 9, 2], [7, 6, 5]] ;

var	plot_array = [] ;
var	sub_array = [] ;
var	test_array = [] ;
var x_max ;
var x_min ;
var y_max ;
var y_min ;
var z_max ;
var z_min ;


// set a version for javascript in the header
document.getElementById("js_ver").innerHTML = " js v0.1g" ;

// initialize some stuff when page gets loaded
window.onload = page_reloaded;


function clear_array(array){
     array.splice(0,array.length)  // remove all items from the array
 }


function page_reloaded(){
  // set graph type to default
 	var x = document.getElementById("threed_radio") ;
	x.checked = true ;
	clear_textarea() ;
}



function write_to_textarea(text_string){
   document.getElementById("incomingMsgOutput").value += text_string + "\r\n";
   var area =  document.getElementById("incomingMsgOutput") ;
   area.scrollTop = area.scrollHeight;   // move to end
}

function clear_textarea(){
    document.getElementById("incomingMsgOutput").value = "";
}


function init_graph_data(){
	clear_textarea() ;  //
	axes_defaultClick() ; //  clear user override
	x_label = "x axis = " ;
	y_label = "y axis = " ;
	z_label = "z axis = " ;

}	


// read file from user selected folder
var openFile = function(event) {
     var input = event.target;
     var name = input.files[0].name ;  // get the file name
     var reader = new FileReader();
     reader.onload = function(){
         var text = reader.result;   //the file text
		 if(name.includes(".csv")){  // parse csv files for plot
              parse_csv(text) ;
          }else{       
            // convert tokens to json dictionary
           //  tokens =  JSON.parse(text) ;
           // var tokens_string = JSON.stringify(tokens) ;
           // parse_tokens(tokens) ;	 
           // document.getElementById("incomingMsgOutput").value +=  tokens_string + "\r\n";
         }
     };
     reader.readAsText(input.files[0]);
  };

function parse_csv(text){
    csv_loaded = 0 ;
	clear_array(plot_array) ;
    var temp = text.split("\n") ; // split lines
    // remove the last line because it's null
    temp = temp.slice(0,temp.length -1) ;
	// remove alternate groups
	//var new_array = temp.slice() ; // copy array
	//for (i in temp){
	//	if ((i % 12) === 0){
	//		 temp.splice(i,12) ; // remove a line
	//	}
	//}
	init_graph_data() ;  // 
    document.getElementById("incomingMsgOutput").value += text + "\r\n";
	write_to_textarea(temp.length.toString() + " points") ;  //
    for (line in temp){
		if(temp[line].indexOf("#") != 0){   // check first char
		//	var temp_sample = temp[line].split(" ") ;
		    var temp_sample = temp[line].split(/[\s,]+/) ; //split on space or comma
   		    var aa = parseFloat(temp_sample[0]) ;
			if(aa >= 946713600){  // 1/1/2000 timecode
				// check if seconds or ms
				var dot = aa.toString().indexOf(".") ;
				if(dot == -1){ 
					var len = aa.toString().length  // no dot,check for 10 or 13 characters
					if(len > 10){
						sub_array.push(parseFloat(temp_sample[0])) ; // already ms
					//	x_axis_type = "datetime" ;
					}else{
						sub_array.push(parseFloat(temp_sample[0]*1000)) ; // convert seconds to ms
					//	x_axis_type = "datetime" ;
					}
				}else{  //has dot, check length 10 or 13
					if(dot > 10){
						sub_array.push(parseFloat(temp_sample[0])) ; // already ms
					//	x_axis_type = "datetime" ;
					}else{
				
				        sub_array.push(parseFloat(temp_sample[0]*1000)) ; // convert seconds to ms
					//	x_axis_type = "datetime" ;
					}
				}
				x_axis_type = "datetime" ;
			}else{
				sub_array.push(aa) ;
				x_axis_type = "linear" ;
			}
		    sub_array.push(parseFloat(temp_sample[2])) ;
		    sub_array.push(parseFloat(temp_sample[1])) ;
		    plot_array.push(sub_array) ;
		    sub_array = [] ;
	    }else{
  			write_to_textarea(temp[line]) ;  //
			if(line == 0){   // set labels
				var header = temp[0].slice(1,temp[0].length) ;
				var head = header.split(/[\s,]+/) ; // split on " " or ","
				x_label = "x axis = " + head[0] ;
				y_label = "y axis = " + head[2] ;
				z_label = "z axis = " + head[1] ;
			}
		}
   }
	var lines_in_file = temp.length ;
	if(lines_in_file < 500){
		marker_size = 4 ;
	}else{
		marker_size = 1.5 ;
	}
	// get x,y and z  column
    var col1 = plot_array.map(function(value,index) { return value[0]; });
    var col2 = plot_array.map(function(value,index) { return value[1]; });
    var col3 = plot_array.map(function(value,index) { return value[2]; });
	get_x_min_max(col1) ;
	get_y_min_max(col2) ;
	get_z_min_max(col3) ;
	get_user_axes_values() ; // see if user overrides limits

}

// this runs when the page loads
// export file
(function () {
var textFile = null,
  makeTextFile = function (text) {
    var data = new Blob([text], {type: 'text/plain'});
    // If we are replacing a previously generated file we need to
    // manually revoke the object URL to avoid memory leaks.
    if (textFile !== null) {
      window.URL.revokeObjectURL(textFile);
    }
    textFile = window.URL.createObjectURL(data);
    return textFile;
  };

    //  export the file button and event listener
  var button = document.getElementById('b') ;
 
  button.addEventListener('click', function () {
    var link = document.createElement('a');
    //var data = write_csv_file() ; ;
    //var fname = generate_fname() ;
    var data = "temp data" ;
    var fname = "temp_test_data.txt" ;
    link.setAttribute('download', fname);
    link.href = makeTextFile(data);
    document.body.appendChild(link);

    // wait for the link to be added to the document
    window.requestAnimationFrame(function () {
      var event = new MouseEvent('click');
      link.dispatchEvent(event);
      document.body.removeChild(link);
                });  
  }, false);
    
})();


function get_axis_values(){
	// get x,y and z  column
    var col1 = plot_array.map(function(value,index) { return value[0]; });
    var col2 = plot_array.map(function(value,index) { return value[1]; });
    var col3 = plot_array.map(function(value,index) { return value[2]; });
	get_x_min_max(col1) ;
	get_y_min_max(col2) ;
	get_z_min_max(col3) ;
	get_user_axes_values() ; // see if user overrides limits
}

	
  function get_y_min_max(first_array){
     var comb_array ;
     //comb_array = first_array.concat(second_array) ;  // combine arrays
     y_min = get_min(first_array) ;
	// y_min = y_min - (0.01 * y_min) ;
     y_max = get_max(first_array) ;
	// y_max = y_max + (0.02 * y_max) ;
  }	  


function get_x_min_max(first_array){
     var comb_array ;
     //comb_array = first_array.concat(second_array) ;  // combine arrays
     x_min = get_min(first_array) ;
	// x_min = x_min - (0.01 * x_min) ;
     x_max = get_max(first_array) ;
	// x_max = x_max + (0.02 * x_max) ;
  }	  


function get_z_min_max(first_array){
     var comb_array ;
     //comb_array = first_array.concat(second_array) ;  // combine arrays
     z_min = get_min(first_array) ;
	// z_min = z_min - (0.01 * z_min) ;
     z_max = get_max(first_array) ;
	// z_max = z_max + (0.02 * z_max) ;
  }	  


function SortAscending(points_array){
       points_array.sort(function(a, b){return a - b});
}



function get_min(array){
    //var new_array = array.slice() ;   // copy array
	var new_array = array.filter(function (value) {   // remove NaN
          return !Number.isNaN(value);
       });
    SortAscending(new_array) ;
    var top = new_array[0] ;
    return top ;
}

function get_max(array){
    //var new_array = array.slice() ;   // copy array
	var new_array = array.filter(function (value) {
		return !Number.isNaN(value);
        });
    SortAscending(new_array) ;
    var end = new_array[new_array.length-1] ;
    return end ;
}


function get_user_axes_values(){
    var temp_x_min = document.getElementById("x_min").value ;
    var temp_x_max = document.getElementById("x_max").value ;
    var temp_y_min = document.getElementById("y_min").value ;
    var temp_y_max = document.getElementById("y_max").value ;
    var temp_z_min = document.getElementById("z_min").value ;
    var temp_z_max = document.getElementById("z_max").value ;
	if(temp_x_min.length > 0){
		x_min = parseFloat(temp_x_min) ;
	}
	if(temp_x_max.length > 0){
		x_max = parseFloat(temp_x_max) ;
	}
	if(temp_y_min.length > 0){
		y_min = parseFloat(temp_y_min) ;
	}
	if(temp_y_max.length > 0){
		y_max = parseFloat(temp_y_max) ;
	}
	if(temp_z_min.length > 0){
		z_min = parseFloat(temp_z_min) ;
	}
	if(temp_z_max.length > 0){
		z_max = parseFloat(temp_z_max) ;
	}	
}

function copy_2d_array(array){
	var dat = [] ;  
    for (var i = 0; i < array.length; i++){   // copy 2d array
       dat[i] = array[i].slice();
	}
	return dat ;
}
	


function axes_defaultClick(){
    document.getElementById("x_min").value = "";  // clear entries
    document.getElementById("x_max").value = "";
    document.getElementById("y_min").value = "";
    document.getElementById("y_max").value = "";
    document.getElementById("z_min").value = "";
    document.getElementById("z_max").value = "";
    get_axis_values() ;
}
	

function testClick(){
	// alert("not yet") ;
	marker_size = 4 ;
	var dat = [] ;  
	dat = copy_2d_array(data1) ;
	clear_array(plot_array) ;
	plot_array = dat ;
	// get individual column arrays
    var col1 = plot_array.map(function(value,index) { return value[0]; }); 
    var col2 = plot_array.map(function(value,index) { return value[1]; });
    var col3 = plot_array.map(function(value,index) { return value[2]; });
	get_x_min_max(col1) ;
	get_y_min_max(col2) ;
	get_z_min_max(col3) ;

	do_plotClick() ;
}

function reloadClick(){
	clear_textarea() ;
	location.reload() ; // reload the web page to reset the graph
}
	

 
function randomNumber(min, max) { 
    return Math.random() * (max - min) + min;
} 

function checkClick(){

}


function radioClick(){


}

function typeClick(){

	var x = document.getElementById("threed_radio") ;
	if(x.checked == true){
		//do_plotClick() ;
		prePlot() ;
	}else{
		plot_flat_scatter() ;
	}
}

// display 'calculating div while doing plot
// need both the await promise and the setTimeout(do_plotClick(),0)
// to make it work

async function prePlot() {
   console.log('start timer');
	var x = document.getElementById("busyDiv");
   x.style.display = "block"  // show the display	
   await new Promise(resolve => setTimeout(resolve, 0));
   setTimeout(do_plotClick(), 0) ;
   //document.body.style.cursor = 'wait';
   console.log('after 1 second');
   x.style.display = "none"  // show the display	
   //document.body.style.cursor = 'default'; 
}


var chart ;

function do_plotClick(){
	
    if (typeof chart !== 'undefined') {
       // the variable is defined
       // chart.destroy();	

    }
  // display the calculating div
//   var x = document.getElementById("busyDiv");
//  x.style.display = "block"  // show the display	

//	test() ;
	
//	if (x.style.display === "none") {
//    x.style.display = "block";
//  } else {
//    x.style.display = "none";
//  }
	
 get_user_axes_values() ; 
 if (typeof chart == 'undefined') {  // don't execute this twice

// Give the points a 3D feel by adding a radial gradient
Highcharts.setOptions({
  colors: Highcharts.getOptions().colors.map(function (color) {
    return {
      radialGradient: {
        cx: 0.4,
        cy: 0.3,
        r: 0.5
      },
      stops: [[0, color], [1, Highcharts.color(color).brighten(-0.2).get('rgb')]]
    };
  })
});

}
	// Set up the chart

  chart = new Highcharts.Chart({
  chart: {
    renderTo: 'container',
    margin: 100,
    type: 'scatter3d',
    animation: false,
    backgroundColor: '#fcFFff',
    options3d: {
      enabled: true,
      alpha: 10,
      beta: 30,
	  depth: 500,
      viewDistance: 5,
      fitToPlot: false,
      frame: {
        bottom: {
          size: 1,
          color: 'rgba(0,0,0,0.00)'
        },
        back: {
          size: 1,
          color: 'rgba(0,0,2,0.01)'
        },
        side: {
          size: 1,
          color: 'rgba(0,0,0,0.03)'
        }
      }
    }
  },
  title: {
    text: ' '
  },
  subtitle: {
    text: 'Click and drag the plot area to rotate in space'
  },
  plotOptions: {
    scatter: {
      width: 10,
      height: 10,
  	  depth: 10
    }
  },
  yAxis: {
    min: y_min,
    max: y_max,
      title: {
		  text: y_label
	  }
  },
  xAxis: {
    min: x_min,
    max: x_max,
    type: x_axis_type,
    gridLineColor: '#a0a0a0',
    gridLineDashStyle: 'Dot',
    gridLineWidth: 1,
      title: {
		  text: x_label
	  }
  },
  zAxis: {
    min: z_min,
    max: z_max,
    gridLineColor: '#a0a0a0',
    gridLineDashStyle: 'Dot',
    showFirstLabel: false,
      title: {
		  text: z_label
	  }
  },
  legend: {
    enabled: false
  },
  series: [{
    name: 'Data',
    colorByPoint: true,
    accessibility: {
      exposeAsGroupOnly: true
    },
      data: plot_array,
	  marker:{
		  radius: marker_size
	  }
  }]
}); // Add mouse and touch events for rotation

(function (H) {
  function dragStart(eStart) {
    eStart = chart.pointer.normalize(eStart);
    var posX = eStart.chartX,
        posY = eStart.chartY,
        alpha = chart.options.chart.options3d.alpha,
        beta = chart.options.chart.options3d.beta,
        sensitivity = 5,
        // lower is more sensitive
    handlers = [];

    function drag(e) {
      // Get e.chartX and e.chartY
      e = chart.pointer.normalize(e);
      chart.update({
        chart: {
          options3d: {
            alpha: alpha + (e.chartY - posY) / sensitivity,
            beta: beta + (posX - e.chartX) / sensitivity
          }
        }
      }, undefined, undefined, false);
    }

    function unbindAll() {
      handlers.forEach(function (unbind) {
        if (unbind) {
          unbind();
        }
      });
      handlers.length = 0;
    }

    handlers.push(H.addEvent(document, 'mousemove', drag));
    handlers.push(H.addEvent(document, 'touchmove', drag));
    handlers.push(H.addEvent(document, 'mouseup', unbindAll));
    handlers.push(H.addEvent(document, 'touchend', unbindAll));
  }

  H.addEvent(chart.container, 'mousedown', dragStart);
  H.addEvent(chart.container, 'touchstart', dragStart);
})(Highcharts);

}

/*
 [[1, 6, 5], [8, 7, 9], [1, 3, 4], [4, 6, 8], [5, 7, 7], [6, 9, 6], [7, 0, 5], [2, 3, 3], [3, 9, 8], [3, 6, 5], [4, 9, 4], [2, 3, 3], [6, 9, 9], [0, 7, 0], [7, 7, 9], [7, 2, 9], [0, 6, 2], [4, 6, 7], [3, 7, 7], [0, 1, 7], [2, 8, 6], [2, 3, 7], [6, 4, 8], [3, 5, 9], [7, 9, 5], [3, 1, 7.4], [4, 4, 2], [3, 6, 2], [3, 1, 6], [6, 8, 5], [6, 6, 7], [4, 1, 1], [7, 2, 7], [7, 7, 0], [8, 8, 9], [9, 4, 1], [8, 3, 4], [9, 8, 9], [3, 5, 3], [0, 2, 4], [6.8, 0, 2], [2, 1, 3], [5, 8, 9], [2, 1, 1], [9, 7, 6], [3, 0, 2], [9, 9.2, 0], [3, 4, 8], [2, 6, 1], [8, 9, 2], [7, 6, 5], [6, 3, 1], [9, 3, 1], [8.1, 9, 3], [9, 1, 0], [3, 8, 7], [8, 0, 0], [4, 9, 7], [8, 6, 2], [4.4, 3, 0], [2, 3, 5], [9, 1, 4], [1, 1, 4], [6, 0, 2], [6, 1, 6], [3, 8, 8], [8, 8.2, 7], [5, 5, 0], [3, 9, 6], [5, 4, 3], [6, 8, 3], [0, 1, 5], [6, 7, 3], [8, 3, 2], [3, 8, 3], [2, 1, 6], [4, 6, 7], [8, 9, 9], [5, 4, 2], [6, 1, 3], [6, 9, 5], [4, 8, 2], [9, 7, 4], [5, 4, 2], [9, 6, 1], [2, 7, 3], [4, 5, 4], [6, 8, 1], [3.4, 4, 0], [2, 2, 6], [5, 1, 2], [9, 9, 7], [6, 9, 9], [8, 4, 3], [4, 1, 7], [6, 2, 5], [0, 4, 9], [3, 5, 9], [6, 9, 1], [1, 9, 2]]
*/

// flat chart

function plot_flat_scatter(){

 get_user_axes_values() ; 	
 chart = new Highcharts.chart('container', {
    chart: {
        type: 'scatter',
		backgroundColor: 'rgb(253,253,253)' ,
        zoomType: 'xy'
    },
    title: {
        text: ' '
    },
    subtitle: {
        text: ' '
    },
     xAxis: {
		 min: x_min,
		 max: x_max, 
        title: {
            enabled: true,
            text: x_label
        },
        startOnTick: true,
        endOnTick: true,
        showLastLabel: true,
		 type: x_axis_type
    },
     yAxis: {
		 min: y_min,
		 max: y_max,
        title: {
            text: y_label
        }
    },
    legend: {
        layout: 'vertical',
        align: 'left',
        verticalAlign: 'top',
        x: 100,
        y: 70,
        floating: true,
        backgroundColor: Highcharts.defaultOptions.chart.backgroundColor,
        borderWidth: 1
    },
    plotOptions: {
        scatter: {
            marker: {
                radius: marker_size,
                states: {
                    hover: {
                        enabled: true,
                        lineColor: 'rgb(100,100,100)'
                    }
                }
            },
            states: {
                hover: {
                    marker: {
                        enabled: false
                    }
                }
            },
            tooltip: {
                headerFormat: '<b>{series.name}</b><br>',
                pointFormat: '{point.x} , {point.y} '
            }

        }
    },
    series: [{
        name: 'data',
        color: 'rgba(223, 83, 83, .7)',
		data: plot_array
    }, {
        name: 'data',
      //  color: 'rgba(119, 152, 191, .7)',
        color: 'rgba(119, 15, 191, .7)',
		data: plot_array
    }]
});

}

var data11 =  [[161.2, 51.6], [167.5, 59.0], [159.5, 49.2], [157.0, 63.0], [155.8, 53.6],
            [170.0, 59.0], [159.1, 47.6], [166.0, 69.8], [176.2, 66.8], [160.2, 75.2],
            [172.5, 55.2], [170.9, 54.2], [172.9, 62.5], [153.4, 42.0], [160.0, 50.0],
            [147.2, 49.8], [168.2, 49.2], [175.0, 73.2], [157.0, 47.8], [167.6, 68.8],
            [159.5, 50.6], [175.0, 82.5], [166.8, 57.2], [176.5, 87.8], [170.2, 72.8],
            [174.0, 54.5], [173.0, 59.8], [179.9, 67.3], [170.5, 67.8], [160.0, 47.0],
            [154.4, 46.2], [162.0, 55.0], [176.5, 83.0], [160.0, 54.4], [152.0, 45.8],
            [162.1, 53.6], [170.0, 73.2], [160.2, 52.1], [161.3, 67.9], [166.4, 56.6],
            [168.9, 62.3], [163.8, 58.5], [167.6, 54.5], [160.0, 50.2], [161.3, 60.3],
            [167.6, 58.3], [165.1, 56.2], [160.0, 50.2], [170.0, 72.9], [157.5, 59.8],
            [167.6, 61.0], [160.7, 69.1], [163.2, 55.9], [152.4, 46.5], [157.5, 54.3],
            [168.3, 54.8], [180.3, 60.7], [165.5, 60.0], [165.0, 62.0], [164.5, 60.3],
            [156.0, 52.7], [160.0, 74.3], [163.0, 62.0], [165.7, 73.1], [161.0, 80.0],
            [162.0, 54.7], [166.0, 53.2], [174.0, 75.7], [172.7, 61.1], [167.6, 55.7],
            [151.1, 48.7], [164.5, 52.3], [163.5, 50.0], [152.0, 59.3], [169.0, 62.5],
            [164.0, 55.7], [161.2, 54.8], [155.0, 45.9], [170.0, 70.6], [176.2, 67.2],
            [170.0, 69.4], [162.5, 58.2], [170.3, 64.8], [164.1, 71.6], [169.5, 52.8],
            [163.2, 59.8], [154.5, 49.0], [159.8, 50.0], [173.2, 69.2], [170.0, 55.9],
            [161.4, 63.4], [169.0, 58.2], [166.2, 58.6], [159.4, 45.7], [162.5, 52.2],
            [159.0, 48.6], [162.8, 57.8], [159.0, 55.6], [179.8, 66.8], [162.9, 59.4],
            [161.0, 53.6], [151.1, 73.2], [168.2, 53.4], [168.9, 69.0], [173.2, 58.4],
            [171.8, 56.2], [178.0, 70.6], [164.3, 59.8], [163.0, 72.0], [168.5, 65.2],
            [166.8, 56.6], [172.7, 105.2], [163.5, 51.8], [169.4, 63.4], [167.8, 59.0],
            [159.5, 47.6], [167.6, 63.0], [161.2, 55.2], [160.0, 45.0], [163.2, 54.0],
            [162.2, 50.2], [161.3, 60.2], [149.5, 44.8], [157.5, 58.8], [163.2, 56.4],
            [172.7, 62.0], [155.0, 49.2], [156.5, 67.2], [164.0, 53.8], [160.9, 54.4],
            [162.8, 58.0], [167.0, 59.8], [160.0, 54.8], [160.0, 43.2], [168.9, 60.5],
            [158.2, 46.4], [156.0, 64.4], [160.0, 48.8], [167.1, 62.2], [158.0, 55.5],
            [167.6, 57.8], [156.0, 54.6], [162.1, 59.2], [173.4, 52.7], [159.8, 53.2],
            [170.5, 64.5], [159.2, 51.8], [157.5, 56.0], [161.3, 63.6], [162.6, 63.2],
            [160.0, 59.5], [168.9, 56.8], [165.1, 64.1], [162.6, 50.0], [165.1, 72.3],
            [166.4, 55.0], [160.0, 55.9], [152.4, 60.4], [170.2, 69.1], [162.6, 84.5],
            [170.2, 55.9], [158.8, 55.5], [172.7, 69.5], [167.6, 76.4], [162.6, 61.4],
            [167.6, 65.9], [156.2, 58.6], [175.2, 66.8], [172.1, 56.6], [162.6, 58.6],
            [160.0, 55.9], [165.1, 59.1], [182.9, 81.8], [166.4, 70.7], [165.1, 56.8],
            [177.8, 60.0], [165.1, 58.2], [175.3, 72.7], [154.9, 54.1], [158.8, 49.1],
            [172.7, 75.9], [168.9, 55.0], [161.3, 57.3], [167.6, 55.0], [165.1, 65.5],
            [175.3, 65.5], [157.5, 48.6], [163.8, 58.6], [167.6, 63.6], [165.1, 55.2],
            [165.1, 62.7], [168.9, 56.6], [162.6, 53.9], [164.5, 63.2], [176.5, 73.6],
            [168.9, 62.0], [175.3, 63.6], [159.4, 53.2], [160.0, 53.4], [170.2, 55.0],
            [162.6, 70.5], [167.6, 54.5], [162.6, 54.5], [160.7, 55.9], [160.0, 59.0],
            [157.5, 63.6], [162.6, 54.5], [152.4, 47.3], [170.2, 67.7], [165.1, 80.9],
            [172.7, 70.5], [165.1, 60.9], [170.2, 63.6], [170.2, 54.5], [170.2, 59.1],
            [161.3, 70.5], [167.6, 52.7], [167.6, 62.7], [165.1, 86.3], [162.6, 66.4],
            [152.4, 67.3], [168.9, 63.0], [170.2, 73.6], [175.2, 62.3], [175.2, 57.7],
            [160.0, 55.4], [165.1, 104.1], [174.0, 55.5], [170.2, 77.3], [160.0, 80.5],
            [167.6, 64.5], [167.6, 72.3], [167.6, 61.4], [154.9, 58.2], [162.6, 81.8],
            [175.3, 63.6], [171.4, 53.4], [157.5, 54.5], [165.1, 53.6], [160.0, 60.0],
            [174.0, 73.6], [162.6, 61.4], [174.0, 55.5], [162.6, 63.6], [161.3, 60.9],
            [156.2, 60.0], [149.9, 46.8], [169.5, 57.3], [160.0, 64.1], [175.3, 63.6],
            [169.5, 67.3], [160.0, 75.5], [172.7, 68.2], [162.6, 61.4], [157.5, 76.8],
            [176.5, 71.8], [164.4, 55.5], [160.7, 48.6], [174.0, 66.4], [163.8, 67.3]]

var data22 =  [[174.0, 65.6], [175.3, 71.8], [193.5, 80.7], [186.5, 72.6], [187.2, 78.8],
            [181.5, 74.8], [184.0, 86.4], [184.5, 78.4], [175.0, 62.0], [184.0, 81.6],
            [180.0, 76.6], [177.8, 83.6], [192.0, 90.0], [176.0, 74.6], [174.0, 71.0],
            [184.0, 79.6], [192.7, 93.8], [171.5, 70.0], [173.0, 72.4], [176.0, 85.9],
            [176.0, 78.8], [180.5, 77.8], [172.7, 66.2], [176.0, 86.4], [173.5, 81.8],
            [178.0, 89.6], [180.3, 82.8], [180.3, 76.4], [164.5, 63.2], [173.0, 60.9],
            [183.5, 74.8], [175.5, 70.0], [188.0, 72.4], [189.2, 84.1], [172.8, 69.1],
            [170.0, 59.5], [182.0, 67.2], [170.0, 61.3], [177.8, 68.6], [184.2, 80.1],
            [186.7, 87.8], [171.4, 84.7], [172.7, 73.4], [175.3, 72.1], [180.3, 82.6],
            [182.9, 88.7], [188.0, 84.1], [177.2, 94.1], [172.1, 74.9], [167.0, 59.1],
            [169.5, 75.6], [174.0, 86.2], [172.7, 75.3], [182.2, 87.1], [164.1, 55.2],
            [163.0, 57.0], [171.5, 61.4], [184.2, 76.8], [174.0, 86.8], [174.0, 72.2],
            [177.0, 71.6], [186.0, 84.8], [167.0, 68.2], [171.8, 66.1], [182.0, 72.0],
            [167.0, 64.6], [177.8, 74.8], [164.5, 70.0], [192.0, 101.6], [175.5, 63.2],
            [171.2, 79.1], [181.6, 78.9], [167.4, 67.7], [181.1, 66.0], [177.0, 68.2],
            [174.5, 63.9], [177.5, 72.0], [170.5, 56.8], [182.4, 74.5], [197.1, 90.9],
            [180.1, 93.0], [175.5, 80.9], [180.6, 72.7], [184.4, 68.0], [175.5, 70.9],
            [180.6, 72.5], [177.0, 72.5], [177.1, 83.4], [181.6, 75.5], [176.5, 73.0],
            [175.0, 70.2], [174.0, 73.4], [165.1, 70.5], [177.0, 68.9], [192.0, 102.3],
            [176.5, 68.4], [169.4, 65.9], [182.1, 75.7], [179.8, 84.5], [175.3, 87.7],
            [184.9, 86.4], [177.3, 73.2], [167.4, 53.9], [178.1, 72.0], [168.9, 55.5],
            [157.2, 58.4], [180.3, 83.2], [170.2, 72.7], [177.8, 64.1], [172.7, 72.3],
            [165.1, 65.0], [186.7, 86.4], [165.1, 65.0], [174.0, 88.6], [175.3, 84.1],
            [185.4, 66.8], [177.8, 75.5], [180.3, 93.2], [180.3, 82.7], [177.8, 58.0],
            [177.8, 79.5], [177.8, 78.6], [177.8, 71.8], [177.8, 116.4], [163.8, 72.2],
            [188.0, 83.6], [198.1, 85.5], [175.3, 90.9], [166.4, 85.9], [190.5, 89.1],
            [166.4, 75.0], [177.8, 77.7], [179.7, 86.4], [172.7, 90.9], [190.5, 73.6],
            [185.4, 76.4], [168.9, 69.1], [167.6, 84.5], [175.3, 64.5], [170.2, 69.1],
            [190.5, 108.6], [177.8, 86.4], [190.5, 80.9], [177.8, 87.7], [184.2, 94.5],
            [176.5, 80.2], [177.8, 72.0], [180.3, 71.4], [171.4, 72.7], [172.7, 84.1],
            [172.7, 76.8], [177.8, 63.6], [177.8, 80.9], [182.9, 80.9], [170.2, 85.5],
            [167.6, 68.6], [175.3, 67.7], [165.1, 66.4], [185.4, 102.3], [181.6, 70.5],
            [172.7, 95.9], [190.5, 84.1], [179.1, 87.3], [175.3, 71.8], [170.2, 65.9],
            [193.0, 95.9], [171.4, 91.4], [177.8, 81.8], [177.8, 96.8], [167.6, 69.1],
            [167.6, 82.7], [180.3, 75.5], [182.9, 79.5], [176.5, 73.6], [186.7, 91.8],
            [188.0, 84.1], [188.0, 85.9], [177.8, 81.8], [174.0, 82.5], [177.8, 80.5],
            [171.4, 70.0], [185.4, 81.8], [185.4, 84.1], [188.0, 90.5], [188.0, 91.4],
            [182.9, 89.1], [176.5, 85.0], [175.3, 69.1], [175.3, 73.6], [188.0, 80.5],
            [188.0, 82.7], [175.3, 86.4], [170.5, 67.7], [179.1, 92.7], [177.8, 93.6],
            [175.3, 70.9], [182.9, 75.0], [170.8, 93.2], [188.0, 93.2], [180.3, 77.7],
            [177.8, 61.4], [185.4, 94.1], [168.9, 75.0], [185.4, 83.6], [180.3, 85.5],
            [174.0, 73.9], [167.6, 66.8], [182.9, 87.3], [160.0, 72.3], [180.3, 88.6],
            [167.6, 75.5], [186.7, 101.4], [175.3, 91.1], [175.3, 67.3], [175.9, 77.7],
            [175.3, 81.8], [179.1, 75.5], [181.6, 84.5], [177.8, 76.6], [182.9, 85.0],
            [177.8, 102.5], [184.2, 77.3], [179.1, 71.8], [176.5, 87.9], [188.0, 94.3],
            [174.0, 70.9], [167.6, 64.5], [170.2, 77.3], [167.6, 72.3], [188.0, 87.3],
            [174.0, 80.0], [176.5, 82.3], [180.3, 73.6], [167.6, 74.1], [188.0, 85.9],
            [180.3, 73.2], [167.6, 76.3], [183.0, 65.9], [183.0, 90.9], [179.1, 89.1],
            [170.2, 62.3], [177.8, 82.7], [179.1, 79.1], [190.5, 98.2], [177.8, 84.1],
							[180.3, 83.2], [180.3, 83.2]] ;

