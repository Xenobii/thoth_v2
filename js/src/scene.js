/*===========================================================================

    THOTH
    Scene Components

    Author: steliosalvanos@gmail.com

===========================================================================*/
let Scene = {};


// Setup

Scene.setup = (sid) => {
    Scene.id        = sid;
    Scene.root      = ATON._rootVisible;
    Scene.currData  = ATON.SceneHub.currData;
    
    Scene.MODE_ADD  = 0;
    Scene.MODE_DEL  = 1;

    const getMainMesh = () => {
        let mesh = null;
        Scene.root.traverse(obj => {
            if (obj.isMesh && !mesh) {
                mesh = obj;
            }
        });
        return mesh;
    };
    Scene.mainMesh = getMainMesh();
    
    Scene.activeLayer = undefined;
};


// Import/Export

Scene.exportLayers = () => {
    console.log("Exporting changes...");

    let A = {};
    A.layers = structuredClone(Scene.currData.layers);
    A.objectDescriptor = structuredClone(Scene.currData.objectDescriptor);

    // Remove all annotation objects and ADD them again with changes
    Scene.patch(A, THOTH.Scene.MODE_DEL, () => {});
    
    // Patch changes
    Scene.patch(A, THOTH.Scene.MODE_ADD, () => {
        console.log("Success!");
    });
};


Scene.patch = (patch, mode, onComplete)=>{
    if (patch === undefined) return;
    if (mode === undefined) mode = Scene.MODE_ADD;

    let sid = Scene.id;

    let O = {};
    O.data = patch;
    O.mode = (mode === Scene.MODE_DEL)? "DEL" : "ADD";

    let jstr = JSON.stringify(O);

    patch = null;
    O = null;

    $.ajax({
        url: ATON.PATH_RESTAPI2 + "scenes/"+sid,
        type:"PATCH",
        data: jstr,
        contentType:"application/json; charset=utf-8",
        dataType:"json",

        success: (r)=>{
            if (r) Scene.currData = r;
            if (onComplete) onComplete();
        }
    });
};

// Layer Management

Scene.createLayer = (id) => {
    if (id === undefined) return;

    const layers = Scene.currData.layers;

    // Resolve id conflict
    if (layers[id] !== undefined) {
        if (layers[id].trash === true) {
            Scene.resurrectLayer(id);
            return;
        }
        else {
            alert("Id conflict");
            return;
        }
    };

    let layer = {
        id              : id,
        name            : "New Layer",
        description     : " ",
        selection       : [],
        visible         : true,
        highlightColor  : THOTH.Utils.getHighlightColor(id),
        trash           : false
    };
    
    layers[id] = layer;
};

Scene.deleteLayer = (id) => {
    if (id === undefined) return;

    let layers = Scene.currData.layers;
    let layer  = layers[id];
    
    // Move layer to trash
    layer.trash = true;
    Scene.activeLayer = undefined;

    // Update visuals
    THOTH.updateVisibility();
};

Scene.resurrectLayer = (id) => {
    if (id === undefined) return;

    const layers = Scene.currData.layers;
    const layer = layers[id];

    if (!layer.trash) return;

    // Remove from trash
    layer.trash = false;

    // Update visuals
    THOTH.updateVisibility();
};

Scene.editLayer = (id, attr, value) => {
    if (id === undefined || attr === undefined) return;
    
    const layer = Scene.currData.layers?.[id];
    if (!layer) return;

    if (value === undefined) value = layer[attr];

    // Edit layer
    layer[attr] = value;
};


// Photon

Scene.syncScene = (layers) => {
    Scene.currData.layers = layers;
    if (layers === undefined) return;
    
    Object.values(layers).forEach(layer => {
        THOTH.UI.createLayer(layer.id);
    });

    THOTH.updateVisibility();
};


export default Scene;