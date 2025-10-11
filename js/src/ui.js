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
    UI._elTopToolbar    = ATON.UI.get("topToolbar");
    UI._elUserToolbar   = ATON.UI.get("userToolbar");
    UI._elMainToolbar   = ATON.UI.get("mainToolbar");

    UI._elToolOptionsToolbar = ATON.UI.get("toolOptToolbar");
};

UI.populateToolbars = () => {
    // Bottom Toolbar
    UI._elTopToolbar.append(
        UI.createTextailesButton(),
        UI.createOptionsButton(),
        UI.createLayersButton(),
        UI.createExportButton(),
        UI.createInfoButton(),
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
    UI._elOptionsPanel      = UI.createPanelOptions();
    UI._elLayersPanel       = UI.createPanelLayers();
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

UI.showPanelLayers = () => {
    ATON.UI.showSidePanel({
        header  : "Layers",
        body    : UI._elLayersPanel
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
    const OptionsBtn = ATON.UI.createButton({
        icon    : "settings",
        onpress : () => UI.showPanelOptions(),
        tooltip : "Options"
    });
    OptionsBtn.classList.add("thoth-dark-btn");

    return OptionsBtn;
};

UI.createLayersButton = () => {
    const LayerBtn = ATON.UI.createButton({
        icon    : "layers",
        onpress : () => UI.showPanelLayers(),
        tooltop : "Layers"
    });
    LayerBtn.classList.add("thoth-dark-btn");

    return LayerBtn;    
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
    const brushBtn = ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "brush.png",
        tooltip : "Brush tool",
        onpress : () => {
            THOTH.fire("selectBrush");
            const allBtns = document.querySelectorAll('.thoth-btn'); //NodeList of class aton-layer
            allBtns.forEach((el) => {
                if (el === brushBtn) {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.5)";
                } else {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.0)";
                }
            });
        }
    });
    brushBtn.classList.add("aton-btn");
    brushBtn.classList.add("thoth-btn");

    return brushBtn;
};

UI.createEraserButton = () => {
    const eraserBtn = ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "eraser.png",
        tooltip : "Eraser tool",
        onpress : () => {
            THOTH.fire("selectEraser");
            const allBtns = document.querySelectorAll('.thoth-btn'); //NodeList of class aton-layer
            allBtns.forEach((el) => {
                if (el === eraserBtn) {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.5)";
                } else {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.0)";
                }
            });
        }
    });
    eraserBtn.classList.add("aton-btn");
    eraserBtn.classList.add("thoth-btn");

    return eraserBtn;
};

UI.createLassoButton = () => {
    const lassoBtn = ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "lasso.png",
        tooltip : "Lasso tool",
        onpress : () => {
            THOTH.fire("selectLasso");
            const allBtns = document.querySelectorAll('.thoth-btn'); //NodeList of class aton-layer
            allBtns.forEach((el) => {
                if (el === lassoBtn) {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.5)";
                } else {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.0)";
                }
            });
        }
    });
    lassoBtn.classList.add("aton-btn");
    lassoBtn.classList.add("thoth-btn");

    return lassoBtn;
};

UI.createNoToolButton = () => {
    const noBtn = ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "none.png",
        onpress : () => {
            THOTH.fire("selectNone");
            const allBtns = document.querySelectorAll('.thoth-btn'); //NodeList of class aton-layer
            allBtns.forEach((el) => {
                if (el === noBtn) {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.5)";
                } else {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.0)";
                }
            });
        }
    });
    noBtn.classList.add("aton-btn");
    noBtn.classList.add("thoth-btn");

    return noBtn;
};

UI.createUndoButton = () => {
    const undoBtn = ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "undo.png",
        tooltip : "Undo",
        onpress : () => {
            THOTH.History.undo();
            const allBtns = document.querySelectorAll('.thoth-btn'); //NodeList of class aton-layer
            allBtns.forEach((el) => {
                if (el === undoBtn) {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.5)";
                } else {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.0)";
                }
            });
        }
    });
    undoBtn.classList.add("aton-btn");
    undoBtn.classList.add("thoth-btn");

    return undoBtn;
};

UI.createRedoButton = () => {
    const redoBtn = ATON.UI.createButton({
        icon    : THOTH.PATH_RES_ICONS + "redo.png",
        tooltip : "Redo",
        onpress : () => {
            THOTH.History.redo();
            const allBtns = document.querySelectorAll('.thoth-btn'); //NodeList of class aton-layer
            allBtns.forEach((el) => {
                if (el === redoBtn) {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.5)";
                } else {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.0)";
                }
            });
        }
    });
    redoBtn.classList.add("aton-btn");
    redoBtn.classList.add("thoth-btn");

    return redoBtn;
};

UI.createNewLayerButton = () => {
    const NewLayerBtn = ATON.UI.createButton({
        text    : "New Layer",
        icon    : "add",
        variant : "success",
        tooltip : "Create new layer",
        onpress : () => THOTH.fire("createLayer")
           
    });
    return NewLayerBtn;
};

UI.createExportButton = () => {
    const ExportBtn = ATON.UI.createButton({
        icon    : "link",
        onpress : () => THOTH.Scene.exportLayers(),
        tooltip : "Export changes",
    });
    ExportBtn.classList.add("thoth-dark-btn");

    return ExportBtn;
};

UI.createVRCButton = () => {
    const VRCBtn = ATON.UI.createButton({
        icon    : "vrc",
        onpress : () => THOTH.setupPhoton(),
        tooltip : "Connect to Photon"
    });
    VRCBtn.classList.add("thoth-dark-btn");

    return VRCBtn;
};  

UI.createInfoButton = () => {
    const InfoBtn = ATON.UI.createButton({
        icon    : "info",
        onpress : () => window.open("https://xenobii.github.io/thoth-documentation/", "_blank"),
        tooltip : "Open documentation"
    });
    InfoBtn.classList.add("thoth-dark-btn");

    return InfoBtn;
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
    elLayer.classList.remove("aton-layer");
    elLayer.classList.add("deleted-layer");
};

UI.resurrectLayer = (id) => {
    const elLayer = UI.layerElements.get(id);

    // Hide
    elLayer.classList.remove("deleted-layer");
    elLayer.classList.add("aton-layer");
};

UI.createObjectController = () => {
    const elObjectController = ATON.UI.createElementFromHTMLString(`<div class="aton-layer"></div>`);
    // Name
    const elName = ATON.UI.createButton({
        text    : "Object: " + THOTH.Scene.modelName,
    });
    // Metadata
    const elMetadata = ATON.UI.createButton({
        text    : "Edit metadata",
        variant : "dark",
        icon    : "list",
        size    : "small",
        onpress : () => UI.modalMetadata(-1),
    });
    elObjectController.append(
        elName,
        elMetadata,
    );
    return elObjectController;
};

UI.createLayerController = (id) => {
    let layer = THOTH.Scene.currData.layers[id];

    const elLayerController = ATON.UI.createElementFromHTMLString(`<div class="aton-layer"></div>`);
    // Visibility
    let icon = null;
    if (layer.visible) icon = "visibility";
    const elVis = ATON.UI.createButton({
        icon    : icon,
        size    : "small",
        onpress : () => {
            if (THOTH.toggleLayerVisibility(id)) {
                const imgElement = elVis.querySelector("img"); // Select the image inside the button
                imgElement.src = "http://localhost:8080/res/icons/visibility.png"; // Change the src to the visibility icon
            }
            else {
                const imgElement = elVis.querySelector("img"); // Select the image inside the button
                imgElement.src = "http://localhost:8080/res/icons/visibility_no.png"; // Change the src to the visibility_no icon
            }
        }
    });
    // Name
    const elName = ATON.UI.createButton({
        text    : layer.name,
        size    : "small",
        onpress : () => {
            THOTH.Scene.activeLayer = layer;

            const allLayerControllers = document.querySelectorAll('.aton-layer'); //NodeList of class aton-layer
            allLayerControllers.forEach((el) => {
                if (el === elLayerController) {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 1.0)";
                } else {
                    el.style.backgroundColor = "rgba(var(--bs-body-bg-rgb), 0.5)";
                }
            });
        }
    });
    THOTH.Events.enableRename(elName, id);
    //HighlightColor Selection
    const elColor = ATON.UI.createButton({
        icon    : "color-palette",
        size    : "small"
    });
    // Create an input element of type 'color'
    const colorInput = document.createElement("input");
    colorInput.type = "color";  // This creates a color picker in most browsers
    colorInput.value = layer.highlightColor;  // Set initial value to current highlightColor
    colorInput.style.width = '30px';
    colorInput.style.height = '26px';
    colorInput.style.position = 'absolute';
    colorInput.style.right = '105px';
    colorInput.style.opacity= '0';
    
    // Append the color picker to the Colorbtn
    elColor.appendChild(colorInput);

    // Listen for color change
    colorInput.addEventListener("input", (e) => {
        const selectedColor = e.target.value;  // Get the color selected by the user
        layer.highlightColor = selectedColor;  // Update the layer's highlight color

        // You can perform additional operations if needed (e.g., apply the color to the layer)
        console.log("New highlight color:", selectedColor);

        // Optional: Immediately update the button's icon to reflect the new color
        elColor.style.backgroundColor = selectedColor;  // Optional, just as an example
    });
        // Trigger focus on the color input so the color picker appears right away
        //colorInput.focus();

    // Delete
    const elDel = ATON.UI.createButton({
        icon    : "trash",
        size    : "small",
        onpress : () => THOTH.fire("deleteLayer", (id))
    });
    // Metadata
    const elMetadata = ATON.UI.createButton({
        variant : "dark",
        icon    : "list",
        size    : "small",
        tooltip : "Edit metadata",
        onpress : () => UI.modalMetadata(id),
    });

    // Align right buttons
    const leftButtons = ATON.UI.createElementFromHTMLString('<div class="left-buttons"></div>');
    leftButtons.append(elColor);

    const rlightButtons = ATON.UI.createElementFromHTMLString('<div class="rlight-buttons"></div>');
    rlightButtons.append(elMetadata); 

    const rightButtons = ATON.UI.createElementFromHTMLString('<div class="right-buttons"></div>');
    rightButtons.append(elDel); // Add "Bin" to right

    // Append groups to the controller
    elLayerController.append(elVis, elName, leftButtons, rlightButtons, rightButtons);

    return elLayerController;
};  

UI.showLayerAttributes = (id) => {

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
                    elInput = ATON.UI.createContainer();
                    const renderTokenS = (value) => {
                        if (value !== undefined && value !== null && value !== "") {
                            const tokenHTML = `<span class="thothToken" data-v="${value}">${value}<button type="button" class="remove-token-btn">×</button></span>`;
                            elDisplay.innerHTML = tokenHTML; // Display the token
                        } else {
                            elDisplay.innerHTML = ""; // Clear token if there's no value
                        }
                    };
                    const inputSField = ATON.UI.createInputText({
                        label: key,
                        oninput: (v) => {
                            // Store the string value directly
                            if (v.trim() !== "") { // Ensure it's not an empty string
                                data_temp[key] = v; // Store the string value
                                renderTokenS(v); // Render the token with the string value
                            } else {
                                data_temp[key] = null; // Reset if the input is not a valid integer
                                renderTokenS(null); // Remove the token
                            }
                        }
                    });
                    elInput.append(inputSField);

                    // Handle token removal
                    elDisplay.addEventListener("click", (event) => {
                        if (event.target.tagName === "BUTTON") {
                            data_temp[key] = null; // Reset the value
                            renderTokenS(null); // Clear the token
                        }
                    });

                    // Initialize with the existing value (if any)
                    if (data_temp[key] !== undefined) {
                        renderTokenS(data_temp[key]);
                    }
                    // Display container for token and input
                    elInput.append(elDisplay);
                    renderTokenS(null);
                    break;
                case "integer":
                    elInput = ATON.UI.createContainer();
                    const renderTokenINT = (value) => {
                        if (value !== undefined && value !== null && value !== "") {
                            const tokenHTML = `<span class="thothToken" data-v="${value}">${value}<button type="button" class="remove-token-btn">×</button></span>`;
                            elDisplay.innerHTML = tokenHTML; // Display the token
                        } else {
                            elDisplay.innerHTML = ""; // Clear token if there's no value
                        }
                    };
                    const inputField = ATON.UI.createInputText({
                        label: key,
                        oninput: (v) => {
                            // Check if the value is a valid integer
                            const parsedValue = parseInt(v, 10);
                            if (!isNaN(parsedValue)) {
                                data_temp[key] = parsedValue; // Store the integer value
                                renderTokenINT(parsedValue); // Render the token with the integer
                            } else {
                                data_temp[key] = null; // Reset if the input is not a valid integer
                                renderTokenINT(null); // Remove the token
                            }
                        }
                    });
                    elInput.append(inputField);

                    // Handle token removal
                    elDisplay.addEventListener("click", (event) => {
                        if (event.target.tagName === "BUTTON") {
                            data_temp[key] = null; // Reset the value
                            renderTokenINT(null); // Clear the token
                        }
                    });

                    // Initialize with the existing value (if any)
                    if (data_temp[key] !== undefined) {
                        renderTokenINT(data_temp[key]);
                    }
                    // Display container for token and input
                    elInput.append(elDisplay);
                    renderTokenINT(null);
                    break;
                case "float" :
                    elInput = ATON.UI.createContainer();
                    const renderTokenF = (value) => {
                        if (value !== undefined && value !== null && value !== "") {
                            const tokenHTML = `<span class="thothToken" data-v="${value}">${value}<button type="button" class="remove-token-btn">×</button></span>`;
                            elDisplay.innerHTML = tokenHTML; // Display the token
                        } else {
                            elDisplay.innerHTML = ""; // Clear token if there's no value
                        }
                    };
                    const inputFField = ATON.UI.createInputText({
                        label: key,
                        oninput: (v) => {
                            // Check if the value is a valid integer
                            const parsedValue = parseFloat(v);
                            if (!isNaN(parsedValue)) {
                                data_temp[key] = parsedValue; // Store the integer value
                                renderTokenF(parsedValue); // Render the token with the integer
                            } else {
                                data_temp[key] = null; // Reset if the input is not a valid integer
                                renderTokenF(null); // Remove the token
                            }
                        }
                    });
                    elInput.append(inputFField);

                    // Handle token removal
                    elDisplay.addEventListener("click", (event) => {
                        if (event.target.tagName === "BUTTON") {
                            data_temp[key] = null; // Reset the value
                            renderTokenF(null); // Clear the token
                        }
                    });

                    // Initialize with the existing value (if any)
                    if (data_temp[key] !== undefined) {
                        renderTokenF(data_temp[key]);
                    }
                    // Display container for token and input
                    elInput.append(elDisplay);
                    renderTokenF(null);
                    break;
                case "bool":
                    elInput = UI.createBool({
                        text    : key,
                        onchange: (input) => data_temp[key] = input
                    });
                    break;
                case "enum":
                    elInput = ATON.UI.createContainer();
                    const renderToken = (value) => {
                        if (value) {
                            const tokenHTML = `<span class="thothToken" data-v="${value}">${value}<button type="button" class="remove-token-btn">×</button></span>`;
                            elDisplay.innerHTML = tokenHTML; // Display the token
                        } else {
                            elDisplay.innerHTML = ""; // Clear token if there's no value
                        }
                    };

                    elDisplay.addEventListener("click", (event) => {
                        if (event.target.tagName === "BUTTON") {
                            data_temp[key] = null; // Reset the selected value
                            renderToken(null); // Clear the token
                        }
                    });

                    // Initialize with the existing selected value (if any)
                    if (data_temp[key]) {
                        renderToken(data_temp[key]);
                    }

                    // Create the dropdown button list for options
                    const dropdContainer = ATON.UI.createDropdown({
                        title: key,
                        items: attr.value.map(option => ({
                            el: ATON.UI.createButton({
                                text: option,
                                onpress: () => {
                                    data_temp[key] = option; // Set the selected value
                                    renderToken(option); // Update the token display
                                }
                            })
                        }))
                    });

                    // Append the dropdown to the input container
                    elInput.append(dropdContainer);

                    renderToken(null);
                    
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