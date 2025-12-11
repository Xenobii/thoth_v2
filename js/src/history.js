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

History.ACTIONS.CREATE_LAYER = 0;
History.ACTIONS.DELETE_LAYER = 1;
History.ACTIONS.RENAME_LAYER = 2;

History.ACTIONS.SELEC_ADD    = 4;
History.ACTIONS.SELEC_DEL    = 5;

History.ACTIONS.EDIT_METADATA_LAYER  = 3;
History.ACTIONS.EDIT_METADATA_OBJECT = 6;

History.ACTIONS.TRANSFORM_MODEL_POS = 7;
History.ACTIONS.TRANSFORM_MODEL_ROT = 8;

History.ACTIONS.ADD_MODEL    = 9;
History.ACTIONS.DEL_MODEL = 10;

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
            THOTH.Layers.deleteLayer(id);
            THOTH.firePhoton("deleteLayer", id);
            break;
            
        case History.ACTIONS.DELETE_LAYER:
            inverseType = History.ACTIONS.CREATE_LAYER;
            THOTH.Layers.createLayer(id);
            THOTH.FE.addNewLayer(id);
            THOTH.firePhoton("createLayer", id);
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
            THOTH.Scene.editLayer(id, "metadata", value);
            THOTH.firePhoton("editLayerMetadata", {
                id   : id,
                value: value
            });
            break;

        case History.ACTIONS.EDIT_METADATA_OBJECT:
            inverseType = History.ACTIONS.EDIT_METADATA_OBJECT;
            // Swap
            [value, prevValue] = [prevValue, value];
            THOTH.Scene.editSceneMetadata(value);
            THOTH.firePhoton("editSceneMetadata", {
                value: value
            });
            break;

        case History.ACTIONS.SELEC_ADD:
            inverseType = History.ACTIONS.SELEC_DEL;
            THOTH.Layers.delFromSelection(id, value);
            THOTH.firePhoton("delFromSelection", {
                id       : id,
                selection: value
            });
            break;

        case History.ACTIONS.SELEC_DEL:
            inverseType = History.ACTIONS.SELEC_ADD;
            THOTH.Layers.delFromSelection(id, value);
            THOTH.firePhoton("addToSelectionScene", {
                id       : id,
                selection: value
            });
            break;
        
        case History.ACTIONS.TRANSFORM_MODEL_POS:
            inverseType = History.ACTIONS.TRANSFORM_MODEL_POS;
            // Swap
            [value, prevValue] = [prevValue, value];

            THOTH.Models.modelTransformPos(id, value);
            THOTH.firePhoton("modelTransformPos", {
                modelName: id,
                value    : value
            });
            break;
        
        case History.ACTIONS.TRANSFORM_MODEL_ROT:
            inverseType = History.ACTIONS.TRANSFORM_MODEL_ROT;
            // Swap
            [value, prevValue] = [prevValue, value];

            THOTH.Models.modelTransformRot(id, value);
            THOTH.firePhoton("modelTransformRot", {
                modelName: id,
                value    : value
            });
            break;
        
        case History.ACTIONS.ADD_MODEL:
            inverseType = History.ACTIONS.DEL_MODEL;
            THOTH.Models.deleteModel(id);
            THOTH.firePhoton("deleteModel", id);
            break;

        case History.ACTIONS.DEL_MODEL:
            inverseType = History.ACTIONS.ADD_MODEL;
            THOTH.Models.addModel(id);
            THOTH.firePhoton("addModel");
            break; 

        default:
            THOTH.UI.showToast("Invalid action type: " + type);
            console.warn("Invalid action: " + type);
            return;
    }

    // Store inverse action in redo stack
    const inverseAction = {
        type     : inverseType,
        id       : id,
        value    : value,
        prevValue: prevValue
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
            THOTH.Layers.deleteLayer(id);
            THOTH.FE.deleteLayer(id);
            THOTH.firePhoton("deleteLayer", id);
            break;

        case History.ACTIONS.DELETE_LAYER:
            inverseType = History.ACTIONS.CREATE_LAYER;
            THOTH.Layers.createLayer(id);
            THOTH.FE.addNewLayer(id);
            THOTH.firePhoton("createLayer", id);
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
            THOTH.Layers.editLayer(id, "metadata", value);
            THOTH.firePhoton("editLayerMetadata", {
                id   : id,
                attr : "metadata",
                value: value
            });
            break;

        case History.ACTIONS.EDIT_METADATA_OBJECT:
            inverseType = History.ACTIONS.EDIT_METADATA_OBJECT;
            // Swap
            [value, prevValue] = [prevValue, value];
            THOTH.Scene.editSceneMetadata(value);
            THOTH.firePhoton("editSceneMetadata", {
                value   : value
            });
            break;

        case History.ACTIONS.SELEC_ADD:
            inverseType = History.ACTIONS.SELEC_DEL;
            THOTH.Layers.delFromSelection(id, value);
            THOTH.firePhoton("delFromSelection", {
                id       : id,
                selection: value
            });
            break;
            
        case History.ACTIONS.SELEC_DEL:
            inverseType = History.ACTIONS.SELEC_ADD;
            THOTH.Layers.addToSelection(id, value);
            THOTH.firePhoton("addToSelection", {
                id       : id,
                selection: value
            });
            break;

        case History.ACTIONS.TRANSFORM_MODEL_POS:
            inverseType = History.ACTIONS.TRANSFORM_MODEL_POS;
            // Swap
            [value, prevValue] = [prevValue, value];

            THOTH.Models.modelTransformPos(id, value);
            THOTH.firePhoton("modelTransformPos", {
                modelName: id,
                value    : value
            });
            break;

        case History.ACTIONS.TRANSFORM_MODEL_ROT:
            inverseType = History.ACTIONS.TRANSFORM_MODEL_ROT;
            // Swap
            [value, prevValue] = [prevValue, value];

            THOTH.Models.modelTransformRot(id, value);
            THOTH.firePhoton("modelTransformRot", {
                modelName: id,
                value    : value
            });
            break;
        
        case History.ACTIONS.ADD_MODEL:
            inverseType = History.ACTIONS.DEL_MODEL;
            THOTH.Models.deleteModel(id);
            THOTH.firePhoton("deleteModel", id);
            break;

        case History.ACTIONS.DEL_MODEL:
            inverseType = History.ACTIONS.ADD_MODEL;
            THOTH.Models.addModel(id);
            THOTH.firePhoton("addModel");
            break; 
            
        default:
            THOTH.UI.showToast("Invalid action type: " + type);
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