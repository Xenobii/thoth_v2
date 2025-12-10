let Models = {};



// Setup

Models.setup = () => {
    // Init scenegraph if undefined
    if (ATON.SceneHub.currData.scenegraph === undefined) {
        ATON.SceneHub.currData.scenegraph = {};
    };
    
    // Create model map for easy access
    const modelGraph = ATON.SceneHub.currData.scenegraph.nodes;
    Models.modelMap = new Map();

    for (const name in modelGraph) {
        const node = ATON.getSceneNode(name);
        Models.modelMap.set(name, node);
    };

    // Initialize raycasting for models
    for (const model of Models.modelMap.keys()) {
        Models.initModelForRC(model);
    }
};


// Utils

Models.getModelURL = (modelName) => {
    if (!modelName) return;

    const model = Models.modelMap.get(modelName);
    if (model === undefined) return;
    
    const url = Object.keys(model._reqURLs)[0];
    return url;
};

Models.getModelMeshes = (modelName) => {
    if (!modelName) return;
    
    const model = Models.modelMap.get(modelName);
    if (model === undefined) return;

    const meshes = new Map()
    model.traverse(N => {
        if (N.isMesh) {
            meshes.set(N.name, N);
        }
    })
    return meshes;
};


// Model Management

Models.addModel = (url) => {
    if (url === undefined) return;

    const N = ATON.createSceneNode();
    N.attachToRoot();

    N.load(url, () => {
        const modelName = ""
        N.as(modelName)

        //
    })
};


Models.initModelForRC = (modelName) => {
    const meshes = Models.getModelMeshes(modelName);
    for (const [name, mesh] of meshes) {
        // Bounds Tree
        if (!mesh.geometry.boundsTree) {
            console.log(`Computing bounds tree for ${name} (${modelName})`);
            mesh.geometry.computeBoundsTree();
        }

        // Color properties for face selection
        mesh.material.vertexColors = true;
        mesh.material.needsUpdate  = true;
    
        // Vertex colors
        if (!mesh.geometry.attributes.color) {
            const defaultColor = new THREE.Color(0xffffff);
            let colorArray = new Float32Array(mesh.geometry.attributes.position.count * 3);
            for (let i = 0; i < mesh.geometry.attributes.position.count; i++) {
                colorArray[i * 3 + 0] = defaultColor.r;
                colorArray[i * 3 + 1] = defaultColor.g;
                colorArray[i * 3 + 2] = defaultColor.b;
            }
            let colorAttr = new THREE.BufferAttribute(colorArray, 3);
            mesh.geometry.setAttribute('color', colorAttr);
        }
    }
};


// Visibility

Models.showModelMeshes = (modelName) => {
    if (modelName === undefined) return;
    
    const meshes = Models.getModelMeshes(modelName);
    const model  = Models.modelMap.get(modelName);
    
    if (meshes === undefined) return;
    
    for (const [, mesh] in meshes) {
        mesh.visible = true;
    }
    model.visible = true;
}; 

Models.hideModelMeshes = (modelName) => {
    if (modelName === undefined) return;
    
    const meshes = Models.getModelMeshes(modelName);
    const model  = Models.modelMap.get(modelName);
    
    if (meshes === undefined) return;
    
    for (const [, mesh] in meshes) {
        mesh.visible = false;
    }
    model.visible = false;
};

Models.toggleVisibility = (modelName) => {
    if (modelName === undefined) return;

    const model = Models.modelMap.get(modelName);
    if (model === undefined) return;

    if (model.visible) {
        Models.hideModelMeshes(modelName);
        model.visible = false;
        return false;
    }
    else {
        Models.showModelMeshes(modelName);
        model.visible = true;
        return true;
    }
};  


// Transforms 

Models.modelTransformPos = (modelName, value) => {
    if (modelName === undefined) return;

    const model = Models.modelMap.get(modelName);
    model.position.set(value.x, value.y, value.z);
};

Models.modelTransformRot = (modelName, value) => {
    if (modelName === undefined) return;

    const model = Models.modelMap.get(modelName);
    model.rotation.set(value.x, value.y, value.z);
};



export default Models;