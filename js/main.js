/*
	THOTH launch point

===============================================*/
// Realize 
let APP = ATON.App.realize();

// Add flares
//APP.requireFlares(["myFlare","anotherFlare"]);

APP.setup = ()=>{

	// Realize base ATON and add base UI events
    ATON.realize();
    ATON.UI.addBasicEvents();

	// Load sample 3D model
	ATON.createSceneNode("sample").load("samples/models/skyphos/skyphos.gltf").attachToRoot();

    // If our app required ore or more flares (plugins), we can also wait for them to be ready for specific setups
    ATON.on("AllFlaresReady",()=>{
		// Do stuff
		console.log("All flares ready");
	});
};

/* If you plan to use an update routine (executed continuously), you can place its logic here.
APP.update = ()=>{

};
*/
