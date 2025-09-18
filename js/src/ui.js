/*===========================================================================

    THOTH
    UI modules

    Author: steliosalvanos@gmail.com

===========================================================================*/
let UI = {}


UI.PATH_RES_ICONS = "../thoth_v2/js/res/icons/";


// Setup

UI.setup = () => {
    UI.setupToolbars();
    UI.populateToolbars();

    UI.setupPanels();
    UI.setupLayerElements();
};


// General

UI.setTheme = (theme) => {
    // Change to light/dark theme
    ATON.UI.setTheme(theme);
};

UI.setBackground = () => {
    
};

UI.hideToolbars = () => {
    UI._elTopToolbar.classList.add("d-none");
    UI._elMainToolbar.classList.add("d-none");
};

UI.showToolbars = () => {
    UI._elBottomToolbar.classList.remove("d-none");
};

UI.changeScale = () => {

};


// Toolbars

UI.setupToolbars = () => {
    UI._elTopToolbar    = ATON.UI.get("topToolbar");
    UI._elUserToolbar   = ATON.UI.get("userToolbar");
    UI._elMainToolbar   = ATON.UI.get("mainToolbar");
};

UI.populateToolbars = () => {
    // Bottom Toolbar
    UI._elTopToolbar.append(
        UI.createTextailesButton(),
        UI.createOptionsButton(),
        UI.createLayersButton(),
        UI.createExportButton(),
    );

    // User Toolbar
    UI._elUserToolbar.append(
        UI.createUserButton(),
        UI.createVRCButton()
    );

    // Main Toolbar
    UI._elMainToolbar.append(
        UI.createBrushButton(),
        UI.createEraserButton(),
        UI.createLassoButton(),
        UI.createNoToolButton(),
        UI.createUndoButton(),
        UI.createRedoButton()
    );
};


// Side Panels

UI.setupPanels = () => {
    UI._elOptionsPanel = UI.createPanelOptions();
    UI._elLayersPanel = UI.createPanelLayers();

};

UI.createPanelOptions = () => {
    ATON.UI.setSidePanelLeft();

    let elOptionsBody = ATON.UI.createContainer();
    let elMode = ATON.UI.createContainer();
    let elMaps = ATON.UI.createContainer();

    // Mode container
    elMode.append(ATON.UI.createButton({
        icon    : UI.PATH_RES_ICONS + "dark-mode.png",
        onpress : () => UI.setTheme("dark"),
        tooltip : "Set to dark mode"
    }));
    elMode.append(ATON.UI.createButton({
        icon    : UI.PATH_RES_ICONS + "light-mode.png",
        onpress : () => UI.setTheme("light"),
        tooltip : "Set to light mode"
    }));

    // Options container
    elOptionsBody.append(ATON.UI.createTreeGroup({
        items: [
            {
                title   : "Mode",
                open    : false,
                content : elMode
            },
            {
                title   : "Mapping",
                open    : false,
                content : elMaps
            }
        ]
    }));
    
    return elOptionsBody
};

UI.showPanelOptions = () => {
    ATON.UI.showSidePanel({
        header  : "Options",
        body    : UI._elOptionsPanel
    });
};

UI.createPanelLayers = () => {
    ATON.UI.setSidePanelRight();

    let elLayersBody = ATON.UI.createContainer();
    UI.elLayerList = ATON.UI.createContainer();

    elLayersBody.append(
        UI.createNewLayerButton(),
        UI.createTestButton(),
        UI.elLayerList,
    );

    return elLayersBody;
};

UI.showPanelLayers = () => {
    ATON.UI.showSidePanel({
        header  : "Layers",
        body    : UI._elLayersPanel
    });
};


// Buttons

UI.createTextailesButton = () => {
    return ATON.UI.createButton({
        icon    : UI.PATH_RES_ICONS + "textailes.png",
        text    : "TEXTaiLES",
        onpress : () => window.open("https://www.echoes-eccch.eu/textailes/", "_blank"),
        tooltip : "Go to the TEXTaiLES website"
    });
};

UI.createOptionsButton = () => {
    return ATON.UI.createButton({
        icon    : "settings",
        onpress : () => UI.showPanelOptions(),
        tooltip : "Options"
    });
};

UI.createLayersButton = () => {
    return ATON.UI.createButton({
        icon    : "layers",
        onpress : () => UI.showPanelLayers(),
        tooltop : "Layers"
    });
};

UI.createUserButton = ()=>{
    UI._elUserBTN = ATON.UI.createButton({
        icon    : "user",
        onpress : UI.modalUser,
        tooltip : "User"
    });

    ATON.checkAuth((u)=>{
        UI._elUserBTN.classList.add("aton-btn-highlight");
    });

    return UI._elUserBTN;
};

UI.createBrushButton = () => {
    return ATON.UI.createButton({
        icon    : UI.PATH_RES_ICONS + "brush.png",
        onpress : () => {
            THOTH.Toolbox.activateBrush();
            THOTH.setUserControl(false);
        },
        tooltip : "Brush tool"
    });
};

UI.createEraserButton = () => {
    return ATON.UI.createButton({
        icon    : UI.PATH_RES_ICONS + "eraser.png",
        onpress : () => {
            THOTH.Toolbox.activateEraser();
            THOTH.setUserControl(false);
        },
        tooltip : "Eraser tool"
    });
};

UI.createLassoButton = () => {
    return ATON.UI.createButton({
        icon    : UI.PATH_RES_ICONS + "lasso.png",
        onpress : () => {
            THOTH.Toolbox.activateLasso();
            THOTH.setUserControl(false);
        },
        tooltip : "Lasso tool"
    });
};

UI.createNoToolButton = () => {
    return ATON.UI.createButton({
        icon    : UI.PATH_RES_ICONS + "none.png",
        onpress : () => THOTH.Toolbox.deactivate(),
    });
};

UI.createUndoButton = () => {
    return ATON.UI.createButton({
        icon    : UI.PATH_RES_ICONS + "undo.png",
        onpress : () => THOTH.History.undo(),
        tooltip : "Undo"
    });
};

UI.createRedoButton = () => {
    return ATON.UI.createButton({
        icon    : UI.PATH_RES_ICONS + "redo.png",
        onpress : () => THOTH.History.redo(),
        tooltip : "Undo"
    });
};

UI.createNewLayerButton = () => {
    return ATON.UI.createButton({
        text    : "Create New Layer",
        icon    : "add",
        onpress : () => THOTH.fire("createLayer"),
        tooltip : "Create new layer"   
    });
};

UI.createExportButton = () => {
    return ATON.UI.createButton({
        icon    : "link",
        onpress : () => THOTH.Scene.exportLayers(),
        tooltip : "Export changes",
    });
};

UI.createVRCButton = () => {
    return ATON.UI.createButton({
        icon    : "vrc",
        onpress : () => THOTH.setupPhoton(),
        tooltip : "Connect to Photon"
    });
};  

UI.createTestButton = () => {
    return ATON.UI.createButton({
        text    : "Test",
        onpress : () => UI.Test(),
        tooltip : "test"   
    });
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
};

UI.createLayer = (id) => {
    const elLayer = UI.createLayerController(id);

    // Add to panel
    UI._elLayersPanel.append(elLayer);

    // Add to layer list
    UI.layerElements.set(id, elLayer);
};

UI.deleteLayer = (id) => {
    const elLayer = UI.layerElements.get(id);

    // Hide
    elLayer.classList.remove("aton-layer");
    elLayer.classList.add("deleted-layer");
};

UI.resurrectLayer = (id) => {
    const elLayer = UI.layerElements.get(id);

    // Hide
    elLayer.classList.remove("deleted-layer");
    elLayer.classList.add("aton-layer");
};

UI.createLayerController = (id) => {
    let layer = THOTH.Scene.currData.layers[id];

    const elLayerController = ATON.UI.createElementFromHTMLString(`<div class="aton-layer"></div>`);
    const elVis = ATON.UI.createButton({
        icon    : "visibility",
        size    : "small",
        onpress : () => THOTH.toggleLayerVisibility(id)
    });
    const elName = ATON.UI.createButton({
        text    : layer.name,
        size    : "small",
        onpress : () => THOTH.Scene.activeLayer = layer,
    });
    const elDel = ATON.UI.createButton({
        icon    : "trash",
        size    : "small",
        onpress : () => THOTH.fire("deleteLayer", (id))
    });

    elLayerController.append(
        elVis,
        elName,
        elDel,
    );

    return elLayerController;
};  

UI.showLayerAttributes = (id) => {

};



// Other 

UI.modalUser = ()=>{

    ATON.checkAuth(
        // Logged
        (u)=>{
            let elBody = ATON.UI.createContainer({ classes: "d-grid gap-2" });
            elBody.append(
                ATON.UI.createButton({
                    text: "Logout",
                    icon: "exit",
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

UI.Test = () => {
    let test = THOTH.Scene.currData.layers;
    console.log(test)
};


export default UI;