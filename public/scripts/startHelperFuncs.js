function fancyFadeGameStart(gameEl, splashEl) {
	gameEl.style.display = "none";
	splashEl.style.opacity = 1;
	let fadeOut = setInterval(function() {
		splashEl.style.opacity -= 0.01;
		if (splashEl.style.opacity <= 0) {
			gameEl.style.opacity = 0;
			gameEl.style.display = "block";
			// if width/h are specified, need to match server
			makeGame(document.getElementById("gameHook"));
			let fadeIn = setInterval(function() {
				// -= works but not += w/o parsing (tries to concat)
				gameEl.style.opacity = parseFloat(gameEl.style.opacity) + 0.01;
				if (gameEl.style.opacity >= 1) clearInterval(fadeIn);
			}, 10);
			clearInterval(fadeOut);
		}
	}, 10);
}
function get(param) {
	let url = window.location.href;
	url = url.split("?")[1].split("=");
	return url.indexOf(param) < 0 ? undefined : url[url.indexOf(param) + 1];
}
