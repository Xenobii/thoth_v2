/*===========================================================================

    THOTH
    Launch Point

    Author: steliosalvanos@gmail.com

===========================================================================*/
import UI from "./src/ui.js";
import Utils from "./src/utils.js";
import Scene from "./src/scene.js";
import Toolbox from "./src/toolbox.js";
import History from "./src/history.js";
import Events from "./src/events.js";


// Realize 
let THOTH = ATON.App.realize();
window.THOTH = THOTH;


// Import
THOTH.UI 		= UI;
THOTH.Utils 	= Utils;
THOTH.Scene 	= Scene;
THOTH.Toolbox 	= Toolbox;
THOTH.History   = History;
THOTH.Events	= Events;


THOTH.BASE_URL          = "../thoth_v2";
THOTH.PATH_RES_ICONS    = `${THOTH.BASE_URL}/js/res/`;
THOTH.PATH_RES_ICONS    = `${THOTH.BASE_URL}/js/res/icons/`;
THOTH.PATH_RES_SCHEMA   = `${THOTH.BASE_URL}/js/res/schema/`;



THOTH.setSceneToLoad = () => {
	const sid = THOTH.params.get('s');
	THOTH._sidToLoad = sid;
};

THOTH.setup = () => {
    THOTH._bLoaded = false;

	// Realize base ATON and add base UI events
    ATON.realize();
    ATON.UI.addBasicEvents();

	// Load Scene
	ATON.on("AllFlaresReady",  () => {
        if (THOTH._sidToLoad) THOTH.loadScene(THOTH._sidToLoad);
		else ATON.UI.showModal({
            header: "Invalid Scene Id"
		});
	});
    
    // Setup THOTH modules
    ATON.on("AllNodeRequestsCompleted", () => {
        if (THOTH._bLoaded) return;

        THOTH.parseAtonElements();
        
        THOTH.Scene.setup(THOTH._sidToLoad);
        THOTH.Events.setup();
        THOTH.History.setup();
        THOTH.Toolbox.setup();
        THOTH.UI.setup();
        
        THOTH.initRC();
        if (!THOTH.Scene.currData.layers) {
            THOTH.Scene.currData.layers = {};
        };

        THOTH._bLoaded = true;
    });
};

THOTH.update = () => {
	if (THOTH._bPauseQuery) return;

    THOTH._queryData = ATON._queryDataScene;
};

THOTH.initRC = (mesh) => {
    if (mesh === undefined) mesh = THOTH.Scene.mainMesh;

    // Raycaster
    THOTH._raycaster = new THREE.Raycaster();
    THOTH._raycaster.layers.set(THOTH.RCLayer);
    THOTH._raycaster.firstHitOnly = true;

    if (!mesh.geometry.boundsTree) {
        console.log("No bounds tree, computing bounds tree");
        mesh.geometry.computeBoundsTree();
    }

    // Color propertied for face selection
    mesh.material.vertexColors = true;
    mesh.material.needsUpdate  = true;

    // Initialize vertex colors if they don't exist
    if (!mesh.geometry.attributes.color) {
        let colorArray, colorAttr;
        
        const defaultColor = new THREE.Color(0xffffff);

        colorArray = new Float32Array(mesh.geometry.attributes.position.count * 3);
        for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
            colorArray[i * 3 + 0] = defaultColor.r;
            colorArray[i * 3 + 1] = defaultColor.g;
            colorArray[i * 3 + 2] = defaultColor.b;
        }

        colorAttr = new THREE.BufferAttribute(colorArray, 3);
        
        mesh.geometry.setAttribute('color', colorAttr);
    }
};

THOTH.parseAtonElements = () => {
	// General
	THOTH.on	= ATON.on;
	THOTH.fire 	= ATON.fire;

	THOTH._renderer	= ATON._renderer;
	THOTH._rcScene	= ATON._rcScene;
    THOTH._rcLayer  = ATON.NTYPES.SCENE
    THOTH._camera   = ATON.Nav._camera;

	// Photon
	THOTH.onPhoton		= ATON.Photon.on;
	THOTH.firePhoton	= ATON.Photon.fire;

    // Nav
    THOTH.setUserControl = ATON.Nav.setUserControl;

	// Utils
	THOTH.textureLoader	= ATON.Utils.textureLoader;
    THOTH.discardAtonEventHandler = ATON.EventHub.clearEventHandlers;
};


// Visualization

THOTH.highlightSelection = (selection, highlightColor, mesh) => {
    if (selection?.size === 0) return;
    if (mesh === undefined) mesh = THOTH.Scene.mainMesh;
    
    const colorAttr = mesh.geometry.attributes.color;
    const indexAttr = mesh.geometry.index;
    const colors    = colorAttr.array;
    const stride    = colorAttr.itemSize;
    
    const r = highlightColor.r;
    const g = highlightColor.g; 
    const b = highlightColor.b;
    
    if (indexAttr) {
        const indices = indexAttr.array;
        for (const face of selection) {
            const face3 = face * 3;
            
            const idx0  = indices[face3] * stride;
            const idx1  = indices[face3 + 1] * stride;
            const idx2  = indices[face3 + 2] * stride;
            
            colors[idx0]        = r;
            colors[idx0 + 1]    = g;
            colors[idx0 + 2]    = b;
            
            colors[idx1]        = r;
            colors[idx1 + 1]    = g;
            colors[idx1 + 2]    = b;
            
            colors[idx2]        = r;
            colors[idx2 + 1]    = g;
            colors[idx2 + 2]    = b;
        }
    } else {
        const stride3 = stride * 3;
        for (const face of selection) {
            const faceStart = face * stride3;
            
            colors[faceStart]       = r;
            colors[faceStart + 1]   = g;
            colors[faceStart + 2]   = b;
            
            colors[faceStart + stride]      = r;
            colors[faceStart + stride + 1]  = g;
            colors[faceStart + stride + 2]  = b;
            
            colors[faceStart + stride * 2]      = r;
            colors[faceStart + stride * 2 + 1]  = g;
            colors[faceStart + stride * 2 + 2]  = b;
        }
    }
    
    colorAttr.needsUpdate = true;
};

THOTH.highlightAllLayers = (mesh) => {
    if (mesh === undefined) mesh = THOTH.Scene.mainMesh;
    
    // All layers
    const layers = THOTH.Scene.currData.layers;
    if (layers === undefined) return;
    
    Object.values(layers).forEach((layer) => {
        if (layer.trash) return;
        if (!layer.visible) return;
        
        const selection      = layer.selection;
        const highlightColor = THOTH.Utils.hex2rgb(layer.highlightColor);

        THOTH.highlightSelection(selection, highlightColor, mesh);
    });
};

THOTH.clearHighlights = (mesh) => {
    if (mesh === undefined) mesh = THOTH.Scene.mainMesh;
    
    const colorAttr     = mesh.geometry.attributes.color;
    const colorArray    = colorAttr.array;

    for (let i=0; i < colorArray.length; i++) {
        colorArray[i] = 1;
    }

    colorAttr.needsUpdate = true;
};

THOTH.updateVisibility = (mesh) => {
	if (mesh === undefined) mesh = THOTH.Scene.mainMesh;
    THOTH.clearHighlights(mesh);
    THOTH.highlightAllLayers(mesh);
};

THOTH.toggleLayerVisibility = (id) => {
    const layer = THOTH.Scene.currData.layers[id];

    if (layer === undefined) return;

    if (layer.visible === false) layer.visible = true;
    else if (layer.visible === true) layer.visible = false;

    THOTH.updateVisibility();

    return layer.visible;
};


// Texture Maps

THOTH.updateNormalMap = (path, mesh, intensity = 10) => {
    if (!path) return false;
	if (mesh === undefined) mesh = THOTH.Scene.mainMesh; 

    THOTH.textureLoader.load(path, (tex)=>{
        const mat = mesh.material;

        if (mat.normalMap) {
            mat.normalMap.image = tex.image;
        }
        else {
            mat.normalMap       = tex;
            mat.normalMap.flipY = false;
            mat.normalMap.wrapS = mat.map.wrapS;
            mat.normalMap.wrapT = mat.map.wrapT;
            mat.normalScale.set(intensity, intensity);
            // mat.normalScale.set(intensity, -intensity);
        }
        mat.normalMap.needsUpdate   = true;
        mat.needsUpdate             = true;
        THOTH.updateVisibility(mesh);
    });
};

THOTH.updateTextureMap = (path, mesh) => {
    if (!path) return false;
	if (mesh === undefined) mesh = THOTH.Scene.mainMesh; 

    THOTH.textureLoader.load(path, (tex)=>{
        const mat = mesh.material;

        if (mat.map) {
            mat.map.image = tex.image;
        }
        else {
            mat.map = tex;
            mat.map.wrapS = mat.map.wrapS;
            mat.map.wrapT = mat.map.wrapT;
        }
        mat.map.needsUpdate = true;
        mat.needsUpdate     = true;
        THOTH.updateVisibility(mesh);
    });
};


// Photon

THOTH.setupPhoton = () => {
    ATON.Photon.connect();
    THOTH.connected = true;
};
