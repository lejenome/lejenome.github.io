"use strict";

var i;
var butts = document.getElementById("settings-buttons").childNodes;

for(i=0; i < butts.length; i++) {
	butts[i].addEventListener("click", buttClick);
}

function buttClick(e) {
	/* jshint validthis: true */
	var frame = document.getElementById("settings-frame");
	if(frame) {
		frame.remove();
	}
	frame = document.createElement("iframe");
	frame.id = "settings-frame";
	frame.src = this.id.replace("-settings", "") + ".html";
	document.body.appendChild(frame);
	return false;
}
