

var Mplayer=require('node-mplayer'),
	fs = require('fs'),
	readline = require('readline'),
	readChunk = require('read-chunk'), 
	fileType = require('file-type'),
	colors = require('colors'),
	path  = require('path'),
	cp = require('child_process'),
 	express  = require('express'),
    app      = express(),     
 	server = require('http').Server(app),
	path =require('path');
 	



var playNext=true , songsDir = '/Music' ,songs=[] /*Playlist*/ ,i =0 ,dispSongs = [];


var mkdirSync = function (path) {
  try {
    fs.mkdirSync(path);
    console.log( songsDir.red + ' folder created. Add Songs to the folder'.red);
    process.exit(0);
  } catch(e) {
    if ( e.code != 'EEXIST' ) throw e;
  }
};

mkdirSync('.'+songsDir);

console.log('\n Searching Song in '.green  + songsDir.yellow + ' folder... \n'.green);



var files = fs.readdirSync('.' +songsDir); // Read all files

for(var j=0,len= files.length;j<len;j++){

	files[j] = '.'+songsDir+'/'+files[j];
	var validateIfMp3 = isMp3(files[j]);
    //console.log(files[j] + " isMp3 ? : " + validateIfMp3);
    if(validateIfMp3) songs.push(files[j]); // Push if file is MP3
}

function isMp3(mp3Src) { //Validate mp3 file
	var buffer = readChunk.sync(mp3Src, 0, 262);
	try {
		return fileType(buffer).ext === 'mp3';
	}catch(e){
		return false;
	}
}

console.log(' ' + songs.length.toString().yellow + ' Songs Found : \n'.green);


	for(var k=0;k<songs.length;k++){		
		dispSongs[k] = songs[k].replace('./Music/','');
		}

displayPlaylist();


function displayPlaylist(){

	var j=1;
	dispSongs.forEach(function(song){
		console.log( j.toString().red + ' : ' + song.yellow );
		j++;
	});
}

var player;	
var playNext = false;

function playSong(i) { // Play song of index i from songs[]

	if(i<0 || i>songs.length-1 ) {
		console.log('ERR: Plz enter valid song number'.red);
		return;
	}

	player= new Mplayer(songs[i]);
  	player.play();
  	player.once('end', function(){
  		
    // Play next song, if there is one,else StartOver
    	if (i < songs.length - 1){
    		
      			 if(playNext){
      			 	 i = i+1;
					playSong(i);
      				}
    			}else{
    				i=0;
    				playSong(i);
    			}  
    			
    			playNext = true;
  	});
  		


  	console.log('Now Playing: '.red + songs[i].replace('./Music/','').replace('.mp3','').yellow);
  	
}


///////// Command Line options////////

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', function(line){


if(line == 'stop') stop();

else if(line == 'resume') resume();

else if(line == 'pause') pause();

else if(line.indexOf('play')>-1) play(line);

else if(line.indexOf('setVolume')>-1) {
	line = line.replace('setVolume','');
	try{
		setVolume(parseInt(line));
	}catch(e){

	}
}

else if(line == 'next') next();

else if(line == 'prev') next();

else if(line == 'stopApp') stopApp();

else if(line == 'list') {
	displayPlaylist();
}

else if(line.indexOf('seek')>-1) {
	line = line.replace('seek','');
	try{
		seek(parseInt(line));
	}catch(e){

	}
}

else console.log('ERR : Wrong command...'.red + '\nCommands: play [songNumber] , pause ,resume , next , stopApp , stop, setVolume [percent] '.blue);

});

//*******************************//

function stop(){
	player.stop();
}

function pause(){
	player.pause();
}
	

function resume(){
	player.pause();
}

function play(line){
		playNext=false;
	line = line.replace('play','');
	if(line) {
		try {
			if(player) player.stop();
			playSong(parseInt(line) - 1 ); 
			i =parseInt(line) - 1 ;
		}catch(e){
			if(player) player.stop();
			console.log('ERR : play argument should be INT'.red);
			playSong(0);
		} 
	}else playSong(0);
	//setTimeout(function(){playNext=true},3000);
}

function prev(){

	playNext=false;
	if(i > 0) {
		playSong(i-1);
		i=i-1;
		if(player) player.stop();
	}else{
		console.log('Cannot Prev');
	}

	
}

function next(){
	playNext=false;

	if(player) player.stop();
	i = i+1;
	playSong(i);

}
	

function stopApp(){
	process.exit(0);
}

function setVolume(volume){
player.setVolume(volume);
}

function seek(sec){


player.getTimeLength(function(length){
	check(length);
});

	function check(length){
		//console.log(length);
		if(sec < length) player.seek(length);

		else console.log('Cannot Seek '+ sec.toString() + 'Song length is '+length.toString() );
	}

}
/////////////// Express ////////////


 app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
  

    app.listen(8080);
    console.log("App listening on port 8080");


    app.get('/play/:song_no', function(req, res) {
    	i= req.params.song_no;
    	playNext=false;
    	if(player) player.stop();
     	playSong(req.params.song_no - 1);
     	res.send(JSON.stringify({'song':i , 'action':'play'}));
    });
     
    app.get('/pause', function(req, res) { 	
     	pause();   
     	res.send(JSON.stringify({'song':i , 'action':'pause'}));
    });



    app.get('/stop', function(req, res) {
    	res.send(JSON.stringify({'song':i , 'action':'stop'}));
     	stop();      
    });

    app.get('/setvolume/:vol', function(req, res) {
     	  setVolume(req.params.vol);  
     	   res.send(JSON.stringify({'song':i , 'action':'setvolume'}));
    });


    app.get('/playlist', function(req, res) {
    	
     	res.send(JSON.stringify(dispSongs));  
    });