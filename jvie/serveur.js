var express = require('express.io');

var bodyParser = require('body-parser'); // Charge le middleware de gestion des paramètres
var urlencodedParser = bodyParser.urlencoded({ extended: false });

var taille = 24;
var nvisiteur = 1;
var timmer=10;
var grille = new Array();
var lstC = new Object();

function incCouleur( couleur ){
	if(typeof lstC[ couleur ] === 'undefined') { lstC[ couleur ] = 1;
	} else { lstC[ couleur ]++; }
}

for(i=1;i<=taille;i++){
	var nord = !(i==1), sud = !(i==taille);
	for(j=1;j<=taille;j++){
		var ouest = !(j==1), est = !(j==taille);
		if(Math.round(Math.random()*1)){ couleur = "ffffff";
		} else { couleur =  "000000"; }
		var point = new Object();
		point.couleur = couleur;
		var voisin = new Array();
		voisin.push( grille.length );
		if( nord && ouest){ voisin.push(grille.length - taille - 1); };
		if( nord ){ voisin.push(grille.length - taille); };
		if( nord && est){ voisin.push(grille.length - taille + 1); };
		if( ouest){ voisin.push(grille.length - 1); };
		if( est){ voisin.push(grille.length + 1); };
		if( sud && ouest){ voisin.push(grille.length + taille - 1); };
		if( sud ){ voisin.push(grille.length + taille); };
		if( sud && est){ voisin.push(grille.length + taille + 1); };
		point.voisines = voisin;
		grille.push( point );
		incCouleur( couleur );
} };

var app = require('express.io')();
app.http().io();

app.io.route('arrive', function(req) {
	pseudo = req.data.pseudo;
	req.io.emit('numero', pseudo+nvisiteur++ );
});

app.io.route('switch', function(req) {
	indice = req.data.indice;
	couleur = req.data.couleur;
	
	lstC[ grille[ indice ].couleur ]--;
	grille[ indice ].couleur = couleur;
	incCouleur( couleur );
	
	faireEvoluerLesVoisines(indice);

	req.io.broadcast('reponse', grille );
	req.io.emit('reponse', grille );
	
	req.io.emit('score', lstC );
});

app.use('/public', express.static(__dirname + '/public'));

app.get('/', function(req, res) {
	res.render('plateau.ejs', {taille: taille, grille: grille });
});

app.listen(8080);

function faireEvoluerLesVoisines( indice, couleur ){
	grille[indice].voisines.forEach( vieOuMeurt );
	return;
}

function vieOuMeurt( element, index, array ) {
if(element!=array[0]){
	caseRef = array[ 0 ];
	var couleur = grille[ caseRef ].couleur;
	var voisines = 0;
	grille[ element ].voisines.forEach( function(e, i, array){
		if( i>0 && grille[e].couleur != 'ffffff' ){ voisines++; }
		});
	//    Une cellule morte possédant exactement trois voisines vivantes devient vivante (elle naît).
	if(grille[ element ].couleur == "ffffff" && voisines == 3 ){
		lstC[ grille[ element ].couleur ]--;
		grille[ element ].couleur = couleur;
		incCouleur( couleur ); }
	//    Une cellule vivante possédant deux ou trois voisines vivantes le reste, sinon elle meurt.
	if(grille[ element ].couleur != "ffffff" && ( voisines < 2 || voisines > 3 ) ){
		lstC[ grille[ element ].couleur ]--;
		grille[ element ].couleur = "ffffff";
		incCouleur( 'ffffff' ); }
}
}

function fnCallBack(){
	couleur='000000'; min = 0;
	for( var i in lstC){
		if(( min == 0 )||( lstC[i] < min )){
			min = lstC[i];
			couleur=i;
		}
	}
	for(i=0;i<(taille*taille);i++){
		if(grille[i].couleur == couleur){indRef=i;}
	}
	var ensemble = new Array();
	ensemble.push( indRef );
	for(i=1;i<taille;i++){
		pt = Math.round(Math.random()*(taille*taille - 1));
		ensemble.push( pt );
	}
	ensemble.forEach( vieOuMeurt );

	app.io.broadcast('reponse', grille );
	app.io.broadcast('score', lstC );

	return;
}
setInterval(fnCallBack, timmer*1000);
