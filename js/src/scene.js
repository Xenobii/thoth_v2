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

    const getMainMesh = () => {
        let mesh = null;
        Scene.root.traverse(obj => {
            if (obj.isMesh && !mesh) {
                mesh = obj;
                // console.log(mesh)
            }
        });
        return mesh;
    };
    Scene.mainMesh = getMainMesh();
    
    Scene.importLayers();
    
    Scene.activeLayer = undefined;
};


// Import/Export

Scene.importLayers = () => {
    console.log("Importing annotation layers...");

    const layers = Scene.currData.layers;
    if (layers === undefined) return

    // Convert layer selections from arrays to sets
    Object.values(layers).forEach((layer) => {
        if (layer.selection === undefined) return;
        layer.selection = new Set(layer.selection);
    });
};

Scene.exportLayers = () => {

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
        selection       : new Set(),
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

    if (layers !== undefined) {
        Object.values(Scene.currData.layers).forEach((layer) => {
            layer.selection = new Set(layer.selection);
        });
    }

    THOTH._bSynced = true;
};


export default Scene;