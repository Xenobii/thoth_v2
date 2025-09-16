/*===========================================================================

    THOTH
    UI modules

    Author: steliosalvanos@gmail.com

===========================================================================*/
let UI = {}


UI.PATH_RES_ICONS = "../thoth_v2/js/res/icons/";


// Setup

UI.setup = () => {
    ATON.UI.createButtonHome();

    UI.setupToolbars();
    UI.populateToolbars();

    UI.setupPanels();
};

UI.setupEventListeners = () => {
    // Events
    // Keybinds
    // VRC
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
    );

    // User Toolbar
    UI._elUserToolbar.append(
        UI.createUserButton()
    );

    // Main Toolbar
    UI._elMainToolbar.append(
        UI.createBrushButton(),
        UI.createEraserButton(),
        UI.createLassoButton(),
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

    elLayersBody.append(
        UI.createNewLayerButton(),
        UI.createTestButton()
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
        onpress : () => {},
        tooltip : "Brush tool"
    });
};

UI.createEraserButton = () => {
    return ATON.UI.createButton({
        icon    : UI.PATH_RES_ICONS + "eraser.png",
        onpress : () => {},
        tooltip : "Eraser tool"
    });
};

UI.createLassoButton = () => {
    return ATON.UI.createButton({
        icon    : UI.PATH_RES_ICONS + "lasso.png",
        onpress : () => {},
        tooltip : "Lasso tool"
    });
};

UI.createUndoButton = () => {
    return ATON.UI.createButton({
        icon    : "prev",
        onpress : () => {},
        tooltip : "Undo"
    });

};

UI.createRedoButton = () => {
    return ATON.UI.createButton({
        icon    : "next",
        onpress : () => {},
        tooltip : "Undo"
    });
};

UI.createNewLayerButton = () => {
    return ATON.UI.createButton({
        text    : "Add New Layer",
        icon    : "add",
        onpress : () => {},
        tooltip : "Add new layer"   
    });
};

UI.createTestButton = () => {
    return ATON.UI.createButton({
        text    : "Test",
        onpress : () => UI.Test(),
        tooltip : "test"   
    });
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
    let root = ATON.getOrCreateSceneNode();
    console.log(root)
};

export default UI;