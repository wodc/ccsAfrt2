function fnChangeCouleur(element, index, array) {
	$( "#nc_"+index ).css( "backgroundColor", "#"+element.couleur );
}

function fnBroadCast( data ){
	data.forEach( fnChangeCouleur );
}

function fnChangePseudo( nouveauPseudo ){
	$( '#pseudo' ).text( nouveauPseudo );
}

function fnScore( data ){
	
	var listeScore="<ul>"
	var l = new Array();

	for (couleur in data){
		score = data[couleur];
		if(score>0 && couleur != 'ffffff'){
			ss = new String( score );
			while(ss.length<4){ ss = '0'+ss; };
			l.push(ss+':'+couleur);
		}
	}
	l.sort();
	l.forEach( function(e,i,array){
		ch = e.split(':');
		score=parseInt(ch[0]);couleur=ch[1];
		listeScore = '<li class="score" style="background-color:#'+couleur+'">.</li>' + listeScore;
	});
	listeScore += "</ul>";
	$( '#score' ).html( listeScore );
}

var io = io.connect();
io.on('reponse', fnBroadCast);
io.on('numero', fnChangePseudo);
io.on('score', fnScore);

var hexDigits = new Array
        ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

//Function to convert hex format to a rgb color
function rgb2hex(rgb) {
 rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
 return hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
}

function hex(x) {
  return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
 }

function fnSwitch( img, indice ){
	var maCouleur  = rgb2hex( $('#couleur').css("background-color") );

	var bkcolor = new String( img.style.backgroundColor );
	var couleur  = rgb2hex( bkcolor );

	if( couleur == "ffffff" && maCouleur != 'ffffff' ){
		img.style.backgroundColor = "#"+maCouleur;
		io.emit('switch', { "indice": indice , "couleur": maCouleur });
	}
	if( maCouleur == 'ffffff' ){ $('#couleur').css("background-color", '#'+couleur ); }
}

function fnConnect( pseudo ){
	io.emit('arrive', { "pseudo": pseudo });
}
