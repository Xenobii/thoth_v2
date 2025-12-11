let FE = {};


FE.setup = () => {
    // Maps for accessibility
    FE.modelMap   = FE.initModelMap();
    FE.layerMap   = FE.initLayerMap();
    FE.toolMap    = FE.initToolMap();
    FE.toolOptMap = FE.initToolOptMap();
    
    // Lists
    FE.modelList = FE.setupModelList(FE.modelMap);
    FE.layerList = FE.setupLayerList(FE.layerMap);
    // FE.historyList = FE.setupHistoryList();

    // Toolbars
    FE.topToolbar     = FE.setupTopToolbar();
    FE.userToolbar    = FE.setupUserToolbar();
    FE.mainToolbar    = FE.setupMainToolbar(FE.toolMap);
    FE.toolOptToolbar = FE.setupToolOptToolbar();
    // FE.historyToolbar = FE.setupHistoryToolbar(FE.historyList);

    // Panels
    FE.settingsPanel = FE.setupSettingsPanel();
    FE.modelsPanel   = FE.setupModelsPanel(FE.modelList);
    FE.layersPanel   = FE.setupLayersPanel(FE.layerList);

    // Toast
    FE.toast = FE.createToast();

    // VP
    FE.viewpointCard = FE.setupVPCard();
};


// Maps

FE.initModelMap = () => {
    const modelMap = new Map();
    for (const modelName of THOTH.Models.modelMap.keys()) {
        const modelController = THOTH.UI.createModelController(modelName);
        modelMap.set(modelName, modelController);
    }
    return modelMap;
};

FE.initLayerMap = () => {
    const layerMap = new Map();
    for (const layerName of THOTH.Layers.layerMap.keys()) {
        const layerControler = THOTH.UI.createLayerController(layerName);
        layerMap.set(layerName, layerControler);
    }
    return layerMap;
};

FE.initToolMap = () => {
    const toolMap = new Map();

    // Brush
    const elBrush = ATON.UI.createButton({
        icon   : THOTH.PATH_RES_ICONS + "brush.png",
        tooltip: "Brush tool (B)",
        onpress: () => THOTH.fire("selectBrush"),
    });
    toolMap.set("brush", elBrush);
    // Eraser
    const elEraser  = ATON.UI.createButton({
        icon   : THOTH.PATH_RES_ICONS + "eraser.png",
        tooltip: "Eraser tool (E)",
        onpress: () => THOTH.fire("selectEraser")
    });
    toolMap.set("eraser", elEraser);
    // Lasso
    const elLasso   = ATON.UI.createButton({
        icon   : THOTH.PATH_RES_ICONS + "lasso.png",
        tooltip: "Lasso tool (L)",
        onpress: () => THOTH.fire("selectLasso")
    });
    toolMap.set("lasso", elLasso);
    // Measure
    // const elMeasure = ATON.UI.createButton({
    //     icon   : "measure",
    //     tooltip: "Measure distance (M)",
    //     onpress: () => THOTH.fire("selectMeasure")
    // });
    // toolMap.set("measure", elMeasure);
    // No tool
    const elNoTool  = ATON.UI.createButton({
        icon   : THOTH.PATH_RES_ICONS + "none.png",
        tooltip: "No Tool (N)",
        onpress: () => THOTH.fire("selectNone")
    });
    toolMap.set("no_tool", elNoTool);
    // Undo
    const elUndo = ATON.UI.createButton({
        icon   : THOTH.PATH_RES_ICONS + "undo.png",
        tooltip: "Undo (Ctrl + Z)",
        onpress: () => THOTH.History.undo()
    });
    toolMap.set("undo", elUndo);
    // Redo
    const elRedo = ATON.UI.createButton({
        icon   : THOTH.PATH_RES_ICONS + "redo.png",
        tooltip: "Redo (Ctrl + Y)",
        onpress: () => THOTH.History.redo()
    });
    toolMap.set("redo", elRedo);
    // Home
    // const elHome = ATON.UI.createButton({
    //     icon   : "home",
    //     tooltip: "Go home",
    //     onpress: () => {
    //         ATON.Nav.requestHome(0.3);
    //     }
    // });
    // toolMap.set("home", elHome);
    
    return toolMap;
};

FE.initToolOptMap = () => {
    const toolOptMap = new Map();

    // Brush
    const elBrushOpt = THOTH.UI.createBrushOptions();
    toolOptMap.set("brush", elBrushOpt);
    // Eraser
    const elEraserOpt = THOTH.UI.createBrushOptions();
    toolOptMap.set("eraser", elEraserOpt);
    // Lasso
    const elLassoOpt = THOTH.UI.createLassoOptions();
    toolOptMap.set("lasso", elLassoOpt);
    // No tool
    const elNoToolOpt = ATON.UI.createContainer();
    toolOptMap.set("no_tool", elNoToolOpt);

    return toolOptMap;
};


// Lists

FE.setupModelList = (modelMap) => {
    const elModelList = ATON.UI.createContainer();

    for (const [ , elModelController] of modelMap) {
        elModelList.append(elModelController)
    }

    return elModelList;
};

FE.setupLayerList = (layerMap) => {
    const elLayerList = ATON.UI.createContainer({classes: ""});
    
    for (const [ , elLayerController] of layerMap) {
        elLayerList.append(elLayerController)
    }
    
    return elLayerList;
};

FE.setupHistoryList = () => {
    const elHistoryList = ATON.UI.createContainer();

    return elHistoryList;
};


// Toolbars

FE.setupTopToolbar = () => {
    const topToolbar = ATON.UI.get("topToolbar");

    topToolbar.append(
        // TEXTaiLES
        ATON.UI.createButton({
            icon    : THOTH.PATH_RES_ICONS + "textailes.png",
            text    : "TEXTaiLES",
            onpress : () => window.open("https://www.echoes-eccch.eu/textailes/", "_blank"),
            tooltip : "Go to the TEXTaiLES website"
        }),
        // Settings
        ATON.UI.createButton({
            icon   : "settings",
            text   : "Settings",
            onpress: () => ATON.UI.showSidePanel({
                header  : "Settings",
                body    : FE.settingsPanel
            }),
            tooltip: "Options"
        }),
        // Scene
        ATON.UI.createButton({
            icon   : 'scene',
            text   : "Models",
            onpress: () => ATON.UI.showSidePanel({
                header: "Scene",
                body  : FE.modelsPanel
            }),
            tooltip: "Models options"
        }),
        // Layers
        ATON.UI.createButton({
            icon   : "layers",
            text   : "Layers",
            onpress: () => ATON.UI.showSidePanel({
                header: "Annotation Layers",
                body  : FE.layersPanel
            }),
            tooltop : "Layers"
        }),
        // Info
        ATON.UI.createButton({
            icon   : "info",
            text   : "Info",
            onpress: () => window.open("https://textailes.github.io/thoth-documentation/", "_blank"),
            tooltip: "Open documentation"
        }),
    );

    return topToolbar;
};

FE.setupUserToolbar = () => {
    const userToolbar = ATON.UI.get("userToolbar");

    userToolbar.append(
        THOTH.UI.createUserButton(),
        ATON.UI.createButton({
            icon    : "vrc",
            onpress : () => THOTH.setupPhoton(),
            tooltip : "Connect to Photon"
        })
    );

    return userToolbar;
};

FE.setupMainToolbar = (toolMap) => {
    const mainToolbar = ATON.UI.get("mainToolbar");

    for (const [ , toolElement] of toolMap) {
        mainToolbar.append(toolElement);
    }

    return mainToolbar;
};

FE.setupToolOptToolbar = () => {
    const toolOptToolbar = ATON.UI.get("toolOptToolbar");

    return toolOptToolbar;
};

FE.setupHistoryToolbar = (historyList) => {
    const historyToolbar = ATON.UI.get("historyToolbar");
    const elButtons = ATON.UI.createContainer();
    elButtons.append(
        ATON.UI.createButton({
            icon   : THOTH.PATH_RES_ICONS + "undo.png",
            tooltip: "Undo (Ctrl + Z)",
            onpress: () => THOTH.History.undo()
        }),
        ATON.UI.createButton({
            icon   : THOTH.PATH_RES_ICONS + "redo.png",
            tooltip: "Redo (Ctrl + Y)",
            onpress: () => THOTH.History.redo()
        })
    );
    const elHeader = THOTH.UI.createSplitRow({
        classes: "bg-body-secondary",
        colLeft: 7,
        itemsLeft: ATON.UI.createButton({
            text: "History",
        }),
        itemsRight: elButtons,
    });
    historyToolbar.append(elHeader, historyList);

    return historyToolbar;
};


// Panels

FE.setupSettingsPanel = () => {
    const elOptionsBody = ATON.UI.createContainer();
    const elMode        = ATON.UI.createContainer();
    const elVP          = ATON.UI.createContainer();

    // Mode
    elMode.append(
        ATON.UI.createButton({
            icon    : THOTH.PATH_RES_ICONS + "dark-mode.png",
            onpress : () => ATON.UI.setTheme("dark"),
            tooltip : "Set to dark mode"
        }),
        ATON.UI.createButton({
            icon    : THOTH.PATH_RES_ICONS + "light-mode.png",
            onpress : () => ATON.UI.setTheme("light"),
            tooltip : "Set to light mode"
        })
    );

    // Viewpoints
    elVP.append(
        THOTH.UI.createBool({
            text    : "Show viewpoints",
            value   : true,
            onchange: (input) => THOTH.SVP.toggleVPNodes(input)
        }),
        ATON.UI.createSlider({
            label  : "Node scale",
            range  : [0.1, 2.0],
            step   : 0.1,
            value  : 1.0,
            oninput: (input) => THOTH.SVP.resizeVPNodes(input)
        }),
    );

    // Options Tree
    const elOptions = ATON.UI.createTreeGroup({
        items: [
            {
                title  : "UI Mode",
                open   : false,
                content: elMode
            },
            {
                title  : "Viewpoints",
                open   : false,
                content: elVP
            }
        ]
    });
    
    elOptionsBody.append(elOptions);
    
    return elOptionsBody;
};

FE.setupModelsPanel = (elModelList) => {
    const elBody       = ATON.UI.createContainer();
    const elTopOptions = ATON.UI.createContainer({classes: "row g-0 align-items-center w-100 rounded-2 px-2 py-1 mb-1"});
    
    // Top buttons
    elTopOptions.append(
        ATON.UI.createButton({
            icon   : "link",
            text   : "Export changes",
            variant: "success",
            tooltip: "Export changes",
            onpress: () => THOTH.UI.modalExport()
        }),
        ATON.UI.createButton({
            icon   : "add",
            text   : "Add model",
            variant: "info",
            onpress: () => THOTH.UI.modalAddModel(),
        }),
    );
    elBody.append(elTopOptions, elModelList);
    
    return elBody;
};

FE.setupLayersPanel = (elLayerList) => {
    const elBody       = ATON.UI.createContainer();
    const elTopOptions = ATON.UI.createContainer({classes: "row g-0 align-items-center w-100 rounded-2 px-2 py-1 mb-1"});

    // Scene controller
    const elSceneController = THOTH.UI.createSceneController();

    // Top buttons
    elTopOptions.append(
        ATON.UI.createButton({
            icon   : "link",
            text   : "Export changes",
            variant: "success",
            tooltip: "Export changes",
            onpress: () => THOTH.UI.modalExport(),
        }),
        ATON.UI.createButton({
            text   : "New Layer",
            icon   : "add",
            variant: "info",
            tooltip: "Create new layer",
            onpress: () => THOTH.fire("createLayer"),
        }),
    );
    elBody.append(elSceneController, elTopOptions, elLayerList);

    return elBody;
};


// Layers

FE.addNewLayer = (layerId) => {
    // Resurrect layer if it already exists
    if (FE.layerMap.has(layerId)) {
        FE.layerMap.get(layerId).style.display = 'flex';
        return;
    }
    // Create new
    const newLayerController = THOTH.UI.createLayerController(layerId);
    FE.layerMap.set(layerId, newLayerController);
    FE.layerList.append(newLayerController);
};

FE.deleteLayer = (layerName) => {
    FE.layerMap.get(layerName).style.display = 'none';
    if (THOTH.Layers.activeLayer === layerName) THOTH.Layers.activeLayer = undefined;
    FE.handleElementHighlight(null, FE.layerMap);
};


// Models

FE.addModel = (modelName) => {
    // Handle resurrection for undo
    if (FE.modelMap.has(modelName)) {
        FE.modelMap.get(modelName).style.display = 'flex';
        return;
    }
    // Create new
    const newModelController = THOTH.UI.createModelController(modelName);
    FE.modelMap.set(modelName, newModelController);
    FE.modelList.append(newModelController);
};

FE.deleteModel = (modelName) => {
    FE.modelMap.get(modelName).style.display = 'none';
};


// Misc

FE.handleElementHighlight = (elname, elMap) => {
    for (const [buttonName, elButton] of elMap) {
        if (buttonName === elname) {
            elButton.classList.add('bg-body-tertiary', 'active')
        }
        else {
            elButton.classList.remove('bg-body-tertiary', 'active')
        }
    }
};

FE.toggleControllerVisibility = (controller, visible) => {
    if (visible) {
        if (controller) {
            controller.classList.remove("opacity-50", "text-muted")
        }
    }
    else if (!visible) {
        if (controller) {
            controller.classList.add("opacity-50", "text-muted");
        }
    }
};

FE.handleToolOptions = (elToolName) => {
    const elOptions = FE.toolOptMap.get(elToolName);
    FE.toolOptToolbar.replaceChildren(elOptions);
    FE.toolOptToolbar.style.display = 'inline-block';
};


// VP

FE.setupVPCard = () => {
    const elCard = ATON.UI.get("vpCard");

    return elCard;
};

FE.showVPCard = (id) => {
    const modelName = id.split("_vp_")[0];
    const vpId      = id.split("_vp_")[1];

    const viewpoint = THOTH.SVP.viewpoints[modelName][vpId];
    const imageURL  = viewpoint.image;
    
    const elFooter = ATON.UI.createContainer();
    elFooter.append(
        ATON.UI.createButton({
            text   : "Close",
            icon   : "cancel",
            onpress: () => FE.viewpointCard.replaceChildren()
        })
    );
    FE.viewpointCard.replaceChildren(
        ATON.UI.createCard({
            title     : id,
            size      : "large",
            cover     : imageURL,
            onactivate: () => THOTH.UI.modalVPImage(viewpoint),
            footer    : elFooter
        }),
    );
};


// Toast

FE.createToast = () => {
    const elBody = ATON.UI.get("toastElement");

    return elBody;
};

FE.showToast = (msg, timeout=2000) => {
    const elMsg = THOTH.UI.createSplitRow({
        classes: "bg-body-secondary opacity-75",
        colLeft  : 10,
        itemsLeft: ATON.UI.createButton({
            text: msg,
        }),
        itemsRight: ATON.UI.createButton({
            icon   : "cancel",
            onpress: () => {
                FE.toast.replaceChildren();
                clearTimeout(FE._toastTimeout);
                FE._toastTimeout = null;
            },
        }),
    });
    
    FE.toast.replaceChildren(elMsg);

    // Handle timeout
    if (FE._toastTimeout) {
        clearTimeout(FE._toastTimeout);
    }

    FE._toastTimeout = setTimeout(() => {
        FE.toast.replaceChildren();
        FE._toastTimeout = null;
    }, timeout);
};



export default FE;