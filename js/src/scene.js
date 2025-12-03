/*===========================================================================

    THOTH
    Scene Components

    Author: steliosalvanos@gmail.com

===========================================================================*/
let Scene = {};


// Setup

Scene.setup = (sid) => {
    Scene.id       = sid;
    Scene.root     = ATON._rootVisible;
    Scene.currData = ATON.SceneHub.currData;
    
    // Models
    Scene.modelMap = Scene.getSceneModels(Scene.root.children);
    
    // Maps
    // Scene.normalMapPath = ATON.Utils.resolveCollectionURL(Scene.modelFolder + "/normal_map.png");

    // Colmap
    // Scene.colmapCamPath = ATON.Utils.resolveCollectionURL(Scene.modelFolder + "/colmap/images.txt")

    Scene.MODE_ADD  = 0;
    Scene.MODE_DEL  = 1;

    Scene.getSchemaJSON();
    // Scene.readColmap();
    
    Scene.activeLayer = undefined;
};


Scene.getSceneModels = (children) => {
    const getAllMeshes = (model) => {
        let meshes = new Map();
        model.traverse(obj => {
            if (obj.isMesh) {
                meshes.set(obj.name, obj);
            }
        })
        return meshes;
    }

    let sceneModels = new Map();
    for (const model of children) {
        if (model.name !== "") {
            const model_data = {
                "url"    : model._reqURLs,
                "meshes" : getAllMeshes(model),
                "visible": model.visible
            }
            sceneModels.set(model.name, model_data);
        }
    }
    console.log("Found", sceneModels.size, "models.");
    return sceneModels;
};


// Data schema

Scene.getSchemaJSON = () => {
    $.getJSON(THOTH.PATH_RES_SCHEMA + "annotation_schema.json", (data) => {
        let check = Scene.validateSchema(data);
        if (!check && THOTH.UI._elToast !== undefined) THOTH.UI.showToast("METADATA CREATION FAILED, INVALID METADATA SCHEMA", 10000);
        
        Scene.currData.objectMetadata = Scene.createPropertiesfromSchema(data);
    });
};

Scene.validateSchema = (data) => {
    let check = true;

    for (const key in data) {
        if (key === "required") continue;

        const attr = data[key];
        if (attr["type"]) {
            switch (attr.type.toLowerCase()) {
                case "string":
                    break;
                case "integer":
                    break;
                case "float": 
                    break;
                case "bool": 
                    break;
                case "enum":
                    break;
                case "enum-multiple": 
                    break;
                default:
                    check = false;
            }
        }
        else if (typeof attr === "object") {
            check = Scene.validateSchema(attr);
        }
        else check = false;
    }
    return check;
};

Scene.createPropertiesfromSchema = (data) => {
    // Annotation object
    let A = {};

    for (const key in data) {
        if (key === "required") continue;

        const attr = data[key];
        if (attr["type"]) {
            switch (attr.type.toLowerCase()) {
                case "string":
                    A[key] = "-";
                    break;
                case "integer":
                    A[key] = 0;
                    break;
                case "float": 
                    A[key] = 0.0;
                    break;
                case "bool": 
                    A[key] = false;
                    break;
                case "enum":
                    A[key] = "-";
                    break;
                case "enum-multiple": 
                    A[key] = [];
                    break;
                default: 
                    A[key] = null;
                    break;
            }
        }
        else if (typeof attr === "object") {
            A[key] = Scene.createPropertiesfromSchema(attr);
        }
    }
    return A;
};


// Import/Export

Scene.exportLayers = () => {
    console.log("Exporting changes...");

    let A = {};
    A.layers = structuredClone(Scene.currData.layers);
    // Exclude trash items
    for (const id in A.layers) {
        if (A.layers[id].trash === true) delete A.layers[id];
    }

    A.objectMetadata = structuredClone(Scene.currData.objectMetadata);

    // Remove all annotation objects and ADD them again with changes
    Scene.patch(A, Scene.MODE_DEL, () => {});
    
    // Patch changes
    Scene.patch(A, Scene.MODE_ADD, () => {
        if (THOTH.UI._elToast !== undefined) THOTH.UI.showToast("Changes exported successfully");
        console.log("Changes exported successfully");
    }, (error) => {
        if (THOTH.UI._elToast !== undefined) THOTH.UI.showToast("Export failed: " + error);
        console.log("Export failed:", error)
    });
};

Scene.patch = (patch, mode, onComplete, onFail)=>{
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
        },

        error:  (xhr, status, error) => {
            if (onFail) onFail(error);
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
        metadata        : null,
        selection       : {},
        visible         : true,
        highlightColor  : THOTH.Utils.getHighlightColor(id),
        trash           : false
    };
    $.getJSON(THOTH.PATH_RES_SCHEMA + "annotation_schema.json", (data) => {
        let check = Scene.validateSchema(data);
        if (!check) {
            if (THOTH.UI._elToast !== undefined) THOTH.UI.showToast("METADATA CREATION FAILED, INVALID METADATA SCHEMA", 10000);
            else console.log("Metadata creation failed, invalid schema")
        }
        layer.metadata = Scene.createPropertiesfromSchema(data);
    });
    
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


// Object management

Scene.editObject = (value) => {
    if (value === undefined) return;
    Scene.currData.objectMetadata = value;
};


// SVP

Scene.readColmap = () => {
    fetch(Scene.colmapCamPath + '?' + new Date().getTime())
        .then(res => {
            if (!res.ok) return false;
            return res.text()
        })
        .then(text => {
            const colmapCameras = text.split('\n').filter(line => line.includes('jpg'));
            Scene.buildCameras(colmapCameras);
        })
        .catch(err => {
            console.error("Failed to load " + Scene.colmapCamPath + ": " + err);
            if (THOTH.UI._elToast !== undefined) THOTH.UI.showToast("No COLMAP txt detected")
        });
};

Scene.buildCameras = (colmapCameras) => {
    THOTH.Scene.currData.viewpoints = {};
    
    for (const cameraAttr of colmapCameras) {
        let [id, qw, qx, qy, qz, tx, ty, tz, label, image] = cameraAttr.split(" ");
        
        // Convert to floatsZ
        [qw, qx, qy, qz, tx, ty, tz] = [qw, qx, qy, qz, tx, ty, tz]
            .map(v => parseFloat(v));

        // Convert to three js coords
        [qw, qx, qy, qz, tx, ty, tz] = THOTH.SVP.convertToThreeCoords(qw, qx, qy, qz, tx, ty, tz);
        
        // Convert to .4f
        [qw, qx, qy, qz, tx, ty, tz] = [qw, qx, qy, qz, tx, ty, tz].map(v => Math.round(v * 1000) / 1000);

        if (Scene.currData.viewpoints[id] === undefined) {
            // naive dummy sampling 
            if (id % 25 !== 0) continue;

            let target = THOTH.SVP.createVPTarget(qw, qx, qy, qz, tx, ty, tz);
            [target.x, target.y, target.z] = [target.x, target.y, target.z].map(v => Math.round(v * 1000) / 1000);
            
            Scene.currData.viewpoints[id] = {
                "position": [tx, ty, tz],
                "target"  : [target.x, target.y, target.z],
                "fov"     : 70,
                "image"   : ATON.Utils.resolveCollectionURL(Scene.modelFolder + "/images/" + image),
            }
            new ATON.POV(id)
                .setPosition(tx, ty, tz)
                .setTarget(target.x, target.y, target.z)
                .setFOV(70);
        }
    }
    THOTH.SVP.setup();
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