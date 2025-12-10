let Layers = {};


Layers.setup = () => {
    // Init layers if undefined
    if (ATON.SceneHub.currData.layers === undefined) {
        ATON.SceneHub.currData.layers = {};
    }

    // Create layer map for easy access
    const layerGraph = ATON.SceneHub.currData.layers;
    Layers.layerMap = new Map();
    for (const name in layerGraph) {
        Layers.layerMap.set(name, layerGraph[name])
    };
};

// Utils



// Management

Layers.createLayer = (layerName) => {
    if (layerName === undefined) return;

    const layer = Layers.layerMap.get(layerName);

    // Resolve id conflict
    // if (layer !== undefined)
};

Layers.deleteLayer = (layerName) => {

};

Layers.resurrectLayer = (layerName) => {

};

Layers.editLayer = (layerName) => {

};


// Visibility

Layers.hideLayer = (layerName) => {
    if (layerName === undefined) return;

    const layer = Layers.layerMap.get(layerName);

    layer.visible = false;
};

Layers.showLayer = (layerName) => {
    if (layerName === undefined) return;

    const layer = Layers.layerMap.get(layerName);

    layer.visible = true;
};

Layers.toggleVisibility = (layerName) => {
    if (layerName === undefined) return;

    const layer = Layers.layerMap.get(layerName);
    if (layer === undefined) return;

    if (layer.visible) {
        Layers.hideLayer(layerName);
        return false;
    }
    else {
        Layers.showLayer(layerName);
        return true;
    }
};




export default Layers;