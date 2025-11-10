/*===========================================================================

    THOTH
    History Functionalities

    Author: steliosalvanos@gmail.com

===========================================================================*/
let History = {};

/*
HISTORY API:
{
    type,
    id,
    value,
    prevValue
}
*/


// Action list
History.ACTIONS = {};
History.ACTIONS.CREATE_LAYER    = 0;
History.ACTIONS.DELETE_LAYER    = 1;
History.ACTIONS.RENAME_LAYER    = 2;
History.ACTIONS.SELEC_ADD       = 4;
History.ACTIONS.SELEC_DEL       = 5;

History.ACTIONS.EDIT_METADATA_LAYER     = 3;
History.ACTIONS.EDIT_METADATA_OBJECT    = 6;

// Setup

History.setup = () => {
    History.historyIdx = 0;

    History.undoStack = [];
    History.redoStack = [];
};


// Add to history

History.pushAction = (action) => {
    if (action.type === undefined) return;

    History.undoStack.push(action);
    History.redoStack = [];
};

// Undo/redo

History.undo = () => {
    if (History.undoStack.length === 0) return;

    const action = History.undoStack.pop();
    
    const type      = action.type;
    const id        = action.id;
    let   value     = action.value;
    let   prevValue = action.prevValue;

    let inverseType = null;

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
            // Swap
            [value, prevValue] = [prevValue, value];
            THOTH.fire("editLayerScene", {
                id      : id,
                attr    : "name",
                value   : value
            }); 
            THOTH.firePhoton("editLayerScene", {
                id      : id,
                attr    : "name",
                value   : value
            });
            break;

        case History.ACTIONS.EDIT_METADATA_LAYER:
            inverseType = History.ACTIONS.EDIT_METADATA_LAYER;
            // Swap
            [value, prevValue] = [prevValue, value];
            THOTH.fire("editLayerScene", {
                id      : id,
                attr    : "metadata",
                value   : value
            });
            THOTH.firePhoton("editLayerScene", {
                id      : id,
                attr    : "metadata",
                value   : value
            });
            break;

        case History.ACTIONS.EDIT_METADATA_OBJECT:
            inverseType = History.ACTIONS.EDIT_METADATA_OBJECT;
            // Swap
            [value, prevValue] = [prevValue, value];
            THOTH.fire("editObjectScene", {
                value   : value
            });
            THOTH.firePhoton("editObjectScene", {
                value   : value
            });
            break;

        case History.ACTIONS.SELEC_ADD:
            inverseType = History.ACTIONS.SELEC_DEL;
            THOTH.fire("delFromSelectionScene", {
                id       : id,
                selection: value
            });
            THOTH.firePhoton("delFromSelectionScene", {
                id       : id,
                selection: value
            });
            THOTH.updateVisibility();
            break;

        case History.ACTIONS.SELEC_DEL:
            inverseType = History.ACTIONS.SELEC_ADD;
            THOTH.fire("addToSelectionScene", {
                id       : id,
                selection: value
            });
            THOTH.firePhoton("addToSelectionScene", {
                id       : id,
                selection: value
            });
            THOTH.updateVisibility();
            break;

        default:
            if (THOTH.UI._elToast !== undefined) THOTH.UI.showToast("Invalid action type: " + type);
            console.warn("Invalid action: " + type);
            return;
    }

    // Store inverse action in redo stack
    const inverseAction = {
        type        : inverseType,
        id          : id,
        value       : value,
        prevValue   : prevValue
    };

    History.redoStack.push(inverseAction);
    History.historyIdx -= 1;
};

History.redo = () => {
    if (History.redoStack.length === 0) return;

    const action = History.redoStack.pop();

    const type      = action.type;
    const id        = action.id;
    let   value     = action.value;
    let   prevValue = action.prevValue;

    let inverseType = undefined;

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
            // Swap
            [value, prevValue] = [prevValue, value];
            THOTH.fire("editLayerScene", {
                id   : id,
                attr : "name",
                value: value
            }); 
            THOTH.firePhoton("editLayerScene", {
                id   : id,
                attr : "name",
                value: value
            });
            break;

        case History.ACTIONS.EDIT_METADATA_LAYER:
            inverseType = History.ACTIONS.EDIT_METADATA_LAYER;
            // Swap
            [value, prevValue] = [prevValue, value];
            THOTH.fire("editLayerScene", {
                id   : id,
                attr : "metadata",
                value: value
            });
            THOTH.firePhoton("editLayerScene", {
                id   : id,
                attr : "metadata",
                value: value
            });
            break;

        case History.ACTIONS.EDIT_METADATA_OBJECT:
            inverseType = History.ACTIONS.EDIT_METADATA_OBJECT;
            // Swap
            [value, prevValue] = [prevValue, value];
            THOTH.fire("editObjectScene", {
                value   : value
            });
            THOTH.firePhoton("editObjectScene", {
                value   : value
            });
            break;

        case History.ACTIONS.SELEC_ADD:
            inverseType = History.ACTIONS.SELEC_DEL;
            THOTH.fire("delFromSelectionScene", {
                id       : id,
                selection: value
            });
            THOTH.firePhoton("delFromSelectionScene", {
                id       : id,
                selection: value
            });
            THOTH.updateVisibility();
            break;

        case History.ACTIONS.SELEC_DEL:
            inverseType = History.ACTIONS.SELEC_ADD;
            THOTH.fire("addToSelectionScene", {
                id       : id,
                selection: value
            });
            THOTH.firePhoton("addToSelectionScene", {
                id       : id,
                selection: value
            });
            THOTH.updateVisibility();
            break;

        default:
            if (THOTH.UI._elToast !== undefined) THOTH.UI.showToast("Invalid action type: " + type);
            console.warn("Invalid action: " + type);
            return;
    }

    // Store inverse action in undo stack
    const inverseAction   = {
        type     : inverseType,
        id       : id,
        value    : value,
        prevValue: prevValue
    };

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