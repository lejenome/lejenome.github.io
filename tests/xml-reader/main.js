"use strict";
var index = -1;
var _name = document.getElementById("input-nom");
var _prenom = document.getElementById("input-prenom");
var _about = document.getElementById("input-apropos");
var _country = document.getElementById("input-country");
var _city = document.getElementById("input-city");
var _zip = document.getElementById("input-zip");
var _sexe = document.getElementById("input-sexe");
var _set = document.getElementById("input-modifier");
var _new = document.getElementById("input-nouveau");
var _tab = document.getElementById("tab");
var i;
var personnes; // personnes element
var xml; // DOM document
function modifier(e) {
	// modifier les valeurs de la formulaire avec les valeur du element
	// personne et enregistrer son index
	index = e.currentTarget.parentElement.dataset.idx;
	var pers = personnes.children[index];
	_name.value = pers.getAttribute("name");
	_prenom.value = pers.getAttribute("prenom");
	_sexe.value = pers.getAttribute("sexe");
	_about.value = pers.getElementsByTagName("about")[0].textContent;
	_country.value = pers.getElementsByTagName("country")[0].textContent;
	_city.value = pers.getElementsByTagName("city")[0].textContent;
	_zip.value = pers.getElementsByTagName("zip")[0].textContent;
}
function supprimer(e) {
	// supprimer l'element personne avec l'index idx de l'element personnes
	var idx = e.currentTarget.parentElement.dataset.idx;
	personnes.removeChild(personnes.children[idx]);
	buildTab();
}
function buildTab() {
	// pour chaque personne on ajoute une ligne au tableau avec
	// supprimer/modifier bouttons
	var nom, prenom, supp, modi, apropos, tr, pers, sexe, address;
	_tab.innerHTML = "";
	for( i = 0; i < personnes.children.length; i++) {
		pers = personnes.children[i];
		tr = document.createElement("tr");
		nom = document.createElement("td");
		prenom = document.createElement("td");
		sexe = document.createElement("td");
		apropos = document.createElement("td");
		address = document.createElement("td");
		supp = document.createElement("td");
		modi = document.createElement("td");
		// sauvegarder l'index
		tr.dataset.idx = i;
		nom.textContent = pers.getAttribute("name");
		prenom.textContent =pers.getAttribute("prenom");
		sexe.textContent = pers.getAttribute("sexe");
		apropos.textContent = pers.getElementsByTagName("about")[0].textContent;
		address.textContent = pers.getElementsByTagName("country")[0].textContent + " - "+
			pers.getElementsByTagName("city")[0].textContent + " - "+
			pers.getElementsByTagName("zip")[0].textContent;
		supp.textContent = "supprimer";
		supp.className = "supprimer";
		modi.textContent = "modifier";
		modi.className = "modifier";
		supp.onclick = supprimer;
		modi.onclick = modifier;
		tr.appendChild(nom);
		tr.appendChild(prenom);
		tr.appendChild(sexe);
		tr.appendChild(apropos);
		tr.appendChild(address);
		tr.appendChild(supp);
		tr.appendChild(modi);
		_tab.appendChild(tr);
	}
}
var xhr = new XMLHttpRequest();
xhr.open("get","data.xml");
xhr.onload= function() {
	if(this.status === 200) {
		parseXML(this.responseText);
	}
};
xhr.send();
_new.onclick= function () {
	// ajouter un nouveau personne element à personnes element avec les
	// valeurs du formulaire
	var pers = xml.createElement("personne");
	var about = xml.createElement("about");
	var address = xml.createElement("address");
	var city = xml.createElement("city");
	var country = xml.createElement("country");
	var zip = xml.createElement("zip");
	pers.setAttribute("name", 	_name.value);
	pers.setAttribute("prenom", 	_prenom.value);
	pers.setAttribute("sexe", 	_sexe.value);
	about.textContent = _about.value;
	country.textContent = _country.value;
	city.textContent = _city.value;
	zip.textContent = _zip.value;

	address.appendChild(country);
	address.appendChild(city);
	address.appendChild(zip);
	pers.appendChild(about);
	pers.appendChild(address);
	personnes.appendChild(pers);
	index = personnes.children.length -1;
	addLastModified();
	buildTab();
};
_set.onclick = function() {
	// modifier l'element personne à l'index avec les valeur du formulaire
	if(index < 0)
		return;
	var pers = personnes.children[index];
	pers.setAttribute("name", 	_name.value);
	pers.setAttribute("prenom", 	_prenom.value);
	pers.setAttribute("sexe", 	_sexe.value);
	pers.getElementsByTagName("about")[0].textContent = 	_about.value;
	pers.getElementsByTagName("country")[0].textContent = 	_country.value;
	pers.getElementsByTagName("city")[0].textContent = 	_city.value;
	pers.getElementsByTagName("zip")[0].textContent = 	_zip.value;
	addLastModified();
	buildTab();
};
function parseXML(txt) {
	// transformer XML text to DOM document si il est valide
	var parser = new DOMParser();
	var dom = parser.parseFromString(txt, "application/xml");
	if(dom.documentElement.nodeName === "parsererror") {
		alert("Fichier XML non valide\n" +
				dom.documentElement.textContent);
		return;
	}
	xml = dom;
	personnes = xml.documentElement;
	buildTab();
}
document.getElementById("input-importer").onchange = function() {
	// slectioner et lire le contenu d'un fichier xml
	if(this.files.length === 0)
		return;
	var reader = new FileReader();
	reader.onload = function(e) {
		parseXML(e.target.result);
	};
	reader.readAsText(this.files[0]);
};
var head = '<?xml version="1.0" encoding="UTF-8" standalone="no"?>' +
	'<personnes>';
document.getElementById("input-exporter-xml").onclick = function () {
	// creer data address à un xml object file
	window.location = "data:text/xml;base64," +
		btoa(head + personnes.innerHTML + "</personnes>");
};
document.getElementById("input-exporter-html").onclick = function () {
	// creer data address à un html object file
	var html= '<!DOCTYPE html><html><head><title>Personnes</title></head>'+
		'<body><h1>Personnes: </h1>'+
		'<table><tr><th>Nom</th><th>Prenom</th><th>Sexe</th><th>A Propos</th>'+
		'<th>Address</th></tr><tbody>';
	for(i=0; i < personnes.children.length; i++) {
		var pers = personnes.children[i];
		html += '<tr><td>' + pers.getAttribute("name");
		html += '</td><td>'+ pers.getAttribute("prenom");
		html += '</td><td>'+ pers.getAttribute("sexe");
		html += '</td><td>'+ pers.getElementsByTagName("about")[0].textContent;
		html += '</td><td>'+ pers.getElementsByTagName("country")[0].textContent + " - "+
			pers.getElementsByTagName("city")[0].textContent + " - "+
			pers.getElementsByTagName("zip")[0].textContent;
		html += '</td></tr>';
	}
	html += '</tbody></table></body></html>';
	window.location = "data:text/html;base64," + btoa(html);
};
function addLastModified() {
	// add Last Modifiedd info on comment on top of personnes elements
	while(personnes.childNodes[0].nodeName=== "#comment")
		personnes.removeChild(personnes.childNodes[0]);
	personnes.insertBefore(
			xml.createComment("Last Modified:" + (new Date()).toString()),
			personnes.childNodes[0]);
}
