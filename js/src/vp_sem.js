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
    const rotation  = SVP.getNodeRotation(position, target);
    // Temp logic
    const inPos     = SVP.tempCreateIntermediatePosition(position, target)

    const scale = 8.0

    const VPBtn = new ATON.SUI.Button(vp)
        .setIcon(ATON.UI.PATH_RES_ICONS + "geoloc.png")
        .setPosition(...inPos)
        .setRotation(...rotation)
        .setScale(scale)
        .setBackgroundOpacity(0.3)
        .setBaseColor(new THREE.Color().setHex(0xffffff))
        .setSwitchColor(new THREE.Color().setHex(0x000000))
        .setOnHover(() => {
            VPBtn.setScale(scale * 1.2)
            VPBtn.switch(true)
        })
        .setOnLeave(() => {
            VPBtn.setScale(scale)
            VPBtn.switch(false)
        })
        .setOnSelect(() => {
            ATON.Nav.requestPOVbyID(vp, 0.5);
        })

    return VPBtn;
};

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
    const midpoint = posVec.clone().lerp(tarVec, 0.75);
    return midpoint;
};



export default SVP;