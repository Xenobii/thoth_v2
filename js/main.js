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
import SVP from "./src/svp.js";
import Layers from "./src/layers.js";
import Models from "./src/models.js";
import FE from "./src/fe.js";


// Realize 
let THOTH = ATON.App.realize();
window.THOTH = THOTH;


// Import
THOTH.UI      = UI;
THOTH.Utils   = Utils;
THOTH.Scene   = Scene;
THOTH.Toolbox = Toolbox;
THOTH.History = History;
THOTH.Events  = Events;
THOTH.SVP     = SVP;
THOTH.Models  = Models;
THOTH.Layers  = Layers;
THOTH.FE      = FE;


THOTH.BASE_URL        = "../thoth_v2";
THOTH.PATH_RES        = `${THOTH.BASE_URL}/js/res/`;
THOTH.PATH_RES_ICONS  = `${THOTH.BASE_URL}/js/res/icons/`;
THOTH.PATH_RES_SCHEMA = `${THOTH.BASE_URL}/js/res/schema/`;



// Init 

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
        THOTH.Models.setup();
        THOTH.Layers.setup();
        THOTH.FE.setup();
        
        THOTH.initRC();

        THOTH._bLoaded = true;
        THOTH.updateVisibility();
    });
};

THOTH.update = () => {
	if (THOTH._bPauseQuery) return;
    
    THOTH._queryData = ATON._queryDataScene;
    
    THOTH.hoveredModel = THOTH._queryData?.o?.parent?.parent?.name;
    THOTH.hoveredMesh  = THOTH._queryData?.o?.name;
};

THOTH.initRC = () => {
    // Use new raycaster
    THOTH._raycaster = new THREE.Raycaster();
    THOTH._raycaster.layers.set(THOTH.RCLayer);
    THOTH._raycaster.firstHitOnly = true;
};

THOTH.parseAtonElements = () => {
	// General
	THOTH.on	= ATON.on;
	THOTH.fire 	= ATON.fire;

	THOTH._renderer	= ATON._renderer;
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

THOTH.highlightSelection = (selection, highlightColor, modelName, meshName) => {
    if (selection === undefined || highlightColor === undefined||
        modelName === undefined || meshName === undefined) return;

    const meshes = THOTH.Models.getModelMeshes(modelName);
    const mesh   = meshes.get(meshName);

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

THOTH.highlightAllLayers = () => {
    // All layers
    for (const [ , layer] of THOTH.Layers.layerMap) {
        if (layer.trash) return;
        if (layer.visible === false) return;
        
        const selection      = layer.selection;
        const highlightColor = THOTH.Utils.hex2rgb(layer.highlightColor);
        for (const modelName of Object.keys(selection)) {
            for (const meshName of Object.keys(selection[modelName])) {
                THOTH.highlightSelection(
                    selection[modelName][meshName],
                    highlightColor,
                    modelName,
                    meshName
                );
            }
        }
    }
};

THOTH.clearHighlights = () => {
    for (const modelName of THOTH.Models.modelMap.keys()) {
        const meshes = THOTH.Models.getModelMeshes(modelName)
        for (const mesh of meshes.values()) {
            const colorAttr  = mesh.geometry.attributes.color;
            const colorArray = colorAttr.array;
            for (let i=0; i < colorArray.length; i++) {
                colorArray[i] = 1;
            }
            colorAttr.needsUpdate = true;
        }
    }
};

THOTH.updateVisibility = () => {
    THOTH.clearHighlights();
    THOTH.highlightAllLayers();
};


// Texture Maps

// TODO: update this for multi-mesh
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

THOTH.removeNormalMap = (mesh) => {
    if (mesh === undefined) mesh = THOTH.Scene.mainMesh;
    const mat = mesh.material;

    if (mat.normalMap) {
        mat.normalMap.dispose();
        mat.normalMap = null;
        mat.needsUpdate = true;
        THOTH.updateVisibility(mesh);
    }
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

THOTH.collabExists = () => {
    // placeholder logic
    return false;
};
