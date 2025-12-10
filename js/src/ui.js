/*===========================================================================

    THOTH
    UI modules

    Author: steliosalvanos@gmail.com

===========================================================================*/
let UI = {}


// Setup

UI.setup = () => {
    // Maps for easy access
    UI.setupToast();
    UI.setupVPPreview();
};


// General

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

    return el;
};

UI.createSplitRow = (options) => {
    const elRow = ATON.UI.createContainer({classes: "row g-0 align-items-center w-100 rounded-2 py-1 mb-1"});
    if (options.classes) elRow.classList.add(options.classes)
    
    let colLeft;
    if (options.colLeft) colLeft = options.colLeft;
    else colLeft = 7;

    let colRight = 12 - colLeft;

    const elLeft  = ATON.UI.createContainer({classes: `col-${colLeft} d-flex align-items-center`});
    const elRight = ATON.UI.createContainer({classes: `col-${colRight} d-flex justify-content-end align-items-center`});

    if (options.itemsLeft) elLeft.append(options.itemsLeft);
    if (options.itemsRight) elRight.append(options.itemsRight);
    
    elRow.append(elLeft, elRight);
    return elRow;
};


// Controllers

UI.createModelController = (modelName) => {
    const elController = ATON.UI.createContainer({classes: "row g-0 align-items-center w-100 rounded-2 border px-2 py-1 mb-1"});
    const elLeft       = ATON.UI.createContainer({classes: "col-7 d-flex align-items-center"});
    const elRight      = ATON.UI.createContainer({classes: "col-5 d-flex justify-content-end align-items-center"});

    elLeft.append(
        // Visibility
        ATON.UI.createButton({
            icon   : "visibility",
            size   : "small",
            onpress: () => THOTH.Models.toggleVisibility(modelName),
        }), 
        // Name
        ATON.UI.createButton({
            text   : modelName,
            size   : "small",
            onpress: () => ATON.UI.showSidePanel({
                header: modelName,
                body  : UI.createModelEditor(modelName)
            })
        }),
    );
    elRight.append(
        // Trash
        ATON.UI.createButton({
            icon   : "trash",
            onpress: () => {}
        })
    );
    elController.append(elLeft, elRight);

    return elController;
};

UI.createSceneController = () => {
    const elController = ATON.UI.createContainer({classes: "row g-0 align-items-center w-100 rounded-2 border px-2 py-1 mb-1"});
    const elLeft       = ATON.UI.createContainer({classes: "col-7 d-flex align-items-center"});
    const elRight      = ATON.UI.createContainer({classes: "col-5 d-flex justify-content-end align-items-center"});
    
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
        onpress: () => THOTH.UI.modalSceneMetadata(),
    });
    
    elLeft.append(elName);
    elRight.append(elMetadata);
    elController.append(elLeft, elRight);
    return elController;
};

UI.createLayerController = (layerId) => {
    const elController = ATON.UI.createContainer({classes: "row g-0 align-items-center w-100 rounded-2 border px-2 py-1 mb-1"});
    const elLeft       = ATON.UI.createContainer({classes: "col-7 d-flex align-items-center"});
    const elRight      = ATON.UI.createContainer({classes: "col-5 d-flex justify-content-end align-items-center"});

    const layer = THOTH.Layers.layerMap.get(layerId);

    elLeft.append(
        // Visibility
        ATON.UI.createButton({
            icon   : "visibility",
            size   : "small",
            onpress: () => THOTH.Layers.toggleVisibility(layerId),
        }),
        // Name
        ATON.UI.createButton({
            text   : layer.name,
            size   : "small",
            onpress: () => {
                THOTH.Scene.activeLayer = layer;
                THOTH.FE.handleElementHighlight(layerId, THOTH.FE.layerMap);
            }
        }),
    );
    elRight.append(
        // Color Picker
        ATON.UI.createColorPicker({
            color  : layer.highlightColor,
            oninput: (color) => {
                layer.highlightColor = color
                THOTH.updateVisibility();
            },
        }),
        // Metadata
        ATON.UI.createButton({
            icon   : "list",
            size   : "small",
            tooltip: "Edit metadata",
            onpress: () => UI.modalLayerDetails(layerId),
        }),
        // Delete
        ATON.UI.createButton({
            icon   : "trash",
            size   : "small",
            onpress: () => THOTH.fire("deleteLayer", (layerId))
        }),
    );

    elController.append(elLeft, elRight);

    return elController;
};


// Editors

UI.createModelEditor = (modelName) => {
    const model = THOTH.Models.modelMap.get(modelName);

    const elBody = ATON.UI.createContainer();

    // Top buttons
    const elModelHead      = ATON.UI.createContainer({classes: "row g-0 align-items-center w-100 rounded-2 px-2 py-1 mb-1"});
    const elModelHeadLeft  = ATON.UI.createContainer({classes: "col-4 d-flex align-items-center"});
    const elModelHeadRight = ATON.UI.createContainer({classes: "col-8 d-flex justify-content-end align-items-center"});
    
    elModelHeadLeft.append(
        // Back
        ATON.UI.createButton({
            icon   : "back",
            onpress: () => ATON.UI.showSidePanel({
                header: "Scene",
                body  : THOTH.FE.modelsPanel
            })
        })
    );
    elModelHeadRight.append(
        // Focus
        ATON.UI.createButton({
            text   : "Focus",
            icon   : "focus",
            classes: "btn-default",
            onpress: () => ATON.Nav.requestPOVbyNode(model, 0.2)
        })
    );
    elModelHead.append(elModelHeadLeft, elModelHeadRight);

    // Options
    const elVPOptions = ATON.UI.createContainer();
    elVPOptions.append(
        ATON.UI.createButton({
            icon   : "visibility",
            size   : "small",
            onpress: () => THOTH.SVP.toggleVPNodes(vpVisible, modelName)
        }),
        ATON.UI.createButton({
            text   : "Build Viewpoints",
            variant: "info",
            icon   : "pov",
            onpress: () => UI.modalBuildVP(modelName),
        }),
        ATON.UI.createButton({
            text   : "Delete All",
            variant: "secondary",
            icon   : "cancel",
            onpress: () => THOTH.SVP.deleteSVPNodes(modelName),
        })
    ) 
    
    const elOptions = ATON.UI.createTreeGroup({
        items: [
            {
                title  : "Meshes",
                open   : true,
                content: UI.createMeshList(modelName)
            },
            {
                title  : "Viewpoints",
                open   : true,
                content: elVPOptions
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
    elBody.append(elModelHead, elOptions);

    return elBody;
};

UI.createMeshList = (modelName) => {
    const elBody = ATON.UI.createContainer();
    const meshes = THOTH.Models.getModelMeshes(modelName);
    for (const mesh of meshes.keys()) {
        elBody.append(
            ATON.UI.createButton({
                text   : mesh,
                icon   : "collection-item",
                onpress: () => {}
            })
        )
    }
    return elBody;
};


// Toolbars

UI.setupToolbars = () => {
    UI._elToolOptionsToolbar = ATON.UI.get("toolOptToolbar");
    
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
    // ATON.UI.showElement(UI._elOptionsBrush);
};

UI.hideBrushOptions = () => {
    // ATON.UI.hideElement(UI._elOptionsBrush);
};

UI.showLassoOptions = () => {
    ATON.UI.showElement(UI._elOptionsLasso);
};

UI.hideLassoOptions = () => {
    // ATON.UI.hideElement(UI._elOptionsLasso);
};


// VP

UI.showVPPreview = (id) => {
    const modelName = id.split("_vp_")[0];
    const vpId      = id.split("_vp_")[1];

    const viewpoint = THOTH.SVP.viewpoints[modelName][vpId];
    const imageURL  = viewpoint.image;

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
            title     : id,
            size      : "large",
            cover     : imageURL,
            onactivate: () => UI.modalVPImage(viewpoint),
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
    let elBody   = ATON.UI.createContainer();
    
    // Body
    const elInfo = ATON.UI.createContainer();
    if (THOTH.collabExists()) {
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
                THOTH.Scene.exportChanges();
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
                    THOTH.SVP.buildVPNodes(vpMap, modelName);
                    ATON.UI.hideModal();
                }
                else if (mode === "uniform") {
                    // Sample from vpNumber
                    vpMap = THOTH.Utils.uniformSamplingFromMap(colmapMap, vpNumber);
                    THOTH.SVP.buildVPNodes(vpMap, modelName);
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

UI.modalVPImage = (viewpoint) => {
    const elBody = ATON.UI.createContainer({
        classes: "d-flex flex-column"
    });
    
    // Image
    const elImgContainer = ATON.UI.createContainer({
        classes: "d-flex ratio-16x9 w-100 bg-dark"
    });
    const elImg = document.createElement("img");
    elImg.src = viewpoint.image;
    elImg.alt = "Image";
    elImg.onerror = () => {};
    elImg.className = "img-fluid w-100 h-100 object-fit-contain";
    elImgContainer.append(elImg);

    // Description
    const elDescription = ATON.UI.createContainer({
        classes: "pt-2"
    });
    elDescription.append(ATON.UI.createTreeGroup({
        items: [
            {
                title  : "position",
                open   : true,
                content: `x: ${viewpoint.position.x},
                          y: ${viewpoint.position.y}, 
                          z: ${viewpoint.position.z}`
            }
        ]
    }))
    
    elBody.append(elImgContainer, elDescription);
    
    // Footer
    const elFooter = ATON.UI.createContainer();
    elFooter.append(ATON.UI.createButton({
        text   : "Download",
        icon   : "download",
        onpress: () => THOTH.Utils.downloadImage(viewpoint.image.replace("/a/thoth_v2", "")),
        variant: "success",
        tooltip: "Download image",
    }));

    ATON.UI.showModal({
        header: viewpoint.name,
        body  : elBody,
        footer: elFooter,
    });
};

UI.modalAddModel = () => {
    // Get models
    ATON.checkAuth(
        (u) => {
            ATON.REQ.get(
                "items/"+u.username+"/models",
                entries => {
                    // Body
                    const elBody = ATON.UI.createContainer();
                    const itemNames = entries.map(item => {
                        return item.replace(u.username+"/models/", "")
                    });
                    const elIT = ATON.UI.createInputText({
                        label      : "Input model",
                        placeholder: "3D model URL",
                        list       : entries,
                        listnames  : itemNames
                    });
                    elBody.append(elIT);
                    let elInput = elIT.getElementsByTagName("input")[0];
        
                    // Footer 
                    const elFooter = ATON.UI.createContainer();
                    const elAddBtn = ATON.UI.createButton({
                        text   : "Add",
                        size   : "large",
                        variant: "success",
                        onpress: () => THOTH.Scene.addModel(elInput.value),
                        // onpress: () => console.log(elInput.value)
                    });
                    const elCancelBtn = ATON.UI.createButton({
                        text   : "Cancel",
                        size   : "large",
                        variant: "secondary",
                        onpress: () => ATON.UI.hideModal()
                    });
                    elFooter.append(elAddBtn, elCancelBtn);
        
                    ATON.UI.showModal({
                        header: "Add model",
                        body  : elBody,
                        footer: elFooter,
                    });
        
                }, error => {
                    console.log(error)
                    UI.showToast("Error loading models:" + error)
                });
        }
    )
};


// Metadata editor

UI.createMetadataEditor = (data, data_temp) => {
    let elData = ATON.UI.createContainer();
    
    // Properties creation logic
    for (const key in data) {
        if (key === "required") continue;
        if (key === "schemaName") continue;
        
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
                    elDisplay.textContent = (data_temp && data_temp[key] !== undefined) ? data_temp[key] : undefined;
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

UI.modalLayerDetails = (layerId, data_temp) => {
    const layer = THOTH.Layers.layerMap.get(layerId);
    
    if (data_temp === undefined) data_temp = structuredClone(layer.metadata) || {};
    
    const schemaName = data_temp?.schemaName;
    const prev_data  = layer.metadata || {};
    const schema     = THOTH.Scene.schemaMap.get(schemaName);
    
    // Body
    const elBody = ATON.UI.createContainer();
    // Name
    const elName = ATON.UI.createInputText({
        label  : "Layer name",
        oninput: (v) => {
            //
        }
    });
    // Misc
    const elMisc = UI.createSplitRow({
        colLeft  : 2,
        itemsLeft: ATON.UI.createColorPicker({
            color  : layer.highlightColor,
            oninput: (color) => {
                layer.highlightColor = color,
                THOTH.updateVisibility();
            },
        }),
        itemsRight: ATON.UI.createButton({
            text   : "Delete Layer",
            icon   : "trash",
            onpress: () => {
                THOTH.fire("deleteLayer", (layerId));
                ATON.UI.hideModal();
            }
        }),
    });
    
    // Schema
    let newSchemaName;
    const elPickSchema = UI.createSplitRow({
        colLeft  : 8,
        itemsLeft: ATON.UI.createInputText({
            label      : "Pick schema",
            list       : Array.from(THOTH.Scene.schemaMap.keys()),
            placeholder: schemaName || "", 
            oninput    : (v) => newSchemaName = v,
        }),
        itemsRight: ATON.UI.createButton({
            text   : `Build metadata`,
            variant: "info",
            onpress: () => {
                data_temp = THOTH.Scene.createPropertiesfromSchema(newSchemaName);
                UI.modalLayerDetails(layerId, data_temp);
            }
        }),
    });

    // Metadata
    const elMetadata = ATON.UI.createContainer();
    if (schema === undefined || Object.keys(schema).length !== 0) {
        elMetadata.append(UI.createMetadataEditor(schema, data_temp))
    }
    elBody.append(elName, elMisc, elPickSchema, elMetadata);
    
    // Footer
    const elFooter = UI.createModalFooter(() => {
        THOTH.fire("editLayerMetadata", {
            id      : layerId,
            data    : data_temp,
            prevData: prev_data
        });
        ATON.UI.hideModal();
    });

    ATON.UI.showModal({
        header: `Edit layer ${layer.name}`,
        body  : elBody,
        footer: elFooter,
    });
}; 

UI.modalSceneMetadata = (data_temp) => {
    if (data_temp === undefined) data_temp = structuredClone(THOTH.Scene.currData.sceneMetadata) || {};
    
    const schemaName = data_temp?.schemaName;
    const prev_data  = THOTH.Scene.currData.sceneMetadata || {};
    const schema     = THOTH.Scene.schemaMap.get(schemaName);

    // Body
    const elBody = ATON.UI.createContainer();
    
    // Schema
    let newSchemaName;
    const elPickSchema = UI.createSplitRow({
        colLeft: 8,
        itemsLeft: ATON.UI.createInputText({
            label      : "Pick schema",
            list       : Array.from(THOTH.Scene.schemaMap.keys()),
            placeholder: schemaName || "",
            oninput    : (v) => newSchemaName = v,
        }),
        itemsRight: ATON.UI.createButton({
            text   : "Build schema",
            variant: "info",
            onpress: () => {
                data_temp = THOTH.Scene.createPropertiesfromSchema(newSchemaName);
                UI.modalSceneMetadata(data_temp);
            }
        }),
    });
    
    // Metadata
    const elMetadata = ATON.UI.createContainer();
    if (schema === undefined || Object.keys(schema).length !== 0) {
        elMetadata.append(UI.createMetadataEditor(schema, data_temp))
    }
    elBody.append(elPickSchema, elMetadata);

    // Footer
    const elFooter = UI.createModalFooter(() => {
        THOTH.fire("editSceneMetadata", {
            data    : data_temp,
            prevData: prev_data
        });
        ATON.UI.hideModal();
    });

    ATON.UI.showModal({
        header: `Edit scene metadata`,
        body  : elBody,
        footer: elFooter,
    });
};  

UI.createModalFooter = (onsuccess) => {
    const elFooter = ATON.UI.createContainer();
    elFooter.append(
        // Save
        ATON.UI.createButton({
            text   : "Save changes",
            size   : "large",
            variant: "success",
            onpress: () => onsuccess()
        }),
        // Cancel
        ATON.UI.createButton({
            text   : "Cancel",
            size   : "large",
            variant: "secondary",
            onpress: () => ATON.UI.hideModal()
        }),
    );
    return elFooter;
};


export default UI;