/*===========================================================================

    THOTH
    Event handling

    Author: steliosalvanos@gmail.com

===========================================================================*/
let Events = {};


Events.setup = () => {
    Events.setupInputEL();
    Events.setupActiveEL();
    Events.setupWindowEL();

    Events.setupToolboxEvents();
    Events.setupPhotonEvents();
    Events.setupLayerEvents();
    Events.setupModelEvents();
};


// Event listeners

Events.setupInputEL = () => {
    let el = THOTH._renderer.domElement;
    // Mouse down
    el.addEventListener("mousedown", (e) => {
        if (e.button === 0) {
            THOTH.fire("MouseLeftDown");
            THOTH._bLeftMouseDown = true;
        }
        if (e.button === 2) {
            THOTH.fire("MouseRightDown")
            THOTH._bRightMouseDown = true;
        }
    });
    // Mouse up
    el.addEventListener("mouseup", (e) => {
        if (e.button === 0) {
            THOTH.fire("MouseLeftUp");
            THOTH._bLeftMouseDown = false;
        }
        if (e.button === 2) {
            THOTH.fire("MouseRightUp")
            THOTH._bRightMouseDown = false;
        }
    });
    // Mouse move
    el.addEventListener("mousemove", (e) => {
        THOTH.fire("MouseMove", (e));
    });
    // Key down
    window.addEventListener("keydown", (e) => {
        THOTH.fire("KeyDown", (e.code), false);
    });
    // Existing keyup event since it doesn't support caps/other languages
    THOTH.discardAtonEventHandler("KeyUp");
    // Key up
    window.addEventListener("keyup", (e) => {
        THOTH.fire("KeyUp", (e.code), false);
    });
};

Events.setupActiveEL = () => {
    // Mouse left click
    THOTH.on("MouseLeftDown", () =>{
        // Brush
        if (THOTH.Toolbox.brushEnabled) {
            if (!Events.activeLayerExists()) {
                THOTH.FE.showToast("No Layer Selected");
                return;
            }
            if (THOTH.Toolbox.tempSelection !== null) return;
            THOTH.fire("useBrush");
        }
        // Eraser
        if (THOTH.Toolbox.eraserEnabled) {
            if (!Events.activeLayerExists()) {
                THOTH.FE.showToast("No Layer Selected");
                return;
            }
            if (THOTH.Toolbox.tempSelection !== null) return;
            THOTH.fire("useEraser");
        }
        // Lasso
        if (THOTH.Toolbox.lassoEnabled) {
            if (!Events.activeLayerExists()) {
                THOTH.FE.showToast("No Layer Selected");
                return;
            }
            THOTH.fire("startLasso");
        }
        // Measure
        if (THOTH.Toolbox.measureEnabled) {
            THOTH.fire("addMeasurement");
        }
    });
    THOTH.on("MouseLeftUp", () => {
        if (!Events.activeLayerExists()) return;
        
        // Brush
        if (THOTH.Toolbox.brushEnabled) {
            THOTH.fire("endBrush");
        }
        // Eraser
        if (THOTH.Toolbox.eraserEnabled) {
            THOTH.fire("endEraser");
        }
        // Lasso
        if (THOTH.Toolbox.lassoEnabled) {
            THOTH.fire("endLassoAdd");
        }
    });
    
    // Mouse right click
    THOTH.on("MouseRightDown", () => {
        // Brush
        if (THOTH.Toolbox.brushEnabled) {
            if (!Events.activeLayerExists()) {
                THOTH.FE.showToast("No Layer Selected");
                return;
            }
            THOTH.fire("startEraser");
        }
        // Eraser
        if (THOTH.Toolbox.eraserEnabled) {
            if (!Events.activeLayerExists()) {
                THOTH.FE.showToast("No Layer Selected");
                return;
            }
            THOTH.fire("startBrush");
        }
        // Lasso
        if (THOTH.Toolbox.lassoEnabled) {
            if (!Events.activeLayerExists()) {
                THOTH.FE.showToast("No Layer Selected");
                return;
            }
            THOTH.fire("startLasso");
        }
    });
    THOTH.on("MouseRightUp", (e) => {
        if (!Events.activeLayerExists()) return;

        // Brush
        if (THOTH.Toolbox.brushEnabled) {
            THOTH.fire("endEraser");
        }
        // Eraser
        if (THOTH.Toolbox.eraserEnabled) {
            THOTH.fire("endBrush");
        }
        // Lasso
        if (THOTH.Toolbox.lassoEnabled) {
            THOTH.fire("endLassoDel");
        }
    });

    // Mouse move
    THOTH.on("MouseMove", (e) => {
        if (!THOTH.Toolbox.enabled) return;

        if (e.preventDefault) e.preventDefault();

        THOTH.Toolbox.moveSelector();
        THOTH.Toolbox.getPixelPointerCoords(e);
        
        if (!Events.activeLayerExists()) return;
        
        if (THOTH._bLeftMouseDown) {
            // Brush
            if (THOTH.Toolbox.brushEnabled) {
                THOTH.fire("useBrush");
            }
            // Eraser
            if (THOTH.Toolbox.eraserEnabled) {
                THOTH.fire("useEraser");
            }
            // Lasso
            if (THOTH.Toolbox.lassoEnabled) {
                THOTH.fire("updateLasso");
            }
        }
        
        if (THOTH._bRightMouseDown) {
            // Brush
            if (THOTH.Toolbox.brushEnabled) {
                THOTH.fire("useEraser");
            }
            // Eraser
            if (THOTH.Toolbox.eraserEnabled) {
                THOTH.fire("useBrush");
            }
            // Lasso
            if (THOTH.Toolbox.lassoEnabled) {
                THOTH.fire("updateLasso");
            }
        }
    });
    
    // Key
    THOTH.on("KeyDown", (k) => {
        // Tools
        if (k === "KeyB") {
            THOTH.fire("selectBrush");
        }
        if (k === "KeyE") {
            THOTH.fire("selectEraser");
        }
        if (k === "KeyL") {
            THOTH.fire("selectLasso");
        }
        if (k === "keyN") {
            THOTH.fire("selectNone");
        }
        if (k === "KeyM") {
            THOTH.fire("selectMeasure");
        }

        // Tool size
        if (k === "BracketLeft") {
            THOTH.Toolbox.decreaseSelectorSize();
            // Todo update the ui as well
        }
        if (k === "BracketRight") {
            THOTH.Toolbox.increaseSelectorSize();
        }

        // History
        if (k === "KeyZ") {
            if (THOTH._bCtrlDown) THOTH.History.undo();
        }
        if (k === "KeyY") {
            if (THOTH._bCtrlDown) THOTH.History.redo();
        }

        // Shift
        if (k === "ShiftLeft") {
            THOTH._bShiftDown = true;
        }
        // Ctrl
        if (k === "ControlLeft") {
            THOTH._bCtrlDown = true;
        }

        // Nav
        if (k === "Space") {
            if (THOTH.Toolbox.enabled) {
                THOTH.setUserControl(true);
                THOTH.Toolbox.pause();
                THOTH.Toolbox.cleanupLasso();
                THOTH.Toolbox.clearMeasure();
            }
        }
    });
    THOTH.on("KeyUp", (k) => {
        // Shift
        if (k === "ShiftLeft") {
            THOTH._bShiftDown = false;
        }
        // Ctrl
        if (k === "ControlLeft") {
            THOTH._bCtrlDown = false;
        }

        // Nav
        if (k === "Space") {
            if (THOTH.Toolbox.paused) {
                THOTH.setUserControl(false);
                THOTH.Toolbox.resume();
            }
        }
    });
};

Events.setupWindowEL = () => {
    let w = window;

    // Resizes
    w.addEventListener('resize', () => {
        THOTH._camera.aspect = w.innerWidth / w.innerHeight;
        THOTH._camera.updateProjectionMatrix();
        THOTH._renderer.setSize(w.innerWidth, w.innerHeight);
        THOTH.Toolbox.resizeLassoCanvas();
    }, false);

    w.addEventListener("blur", () => {
        // maybe?
    });
};


// Events

Events.setupLayerEvents = () => {
    // Create layer
    THOTH.on("createLayer", () => {
        const layerId = THOTH.Utils.getFirstUnusedKey(THOTH.Layers.layerMap);
        // Local
        THOTH.Layers.createLayer(layerId);
        THOTH.FE.addNewLayer(layerId);
        // Photon
        THOTH.firePhoton("createLayer", (layerId));
        // History
        THOTH.History.pushAction({
            type: THOTH.History.ACTIONS.CREATE_LAYER,
            id  : layerId
        });
    });
    // Delete Layer
    THOTH.on("deleteLayer", (layerId) => {
        // Local
        THOTH.Layers.deleteLayer(layerId);
        THOTH.FE.deleteLayer(layerId);
        // Photon
        THOTH.firePhoton("deleteLayer", (layerId));
        // History
        THOTH.History.pushAction({
            type: THOTH.History.ACTIONS.DELETE_LAYER,
            id  : layerId
        });
    });
    // Edit layer metadata
    THOTH.on("editLayerMetadata", (l) => {
        const layerId  = l.id;
        const data     = l.data;
        const prevData = l.prevData;
        
        // Local
        THOTH.Layers.editLayer(layerId, "metadata", data);
        // Photon
        THOTH.firePhoton("editLayerMetadata", ({
            id   : layerId,
            value: data
        }));
        // History
        THOTH.History.pushAction({
            type     : THOTH.History.ACTIONS.EDIT_METADATA_LAYER,
            id       : layerId,
            value    : data,
            prevValue: prevData
        });
    });
    // Edit scene metadata
    THOTH.on("editSceneMetadata", (l) => {
        const data     = l.data;
        const prevData = l.prevData;

        // Local event
        THOTH.Scene.editSceneMetadata(data)
        // Photon event
        THOTH.firePhoton("editSceneMetadata", ({
            value: data
        }));
        // History 
        THOTH.History.pushAction({
            type     : THOTH.History.ACTIONS.EDIT_METADATA_SCENE,
            value    : data,
            prevValue: prevData
        });
    });
    // Brush
    THOTH.on("selectBrush", () => {
        THOTH.Toolbox.activateBrush();
        THOTH.setUserControl(false);
        THOTH.Toolbox.cleanupLasso();
        THOTH.Toolbox.clearMeasure();
        THOTH.FE.handleToolOptions('brush');
        THOTH.FE.handleElementHighlight('brush', THOTH.FE.toolMap);
    });
    // Eraser
    THOTH.on("selectEraser", () => {
        THOTH.Toolbox.activateEraser();
        THOTH.setUserControl(false);
        THOTH.Toolbox.cleanupLasso();
        THOTH.Toolbox.clearMeasure();
        THOTH.FE.handleToolOptions('eraser');
        THOTH.FE.handleElementHighlight('eraser', THOTH.FE.toolMap);
    });
    // Lasso add
    THOTH.on("selectLasso", () => {
        THOTH.Toolbox.activateLasso();
        THOTH.setUserControl(false);
        THOTH.Toolbox.cleanupLasso();
        THOTH.Toolbox.clearMeasure();
        THOTH.FE.handleToolOptions('lasso');
        THOTH.FE.handleElementHighlight('lasso', THOTH.FE.toolMap);
    });
    // Select no tool
    THOTH.on("selectNone", () => {
        THOTH.Toolbox.deactivate();
        THOTH.setUserControl(true);
        THOTH.Toolbox.cleanupLasso();
        THOTH.Toolbox.clearMeasure();
        THOTH.FE.handleToolOptions('no_tool');
        THOTH.FE.handleElementHighlight('no_tool', THOTH.FE.toolMap);
    });
    // Select measure
    THOTH.on("selectMeasure", () => {
        THOTH.Toolbox.activateMeasure();
        THOTH.setUserControl(false);
        // THOTH.UI.hideBrushOptions();
        // THOTH.UI.hideLassoOptions();
        THOTH.Toolbox.cleanupLasso();
        THOTH.Toolbox.clearMeasure();
        THOTH.FE.handleToolHighlight('measure', THOTH.FE.toolMap);
    });
    
};

Events.setupModelEvents = () => {
    // Model Transform
    THOTH.on("modelTransformPosInput", (l) => {
        const pos = THOTH.Models.modelMap.get(l.modelName).position
        const prevValue = {
            x: pos.x,
            y: pos.y,
            z: pos.z
        };
        // Local
        THOTH.Models.modelTransformPos(l.modelName, l.value);
        // Photon
        THOTH.firePhoton("modelTransformPosScene", (l));
        // History
        THOTH.History.pushAction({
            type     : THOTH.History.ACTIONS.TRANSFORM_MODEL_POS,
            id       : l.modelName,
            value    : l.value,
            prevValue: prevValue
        });
    }); 

    THOTH.on("modelTransformRot", (l) => {
        const rot = THOTH.Models.modelMap.get(l.modelName).rotation;
        const prevValue = {
            x: rot.x,
            y: rot.y,
            z: rot.z
        };
        // Local
        THOTH.Models.modelTransformRot(l.modelName, l.value);
        // Photon
        THOTH.firePhoton("modelTransformRot", (l));
        // History
        THOTH.History.pushAction({
            type     : THOTH.History.ACTIONS.TRANSFORM_MODEL_ROT,
            id       : l.modelName,
            value    : l.value,
            prevValue: prevValue
        });
    }); 
};

Events.setupPhotonEvents = () => {
    THOTH.onPhoton("createLayer", (layerId) => {
        THOTH.Layers.createLayer(layerId);
        THOTH.FE.addNewLayer(layerId);
    });

    THOTH.onPhoton("deleteLayer", (layerId) => {
        THOTH.Scene.deleteLayer(layerId);
        THOTH.FE.deleteLayer(layerId);
    });

    THOTH.onPhoton("editSceneMetadata", (l) => {
        THOTH.Scene.editSceneMetadata(l.data);
    });
    
    THOTH.onPhoton("editLayerMetadata", (l) => {
        THOTH.Scene.editLayer(l.id, "metadata", l.value);
    });

    THOTH.onPhoton("addToSelection", (l) => {
        THOTH.Layers.addToSelection(l.id, l.selection);
    });
    
    THOTH.onPhoton("delFromSelection", (l) => {
        THOTH.Layers.delFromSelection(l.id, l.selection);
    });

    THOTH.onPhoton("modelTransformRot", (l) => {
        THOTH.Models.modelTransformRot(l.modelName, l.value);
    });

    THOTH.onPhoton("modelTransformPos", (l) => {
        THOTH.Models.modelTransformPos(l.modelName, l.value);
    });

    // On new user join
    THOTH.on("VRC_UserEnter", () => {
        const currData = THOTH.Scene.currData;
        THOTH.firePhoton("syncScene", currData);
    });
    
    // Sync scene
    THOTH.onPhoton("syncScene", (currData) => {
        THOTH.Scene.syncScene(currData);
    });
};

Events.setupToolboxEvents = () => {
    THOTH.on("useBrush", () => {
        if (!THOTH.Toolbox.enabled || THOTH.Toolbox.paused) return;
        
        if (THOTH.Toolbox.tempSelection === null) {
            THOTH.Toolbox.tempSelection = {};
        }
        
        if (THOTH._queryData === undefined) return;
        
        THOTH.Toolbox.brushActive();
    });
    THOTH.on("endBrush", () => {
        if (!THOTH.Toolbox.enabled || THOTH.Toolbox.paused) return;
        if (THOTH.Toolbox.tempSelection === null) return;
        
        // Get only faces that don't already belong to layer
        const layerId   = THOTH.Scene.activeLayer.id;
        const selection = THOTH.Toolbox.endBrush();
        
        if (Object.keys(selection).length === 0) return;

        // Local
        THOTH.Layers.addToSelection(layerId, selection);
        // Photon
        THOTH.firePhoton("addToSelectionScene", {
            id       : layerId,
            selection: selection
        });
        // History
        THOTH.History.pushAction({
            type : THOTH.History.ACTIONS.SELEC_ADD,
            id   : layerId,
            value: selection
        });

        THOTH.Toolbox.tempSelection = null;
    });
    
    THOTH.on("useEraser", () => {
        if (!THOTH.Toolbox.enabled || THOTH.Toolbox.paused) return;
        if (THOTH.Toolbox.tempSelection === null) {
            THOTH.Toolbox.tempSelection = {};
        }

        if (THOTH._queryData === undefined) return;

        THOTH.Toolbox.eraserActive();
    })
    THOTH.on("endEraser", () => {
        if (!THOTH.Toolbox.enabled || THOTH.Toolbox.paused) return;
        if (THOTH.Toolbox.tempSelection === null) return;
        
        // Get only faces that don't already belong to layer
        const layerId   = THOTH.Scene.activeLayer.id;
        const selection = THOTH.Toolbox.endEraser();
        
        // Return if selection is empty
        if (Object.keys(selection).length === 0) return;
        
        // Local
        THOTH.Layers.delFromSelection(layerId, selection);
        // Photon
        THOTH.firePhoton("delFromSelection", {
            id       : layerId,
            selection: selection
        });
        // History
        THOTH.History.pushAction({
            type : THOTH.History.ACTIONS.SELEC_DEL,
            id   : layerId,
            value: selection
        });

        THOTH.Toolbox.tempSelection = null;
    });

    THOTH.on("startLasso", () => {
        if (!THOTH.Toolbox.enabled || THOTH.Toolbox.paused) return;
        THOTH.Toolbox.startLasso();
    });
    THOTH.on("updateLasso", () => {
        if (!THOTH.Toolbox.enabled || THOTH.Toolbox.paused) return;
        THOTH.Toolbox.updateLasso();
    });
    THOTH.on("endLassoAdd", (l) => {
        if (!THOTH.Toolbox.enabled || THOTH.Toolbox.paused) return;

        const layerId   = THOTH.Scene.activeLayer.id;
        const selection = THOTH.Toolbox.endLassoAdd();

        if (Object.keys(selection).length === 0) return;

        // Local
        THOTH.Layers.addToSelection(layerId, selection);
        // Photon
        THOTH.firePhoton("addToSelection", {
            id       : layerId,
            selection: selection
        });
        // History
        THOTH.History.pushAction({
            type : THOTH.History.ACTIONS.SELEC_ADD,
            id   : layerId,
            value: selection
        });

        THOTH.Toolbox.tempSelection = null;
    });
    THOTH.on("endLassoDel", (l) => {
        if (!THOTH.Toolbox.enabled || THOTH.Toolbox.paused) return;

        const layerId   = THOTH.Scene.activeLayer.id;
        const selection = THOTH.Toolbox.endLassoDel();

        if (Object.keys(selection).length === 0) return;

        // Local
        THOTH.Layers.delFromSelection(layerId, selection);
        // Photon
        THOTH.firePhoton("delFromSelection", {
            id       : layerId,
            selection: selection
        });
        // History
        THOTH.History.pushAction({
            type : THOTH.History.ACTIONS.SELEC_DEL,
            id   : layerId,
            value: selection
        });

        THOTH.Toolbox.tempSelection = null;
    });
    THOTH.on("addMeasurement", (l) => {
        THOTH.Toolbox.addMeasurementPoint();
    });
    THOTH.on("endAllToolOps", () => {
        THOTH.fire("endLasso");
    });
};


// Utils

Events.activeLayerExists = () => {
    if (THOTH.Scene.activeLayer === undefined) return false;
    else return true;
};


export default Events;