/*
	THOTH

	Developped for the TEXTaiLES Project

	@author: Stelios Alvanos
	ATHENA RC, DUTH
	steliosalvanos@gmail.com

===============================================*/
import UI from "./src/ui.js";
import Utils from "./src/utils.js";


// Realize 
let THOTH = ATON.App.realize();
window.THOTH = THOTH;

// Import
THOTH.UI = UI;
THOTH.Utils = Utils;


THOTH.setSceneToLoad = (sid) => {
	if (!sid) sid = THOTH.params.get('s');

	// Default
	if (!sid) sid = "samples/venus";

	THOTH._sidToLoad = sid;
};


THOTH.setup = () => {
	// Realize base ATON and add base UI events
    ATON.realize();
    ATON.UI.addBasicEvents();

	// On load
	THOTH.setupLogic();
};


THOTH.setupLogic = () => {
	ATON.on("AllFlaresReady", () => {
		if (THOTH._sidToLoad) THOTH.loadScene(THOTH._sidToLoad);
		else ATON.UI.showModal({
			header: "No Scene"
		});
	});

};

// THOTH.update = ()=>{
// };


// More...