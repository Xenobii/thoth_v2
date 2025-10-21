/*===========================================================================

    THOTH
    Semantic Viewpoint Components

    Author: steliosalvanos@gmail.com

===========================================================================*/


let SVP = {};



// Setup

SVP.setup = () => {
    SVP.setupSVPNodes();
};

SVP.setupSVPNodes = () => {
    const viewpoints = THOTH.Scene.currData.viewpoints;
    if (viewpoints === undefined) return;

    SVP.VPNodes = new ATON.Node("SVPNodes", ATON.NTYPES.UI);
    for (const vp of Object.keys(viewpoints)) {
        if (vp !== "home") {
            const VPBtn = SVP.createSVPNode(vp);
            VPBtn.attachTo("SVPNodes");
        }
    }
    SVP.VPNodes.attachToRoot();
};

SVP.createSVPNode = (vp) => {
    const viewpoint = THOTH.Scene.currData.viewpoints[vp];
    const position  = viewpoint.position;
    const target    = viewpoint.target;
    
    // Temp logic
    const inPos = SVP.tempCreateIntermediatePosition(position, target);

    // Create nav mesh
    const radius = 0.2;
    const matSTD = new THREE.MeshStandardMaterial({
        color      : new THREE.Color(0xffffff),
        metalness  : 0.1,
        transparent: true,
        roughness  : 0.4
    });    
    const geom   = new THREE.SphereGeometry(radius, 16, 12);
    const mesh   = new THREE.Mesh(geom, matSTD);

    mesh.renderOrder        = 1;
    mesh.material.depthTest = true;

    const N = new ATON.Node(vp, ATON.NTYPES.UI);
    N.add(mesh);
    N.setPickable(true);
    N.setOpacity(0.7);
    N.setPosition(...inPos);
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
        ATON.Nav.requestPOVbyID(vp, 0.5);
        THOTH.UI.showVPPreview(vp);
    });
    
    return N;
};


// Visualization

SVP.toggleVPNodes = (bool) => {
    SVP.VPNodes.toggle(bool);
};

SVP.resizeVPNodes = (scale) => {
    if (SVP.VPNodes && SVP.VPNodes.children) {
        for (const VPNode of SVP.VPNodes.children) {
            VPNode.setScale(scale);
        }
    }
};


// Utils

SVP.getNodeRotation = (position, target) => {
    const posVec = new THREE.Vector3(...position)
    const tarVec = new THREE.Vector3(...target)
    const up     = new THREE.Vector3(0, 1, 0);

    const m = new THREE.Matrix4();
    m.lookAt(posVec, tarVec, up);

    const quat  = new THREE.Quaternion().setFromRotationMatrix(m);
    const euler = new THREE.Euler().setFromQuaternion(quat);

    return euler
};

SVP.tempCreateIntermediatePosition = (position, target) => {
    const posVec   = new THREE.Vector3(...position);
    const tarVec   = new THREE.Vector3(...target);
    const midpoint = posVec.clone().lerp(tarVec, 0.8);
    return midpoint;
};



export default SVP;