/*===========================================================================

    THOTH
    Semantic Viewpoint Components

    Author: steliosalvanos@gmail.com

===========================================================================*/


let SVP = {};



// Build

SVP.buildVPNodes = (modelName) => {
    const viewpoints = THOTH.Scene.currData.viewpoints;
    if (viewpoints === undefined) return;
    
    SVP.VPNodes = new ATON.Node("SVPNodes", ATON.NTYPES.UI);
    for (const vp of Object.keys(viewpoints)) {
        if (vp !== "home") {
            const VPBtn = SVP.createSVPNode(vp);
            VPBtn.attachTo("SVPNodes");
        }
    }
    SVP.VPNodes.attachTo(THOTH.Scene.modelMap.get(modelName).modelData);
};

SVP.createSVPNode = (vp) => {
    const viewpoint = THOTH.Scene.currData.viewpoints[vp];
    if (viewpoint === undefined) return;
    
    const position  = viewpoint.position;
    const target    = viewpoint.target;
    
    // Temp logic
    // const inPos = SVP.tempCreateIntermediatePosition(position, target);
    const inPos = position

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

SVP.getCameraPosition = (camera) => {
    // DONT KNOW IF THIS WORKS
    const q_colmap = new THREE.Quaternion(camera.qx, camera.qy, camera.qz, camera.qw);
    
    // Rotation
    const R = new THREE.Matrix3().setFromQuaternion(q_colmap);

    // Translation
    const t = new TRHEE.Vector3(camera.tx, camera.ty, camera.tz);

    // Camera center
    const Rt = R.clone().transpose();
    const C  = t.clone().applyMatrix3(Rt).negate();

    // Convert to threejs
    const q_three = q_colmap.clone().invert();

    return {
        position: C,
        quartenion: q_three
    }
};

SVP.convertToThreeCoords = (qw, qx, qy, qz, tx, ty, tz) => {
    // World to camera
    const q_wc = new THREE.Quaternion(-qx, qz, qy, qw).invert();
    const c_wc = new THREE.Vector3(tx, tz, ty).negate().applyQuaternion(q_wc);
    // Rotate to match COLMAP
    const flip = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0), Math.PI
    );
    const q_three = flip.clone().multiply(q_wc).multiply(flip);
    const c_three = new THREE.Vector3(c_wc.x, -c_wc.y, -c_wc.z);

    return [
        q_three.w,
        q_three.x,
        q_three.y,
        q_three.z,
        c_three.x,
        c_three.y,
        c_three.z
    ];
};

SVP.createVPTarget = (qw, qx, qy, qz, tx, ty, tz, mesh) => {
    if (mesh === undefined) mesh = THOTH.Scene.mainMesh;

    const camPos  = new THREE.Vector3(tx, ty, tz);
    const camQuat = new THREE.Quaternion(qx, qy, qz, qw);

    const forward = new THREE.Vector3(0, -1, 0).applyQuaternion(camQuat).normalize();

    // Raycaster
    const raycaster = new THREE.Raycaster();
    raycaster.ray.origin.copy(camPos);
    raycaster.ray.direction.copy(forward);
    raycaster.near = 0.001;
    raycaster.far  = 1000;

    // visualization
    const rayLength = 2;
    const endPos = new THREE.Vector3().copy(raycaster.ray.origin)
        .add(new THREE.Vector3().copy(raycaster.ray.direction).multiplyScalar(rayLength));

    return endPos;
};


SVP.updatePosition = () => {

};


SVP.updateRotation = () => {

};  



export default SVP;