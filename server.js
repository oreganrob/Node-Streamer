//var io = require('socket.io').listen(8080);
var fs = require('fs');
var throttle = require('throttle');
var StreamBrake = require('streambrake');
var throttled = require('throttled-stream');
var brake = require('brake');
//var dl  = require('delivery');
var BinaryServer = require('binaryjs').BinaryServer;

var server = BinaryServer({port: 9000});
var clients = []; 

server.on('connection', function(client){   
  //var file = fs.createReadStream(__dirname + '/flower.png');
  //client.send(file); 
  clients.push(client);
});

//wss.on('connection', function(ws) {
function startPlaying() {
	// send array 
	// sample code
    /*var array = new Float32Array(5);
    for (var i = 0; i < array.length; ++i) array[i] = i / 2;
    ws.send(array, {binary: true, mask: false});*/
	
	// read file and send in one go
	// works but its not streaming!
	/*fs.readFile('test.mp3', function (err, data) {
	  if (err) throw err;
	  ws.send(data, {binary: true, mask: false});
	});*/
	
	// alternative. can't throttle readFile?
	//var stream = fs.readFile('test1.mp3');
	//var slowStream = throttled(stream, 64*1024);
	
	// (file_size * 8) / length of song in seconds	
	var path = "Zombieland.mp4";
	var stat = fs.statSync(path);
	var total = stat.size;	
	var bit_rate = (total * 8)/4956; 
		
	// stream file
	var readStream = 
		//fs.createReadStream(path);
		//fs.createReadStream(path).pipe(new StreamBrake((bit_rate/10) * 2.5));
		//fs.createReadStream(path).pipe(new brake(65536));
		//fs.createReadStream(path, {'bufferSize': 128 * 1024}).pipe(new StreamBrake(28*1024));
		fs.createReadStream(path).pipe(new throttle((bit_rate/10) * 2.5));
		 /*{'flags': 'r',
		  'mode': 0666, 
		  'bufferSize': 64 * 1024});*/
	
	// get a throttled stream that runs at 64 KB/s or slower
	// sort of works
	//var slowStream = throttled(readStream, 64*1024);
		  
    // this multiplier may vary depending on your machine
	// doesn't work any more. throttle module changed
	//var t = new throttle({bps: 655360});
    //var unthrottle = throttle(readStream, {bps:(200/10) * 1.4}); 
	//readStream.pipe(t);
	
	// just some sample code
	/*window.setInterval(function() {
    // Send off data when nothing is buffered.
    if (socket.bufferedAmount == 0) {
      socket.send(new Blob([blob1, blob2])); // presumably image data.
    }
	}, 50); // rate limit us.*/
	
	// sort of works a bit (ish!)
	/*var t = new throttle({bps: 64000});
	readStream.pipe(t);*/
	
	var count = 0;
	readStream.on('data', function(data) {
	//slowStream.on('data', function(data) {
		count++;
        console.log("Type: "+typeof data+", Size: "+data.length+", Total: "+total);
		console.log('Sending chunk of data: '+count);
		
		//if(count == 3)
		//	ws.send(data, {binary: true, mask: false});
			
		// send to all connected clients
		console.log("Sending to "+clients.length+" clients");
		clients.forEach(function(client) {
			if(count == 100)
				client.send(data, {binary: true, mask: false});
		});
    });
	
	readStream.on('end', function() {
        //response.end();  
		console.log("END");
    });
//});
}

startPlaying();
  
console.log('Server running at http://127.0.0.1:8080/');