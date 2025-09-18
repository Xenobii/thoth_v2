/*===========================================================================

    THOTH
    Event handling

    Author: steliosalvanos@gmail.com

===========================================================================*/
let Events = {};


Events.setup = () => {
    Events.setupMouseEventListeners();
    Events.setupActiveEventListeners();
    Events.setupBackgroundEventListeners();

    Events.setupToolboxEvents();
    Events.setupSceneEvents();
    Events.setupPhotonEvents();
    Events.setupUIEvents();
};


// Event listeners

Events.setupMouseEventListeners = () => {
    let el  = THOTH._renderer.domElement;

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

    el.addEventListener("mousemove", (e) => {
        THOTH.fire("MouseMove", (e));
    });

    window.addEventListener("keydown", (e) => {
        THOTH.fire("KeyDown", (e.code), false);
    });

    // Existing keyup event since it doesn't support caps/other languages
    THOTH.discardAtonEventHandler("KeyUp");

    window.addEventListener("keyup", (e) => {
        THOTH.fire("KeyUp", (e.code), false);
    });
};

Events.setupActiveEventListeners = () => {
    let el  = THOTH._renderer.domElement;

    // Mouse left click
    THOTH.on("MouseLeftDown", () =>{
        if (!THOTH.Toolbox.enabled) return;
        
        if (THOTH.Scene.activeLayer === undefined) {
            console.log("No layer selected");
            el.style.cursor = "not-allowed";
            return;
        }

        // Brush
        if (THOTH.Toolbox.brushEnabled) {
            THOTH.Toolbox.tempSelection = new Set();
            
            if (THOTH._queryData === undefined) return;
            THOTH.Toolbox.brushActive();
        }

        // Eraser
        if (THOTH.Toolbox.eraserEnabled) {
            THOTH.Toolbox.tempSelection = new Set();
            
            if (THOTH._queryData === undefined) return;

            THOTH.Toolbox.eraserActive();
        }

        // Lasso
        if (THOTH.Toolbox.lassoEnabled) {
            THOTH.Toolbox.tempSelection = new Set(THOTH.Scene.activeLayer.selection);

            THOTH.Toolbox.startLasso();
        }
    });

    THOTH.on("MouseLeftUp", () => {
        if (!THOTH.Toolbox.enabled) return;

        if (THOTH.Scene.activeLayer === undefined) return;

        // Brush
        if (THOTH.Toolbox.brushEnabled) {
            if (THOTH.Toolbox.tempSelection === undefined) return;
            THOTH.Toolbox.endBrush();
        }
        // Eraser
        if (THOTH.Toolbox.eraserEnabled) {
            if (THOTH.Toolbox.tempSelection === undefined) return;
            THOTH.Toolbox.endEraser();
        }
        // Lasso
        if (THOTH.Toolbox.lassoEnabled) {
            if (THOTH.Toolbox.tempSelection === undefined) return;
            THOTH.Toolbox.endLassoAdd();
        }
    });
    
    // Mouse right click
    THOTH.on("MouseRightDown", () => {
        if (!THOTH.Toolbox.enabled) return;
        
        if (THOTH.Scene.activeLayer === undefined) {
            console.log("No layer selected");
            el.style.cursor = "not-allowed";
            return;
        }

        // Brush
        if (THOTH.Toolbox.brushEnabled) {
            THOTH.Toolbox.tempSelection = new Set();
            
            if (THOTH._queryData === undefined) return;

            THOTH.Toolbox.eraserActive();
        }
        // Eraser
        if (THOTH.Toolbox.eraserEnabled) {
            THOTH.Toolbox.tempSelection = new Set();
            
            if (THOTH._queryData === undefined) return;

            THOTH.Toolbox.brushActive();
        }
        // Lasso
        if (THOTH.Toolbox.lassoEnabled) {
            THOTH.Toolbox.tempSelection = new Set(THOTH.Scene.activeLayer.selection);

            THOTH.Toolbox.startLasso();
        }
    });

    THOTH.on("MouseRightUp", () => {
        if (!THOTH.Toolbox.enabled) return;

        if (THOTH.Scene.activeLayer === undefined) return;

        // Brush
        if (THOTH.Toolbox.brushEnabled) {
            if (THOTH.Toolbox.tempSelection === undefined) return;
            THOTH.Toolbox.endEraser();
        }
        // Eraser
        if (THOTH.Toolbox.eraserEnabled) {
            if (THOTH.Toolbox.tempSelection === undefined) return;
            THOTH.Toolbox.endBrush();
        }
        // Lasso
        if (THOTH.Toolbox.lassoEnabled) {
            THOTH.Toolbox.endLassoDel();
        }
    });

    // Mouse move
    THOTH.on("MouseMove", (e) => {
        if (!THOTH.Toolbox.enabled) return;

        THOTH.Toolbox.moveSelector();
        THOTH.Toolbox.updateScreenMove(e);
        THOTH.Toolbox.updatePixelPointerCoords(e);
        
        if (THOTH.Scene.activeLayer === undefined) return;

        if (THOTH._bLeftMouseDown) {
            // Brush
            if (THOTH.Toolbox.brushEnabled) {
                if (THOTH._queryData === undefined) return;
                THOTH.Toolbox.brushActive();
            }
            // Eraser
            if (THOTH.Toolbox.eraserEnabled) {
                if (THOTH._queryData  === undefined) return;
                THOTH.Toolbox.eraserActive();
            }
            // Lasso
            if (THOTH.Toolbox.lassoEnabled) {
                THOTH.Toolbox.updateLasso();
            }
        }
        
        if (THOTH._bRightMouseDown) {
            // Brush
            if (THOTH.Toolbox.brushEnabled) {
                if (THOTH._queryData === undefined) return;
                THOTH.Toolbox.eraserActive();
            }
            // Eraser
            if (THOTH.Toolbox.eraserEnabled) {
                if (THOTH._queryData  === undefined) return;
                THOTH.Toolbox.brushActive();
            }
            // Lasso
            if (THOTH.Toolbox.lassoEnabled) {
                THOTH.Toolbox.updateLasso();
            }
        }
    });
    
    // Key down
    THOTH.on("KeyDown", (k) => {
        // Tools
        if (k === "KeyB") {
            THOTH.Toolbox.activateBrush();
            THOTH.setUserControl(false);
        }
        if (k === "KeyE") {
            THOTH.Toolbox.activateEraser();
            THOTH.setUserControl(false);
        }
        if (k === "KeyL") {
            THOTH.Toolbox.activateLasso();
            THOTH.setUserControl(false);
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
            THOTH.setUserControl(true);
        }
        // Ctrl
        if (k === "ControlLeft") {
            THOTH._bCtrlDown = true;
            THOTH.setUserControl(true);
        }
    });

    // Key up
    THOTH.on("KeyUp", (k) => {
        // Shift
        if (k === "ShiftLeft") {
            THOTH._bShiftDown = false;
            THOTH.setUserControl(false);
        }
        // Ctrl
        if (k === "ControlLeft") {
            THOTH._bCtrlDown = false;
            THOTH.setUserControl(false);
        }
    });
};

Events.setupBackgroundEventListeners = () => {
    let w   = window;

    // Resizes
    w.addEventListener('resize', () => {
        THOTH._camera.aspect = w.innerWidth / w.innerHeight;
        THOTH._camera.updateProjectionMatrix();
        THOTH._renderer.setSize(w.innerWidth, w.innerHeight);
        THOTH.Toolbox.resizeLassoCanvas();
    }, false);
};


// Events

Events.setupUIEvents = () => {
    // Create Layer
    THOTH.on("addNewLayer", () => {
        const id = THOTH.Utils.getFirstUnusedKey(THOTH.Scene.currData.layers);
        
        THOTH.fire("createLayer", (id));
        THOTH.firePhoton("createLayer", (id));
        THOTH.History.pushAction(
            THOTH.History.ACTIONS.CREATE_LAYER,
            id
        );
    });

    // Delete Layer
    THOTH.on("removeLayer", (id) => {
        THOTH.fire("deleteLayer", (id));
        THOTH.firePhoton("deleteLayer", (id));
        THOTH.History.pushAction(
            THOTH.History.ACTIONS.DELETE_LAYER,
            id
        );
    });
};

Events.setupSceneEvents = () => {
    // Local
    THOTH.on("createLayer", (id) => {
        THOTH.Scene.createLayer(id);

        const layers = THOTH.Scene.currData.layers; 
        if (layers[id] !== undefined && layers[id].trash === true) THOTH.UI.ressurectLayer(id);
        else THOTH.UI.createLayer(id);
    });

    THOTH.on("deleteLayer", (id) => {
        THOTH.Scene.deleteLayer(id);
        THOTH.UI.deleteLayer(id);
    });
    
    THOTH.on("editLayer", (l) => {
        const id    = l.id;
        const attr  = l.attr;
        const value = l.value;
        THOTH.editLayer(id, attr, value);
    });
    
    THOTH.on("addToSelection", (item) => {
        const id    = item.id;
        const faces = item.faces;
        const layer = THOTH.Scene.currData.layers[id];
        const selection = THOTH.Toolbox.addFacesToSelection(faces, layer.selection);
        
        THOTH.Scene.editLayer(id, "selection", selection);
        THOTH.updateVisibility();
    });
    
    THOTH.on("delFromSelection", (item) => {
        const id    = item.id;
        const faces = item.faces;
        const layer = THOTH.Scene.currData.layers[id];
        const selection = THOTH.Toolbox.delFacesFromSelection(faces, layer.selection);
        
        THOTH.Scene.editLayer(id, "selection", selection);
        THOTH.updateVisibility();
    });
    
    // Photon
    THOTH.onPhoton("createLayer", (id) => {
        THOTH.Scene.createLayer(id);

        const layers = THOTH.Scene.currData.layers; 
        if (layers[id] !== undefined && layers[id].trash === true) THOTH.UI.ressurectLayer(id);
        else THOTH.UI.createLayer(id);
    });
    
    THOTH.onPhoton("deleteLayer", (id) => {
        THOTH.Scene.deleteLayer(id);
        THOTH.UI.deleteLayer(id);
    });
    
    THOTH.onPhoton("editLayer", (l) => {
        const id    = l.id;
        const attr  = l.attr;
        const value = l.value;
        THOTH.Scene.editLayer(id, attr, value);
    });

    THOTH.onPhoton("addToSelection", (item) => {
        const id    = item.id;
        const faces = item.faces;
        const layer = THOTH.Scene.currData.layers[id];
        const selection = THOTH.Toolbox.addFacesToSelection(faces, layer.selection);

        THOTH.Scene.editLayer(id, "selection", selection);
        THOTH.updateVisibility();
    });

    THOTH.onPhoton("delFromSelection", (item) => {
        const id    = item.id;
        const faces = item.faces;
        const layer = THOTH.Scene.currData.layers[id];
        const selection = THOTH.Toolbox.delFacesFromSelection(faces, layer.selection);

        THOTH.Scene.editLayer(id, "selection", selection);
        THOTH.updateVisibility();
    });
};

Events.setupToolboxEvents = () => {
    // Brush
    THOTH.on("endBrush", (item) => {
        const id    = item.id;
        const faces = item.faces;
        
        THOTH.History.pushAction(
            THOTH.History.ACTIONS.SELEC_ADD,
            id,
            faces
        );
        THOTH.fire("addToSelection", {
            id: id,
            faces: faces
        });
        THOTH.firePhoton("addToSelection", {
            id: id,
            faces: faces
        });
    });

    // Eraser
    THOTH.on("endEraser", (item) => {
        const id    = item.id;
        const faces = item.faces;
        
        THOTH.History.pushAction(
            THOTH.History.ACTIONS.SELEC_DEL,
            id,
            faces
        );
        THOTH.fire("delFromSelection", {
            id: id,
            faces: faces
        });
        THOTH.firePhoton("delFromSelection", {
            id: id,
            faces: faces
        });
    });

    // Lasso add
    THOTH.on("endLassoAdd", (item) => {
        const id    = item.id;
        const faces = item.faces;

        THOTH.History.pushAction(
            THOTH.History.ACTIONS.SELEC_ADD,
            id,
            faces
        );
    
        // Fire events
        THOTH.fire("addToSelection", {
            id: id,
            faces: faces
        });
        THOTH.firePhoton("addToSelection", {
            id: id,
            faces: faces
        });
    });

    // Lasso add
    THOTH.on("endLassoDel", (item) => {
        const id    = item.id;
        const faces = item.faces;

        THOTH.History.pushAction(
            THOTH.History.ACTIONS.SELEC_DEL,
            id,
            faces
        );
    
        // Fire events
        THOTH.fire("delFromSelection", {
            id: id,
            faces: faces
        });
        THOTH.firePhoton("delFromSelection", {
            id: id,
            faces: faces
        });
    });
};

Events.setupPhotonEvents = () => {
    // On new user join
    THOTH.on("VRC_UserEnter", () => {
        const layers = THOTH.Scene.currData.layers;
        console.log("AHA")
        if (layers !== undefined) {
            Object.values(layers).forEach((layer) => {
                layer.selection = Array.from(layer.selection);
            });
        }

        THOTH.firePhoton("syncScene", layers);
    });
    
    // Sync scene
    THOTH.onPhoton("syncScene", (layers) => {
        THOTH.Scene.syncScene(layers);
    });
};


export default Events;