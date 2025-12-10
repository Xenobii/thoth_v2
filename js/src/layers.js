let Layers = {};

// Init

Layers.setup = () => {
    // Init layers if undefined
    if (ATON.SceneHub.currData.layers === undefined) {
        ATON.SceneHub.currData.layers = {};
    }

    // Create layer map for easy access
    const layerGraph = ATON.SceneHub.currData.layers;
    Layers.layerMap = new Map();
    for (const id in layerGraph) {
        Layers.layerMap.set(Number(id), layerGraph[id])
    };
};


// Management

Layers.createLayer = (layerId) => {
    if (layerId === undefined) return;

    const layer = Layers.layerMap.get(layerId);

    // Resolve id conflict
    if (layer !== undefined) {
        if (layer.trash === true) {
            Layers.resurrectLayer(layerId);
        }
        else {
            alert(`Layer id conflict ${layerId}`);
        }
    }

    // Build layer data
    const layerData = {
        id            : layerId,
        name          : `New Layer`,
        metadata      : {},
        selection     : {},
        visible       : true,
        highlightColor: THOTH.Utils.getHighlightColor(layerId),
        trash         : false
    };

    // Append to map
    Layers.layerMap.set(layerId, layerData);
};

Layers.deleteLayer = (layerId) => {
    if (layerId === undefined) return;

    const layer = Layers.layerMap.get(layerId);

    layer.trash = true;
    THOTH.Scene.activeLayer = undefined;

    THOTH.updateVisibility();
};

Layers.resurrectLayer = (layerId) => {
    if (layerId === undefined) return;

    const layer = Layers.layerMap.get(layerId);

    if (!layer.trash) return;
    
    layer.trash = false;
    THOTH.updateVisibility();
};

Layers.editLayer = (layerId, attr, value) => {
    if (layerId === undefined) return;
    
    const layer = Layers.layerMap.get(layerId);
    if (!layer) return;
    
    layer[attr] = value;
};

Layers.addToSelection = (layerId, selection) => {
    const layer = Layers.layerMap.get(layerId);

    const tempSelection = layer.selection || {};
    for (const modelName of Object.keys(selection)) {
        tempSelection[modelName] = tempSelection[modelName] || {};

        for (const meshName of Object.keys(selection[modelName])) {
            tempSelection[modelName][meshName] =
            [...THOTH.Toolbox.addFacesToSelection(selection[modelName][meshName], layer.selection[modelName][meshName])];
        }
    }  
    
    layer.selection = tempSelection;
    THOTH.updateVisibility();
};

Layers.delFromSelection = (layerId, selection) => {
    const layer = Layers.layerMap.get(layerId);

    const tempSelection = layer.selection || {};
    for (const modelName of Object.keys(selection)) {
        tempSelection[modelName] = tempSelection[modelName] || {};

        for (const meshName of Object.keys(selection[modelName])) {
            tempSelection[modelName][meshName] =
            [...THOTH.Toolbox.delFacesFromSelection(selection[modelName][meshName], layer.selection[modelName][meshName])];
        }
    }  

    layer.selection = tempSelection;
    THOTH.updateVisibility();
};

Layers.changeLayerSchema = (layerId, schemaName) => {
    const layer = Layers.layerMap.get(layerId);
    layer.metadata.schemaName = schemaName;
};


// Visibility

Layers.hideLayer = (layerId) => {
    if (layerId === undefined) return;

    const layer = Layers.layerMap.get(layerId);

    layer.visible = false;
    THOTH.updateVisibility();
};

Layers.showLayer = (layerName) => {
    if (layerName === undefined) return;

    const layer = Layers.layerMap.get(layerName);

    layer.visible = true;
    THOTH.updateVisibility();
};

Layers.toggleVisibility = (layerId) => {
    if (layerId === undefined) return;

    const layer = Layers.layerMap.get(layerId);
    const layerControler = THOTH.FE?.layerMap.get(layerId);
    
    if (layer === undefined) return;
    
    if (layer.visible) {
        Layers.hideLayer(layerId);
        THOTH.FE.toggleControllerVisibility(layerControler, false);
    }
    else {
        Layers.showLayer(layerId);
        THOTH.FE.toggleControllerVisibility(layerControler, true);
    }
};


// Export

Layers.getExportData = () => {
    const layerObjects = Object.fromEntries(Layers.layerMap);

    if (layerObjects === undefined) return {}; 

    // Exclude trashed items
    for (const layerId in layerObjects) {
        if (layerObjects[layerId].trash === true) layerObjects.delete(layerId)
    }
    return layerObjects;
};



export default Layers;