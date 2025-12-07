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
    Events.setupSceneEvents();
    Events.setupPhotonEvents();
    Events.setupUIEvents();
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
                if (THOTH.UI._elToast !== undefined) THOTH.UI.showToast("No Layer Selected");
                return;
            }
            if (THOTH.Toolbox.tempSelection !== null) return;
            THOTH.fire("useBrush");
        }
        // Eraser
        if (THOTH.Toolbox.eraserEnabled) {
            if (!Events.activeLayerExists()) {
                if (THOTH.UI._elToast !== undefined) THOTH.UI.showToast("No Layer Selected");
                return;
            }
            if (THOTH.Toolbox.tempSelection !== null) return;
            THOTH.fire("useEraser");
        }
        // Lasso
        if (THOTH.Toolbox.lassoEnabled) {
            if (!Events.activeLayerExists()) {
                if (THOTH.UI._elToast !== undefined) THOTH.UI.showToast("No Layer Selected");
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
                if (THOTH.UI._elToast !== undefined) THOTH.UI.showToast("No Layer Selected");
                else console.log("No layer selected")
                return;
            }
            THOTH.fire("startEraser");
        }
        // Eraser
        if (THOTH.Toolbox.eraserEnabled) {
            if (!Events.activeLayerExists()) {
                if (THOTH.UI._elToast !== undefined) THOTH.UI.showToast("No Layer Selected");
                else console.log("No layer selected")
                return;
            }
            THOTH.fire("startBrush");
        }
        // Lasso
        if (THOTH.Toolbox.lassoEnabled) {
            if (!Events.activeLayerExists()) {
                if (THOTH.UI._elToast !== undefined) THOTH.UI.showToast("No Layer Selected");
                else console.log("No layer selected")
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

Events.setupUIEvents = () => {
    // Create Layer
    THOTH.on("createLayer", () => {
        const id = THOTH.Utils.getFirstUnusedKey(THOTH.Scene.currData.layers);

        THOTH.fire("createLayerScene", (id));
        THOTH.firePhoton("createLayerScene", (id));
        THOTH.History.pushAction({
            type: THOTH.History.ACTIONS.CREATE_LAYER,
            id  : id
        });
    });

    // Delete Layer
    THOTH.on("deleteLayer", (id) => {
        THOTH.fire("deleteLayerScene", (id));
        THOTH.firePhoton("deleteLayerScene", (id));
        THOTH.History.pushAction({
            type: THOTH.History.ACTIONS.DELETE_LAYER,
            id  : id
        });
    });

    // Edit Layer metadata
    THOTH.on("editMetadata", (l) => {
        const id       = l.id;
        const data     = l.data;
        const prevData = l.prevData;

        if (id === -1) {
            THOTH.fire("editObjectScene", ({
                value: data
            }));
            THOTH.firePhoton("editObjectScene", ({
                value: data
            }));
            THOTH.History.pushAction({
                type     : THOTH.History.ACTIONS.EDIT_METADATA_OBJECT,
                value    : data,
                prevValue: prevData
            });
        }
        else {
            THOTH.fire("editLayerScene", ({
                id   : id,
                attr : "metadata",
                value: data
            }));
            THOTH.firePhoton("editLayerScene", ({
                id   : id,
                attr : "metadata",
                value: data
            }));
            THOTH.History.pushAction({
                type     : THOTH.History.ACTIONS.EDIT_METADATA_LAYER,
                id       : id,
                value    : data,
                prevValue: prevData
            });
        }

    });

    // Brush
    THOTH.on("selectBrush", () => {
        THOTH.Toolbox.activateBrush();
        THOTH.setUserControl(false);
        THOTH.UI.showBrushOptions();
        THOTH.UI.hideLassoOptions();
        THOTH.Toolbox.cleanupLasso();
        THOTH.Toolbox.clearMeasure();
        THOTH.UI.handleToolHighlight('brush');
    });

    // Eraser
    THOTH.on("selectEraser", () => {
        THOTH.Toolbox.activateEraser();
        THOTH.setUserControl(false);
        THOTH.UI.showBrushOptions();
        THOTH.UI.hideLassoOptions();
        THOTH.Toolbox.cleanupLasso();
        THOTH.Toolbox.clearMeasure();
        THOTH.UI.handleToolHighlight('eraser');
    });

    // Lasso add
    THOTH.on("selectLasso", () => {
        THOTH.Toolbox.activateLasso();
        THOTH.setUserControl(false);
        THOTH.UI.showLassoOptions();
        THOTH.UI.hideBrushOptions();
        THOTH.Toolbox.cleanupLasso();
        THOTH.Toolbox.clearMeasure();
        THOTH.UI.handleToolHighlight('lasso');
    });

    // Select no tool
    THOTH.on("selectNone", () => {
        THOTH.Toolbox.deactivate();
        THOTH.setUserControl(true);
        THOTH.UI.hideBrushOptions();
        THOTH.UI.hideLassoOptions();
        THOTH.Toolbox.cleanupLasso();
        THOTH.Toolbox.clearMeasure();
        THOTH.UI.handleToolHighlight('no_tool');
    });

    // Select measure
    THOTH.on("selectMeasure", () => {
        THOTH.Toolbox.activateMeasure();
        THOTH.setUserControl(false);
        THOTH.UI.hideBrushOptions();
        THOTH.UI.hideLassoOptions();
        THOTH.Toolbox.cleanupLasso();
        THOTH.Toolbox.clearMeasure();
        THOTH.UI.handleToolHighlight('measure');
    });

    // Model Transform
    THOTH.on("modelTransformPosInput", (l) => {
        const pos = THOTH.Scene.modelMap.get(l.modelName).modelData.position
        const prevValue = {
            x: pos.x,
            y: pos.y,
            z: pos.z
        };

        THOTH.History.pushAction({
            type     : THOTH.History.ACTIONS.TRANSFORM_MODEL_POS,
            id       : l.modelName,
            value    : l.value,
            prevValue: prevValue
        });
        THOTH.fire("modelTransformPosScene", (l));
        THOTH.firePhoton("modelTransformPosScene", (l));
    }); 

    THOTH.on("modelTransformRotInput", (l) => {
        const rot = THOTH.Scene.modelMap.get(l.modelName).modelData.rotation;
        const prevValue = {
            x: rot.x,
            y: rot.y,
            z: rot.z
        };
        
        THOTH.History.pushAction({
            type     : THOTH.History.ACTIONS.TRANSFORM_MODEL_ROT,
            id       : l.modelName,
            value    : l.value,
            prevValue: prevValue
        });
        THOTH.fire("modelTransformRotScene", (l));
        THOTH.firePhoton("modelTransformRotScene", (l));
    }); 

    // Dlclick rename
    // TODO: remove this and replace
    THOTH.Events.enableRename = (buttonElement, id) => {

        buttonElement.classList.add('renamable');
        const layer 	= THOTH.Scene.currData.layers[id];
        const attr 		= "name";

        buttonElement.addEventListener('dblclick', () => {
            const input            = document.createElement('input');
            input.type             = 'text';
            input.value            = layer[attr];
            input.style.width      = `${buttonElement.offsetWidth}px`;
            input.style.fontSize   = 'inherit';
            input.style.border     = 'none';
            input.style.outline    = 'none';
            input.style.background = 'white';
            input.style.color      = 'gray';

            THOTH._bListenKeyboardEvents = false;

            const applyRename = () => {
                let newTitle = input.value.trim();
                if (newTitle.length > 20) {
                    // Trim to 24 characters
                    newTitle = newTitle.substring(0, 20) + ".."; 
                } 
                if (newTitle !== '') {
                    buttonElement.textContent = newTitle;
                    layer[attr] = newTitle;

                    // Update the scene with the new name
                    THOTH.fire("editLayerScene", { id: id, attr: "name", value: newTitle });
                    THOTH.firePhoton("editLayerScene", { id: id, attr: "name", value: newTitle });
                }
                input.replaceWith(buttonElement);
            };

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') applyRename();
            });
            input.addEventListener('blur', () => {
                applyRename();
            });

            buttonElement.replaceWith(input);
            input.focus();
            input.select();
        });
    };

};

Events.setupSceneEvents = () => {
    // Local
    THOTH.on("createLayerScene", (id) => {
        THOTH.Scene.createLayer(id);
        THOTH.UI.createLayer(id);
    });

    THOTH.on("deleteLayerScene", (id) => {
        THOTH.Scene.deleteLayer(id);
        THOTH.UI.deleteLayer(id);
    });
    
    THOTH.on("editLayerScene", (l) => {
        const id    = l.id;
        const attr  = l.attr;
        const value = l.value;
        THOTH.Scene.editLayer(id, attr, value);
    });

    THOTH.on("editObjectScene", (l) => {
        THOTH.Scene.editObject(l.value);
    });
    
    THOTH.on("addToSelectionScene", (l) => {
        const id        = l.id;
        const selection = l.selection;
        const layer     = THOTH.Scene.currData.layers[id];
        
        const tempSelection = layer.selection || {};
        for (const modelName of Object.keys(selection)) {
            tempSelection[modelName] = tempSelection[modelName] || {};
            
            for (const meshName of Object.keys(selection[modelName])) {
                tempSelection[modelName][meshName] = 
                [...THOTH.Toolbox.addFacesToSelection(selection[modelName][meshName], tempSelection[modelName][meshName])];
            }
        }
        THOTH.Scene.editLayer(id, "selection", tempSelection);
        THOTH.updateVisibility();
    });
    
    THOTH.on("delFromSelectionScene", (l) => {
        const id        = l.id;
        const selection = l.selection;
        const layer     = THOTH.Scene.currData.layers[id];
        
        const tempSelection = layer.selection || {};
        for (const modelName of Object.keys(selection)) {
            tempSelection[modelName] = tempSelection[modelName] || {};
            
            for (const meshName of Object.keys(selection[modelName])) {
                tempSelection[modelName][meshName] =
                [...THOTH.Toolbox.delFacesFromSelection(selection[modelName][meshName], tempSelection[modelName][meshName])];
            }
        }

        THOTH.Scene.editLayer(id, "selection", tempSelection);
        THOTH.updateVisibility();
    });

    THOTH.on("modelTransformPosScene", (l) => {
        const modelName = l.modelName;
        const value     = l.value;
        
        THOTH.Scene.modelTransformPos(modelName, value);
        THOTH.updateVisibility();
    });
    
    THOTH.on("modelTransformRotScene", (l) => {
        const modelName = l.modelName;
        const value     = l.value;
        
        THOTH.Scene.modelTransformRot(modelName, value);
        THOTH.updateVisibility();
    });

    // Photon
    THOTH.onPhoton("createLayerScene", (id) => {
        THOTH.Scene.createLayer(id);

        const layers = THOTH.Scene.currData.layers; 
        if (layers[id] !== undefined && layers[id].trash === true) THOTH.UI.ressurectLayer(id);
        else THOTH.UI.createLayer(id);
    });
    
    THOTH.onPhoton("deleteLayerScene", (id) => {
        THOTH.Scene.deleteLayer(id);
        THOTH.UI.deleteLayer(id);
    });
    
    THOTH.onPhoton("editLayerScene", (l) => {
        const id    = l.id;
        const attr  = l.attr;
        const value = l.value;
        THOTH.Scene.editLayer(id, attr, value);
    });

    THOTH.onPhoton("addToSelectionScene", (l) => {
        const id        = l.id;
        const selection = l.selection;
        const layer     = THOTH.Scene.currData.layers[id];
        
        const tempSelection = layer.selection || {};
        for (const modelName of Object.keys(selection)) {
            tempSelection[modelName] = tempSelection[modelName] || {};

            for (const meshName of Object.keys(selection[modelName])) {
                tempSelection[modelName][meshName] =
                [...THOTH.Toolbox.addFacesToSelection(selection[modelName][meshName], layer.selection[modelName][meshName])];
            }
        }

        THOTH.Scene.editLayer(id, "selection", tempSelection);
        THOTH.updateVisibility();
    });

    THOTH.onPhoton("delFromSelectionScene", (l) => {
        const id        = l.id;
        const selection = l.selection;
        const layer     = THOTH.Scene.currData.layers[id];
        
        const tempSelection = layer.selection || {};
        for (const modelName of Object.keys(selection)) {
            tempSelection[modelName] = tempSelection[modelName] || {};

            for (const meshName of Object.keys(selection[modelName])) {
                tempSelection[modelName][meshName] = 
                [...THOTH.Toolbox.delFacesFromSelection(selection[modelName][meshName], layer.selection[modelName][meshName])];
            } 
        }

        THOTH.Scene.editLayer(id, "selection", tempSelection);
        THOTH.updateVisibility();
    });

    THOTH.onPhoton("modelTransformScene", (l) => {
        const modelName = l.modelName;
        const value     = l.value;
        
        THOTH.Scene.modelTransform(modelName, transform, value);
        THOTH.updateVisibility();
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
        const id        = THOTH.Scene.activeLayer.id;
        const selection = THOTH.Toolbox.endBrush();
        
        if (Object.keys(selection).length === 0) return;

        THOTH.History.pushAction({
            type : THOTH.History.ACTIONS.SELEC_ADD,
            id   : id,
            value: selection
        });
        THOTH.fire("addToSelectionScene", {
            id       : id,
            selection: selection
        });
        THOTH.firePhoton("addToSelectionScene", {
            id       : id,
            selection: selection
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
        const id        = THOTH.Scene.activeLayer.id;
        const selection = THOTH.Toolbox.endEraser();
        
        // Return if selection is empty
        if (Object.keys(selection).length === 0) return;
        
        THOTH.History.pushAction({
            type : THOTH.History.ACTIONS.SELEC_DEL,
            id   : id,
            value: selection
        });
        THOTH.fire("delFromSelectionScene", {
            id       : id,
            selection: selection
        });
        THOTH.firePhoton("delFromSelectionScene", {
            id       : id,
            selection: selection
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

        const id        = THOTH.Scene.activeLayer.id;
        const selection = THOTH.Toolbox.endLassoAdd();

        if (Object.keys(selection).length === 0) return;

        THOTH.History.pushAction({
            type : THOTH.History.ACTIONS.SELEC_ADD,
            id   : id,
            value: selection
        });
        THOTH.fire("addToSelectionScene", {
            id       : id,
            selection: selection
        });
        THOTH.firePhoton("addToSelectionScene", {
            id       : id,
            selection: selection
        });

        THOTH.Toolbox.tempSelection = null;
    });
    THOTH.on("endLassoDel", (l) => {
        if (!THOTH.Toolbox.enabled || THOTH.Toolbox.paused) return;

        const id        = THOTH.Scene.activeLayer.id;
        const selection = THOTH.Toolbox.endLassoDel();

        if (Object.keys(selection).length === 0) return;

        THOTH.History.pushAction({
            type : THOTH.History.ACTIONS.SELEC_DEL,
            id   : id,
            value: selection
        });
        THOTH.fire("delFromSelectionScene", {
            id       : id,
            selection: selection
        });
        THOTH.firePhoton("delFromSelectionScene", {
            id       : id,
            selection: selection
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

Events.setupPhotonEvents = () => {
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


// Utils

Events.activeLayerExists = () => {
    if (THOTH.Scene.activeLayer === undefined) return false;
    else return true;
};


export default Events;