/*===========================================================================

    THOTH
    UI modules

    Author: steliosalvanos@gmail.com

===========================================================================*/
let UI = {}


// Setup

UI.setup = () => {
    UI.setupToolbars();
    UI.setupPanels();

    UI.setupLayerElements();

    UI.setupToast();
    UI.setupVPPreview();
};


// General

UI.setTheme = (theme) => {
    // Change to light/dark theme
    ATON.UI.setTheme(theme);
};

UI.setBackground = () => {
    // TBI
};

UI.showToolbars = () => {
    UI._elBottomToolbar.classList.remove("d-none");
};

UI.changeScale = () => {
    // TBI
};

UI.createBool = (options) => {
    let container = document.createElement('div');
    container.classList.add('form-check', 'thoth-bool');

    let el = document.createElement('input');
    el.classList.add('form-check-input');
    el.setAttribute('type', 'checkbox');

    if (options.value) el.checked = options.value;

    if (options.text) {
        let label = document.createElement('label');
        label.classList.add('form-check-label');
        label.innerHTML = options.text;
        if (options.icon) ATON.UI.prependIcon(label, options.icon);
        container.appendChild(label);
        container.appendChild(el);
    }
    else container.appendChild(el);

    if (options.variant) container.classList.add("form-check-" + options.variant);

    if (options.size) {
        if (options.size === "large") el.classList.add("form-check-lg");
        if (options.size === "small") el.classList.add("form-check-sm");
    }

    if (options.classes) el.className = el.className + " " + options.classes;

    if (options.tooltip) el.setAttribute("title", options.tooltip);

    if (options.onchange) el.onchange = () => options.onchange(el.checked);

    return container;
};

UI.modelTransformControl = (options) => {
    // Same as ATON's but with parsable modelName 
    let baseid = ATON.Utils.generateID("ftrans");
    
    let el = document.createElement('div');
    el.id = baseid;

    let N = undefined;
    if (options.node) N = ATON.getSceneNode(options.node);
    
    // Position
    if (options.position){
        let elPos = THOTH.UI.createVectorControl({
            vector   : N.position,
            step     : options.position.step,
            reset    : [0,0,0],
            modelName: N.name,
        }, "position");
        el.append(ATON.UI.elem("<label class='form-label hathor-text-block' for='"+elPos.id+"'>Position</label>") );
        el.append(elPos);
    }

    // Scale
    if (options.scale){
        let elScale = THOTH.UI.createVectorControl({
            vector   : N.scale,
            step     : options.scale.step,
            reset    : [1,1,1],
            modelName: N.name,
        }, "scale");
        el.append(ATON.UI.elem("<label class='form-label hathor-text-block' for='"+elScale.id+"'>Scale</label>") );
        el.append(elScale);
    }

    // Rotation
    if (options.rotation){
        let elRot = THOTH.UI.createVectorControl({
            vector   : N.rotation,
            step     : options.rotation.step,
            reset    : [0,0,0],
            modelName: N.name,
        }, "rotation");
        el.append( ATON.UI.elem("<label class='form-label hathor-text-block' for='"+elRot.id+"'>Rotation</label>") );
        el.append( elRot );
    }

    return el;
};

UI.createVectorControl = (options, transform)=>{
    // Same as ATON's with additional control for collaborative updates and history
    let baseid = ATON.Utils.generateID("vec3");

    let V = undefined;
    if (options.vector) V = options.vector;

    let step = 0.01;
    if (options.step) step = options.step;

    let posx = V? V.x : 0.0;
    let posy = V? V.y : 0.0;
    let posz = V? V.z : 0.0;

    let el = ATON.UI.elem(`
        <div class="input-group mb-3 aton-inline">
            <input type="number" class="form-control aton-input-x" placeholder="x" aria-label="x" step="${step}" value="${posx}">
            <input type="number" class="form-control aton-input-y" placeholder="y" aria-label="y" step="${step}" value="${posy}">
            <input type="number" class="form-control aton-input-z" placeholder="z" aria-label="z" step="${step}" value="${posz}">
        </div>
    `);

    if (options.label){
        el.prepend( ATON.UI.elem("<span class='input-group-text aton-inline'>"+options.label+"</span>"));
    }

    if (options.reset){
        let R = options.reset;
        el.append(ATON.UI.createButton({
            icon   : "cancel",
            classes: "btn-default",
            onpress: ()=>{
                elInputX.value = R[0];
                elInputY.value = R[1];
                elInputZ.value = R[2];

                const l = {
                    modelName: options.modelName,
                    value    : {
                        x: R[0],
                        y: R[1],
                        z: R[2],
                    },
                }
                if (transform === "position") {
                    THOTH.fire("modelTransformPosInput", (l));
                }
                else if (transform === "rotation") {
                    THOTH.fire("modelTransformRotInput", (l)); 
                }
                if (options.onupdate) options.onupdate();
            }
        }))
    }

    el.id = baseid;

    let elInputX = el.children[0];
    let elInputY = el.children[1];
    let elInputZ = el.children[2];

    elInputX.oninput = () => {
        const l = {
            modelName: options.modelName,
            value    : {
                x: elInputX.value,
                y: elInputY.value,
                z: elInputZ.value,
            },
        }
        if (transform === "position") {
            THOTH.fire("modelTransformPosInput", (l));
        }
        else if (transform === "rotation") {
            THOTH.fire("modelTransformRotInput", (l));
        }
        if (options.onupdate) options.onupdate();
    };

    elInputY.oninput = () => {
        const l = {
            modelName: options.modelName,
            value    : {
                x: elInputX.value,
                y: elInputY.value,
                z: elInputZ.value,
            },
        }
        if (transform === "position") {
            THOTH.fire("modelTransformPosInput", (l));
        }
        else if (transform === "rotation") {
            THOTH.fire("modelTransformRotInput", (l));
        }
        if (options.onupdate) options.onupdate();
    };

    elInputZ.oninput = ()=>{
        const l = {
            modelName: options.modelName,
            value    : {
                x: elInputX.value,
                y: elInputY.value,
                z: elInputZ.value,
            },
        }
        if (transform === "position") {
            THOTH.fire("modelTransformPosInput", (l));
        }
        else if (transform === "rotation") {
            THOTH.fire("modelTransformRotInput", (l));
        }
        if (options.onupdate) options.onupdate();
    };

    // Handle multi-field paste (comma separated values - eg: 2,3.5,8.1)
    // let onpaste = (ev)=>{
    //     ev.preventDefault();

    //     let clip = ev.clipboardData.getData('text');
    //     clip = clip.split(",");
    //     if (clip.length === 3){
    //         elInputX.value = parseFloat(clip[0]);
    //         elInputY.value = parseFloat(clip[1]);
    //         elInputZ.value = parseFloat(clip[2]);

    //         if (V){
    //             V.set(elInputX.value, elInputY.value, elInputZ.value);
    //             if (options.onupdate) options.onupdate();
    //         }
    //     }
    // };

    // elInputX.onpaste = onpaste;
    // elInputY.onpaste = onpaste;
    // elInputZ.onpaste = onpaste;

    return el;
};


// Toolbars

UI.setupToolbars = () => {
    UI._elTopToolbar         = ATON.UI.get("topToolbar");
    UI._elUserToolbar        = ATON.UI.get("userToolbar");
    UI._elMainToolbar        = ATON.UI.get("mainToolbar");
    UI._elToolOptionsToolbar = ATON.UI.get("toolOptToolbar");
    
    // Top Toolbar
    UI._elTopToolbar.append(
        UI.createTestButton(() => {
            console.log(THOTH.Scene.root.children)
        }),
        ATON.UI.createButton({
            icon    : THOTH.PATH_RES_ICONS + "textailes.png",
            text    : "TEXTaiLES",
            onpress : () => window.open("https://www.echoes-eccch.eu/textailes/", "_blank"),
            tooltip : "Go to the TEXTaiLES website"
        }),
        ATON.UI.createButton({
            icon   : "settings",
            text   : "Settings",
            onpress: () => ATON.UI.showSidePanel({
                header  : "Settings",
                body    : UI._elOptionsPanel
            }),
            tooltip: "Options"
        }),
        ATON.UI.createButton({
            icon   : 'scene',
            text   : "Scene",
            onpress: () => ATON.UI.showSidePanel({
                header: "Scene",
                body  : UI._elScenePanel
            }),
            tooltip: "Scene options"
        }),
        ATON.UI.createButton({
            icon   : "layers",
            text   : "Layers",
            onpress: () => ATON.UI.showSidePanel({
                header: "Annotation Layers",
                body  : UI._elLayersPanel
            }),
            tooltop : "Layers"
        }),
        ATON.UI.createButton({
            icon   : "link",
            text   : "Export",
            onpress: () => UI.modalExport(),
            tooltip: "Export changes",
        }),
        ATON.UI.createButton({
            icon   : "info",
            text   : "Info",
            onpress: () => window.open("https://textailes.github.io/thoth-documentation/", "_blank"),
            tooltip: "Open documentation"
        }),
    );
    
    // User Toolbar
    UI._elUserToolbar.append(
        UI.createUserButton(),
        ATON.UI.createButton({
            icon    : "vrc",
            onpress : () => THOTH.setupPhoton(),
            tooltip : "Connect to Photon"
        })
    );
    
    // Main Toolbar
    UI.toolElements = new Map();

    const elBrush   = ATON.UI.createButton({
        icon   : THOTH.PATH_RES_ICONS + "brush.png",
        tooltip: "Brush tool (B)",
        onpress: () => THOTH.fire("selectBrush")
    });
    const elEraser  = ATON.UI.createButton({
        icon   : THOTH.PATH_RES_ICONS + "eraser.png",
        tooltip: "Eraser tool (E)",
        onpress: () => THOTH.fire("selectEraser")
    });
    const elLasso   = ATON.UI.createButton({
        icon   : THOTH.PATH_RES_ICONS + "lasso.png",
        tooltip: "Lasso tool (L)",
        onpress: () => THOTH.fire("selectLasso")
    });
    const elMeasure = ATON.UI.createButton({
        icon   : "measure",
        tooltip: "Measure distance (M)",
        onpress: () => THOTH.fire("selectMeasure")
    });
    const elNoTool  = ATON.UI.createButton({
        icon   : THOTH.PATH_RES_ICONS + "none.png",
        tooltip: "No Tool (N)",
        onpress: () => THOTH.fire("selectNone")
    });
    const elUndo = ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "undo.png",
        tooltip : "Undo (Ctrl + Z)",
        onpress : () => THOTH.History.undo()
    });
    const elRedo = ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "redo.png",
        tooltip : "Redo (Ctrl + Y)",
        onpress : () => THOTH.History.redo()
    });
    const elHome = ATON.UI.createButton({
        icon   : "home",
        tooltip: "Go home",
        onpress: () => {
            ATON.Nav.requestHome(0.3);
        }
    });
   
    UI.toolElements.set('brush', elBrush);
    UI.toolElements.set('eraser', elEraser);
    UI.toolElements.set('lasso', elLasso);
    UI.toolElements.set('no_tool', elNoTool);
    UI.toolElements.set('measure', elMeasure);
    UI._elMainToolbar.append(
        elHome,
        elBrush, 
        elEraser,
        elLasso,
        elNoTool,
        elMeasure,
        elUndo,
        elRedo,
    );
    
    // Tool options
    const createBrushOptions = () => {
        const elOptionsBrush = ATON.UI.createContainer({ classes: "p-1" });

        const createOptionRow = (labelText, controlEl) => {
            const row = ATON.UI.createContainer({ classes: "d-flex w-100 align-items-center mb-2" });
            const left = ATON.UI.createContainer({ classes: "col-5 pe-2 text-truncate" });
            const right = ATON.UI.createContainer({ classes: "col" });

            left.textContent = labelText;
            // make control fill available space
            if (controlEl && controlEl.classList) controlEl.classList.add("w-100");
            right.append(controlEl);

            row.append(left, right);
            return row;
        };

        // Size (use existing createSlider)
        UI._elBrushSlider = ATON.UI.createSlider({
            range  : [0, 10],
            value  : THOTH.Toolbox.selectorSize,
            oninput: (v) => THOTH.Toolbox.setSelectorSize(v),
        });
        elOptionsBrush.append(createOptionRow("Size", UI._elBrushSlider));

        return elOptionsBrush;
    };

    const createLassoOptions = () => {
        const elOptionsLasso = ATON.UI.createContainer({ classes: "p-1" });

        const createOptionRow = (labelText, controlEl) => {
            const row   = ATON.UI.createContainer({ classes: "d-flex w-100 align-items-center mb-2" });
            const left  = ATON.UI.createContainer({ classes: "col-4 pe-2 text-truncate" });
            const right = ATON.UI.createContainer({ classes: "col" });

            left.textContent = labelText;
            if (controlEl && controlEl.classList) controlEl.classList.add("w-100");
            right.append(controlEl);

            row.append(left, right);
            return row;
        };

        // Lasso Precision
        const precisionSlider = ATON.UI.createSlider({
            range   : [0.1, 1],
            value   : THOTH.Toolbox.lassoPrecision,
            step    : 0.1,
            oninput : (v) => THOTH.Toolbox.lassoPrecision = v,
        });
        elOptionsLasso.append(createOptionRow("Precision", precisionSlider));

        // Normal Threshold
        const normalSlider = ATON.UI.createSlider({
            range  : [-1, 1],
            step   : 0.1,
            value  : THOTH.Toolbox.normalThreshold,
            oninput: (v) => THOTH.Toolbox.normalThreshold = v,
        });
        elOptionsLasso.append(createOptionRow("Normal threshold", normalSlider));

        // Select Occluded Faces (use createBool but without its internal label)
        const occludedBool = UI.createBool({
            // omit 'text' so createBool only creates the input control
            onchange: (input) => THOTH.Toolbox.selectObstructedFaces = input,
            tooltip : "Select occluded faces",
        });
        elOptionsLasso.append(createOptionRow("Select occluded faces", occludedBool));

        return elOptionsLasso;
    };
    UI._elOptionsBrush = createBrushOptions(),
    UI._elOptionsLasso = createLassoOptions(),

    UI._elToolOptionsToolbar.append(
        UI._elOptionsBrush,
        UI._elOptionsLasso
    );

    // Manage visibility
    UI.hideBrushOptions();
    UI.hideLassoOptions();
};


// Side Panels

UI.setupPanels = () => {
    // Settings
    const setupSettingsPanel = () => {
        let elOptionsBody = ATON.UI.createContainer();
        let elMode        = ATON.UI.createContainer();
        let elMaps        = ATON.UI.createContainer();
        let elVP          = ATON.UI.createContainer();
        let elMeasures    = ATON.UI.createContainer();
        
        // Mode container
        elMode.append(ATON.UI.createButton({
            icon    : THOTH.PATH_RES_ICONS + "dark-mode.png",
            onpress : () => UI.setTheme("dark"),
            tooltip : "Set to dark mode"
        }));
        elMode.append(ATON.UI.createButton({
            icon    : THOTH.PATH_RES_ICONS + "light-mode.png",
            onpress : () => UI.setTheme("light"),
            tooltip : "Set to light mode"
        }));
    
        // Mapping container
        elMaps.append(ATON.UI.createDropdown({
            title   : "Normal Map",
            items   : [
                {
                    el: ATON.UI.createButton({
                        text   : "none",
                        icon   : "clone",
                        onpress: () => THOTH.removeNormalMap()
                    })
                },
                {
                    el: ATON.UI.createButton({
                        text   : "MSII",
                        icon   : "clone",
                        onpress: () => {
                            THOTH.updateNormalMap(THOTH.Scene.normalMapPath);
                            UI.showToast("TBI fully");
                        }
                    })
                }
            ]
        }));
    
        // Viewpoint container
        elVP.append(UI.createBool({
            text    : "Show viewpoints",
            value   : true,
            onchange: (input) => THOTH.SVP.toggleVPNodes(input)
        }));
        elVP.append(ATON.UI.createSlider({
            label  : "Node scale",
            range  : [0.1, 2.0],
            step   : 0.1,
            value  : 1.0,
            oninput: (input) => THOTH.SVP.resizeVPNodes(input)
        }))
    
        // Measurements container
        elMeasures.append(ATON.UI.createButton({
                            icon   : "cancel",
                            text   : "Clear Measurements",
                            tooltip: "Clear all measurements",
                            onpress: () => ATON.SUI.clearMeasurements()
                        })
        );
    
        // Options container
        elOptionsBody.append(ATON.UI.createTreeGroup({
            items: 
            [
                {
                    title  : "UI Mode",
                    open   : false,
                    content: elMode
                },
                {
                    title  : "Mapping",
                    open   : false,
                    content: elMaps
                },
                {
                    title  : "Viewpoints",
                    open   : false,
                    content: elVP
                },
                {
                    title  : "Measurements",
                    open   : false,
                    content: elMeasures
                }
            ]
        }));

        return elOptionsBody;
    };

    // Scene
    const setupScenePanel = () => {
        // Scene buttons
        const elSceneButtons = ATON.UI.createContainer({
            classes: "row g-0 align-items-center w-100 rounded-2 px-2 py-1 mb-1"
        });
        elSceneButtons.append(
            ATON.UI.createButton({
                icon   : "link",
                text   : "Export changes",
                variant: "success",
                tooltip: "Export changes",
                onpress: () => UI.modalExport()
            }),
            ATON.UI.createButton({
                icon   : "add",
                text   : "Add model",
                variant: "info",
                onpress: () => {}
            }),
        );

        // Model management
        const elModelList = ATON.UI.createContainer();
        UI.modelMap = new Map();
        if (THOTH.Scene?.modelMap) {
            THOTH.Scene.modelMap.forEach((model, modelName) => {
                const controller = createModelController(modelName);
                elModelList.append(controller);
                UI.modelMap.set(modelName, controller);
            });
        }

        // Return body
        const elBody = ATON.UI.createContainer();
        elBody.append(
            elSceneButtons,
            elModelList
        );
        
        return elBody;
    };

    const createModelController = (modelName) => {
        const elRow   = ATON.UI.createContainer({ classes: "row g-0 align-items-center w-100 rounded-2 border px-2 py-1 mb-1" });
        const elLeft  = ATON.UI.createContainer({ classes: "col-8 d-flex align-items-center" });
        const elRight = ATON.UI.createContainer({ classes: "col-4 d-flex justify-content-end align-items-center" });

        // Visibility
        const elVis = ATON.UI.createButton({
            icon   : "visibility",
            size   : "small",
            onpress: () => {
                THOTH.toggleModelVisibility(modelName);
            }
        }); 

        // Name 
        const elName = ATON.UI.createButton({
            text   : modelName,
            size   : "small",
            onpress: () => {}
        });
        // Delete
        const elDel = ATON.UI.createButton({
            icon   : "trash",
            onpress: () => {}
        });
        // Edit
        const elEdit = ATON.UI.createButton({
            icon   : "edit",
            onpress: () => ATON.UI.showSidePanel({
                header: modelName,
                body  : editModelPanel(modelName)
            })
        })

        elLeft.append(elVis, elName);
        elRight.append(elEdit, elDel);
        elRow.append(elLeft, elRight);

        return elRow;
    };

    const editModelPanel = (modelName) => {
        let N = ATON.getSceneNode(modelName);
        if (!N) return;
        
        const elBody = ATON.UI.createContainer();

        // Header
        const elModelHead = ATON.UI.createContainer({
            classes: "row g-0 align-items-center w-100 rounded-2 px-2 py-1 mb-1"
        });
        const elModelHeadLeft  = ATON.UI.createContainer({ 
            classes: "col-4 d-flex align-items-center" 
        });
        const elModelHeadRight  = ATON.UI.createContainer({ 
            classes: "col-8 d-flex justify-content-end align-items-center" 
        });
        const elFocus = ATON.UI.createButton({
            text   : "Focus",
            classes: "btn-default",
            onpress: ()=>{
                ATON.Nav.requestPOVbyNode(N, 0.2);
            }
        });
        const elBack = ATON.UI.createButton({
            icon   : "back",
            onpress: () => ATON.UI.showSidePanel({
                header: "Scene",
                body  : UI._elScenePanel
            })
        });
        const elBuildVP = ATON.UI.createButton({
            text   : "Build Viewpoints",
            classes: "btn-default",
            icon   : "pov",
            onpress: () => UI.modalBuildVP(modelName)
        });
        elModelHeadLeft.append(elBack);
        elModelHeadRight.append(elFocus, elBuildVP)
        elModelHead.append(elModelHeadLeft, elModelHeadRight)

        // Transforms
        const createMeshList = (modelName) => {
            const elContainer = ATON.UI.createContainer();
            for (const [meshName, ] of THOTH.Scene.modelMap.get(modelName).meshes) {
                elContainer.append(ATON.UI.createButton({
                    text   : meshName,
                    icon   : "collection-item"
                }))
            };
            return elContainer;
        };
        const elOptions = ATON.UI.createTreeGroup({
            items: [
                {
                    title  : "Meshes",
                    open   : true,
                    content: createMeshList(modelName)
                },
                {
                    title  : "Transform",
                    open   : true,
                    content: UI.modelTransformControl({
                        node    : modelName,
                        position: true,
                        scale   : false,
                        rotation: true,
                    })
                }
            ]
        });

        // Body
        elBody.append(
            elModelHead,
            elOptions
        );

        return elBody
    };

    // Layers
    const setupLayersPanel = () => {
        const elLayersPanel = ATON.UI.createContainer({
            classes: "row g-0 align-items-center w-100 rounded-2 px-2 py-1 mb-1"
        });
        UI.elLayerList = ATON.UI.createContainer();
        
        elLayersPanel.append(
            createSceneLayer(),
            ATON.UI.createButton({
                text   : "New Layer",
                icon   : "add",
                variant: "info",
                tooltip: "Create new layer",
                onpress: () => THOTH.fire("createLayer")
            }),
            UI.elLayerList,
        );
        
        return elLayersPanel;
    };

    const createSceneLayer = () => {
        const elRow   = ATON.UI.createContainer({ classes: "row g-0 align-items-center w-100 bg-body-tertiary rounded-2 px-2 py-1 mb-1" });
        const elLeft  = ATON.UI.createContainer({ classes: "col-6 d-flex align-items-center" });
        const elRight = ATON.UI.createContainer({ classes: "col-6 d-flex justify-content-end align-items-center" });

        // Name
        const elName = ATON.UI.createButton({
            text: "Scene Layer",
            icon: "scene",
            size: "small"
        });
        // Metadata
        const elMetadata = ATON.UI.createButton({
            text   : "Scene Metadata",
            icon   : "list",
            size   : "small",
            onpress: () => UI.modalMetadata(-1),
        });

        elLeft.append(elName);
        elRight.append(elMetadata);
        elRow.append(elLeft, elRight);
        return elRow;
    };
    
    UI._elOptionsPanel = setupSettingsPanel();
    UI._elLayersPanel  = setupLayersPanel();
    UI._elScenePanel   = setupScenePanel();
};
 

// Buttons

UI.createUserButton = ()=>{
    UI._elUserBTN = ATON.UI.createButton({
        icon    : "user",
        onpress : UI.modalUser,
        tooltip : "User"
    });

    ATON.checkAuth((u)=>{
        UI._elUserBTN.classList.add("aton-btn-highlight");
    });
    UI._elUserBTN.classList.add("thoth-dark-btn");

    return UI._elUserBTN;
};

UI.createTestButton = (testfunc) => {
    return ATON.UI.createButton({
        text    : "Test",
        onpress : () => {
            if (testfunc) testfunc()
        },
        tooltip : "test"   
    });
};


// Tool options

UI.showBrushOptions = () => {
    ATON.UI.showElement(UI._elOptionsBrush);
};

UI.hideBrushOptions = () => {
    ATON.UI.hideElement(UI._elOptionsBrush);
};

UI.showLassoOptions = () => {
    ATON.UI.showElement(UI._elOptionsLasso);
};

UI.hideLassoOptions = () => {
    ATON.UI.hideElement(UI._elOptionsLasso);
};


// Layers

UI.setupLayerElements = () => {
    UI.layerElements = new Map();

    const layers = THOTH.Scene.currData.layers;
    if (layers === undefined) return;

    Object.values(layers).forEach((layer) => {
        const id = layer.id;
        UI.createLayer(id);
    });

    UI.handleLayerHighlight();
};

UI.createLayer = (id) => {
    const layers = THOTH.Scene.currData.layers;

    // Resurrect layer if it exists
    if (layers[id] !== undefined && layers[id].trash === true) {
        const elLayer = UI.layerElements.get(id);
    
        // Show
        elLayer.style.display = 'flex';
    }
    else {
        const createLayerController = (id) => {
        let layer = layers[id];
    
        const elRow   = ATON.UI.createContainer({ classes: "row g-0 align-items-center w-100 border rounded-2 px-2 py-1 mb-1" });
        const elLeft  = ATON.UI.createContainer({ classes: "col-6 d-flex align-items-center" });
        const elRight = ATON.UI.createContainer({ classes: "col-6 d-flex justify-content-end align-items-center" });
            
            // Visibility
            const elVis = ATON.UI.createButton({
                icon    : "visibility",
                size    : "small",
                onpress : () => THOTH.toggleLayerVisibility(id)
            });
            // Name
            const elName = ATON.UI.createButton({
                text   : layer.name,
                size   : "small",
                onpress: () => {
                    THOTH.Scene.activeLayer = layer;
                    UI.handleLayerHighlight();
                }
            });
            THOTH.Events.enableRename(elName, id);
            
            const elCP = ATON.UI.createColorPicker({
                color   : layer.highlightColor,
                oninput: (color) => {
                    layer.highlightColor = color
                    THOTH.updateVisibility();
                },
            });
            elCP.style.width = "60px";
    
            // Delete
            const elDel = ATON.UI.createButton({
                icon   : "trash",
                size   : "small",
                onpress: () => THOTH.fire("deleteLayer", (id))
            });
            
            // Metadata
            const elMetadata = ATON.UI.createButton({
                icon   : "list",
                size   : "small",
                tooltip: "Edit metadata",
                onpress: () => UI.modalMetadata(id),
            });
    
            elLeft.append(elVis, elName);
            elRight.append(elMetadata, elCP, elDel);
            elRow.append(elLeft, elRight);
    
            return elRow;
        };
     
        const elLayer = createLayerController(id);
    
        // Add to panel
        UI.elLayerList.append(elLayer);
    
        // Add to layer list
        UI.layerElements.set(id, elLayer);
    }

};

UI.deleteLayer = (id) => {
    const elLayer = UI.layerElements.get(id);

    // Hide
    elLayer.style.display = 'none';
};

UI.handleLayerHighlight = () => {
    const layers = THOTH.Scene.currData.layers;
    const activeLayer = THOTH.Scene.activeLayer
    for (const [id, elLayer] of UI.layerElements) {
        if (layers[id] === activeLayer) {
            elLayer.classList.add('active', 'bg-body-tertiary');
        } else {
            elLayer.classList.remove('active', 'bg-body-tertiary');
        }
    }
};

UI.handleToolHighlight = (tool_id) => {
    for (const [id, elTool] of UI.toolElements) {
        if (tool_id === id) {
            elTool.classList.add('aton-btn-highlight');
        }
        else {
            elTool.classList.remove('aton-btn-highlight');
        }
    }
};


// VP

UI.showVPPreview = (vp) => {
    const viewpoint = THOTH.Scene.currData.viewpoints[vp];
    const subtitle  = 
        "Position: " + viewpoint.position +
        ",\n Target: " + viewpoint.target +
        ",\n FOV: " + viewpoint.fov;

    const elFooter = ATON.UI.createContainer();
    elFooter.append(
        ATON.UI.createButton({
            text   : "Close",
            icon   : "cancel",
            onpress: () => UI.elVPPreviewer.replaceChildren()
        })
    );
    UI.elVPPreviewer.replaceChildren(
        ATON.UI.createCard({
            title     : vp,
            subtitle  : subtitle,
            size      : "large",
            cover     : viewpoint["image"],
            onactivate: () => UI.modalVPImage(vp),
            footer    : elFooter
        }),
    );
};

UI.setupVPPreview = () => {
    UI.elVPPreviewer = ATON.UI.createContainer({
        id     : "VPPreviewer",
        classes: "thoth-vp-preview"
    });
    UI.elVPPreviewer.style.display = "block";
    UI.elVPPreviewer.style.opacity = 1;
    document.body.appendChild(UI.elVPPreviewer)
};


// Toast

UI.setupToast = () => {
    const createToast = () => {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'position-fixed bottom-0 end-0 p-3';
        container.style.zIndex = 1100;

        const toast = document.createElement('div');
        toast.className = 'toast align-items-center text-bg-body-secondary border-0';
        toast.setAttribute('role', 'status');
        toast.setAttribute('aria-live', 'polite');
        toast.setAttribute('aria-atomic', 'true');

        const toastBody = document.createElement('div');
        toastBody.className = 'd-flex toast-body align-items-center';
        toast.message = document.createElement('span');
        toastBody.appendChild(toast.message);

        const btnClose = document.createElement('button');
        btnClose.type = 'button';
        btnClose.className = 'btn-close btn-close-white ms-2 mb-1';
        btnClose.setAttribute('aria-label', 'Close');
        btnClose.onclick = () => {
            toast.classList.remove('show');
            setTimeout(() => { container.style.display = 'none'; }, 200);
        };
        toastBody.appendChild(btnClose);

        toast.appendChild(toastBody);
        container.appendChild(toast);
        document.body.appendChild(container);

        container._toast   = toast;
        container._message = toast.message;
        return container;
    };
    UI._elToast = createToast();
    // hide initially
    UI._elToast.style.display = 'none';
};
 
UI.showToast = (message, timeout = 2500) => {
    if (!UI._elToast) return;
    const container = UI._elToast;
    const toast = container._toast;
    const msgEl = container._message;

    msgEl.textContent = message;
    container.style.display = 'block';
    // show bootstrap toast (class 'show' used by bs to display)
    toast.classList.add('show');

    if (UI._toastTimeout) clearTimeout(UI._toastTimeout);
    UI._toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => { container.style.display = 'none'; }, 200);
    }, timeout);
};


// Modals

UI.modalUser = () => {
    ATON.checkAuth(
        // Logged
        (u)=>{
            let elBody = ATON.UI.createContainer({ classes: "d-grid gap-2" });
            elBody.append(
                ATON.UI.createButton({
                    text   : "Logout",
                    icon   : "exit",
                    classes: "aton-btn-highlight",
                    onpress: ()=>{
                        ATON.REQ.logout();
                        ATON.UI.hideModal();
                        if (UI._elUserBTN) UI._elUserBTN.classList.remove("aton-btn-highlight");
                    }
                })
            );

            ATON.UI.showModal({
                header: u.username,
                body: elBody
            })
        },
        // Not logged
        ()=>{
            ATON.UI.showModal({
                header: "User",
                body: ATON.UI.createLoginForm({
                    onSuccess: (r)=>{
                        ATON.UI.hideModal();
                        if (UI._elUserBTN) UI._elUserBTN.classList.add("aton-btn-highlight");
                    },
                    onFail: ()=>{
                        // TODO:
                    }
                })
            })
        }
    );
};

UI.modalExport = () => {
    let elFooter = ATON.UI.createContainer();
    let elBody = ATON.UI.createContainer();
    
    // Body
    const elInfo = ATON.UI.createContainer();
    if (THOTH.collabCollabExists()) {
        elInfo.textContent = `AN EXISTING VERSION OF THIS SCENE EXISTS. OVERWRITE IT?`;
    }
    else {
        elInfo.textContent = `OVERWRITE CURRENT SCENE DATA?`;
    }
    elBody.append(elInfo);

    // Footer
    elFooter.append(
        ATON.UI.createButton({
            text   : "Export",
            icon   : "link",
            size   : "large",
            variant: "success",
            onpress: () => {
                THOTH.Scene.exportLayers();
                ATON.UI.hideModal();
            }
        }),
        ATON.UI.createButton({
            text   : "Cancel",
            size   : "large",
            variant: "secondary",
            onpress: () => ATON.UI.hideModal(),
        }),
    );

    ATON.UI.showModal({
        header: "Export changes?",
        body  : elBody,
        footer: elFooter
    });
};

UI.modalMetadata = (id) => {
    let data_temp = null;
    // id = -1 -> entire scene
    if (id === -1) {
        data_temp = structuredClone(THOTH.Scene.currData.sceneMetadata);
        $.getJSON(THOTH.PATH_RES_SCHEMA + "annotation_schema.json", (data) => {
            // Main body
            let elMetadataBody = UI.createMetadataEditor(data, data_temp);
            // Buttons
            let elMetadataFooter = ATON.UI.createContainer();
            // OK Button
            let l = {
                id      : id,
                data    : data_temp,
                prevData: THOTH.Scene.currData.sceneMetadata
            };
            elMetadataFooter.append(ATON.UI.createButton({
                text   : "Save changes",
                size   : "large",
                variant: "success",
                onpress: () => {
                    THOTH.fire("editMetadata", l);
                    ATON.UI.hideModal();
                }
            }));
            // Cancel
            elMetadataFooter.append(ATON.UI.createButton({
                text   : "Cancel",
                size   : "large",
                variant: "secondary",
                onpress: () => ATON.UI.hideModal(),
            }));
            ATON.UI.showModal({
                header: `Edit scene metadata`,
                body  : elMetadataBody,
                footer: elMetadataFooter
            });
        });
    }
    else {
        data_temp = structuredClone(THOTH.Scene.currData.layers[id].metadata);
    
        $.getJSON(THOTH.PATH_RES_SCHEMA + "annotation_schema.json", (data) => {
            // Main body
            let elMetadataBody = UI.createMetadataEditor(data, data_temp);
            // Buttons
            let elMetadataFooter = ATON.UI.createContainer();
            // Inherit attributes
            elMetadataFooter.append(ATON.UI.createButton({
                text   : "Inherit from scene",
                size   : "large",
                variant: "primary",
                onpress: () => {
                    THOTH.Scene.inheritFromScene(id);
                    ATON.UI.hideModal();
                }
            }));
            // OK Button
            let l = {
                id      : id,
                data    : data_temp,
                prevData: THOTH.Scene.currData.layers[id].metadata
            };
            elMetadataFooter.append(ATON.UI.createButton({
                text   : "Save changes",
                size   : "large",
                variant: "success",
                onpress: () => {
                    THOTH.fire("editMetadata", l);
                    ATON.UI.hideModal();
                }
            }));
            // Cancel
            elMetadataFooter.append(ATON.UI.createButton({
                text   : "Cancel",
                size   : "large",
                variant: "secondary",
                onpress: () => ATON.UI.hideModal(),
            }));
            ATON.UI.showModal({
                header: "Edit metadata for layer " + id,
                body  : elMetadataBody,
                footer: elMetadataFooter
            });
        });
    }
};

UI.modalBuildVP = (modelName) => {
    THOTH.Scene.readColmap(modelName).then((colmapMap) => {
        if (!colmapMap) {
            UI.showToast("No COLMAP text detected");
            return;
        };
        const recommended = Math.min(Math.floor(colmapMap.size / 2), 20);

        // Return variables
        let vpNumber = recommended;
        let vpMap    = new Map();
        let mode     = "uniform";
    
        const elBody   = ATON.UI.createContainer();
        const elFooter = ATON.UI.createContainer();
    
        // Info
        const elInfo = ATON.UI.createContainer();
        elInfo.textContent = `Found ${colmapMap.size} cameras \n
        Recomended number of viewpoints: ${recommended}`;

        // Uniform Sampling
        const vpUniformSelect = ATON.UI.createInputText({
            placeholder: "Number of viewpoints",
            value      : recommended,
            label      : "Number of generated viewpoints",
            oninput    : (v) => {
                vpNumber = THOTH.Utils.bindInput(v, 1, colmapMap.size);
                vpUniformSelect.querySelector('input').value = vpNumber;
            },
        });
        // Manual Sampling
        const vpManualSelect = ATON.UI.createTagsComponent({
            list    : Array.from(colmapMap.keys()),
            label   : "Generated viewpoints",
            tags    : [],
            onaddtag: (v) => {
                if (colmapMap.has(v)) vpMap.set(v, colmapMap.get(v));
            },
            onremovetag: (v) => {
                vpMap.delete(v);
            }
        })
        
        // Options
        const elOptions = ATON.UI.createContainer();
        const elButtonsRow = ATON.UI.createContainer({
            classes: "row g-1 mb-2"
        });
        const elBtnColLeft = ATON.UI.createContainer({
            classes: "col-6"
        });
        const elBtnColRight = ATON.UI.createContainer({
            classes: "col-6"
        });

        const manualBtn = ATON.UI.createButton({
            text   : "Manual Sampling",
            classes: "w-100",
            onpress: () => {
                mode  = "manual";
                updateMode();
            },
        });
        const uniformBtn = ATON.UI.createButton({
            text   : "Uniform Sampling",
            classes: "w-100",
            onpress: () => {
                mode  = "uniform";
                updateMode();
            }
        });
        elBtnColLeft.append(uniformBtn);
        elBtnColRight.append(manualBtn);
        elButtonsRow.append(elBtnColLeft, elBtnColRight);
        elOptions.append(elButtonsRow);
        
        const updateMode = () => {
            if (mode === "uniform") {
                vpMap = new Map();
                uniformBtn.classList.add("aton-btn-highlight");
                manualBtn.classList.remove("aton-btn-highlight");
                elSamplingMethod.replaceChildren(vpUniformSelect);
            } else {
                vpMap = new Map();
                manualBtn.classList.add("aton-btn-highlight");
                uniformBtn.classList.remove("aton-btn-highlight");
                elSamplingMethod.replaceChildren(vpManualSelect);
            }
        };
        
        const elSamplingMethod = ATON.UI.createContainer();
        updateMode();

        elBody.append(elInfo, elOptions, elSamplingMethod);
        
        // Footer 
        const elBuildBtn = ATON.UI.createButton({
            text   : "Build",
            size   : "large",
            variant: "success",
            onpress: () => {
                if (mode === "manual") {
                    THOTH.Scene.buildViewpoints(vpMap, modelName);
                    THOTH.SVP.buildVPNodes(modelName);
                    ATON.UI.hideModal();
                }
                else if (mode === "uniform") {
                    // Sample from vpNumber
                    vpMap = THOTH.Utils.uniformSamplingFromMap(colmapMap, vpNumber);
                    THOTH.Scene.buildViewpoints(vpMap, modelName);
                    THOTH.SVP.buildVPNodes(modelName);
                    ATON.UI.hideModal();
                }
            }
        });
        const elCancelBtn = ATON.UI.createButton({
            text   : "Cancel",
            size   : "large",
            variant: "secondary",
            onpress: () => ATON.UI.hideModal()
        });
        elFooter.append(elBuildBtn, elCancelBtn);
        
        ATON.UI.showModal({
            header: "Build viewpoints for " + modelName,
            body  : elBody,
            footer: elFooter,
        });
    });
};

UI.modalVPImage = (node) => {
    const viewpoint = THOTH.Scene.currData.viewpoints[node];
    
    let elBody   = ATON.UI.createContainer();
    let elFooter = ATON.UI.createContainer();
    
    // Image
    let elImg = document.createElement("img");
    elImg.src = viewpoint["image"];
    elImg.onerror = () => {};

    elBody.classList.add("thoth-vp-image");
    elBody.append(
        elImg,
    );

    elFooter.append(ATON.UI.createButton({
        text   : "Download",
        icon   : "download",
        onpress: () => THOTH.Utils.downloadImage(viewpoint["image"]),
        variant: "success",
        tooltip: "Download image",
    }));

    ATON.UI.showModal({
        header: node,
        body  : elBody,
        footer: elFooter,
    });
};


// Other

UI.createMetadataEditor = (data, data_temp) => {
    let elData = ATON.UI.createContainer();
    
    // Properties creation logic
    for (const key in data) {
        if (key === "required") continue;
        
        let elAttr    = ATON.UI.createContainer({classes: "row"});
        let elInput   = ATON.UI.createContainer({classes: "col-12 col-md-7"});
        let elDisplay = ATON.UI.createContainer({classes: "col-12 col-md-5"});

        const attr = data[key];
        
        // Initialize values

        if (attr["type"]) {
            switch (attr.type.toLowerCase()) {
                case "string":
                    elInput = ATON.UI.createInputText({
                        label      : key,
                        value      : (data_temp && data_temp[key] !== undefined) ? data_temp[key] : undefined,
                        placeholder: "string",
                        oninput    : (v) => {
                            data_temp[key] = v;
                        }
                    });
                    break;
                case "integer":
                    elInput = ATON.UI.createInputText({
                        placeholder: "integer",
                        value      : (data_temp && data_temp[key] !== undefined) ? data_temp[key] : undefined,
                        label      : key,
                        oninput    : (v) => data_temp[key] = v,
                    });
                    break;
                case "float" :
                    elInput = ATON.UI.createInputText({
                        placeholder: "float",
                        label      : key,
                        value      : (data_temp && data_temp[key] !== undefined) ? data_temp[key] : undefined,
                        oninput    : (v) => {
                            data_temp[key] = v;
                        }
                    });
                    break;
                case "bool":
                    elInput = UI.createBool({
                        text    : key,
                        value   : (data_temp && data_temp[key] !== undefined) ? data_temp[key] : undefined,
                        onchange: (input) => data_temp[key] = input
                    });
                    break;
                case "enum":
                    elDisplay.textContent = data_temp[key];
                    elInput = ATON.UI.createDropdown({
                        title: key,
                        items: attr.value.map(option => ({
                            el  : ATON.UI.createButton({
                                text   : option,
                                onpress: () => {
                                    data_temp[key]        = option;
                                    elDisplay.textContent = option;
                                }
                            })
                        }))
                    });
                    
                    break;
                case "enum-multiple":
                    elInput = ATON.UI.createTagsComponent({
                        list    : attr.value,
                        label   : key,
                        tags    : data_temp[key],
                        onaddtag: (k) => {
                            if (!data_temp[key].includes(k)) {
                                data_temp[key].push(k);
                            }
                        },
                        onremovetag: (k) => {
                            const index = data_temp[key].indexOf(k);
                            if (index !== -1) {
                                data_temp[key].splice(index, 1);
                            }
                        },
                    });
                    break;
                default:
                    break;
            }
            elAttr.append(elInput, elDisplay);
        }
        else if (typeof attr === "object") {
            elAttr = ATON.UI.createTreeGroup({
                items: 
                [
                    {
                        title   : key,
                        open    : false,
                        content : UI.createMetadataEditor(attr, data_temp[key])
                    }
                ]
            });
        }
        if (elAttr) {
            elData.append(elAttr);
        }
    }
    return elData;
};


export default UI;