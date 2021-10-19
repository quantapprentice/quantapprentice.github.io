


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
document.getElementById("js_ver").innerHTML = " js v0.1c" ;


function clear_array(array){
     array.splice(0,array.length)  // remove all items from the array
 }



function write_to_textarea(text_string){
   document.getElementById("incomingMsgOutput").value += text_string + "\r\n";
   var area =  document.getElementById("incomingMsgOutput") ;
   area.scrollTop = area.scrollHeight;   // move to end
}

function clear_textarea(){
    document.getElementById("incomingMsgOutput").value = "";
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
    //write_to_textarea(ctx.canvas.id) ;
    csv_loaded = 0 ;
	clear_array(plot_array) ;
    var temp = text.split("\n") ; // split lines
    // remove the last line because it's null
    temp = temp.slice(0,temp.length -1) ;
	clear_textarea() ;  //
	axes_defaultClick() // 
   // write_to_textarea(text) ;  // limit number of lines displayed
    document.getElementById("incomingMsgOutput").value += text + "\r\n";
    for (line in temp){
		if(temp[line].indexOf("#") != 0){   // check first char
		//	var temp_sample = temp[line].split(" ") ;
		    var temp_sample = temp[line].split(/[\s,]+/) ; //split on space or comma
   		    var aa = parseFloat(temp_sample[0]) ;
			if(aa >= 946713600){  // 1/1/2000 timecode
				sub_array.push(parseFloat(temp_sample[0])*1000) ;
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
			if(line == 0){
				var header = temp[0].slice(1,temp[0].length) ;
				var head = header.split(/[\s,]+/) ; // split on " " or ","
				x_label = "x axis = " + head[0] ;
				y_label = "y axis = " + head[1] ;
				z_label = "z axis = " + head[2] ;
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
  
var chart ;

function do_plotClick(){
	
if (typeof chart !== 'undefined') {
    // the variable is defined
  //  chart.destroy();	

}
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
    text: 'Draggable box'
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
