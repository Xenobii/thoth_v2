/*===========================================================================

    THOTH
    History Functionalities

    Author: steliosalvasno@gmail.com

===========================================================================*/
let History = {};


// Action list
History.ACTIONS = {};
History.ACTIONS.CREATE_LAYER = 0;
History.ACTIONS.DELETE_LAYER = 1;
History.ACTIONS.RENAME_LAYER = 2;
History.ACTIONS.CHANGE_DESCR = 3;
History.ACTIONS.SELEC_ADD    = 4;
History.ACTIONS.SELEC_DEL    = 5;


// Setup

History.setup = () => {
    History.historyIdx = 0;

    History.undoStack = [];
    History.redoStack = [];
};


// Add to history

History.pushAction = (type, id, value) => {
    if (type === undefined || id === undefined) return;
    
    const action   = {};
    action.type    = type;
    action.id      = id;
    action.content = value;
    
    History.undoStack.push(action);
    History.redoStack = [];
};

// Undo/redo

History.undo = () => {
    if (History.undoStack.length === 0) return;

    const action  = History.undoStack.pop();
    const type    = action.type;
    const id      = action.id;
    const content = action.content;

    let inverseType = undefined;
    let prevContent = undefined;

    // Re-enact the inverse action
    switch(type) {
        case History.ACTIONS.CREATE_LAYER:
            inverseType = History.ACTIONS.DELETE_LAYER;
            THOTH.fire("deleteLayerScene", id);
            THOTH.firePhoton("deleteLayerScene", id);
            break;

        case History.ACTIONS.DELETE_LAYER:
            inverseType = History.ACTIONS.CREATE_LAYER;
            THOTH.fire("createLayerScene", id);
            THOTH.firePhoton("createLayerScene", id);
            break;

        case History.ACTIONS.RENAME_LAYER:
            inverseType = History.ACTIONS.RENAME_LAYER;
            prevContent = content;
            THOTH.fire("editLayerScene", {
                id: id,
                attr: "name",
                value: content.oldTitle
            }); 
            THOTH.firePhoton("editLayerScene", {
                id: id,
                attr: "name",
                value: content["oldTitle"]
            }); 
            break;

        case History.ACTIONS.SELEC_ADD:
            inverseType = History.ACTIONS.SELEC_DEL;
            prevContent = content; 
            THOTH.fire("delFromSelectionScene", {
                id: id,
                faces: content
            });
            THOTH.firePhoton("delFromSelectionScene", {
                id: id,
                faces: content
            });

            THOTH.updateVisibility();
            break;

        case History.ACTIONS.SELEC_DEL:
            inverseType = History.ACTIONS.SELEC_ADD;
            prevContent = content; 
            THOTH.fire("addToSelectionScene", {
                id: id,
                faces: content
            });
            THOTH.firePhoton("addToSelectionScene", {
                id: id,
                faces: content
            });

            THOTH.updateVisibility();
            break;

        default:
            console.warn("Invalid action: " + type);
            return;
    }

    // Store inverse action in redo stack
    const inverseAction   = {};
    inverseAction.type    = inverseType;
    inverseAction.id      = id;
    inverseAction.content = prevContent;

    History.redoStack.push(inverseAction);

    History.historyIdx -= 1;
};

History.redo = () => {
    if (History.redoStack.length === 0) return;

    const action  = History.redoStack.pop();
    const type    = action.type;
    const id      = action.id;
    const content = action.content;

    let inverseType = undefined;
    let prevContent = undefined;

    // Re-enact the inverse action
    switch(type) {
        case History.ACTIONS.CREATE_LAYER:
            inverseType = History.ACTIONS.DELETE_LAYER;
            THOTH.fire("deleteLayer", id);
            THOTH.firePhoton("deleteLayer", id);
            break;

        case History.ACTIONS.DELETE_LAYER:
            inverseType = History.ACTIONS.CREATE_LAYER;
            THOTH.fire("createLayer", id);
            THOTH.firePhoton("createLayer", id);
            break;

        case History.ACTIONS.RENAME_LAYER:
            inverseType = History.ACTIONS.RENAME_LAYER;
            prevContent = content;
            THOTH.fire("editLayer", {
                id: id,
                attr: "name",
                value: content.newTitle
            }); 
            THOTH.firePhoton("editLayer", {
                id: id,
                attr: "name",
                value: content.newTitle
            }); 
            break;

        case History.ACTIONS.SELEC_ADD:
            inverseType = History.ACTIONS.SELEC_DEL;
            prevContent = content;
            THOTH.fire("delFromSelection", {
                id: id,
                faces: content
            });
            THOTH.firePhoton("delFromSelection", {
                id: id,
                faces: content
            });

            THOTH.updateVisibility();
            break;

        case History.ACTIONS.SELEC_DEL:
            inverseType = History.ACTIONS.SELEC_ADD;
            prevContent = content;
            THOTH.fire("addToSelection", {
                id: id,
                faces: content
            });
            THOTH.firePhoton("addToSelection", {
                id: id,
                faces: content
            });

            THOTH.updateVisibility();
            break;

        default:
            console.warn("Invalid action: " + type);
            return;
    }

    // Store inverse action in undo stack
    const inverseAction   = {};
    inverseAction.type    = inverseType;
    inverseAction.id      = id;
    inverseAction.content = prevContent;

    History.undoStack.push(inverseAction);

    History.historyIdx += 1;
};

History.historyJump = (idx) => {
    if (idx === History.historyIdx) return;

    // Earlier step
    if (idx < History.historyIdx && idx > 0) {
        while (History.historyIdx > idx) {
            History.undo();
        }
    }
    // Later step
    if (idx > History.historyIdx && idx < History.historyIdx + History.redoStack) {
        while (History.historyIdx < idx) {
            History.redo();
        }
    }
    return;
};



export default History;