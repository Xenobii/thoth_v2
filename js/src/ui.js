/*===========================================================================

    THOTH
    UI modules

    Author: steliosalvanos@gmail.com

===========================================================================*/
let UI = {}



// Setup

UI.setup = () => {
    UI.setupToolbars();
    UI.populateToolbars();

    UI.setupPanels();
    UI.setupLayerElements();
    UI.setupNavElements();

    UI.setupToast();
};


// General

UI.setTheme = (theme) => {
    // Change to light/dark theme
    ATON.UI.setTheme(theme);
};

UI.setBackground = () => {
    // TBI
};

UI.hideToolbars = () => {
    UI._elTopToolbar.classList.add("d-none");
    UI._elMainToolbar.classList.add("d-none");
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


// Toolbars

UI.setupToolbars = () => {
    UI._elTopToolbar         = ATON.UI.get("topToolbar");
    UI._elUserToolbar        = ATON.UI.get("userToolbar");
    UI._elMainToolbar        = ATON.UI.get("mainToolbar");
    UI._elToolOptionsToolbar = ATON.UI.get("toolOptToolbar");
};

UI.populateToolbars = () => {
    // Bottom Toolbar
    UI._elTopToolbar.append(
        UI.createTextailesButton(),
        UI.createOptionsButton(),
        UI.createLayersButton(),
        UI.createExportButton(),
        UI.createVPButton(),
        UI.createInfoButton(),
    );
    
    // User Toolbar
    UI._elUserToolbar.append(
        UI.createUserButton(),
        UI.createVRCButton()
    );
    
    // Main Toolbar
    UI.toolElements = new Map();

    const elBrush  = UI.createBrushButton();
    const elEraser = UI.createEraserButton();
    const elLasso  = UI.createLassoButton();
    const elNoTool = UI.createNoToolButton();
   
    UI.toolElements.set('brush', elBrush);
    UI.toolElements.set('eraser', elEraser);
    UI.toolElements.set('lasso', elLasso);
    UI.toolElements.set('no_tool', elNoTool);
    UI._elMainToolbar.append(
        elBrush, 
        elEraser,
        elLasso,
        elNoTool,
        UI.createUndoButton(),
        UI.createRedoButton()
    );
    
    // Tool options
    UI._elToolOptionsToolbar.append(
        UI.createBrushOptions(),
        UI.createLassoOptions(),
    );

    // Manage visibility
    UI.hideBrushOptions();
    UI.hideLassoOptions();
};

// Side Panels

UI.setupPanels = () => {
    UI._elOptionsPanel = UI.createPanelOptions();
    UI._elLayersPanel  = UI.createPanelLayers();
    UI._elVPPanel      = UI.createPanelVP();
};

UI.createPanelOptions = () => {
    ATON.UI.setSidePanelLeft();

    let elOptionsBody = ATON.UI.createContainer();
    let elMode  = ATON.UI.createContainer();
    let elMaps  = ATON.UI.createContainer();

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
    elMaps.append(ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "light-mode.png",
        onpress : () => console.log("placeholder")
    }));

    // Options container
    elOptionsBody.append(ATON.UI.createTreeGroup({
        items: 
        [
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
    
    return elOptionsBody;
};

UI.showPanelOptions = () => {
    ATON.UI.showSidePanel({
        header  : "Layers",
        body    : UI._elOptionsPanel
    });
};  

UI.createPanelLayers = () => {
    ATON.UI.setSidePanelRight();

    let elLayersBody = ATON.UI.createContainer();
    UI.elLayerList = ATON.UI.createContainer();

    elLayersBody.append(
        UI.createObjectController(),
        UI.createNewLayerButton(),
        UI.elLayerList,
    );

    return elLayersBody;
};

UI.createPanelVP = () => {
    ATON.UI.setSidePanelRight();

    let elVPBody = ATON.UI.createContainer();
    UI.elVPList = ATON.UI.createContainer();

    elVPBody.append(
        UI.createHomeButton(),
        UI.elVPList,
    )
    return elVPBody;
};

UI.showPanelLayers = () => {
    ATON.UI.showSidePanel({
        header: "Layers",
        body  : UI._elLayersPanel
    });
};

UI.showPanelVP = () => {
    ATON.UI.showSidePanel({
        header: "COLMAP Navigation",
        body  : UI._elVPPanel
    });
};


// Buttons

UI.createTextailesButton = () => {
    return ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "textailes.png",
        text    : "TEXTaiLES",
        onpress : () => window.open("https://www.echoes-eccch.eu/textailes/", "_blank"),
        tooltip : "Go to the TEXTaiLES website"
    });
};

UI.createOptionsButton = () => {
    return ATON.UI.createButton({
        icon   : "settings",
        onpress: () => UI.showPanelOptions(),
        tooltip: "Options"
    });
};

UI.createLayersButton = () => {
    return ATON.UI.createButton({
        icon    : "layers",
        onpress : () => UI.showPanelLayers(),
        tooltop : "Layers"
    });
};

UI.createInfoButton = () => {
    return ATON.UI.createButton({
        icon   : "info",
        onpress: () => window.open("https://xenobii.github.io/thoth-documentation/", "_blank"),
        tooltip: "Open documentation"
    });
};

UI.createVPButton = () => {
    return ATON.UI.createButton({
        icon   : "geoloc",
        onpress: () => UI.showPanelVP(),
        tooltip: "Navigate colmap"
    })
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
    UI._elUserBTN.classList.add("thoth-dark-btn");

    return UI._elUserBTN;
};

UI.createBrushButton = () => {
    return ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "brush.png",
        tooltip : "Brush tool",
        onpress : () => {
            THOTH.fire("selectBrush");
            UI.handleToolHighlight('brush');
        }
    });
};

UI.createEraserButton = () => {
    return ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "eraser.png",
        tooltip : "Eraser tool",
        onpress : () => {
            THOTH.fire("selectEraser");
            UI.handleToolHighlight('eraser');
        }
    });
};

UI.createLassoButton = () => {
    return ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "lasso.png",
        tooltip : "Lasso tool",
        onpress : () => {
            THOTH.fire("selectLasso");
            UI.handleToolHighlight('lasso');
        }
    });
};

UI.createNoToolButton = () => {
    return ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "none.png",
        onpress : () => {
            THOTH.fire("selectNone");
            UI.handleToolHighlight('no_tool')
        }
    });
};

UI.createUndoButton = () => {
    return ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "undo.png",
        tooltip : "Undo",
        onpress : () => {
            THOTH.History.undo();
        }
    });
};

UI.createRedoButton = () => {
    return ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "redo.png",
        tooltip : "Redo",
        onpress : () => {
            THOTH.History.redo();
        }
    });
};

UI.createNewLayerButton = () => {
    return ATON.UI.createButton({
        text    : "New Layer",
        icon    : "add",
        variant : "success",
        tooltip : "Create new layer",
        onpress : () => THOTH.fire("createLayer")
           
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

UI.createHomeButton = () => {
    return ATON.UI.createButton({
        icon   : "home",
        tooltip: "Go home",
        onpress: () => {
            ATON.Nav.requestHome(0.3);
        }
    });
};

UI.createTestButton = () => {
    return ATON.UI.createButton({
        text    : "Test",
        onpress : () => UI.Test(),
        tooltip : "test"   
    });
};


// Tool options

UI.createBrushOptions = () => {
    UI._elOptionsBrush = ATON.UI.createContainer();

    // Size
    UI._elBrushSlider = ATON.UI.createSlider({
        label   : "Size",
        range   : [0, 10],
        value   : THOTH.Toolbox.selectorSize,
        oninput : (v) => THOTH.Toolbox.setSelectorSize(v),
    });
    UI._elOptionsBrush.append(UI._elBrushSlider);

    return UI._elOptionsBrush;
};

UI.createLassoOptions = () => {
    UI._elOptionsLasso = ATON.UI.createContainer();
    
    UI._elOptionsLasso.append(
        // Lasso Precision
        ATON.UI.createSlider({
            label   : "Precision",
            range   : [0.1, 1],
            value   : THOTH.Toolbox.lassoPrecision,
            step    : 0.1,
            oninput : (v) => THOTH.Toolbox.lassoPrecision = v,
        }),
        // Normal Threshold
        ATON.UI.createSlider({
            label   : "Normal threshold",
            range   : [-1, 1],
            step    : 0.1,
            value   : THOTH.Toolbox.normalThreshold,
            oninput : (v) => THOTH.Toolbox.normalThreshold = v,
        }),
        // Select Obstructed Faces
        UI.createBool({
            text    : "Select occluded faces",
            onpress : (input) => THOTH.Toolbox.selectObstructedFaces = input,
            tooltip : "Select occluded faces",
        }),
    )

    return UI._elOptionsLasso;
};

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
    const elLayer = UI.createLayerController(id);

    // Add to panel
    UI.elLayerList.append(elLayer);

    // Add to layer list
    UI.layerElements.set(id, elLayer);
};

UI.deleteLayer = (id) => {
    const elLayer = UI.layerElements.get(id);

    // Hide
    elLayer.style.display = 'none';
};

UI.resurrectLayer = (id) => {
    const elLayer = UI.layerElements.get(id);
    
    // Show
    elLayer.style.display = 'flex';
};

UI.createObjectController = () => {
    const elObjectController = ATON.UI.createElementFromHTMLString(`<div class="thoth-layer"></div>`);
    const elRButtonContainer = ATON.UI.createElementFromHTMLString(`<div class="thoth-btn-right"></div>`)

    // Name
    const elName = ATON.UI.createButton({
        text    : "Object: " + THOTH.Scene.modelName,
    });
    // Metadata
    const elMetadata = ATON.UI.createButton({
        text    : "Edit Object Metadata",
        icon    : "list",
        size    : "small",
        onpress : () => UI.modalMetadata(-1),
    });
    elRButtonContainer.append(elMetadata)
    elObjectController.append(
        elName,
        elRButtonContainer,
    );
    return elObjectController;
};

UI.createLayerController = (id) => {
    let layer = THOTH.Scene.currData.layers[id];

    const elLayerController = ATON.UI.createElementFromHTMLString(`<div class="thoth-layer"></div>`);
    const elRButtonContainer = ATON.UI.createElementFromHTMLString(`<div class="thoth-btn-right"></div>`)
    // Visibility
    let icon = null;
    if (layer.visible) {
        icon = "visibility";
    }
    else {
        elLayerController.classList.add("aton-layer-hidden")
        icon = THOTH.PATH_RES_ICONS + "visibility_no.png"
    }
    const elVis = ATON.UI.createButton({
        icon    : icon,
        size    : "small",
        onpress : () => {
            if (THOTH.toggleLayerVisibility(id)) {
                elLayerController.classList.remove("aton-layer-hidden")
                const imgElement = elVis.querySelector("img");
                imgElement.src = ATON.UI.PATH_RES_ICONS + "visibility.png";
            }
            else {
                elLayerController.classList.add("aton-layer-hidden")
                const imgElement = elVis.querySelector("img");
                imgElement.src = THOTH.PATH_RES_ICONS + "visibility_no.png"; 
            }
        }
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
    
    //  USE THIS AFTER IT'S IMPORTED TO ATON.MIN
    // const elCP = ATON.UI.createColorPicker({
    //     color   : layer.color,
    //     onchange: (color) => {
    //         layer.color = color
    //     }
    // })

    // Delete
    const elDel = ATON.UI.createButton({
        icon   : "trash",
        size   : "small",
        onpress: () => THOTH.fire("deleteLayer", (id))
    });
    // Metadata
    const elMetadata = ATON.UI.createButton({
        text   : "Edit Metadata",
        icon   : "list",
        size   : "small",
        tooltip: "Edit metadata",
        onpress: () => UI.modalMetadata(id),
    });

    elRButtonContainer.append(
        elMetadata,
        elDel
    );
    elLayerController.append(
        elVis,
        elName,
        elRButtonContainer
    );

    return elLayerController;
};

UI.handleLayerHighlight = () => {
    const layers = THOTH.Scene.currData.layers;
    const activeLayer = THOTH.Scene.activeLayer
    for (const [id, elLayer] of UI.layerElements) {
        if (layers[id] === activeLayer){
            elLayer.classList.remove('thoth-layer')
            elLayer.classList.add('thoth-layer-selected');
        }
        else {
            elLayer.classList.remove('thoth-layer-selected');
            elLayer.classList.add('thoth-layer')
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


// Nav
UI.setupNavElements = () => {
    UI.viewpointElements = new Map();

    const viewpoints = THOTH.Scene.currData.viewpoints;
    if (viewpoints === undefined) return;

    for (let node in viewpoints) {
        if (node !== "home") {
            UI.createViewpoint(node);
        }
    }
};

UI.createViewpoint = (node) => {
    const elViewpoint = UI.createVPController(node);

    // Add to panel
    UI.elVPList.append(elViewpoint);

    // Add to vp list
    UI.viewpointElements.set(node, elViewpoint);
};

UI.createVPController = (node) => {
    const elVPController = ATON.UI.createElementFromHTMLString(`<div class="thoth-layer"></div>`);
    const elNavButton = ATON.UI.createButton({
        text   : node,
        icon   : "geoloc",
        onpress: () => ATON.Nav.requestPOVbyID(node, 0.5)
    });
    const test = ATON.UI.createCard({
        title      : "test",
        subtitle   : "test sub",
        useblurtint: true,
        cover      : "http://localhost:8080/api/v2/scenes/samples/skyphos/cover",
        url        : "http://localhost:8080/a/thoth_v2/?s=" + THOTH.Scene.id,
        size       : "large",
    });
    elVPController.append(
        elNavButton,
        test
    );
    
    return elVPController;
};


// Toast

UI.setupToast = () => {
    UI._elToast = UI.createToast();
    ATON.UI.hideElement(UI._elToast);
};

UI.createToast = () => {
    const elToastBody = ATON.UI.createContainer({
        id      : "toast",
        classes : "thoth-toast", 
    });

    elToastBody.message = document.createElement("span");
    elToastBody.appendChild(elToastBody.message);
    document.body.appendChild(elToastBody);
    
    return elToastBody;
};

UI.showToast = (message, timeout = 2500) => {
    ATON.UI.showElement(UI._elToast)
    UI._elToast.message.textContent = message;
    UI._elToast.style.display = "block";
    UI._elToast.style.opacity = 1;

    if (UI._toastTimeout) clearTimeout(UI._toastTimeout);

    UI._toastTimeout = setTimeout(() => {
        UI._elToast.style.opacity = 0;
        setTimeout(() => {
            ATON.UI.hideElement(UI._elToast);
        }, 300)
    }, timeout)
};


// Modals

UI.modalUser = () => {
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

UI.modalMetadata = (id) => {
    let data_temp = null;
    if (id === -1) {
        data_temp = structuredClone(THOTH.Scene.currData.objectMetadata);
        $.getJSON(THOTH.PATH_RES_SCHEMA + "annotation_schema.json", (data) => {
            // Main body
            let elMetadataBody = UI.createMetadataEditor(data, data_temp);
            // Buttons
            let elMetadataFooter = ATON.UI.createContainer();
            // OK Button
            let l = {
                id      : id,
                data    : data_temp,
                prevData: THOTH.Scene.currData.objectMetadata
            };
            elMetadataFooter.append(ATON.UI.createButton({
                text    : "Save changes",
                size    : "large",
                variant : "success",
                onpress : () => {
                    THOTH.fire("editMetadata", l);
                    ATON.UI.hideModal();
                }
            }));
            // Cancel
            elMetadataFooter.append(ATON.UI.createButton({
                text    : "Cancel",
                size    : "large",
                variant : "secondary",
                onpress : () => ATON.UI.hideModal(),
            }));
            ATON.UI.showModal({
                header  : `Edit object metadata (${THOTH.Scene.modelName})`,
                body    : elMetadataBody,
                footer  : elMetadataFooter
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
                text    : "Inherit from object",
                size    : "large",
                variant : "primary",
                onpress : () => UI.showToast("TBI")
            }));
            // OK Button
            let l = {
                id      : id,
                data    : data_temp,
                prevData: THOTH.Scene.currData.layers[id].metadata
            };
            elMetadataFooter.append(ATON.UI.createButton({
                text    : "Save changes",
                size    : "large",
                variant : "success",
                onpress : () => {
                    THOTH.fire("editMetadata", l);
                    ATON.UI.hideModal();
                }
            }));
            // Cancel
            elMetadataFooter.append(ATON.UI.createButton({
                text    : "Cancel",
                size    : "large",
                variant : "secondary",
                onpress : () => ATON.UI.hideModal(),
            }));
            ATON.UI.showModal({
                header  : "Edit metadata for layer " + id,
                body    : elMetadataBody,
                footer  : elMetadataFooter
            });
        });
    }
};


// Other

UI.createMetadataEditor = (data, data_temp) => {
    let elData = ATON.UI.createContainer();
    
    // Properties creation logic
    for (const key in data) {
        if (key === "required") continue;
        
        let elAttr      = ATON.UI.createContainer();
        let elDisplay   = ATON.UI.createContainer();
        let elInput     = null;

        const attr      = data[key];
        elDisplay.textContent = data_temp[key];

        if (attr["type"]) {
            switch (attr.type.toLowerCase()) {
                case "string":
                    elInput = ATON.UI.createInputText({
                        label   : key,
                        oninput : (v) => {
                            data_temp[key] = v;
                            elInput.textContent = v;
                        }
                    });
                    break;
                case "integer":
                    elInput = ATON.UI.createInputText({
                        label   : key,
                        oninput : (v) => {
                            data_temp[key] = v;
                            elDisplay.textContent = v;
                        }
                    });
                    break;
                case "float" :
                    elInput = ATON.UI.createInputText({
                        label   : key,
                        oninput : (v) => {
                            data_temp[key] = v;
                            elDisplay.textContent = v;
                        }
                    });
                    break;
                case "bool":
                    elInput = UI.createBool({
                        text    : key,
                        onchange: (input) => data_temp[key] = input
                    });
                    break;
                case "enum":
                    elInput = ATON.UI.createDropdown({
                        title   : key,
                        items   : attr.value.map(option => ({
                            el  : ATON.UI.createButton({
                                text    : option,
                                onpress : () => {
                                    data_temp[key] = option;
                                    elDisplay.textContent = option;
                                }
                            })
                        }))
                    });
                    
                    break;
                case "enum-multiple":
                    // Token Box for multiple selections
                    elInput = ATON.UI.createContainer();
                    const selectedTokens = new Set(data_temp[key] || []); // Initialize with existing values
                    const renderTokens = () => {
                        const tokens = Array.from(selectedTokens).map(v => 
                            `<span class="thothToken" data-v="${v}">${v}<button type="button" class="remove-token-btn">×</button></span>`
                        ).join("");
                        elDisplay.innerHTML = tokens;
                    };
                    
                    // Function to add tokens
                    const addToken = (value) => {
                        selectedTokens.add(value);
                        renderTokens();
                    };

                    // Function to remove tokens
                    elDisplay.addEventListener("click", (event) => {
                        if (event.target.tagName === "BUTTON") {
                            const tokenValue = event.target.parentElement.getAttribute("data-v");
                            selectedTokens.delete(tokenValue);
                            renderTokens();
                        }
                    });

                    // Render the existing tokens
                    renderTokens();
                    // Create the dropdown button list for options
                    const dropdownContainer = ATON.UI.createDropdown({
                        title: key, 
                        items: attr.value.map(option => ({
                            el: ATON.UI.createButton({
                                text: option,
                                onpress: () => {
                                    addToken(option); // Add the selected option as a token
                                }
                            })
                        }))
                    });

                    // Append the dropdown to the input container
                    elInput.append(dropdownContainer);
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


// Testing

UI.Test = () => {
    let test = THOTH.Scene.modelName;
    console.log(test)
};


export default UI;