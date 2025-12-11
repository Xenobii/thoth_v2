/*===========================================================================

    THOTH
    Semantic Viewpoint Components

    Author: steliosalvanos@gmail.com

===========================================================================*/


let SVP = {};



// Build

SVP.buildVPNodes = (vpMap, modelName) => {
    // Create viewpoints
    const viewpoints = new ATON.Node(
        `${modelName}Viewpoints`,
        ATON.NTYPES.UI,
    );
    SVP.viewpoints = SVP.viewpoints || {}; 
    SVP.viewpoints[modelName] = {};
    
    for (const [id, vp] of vpMap) {
        const [qw, qx, qy, qz, tx, ty, tz, , image] = vp;
        
        // Convert to three coords
        const Q   = SVP.getQuatThree(qw, qx, qy, qz);
        const pos = SVP.getPosThree(Q, tx, ty, tz);

        // Get image url
        const modelURL = THOTH.Scene.modelMap.get(modelName).url;
        const imageURL = modelURL.split('/').slice(0, -1).join('/') + "/images/" + image;
        
        // Get target
        const target = SVP.createTarget(Q, pos);
        
        // Create pov node
        new ATON.POV(`${modelName}_vp_${id}`)
            .setPosition(pos.x, pos.y, pos.z)
            .setTarget(target.x, target.y, target.z)
            .setFOV(70);
            
        // Create semantic node
        const semNode = SVP.createSVPNode(`${modelName}_vp_${id}`, pos);
        semNode.attachTo(`${modelName}Viewpoints`);
        semNode.image = ATON.Utils.resolveCollectionURL(imageURL);
        
        // Add to SVP map for convenience
        SVP.viewpoints[modelName][id] = semNode;
    };

    // Attach to model
    viewpoints.attachTo(THOTH.Scene.modelMap.get(modelName).modelData);
};

SVP.createSVPNode = (id, pos) => {
    // Create Sphere geometry
    const radius = 0.2;
    const matSTD = new THREE.MeshStandardMaterial({
        color      : new THREE.Color(0xffffff),
        metalness  : 0.1,
        transparent: true,
        roughness  : 0.4
    });    
    const geom = new THREE.SphereGeometry(radius, 16, 12);
    const mesh = new THREE.Mesh(geom, matSTD);

    mesh.renderOrder        = 1;
    mesh.material.depthTest = true;

    // Create node
    const N = new ATON.Node(id, ATON.NTYPES.UI);
    N.add(mesh);
    N.setPickable(true);
    N.setOpacity(0.7);
    N.setPosition(pos.x, pos.y, pos.z);
    N.orientToCamera();
    N.dirtyBound();
    N.setOnHover(() => {
        N.setOpacity(0.8);
        N.setScale(1.6);
    });
    N.setOnLeave(() => {
        N.setOpacity(0.7);
        N.setScale(1.0);
    });
    N.setOnSelect(() => {
        ATON.Nav.requestPOVbyID(id, 0.5);
        THOTH.FE.showVPCard(id);
    });

    return N;
};

SVP.deleteSVPNodes = (modelName) => {
    if (!modelName) return;
    const modelEntry = THOTH.Scene.modelMap.get(modelName);
    if (!modelEntry || !modelEntry.modelData) return;

    const modelData = modelEntry.modelData;
    const vpName = `${modelName}Viewpoints`;
    const parent = modelData.getObjectByName ? modelData.getObjectByName(vpName) : null;

    if (parent) {
        modelData.remove(parent);

        parent.traverse((obj) => {
            if (obj.isMesh) {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) {
                        obj.material.forEach(m => m?.dispose && m.dispose());
                    } else {
                        obj.material?.dispose && obj.material.dispose();
                    }
                }
            }
        });
    }

    if (SVP.viewpoints?.[modelName]) delete SVP.viewpoints[modelName];
};


// Visualization

SVP.toggleVPNodes = (bool, modelName) => {
    if (!modelName) {
        const modelNames = Object.keys(SVP.viewpoints);
        for (const name of modelNames) {
            SVP.toggleVPNodes(bool, name);
        }
        return;
    }
    const viewpoints = SVP.viewpoints?.[modelName];
    if (viewpoints === undefined) return;
    for (const vp in viewpoints) {
        viewpoints[vp].toggle(bool);
    }
};

SVP.resizeVPNodes = (scale) => {
    for (const modelName in SVP.viewpoints) {
        const viewpoints = SVP.viewpoints[modelName];
        for (const vp in viewpoints) {
            viewpoints[vp].setScale(scale);
        }
    }
};


// Utils

SVP.getQuatThree = (qw, qx, qy, qz) => {
    const process = (v) => {
        const s = 10 ** 4;
        return parseFloat(v) * s / s;
    }
    const flip = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 0), Math.PI
    );
    return new THREE.Quaternion(
        -process(qx),
        process(qz),
        process(qy),
        process(qw)
    ).invert();
};

SVP.getPosThree = (Q, tx, ty, tz) => {
    const process = (v) => {
        const s = 10 ** 4;
        return parseFloat(v) * s / s;
    };
    return new THREE.Vector3(
        -process(tx),
        process(tz),
        process(ty)
    ).applyQuaternion(Q)
};

SVP.createTarget = (Q, pos) => {
    const forward = new THREE.Vector3(0, -1, 0).applyQuaternion(Q).normalize();
    const length  = 10;
    return pos.clone().addScaledVector(forward, length);
};

export default SVP;