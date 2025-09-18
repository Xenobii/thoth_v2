/*===========================================================================

    THOTH
    Toolbox Functalities

    Author: steliosalvasno@gmail.com

===========================================================================*/
const { INTERSECTED, NOT_INTERSECTED, CONTAINED } = window.ThreeMeshBVH;


let Toolbox = {};


// Setup

Toolbox.setup = () => {
    // Adjustable params
    Toolbox.lassoPrecision  = 0.1;  // between 0.1 and 1
    Toolbox.normalThreshold = 0;    // between -1 and 1
    Toolbox.selectObstructedFaces = false;

    Toolbox.enabled         = false;
    Toolbox.brushEnabled    = false;
    Toolbox.eraserEnabled   = false;
    Toolbox.lassoEnabled    = false;
    
    // Internal params
    Toolbox.tempSelection   = null;

    // Create selector mesh
    Toolbox.selectorSize    = 1;
    Toolbox.selectorRadius  = THOTH.Utils.computeRadius(Toolbox.selectorSize)
    Toolbox.selectorMesh    = Toolbox.createSelectorMesh(Toolbox.selectorRadius);
    
    // Add to scene
    THOTH.Scene.root.add(Toolbox.selectorMesh);
    
    // Create lasso canvas
    Toolbox.createLassoCanvas();
    Toolbox.resizeLassoCanvas();
    Toolbox.lassoPoints = [];
};


// Selector

Toolbox.createSelectorMesh = (radius) => {
    let selectorGeometry = new THREE.SphereGeometry(1, 32, 16);
    let selectorMaterial = new THREE.MeshStandardMaterial({
        color:0xffffff,
        roughness: 0.75,
        metalness: 0,
        transparent: true,
        opacity: 0.5,
        premultipliedAlpha: true,
        emissive: 0x00ff00,
        emissiveIntensity: 0.5,
    });
    let selectorMesh = new THREE.Mesh(selectorGeometry, selectorMaterial);
    selectorMesh.scale.setScalar(radius);
    selectorMesh.visible = false;
    
    return selectorMesh;
};

Toolbox.increaseSelectorSize = () => {
    Toolbox.selectorSize += 1;
    Toolbox.selectorRadius = THOTH.Utils.computeRadius(Toolbox.selectorSize);
    Toolbox.selectorMesh.scale.setScalar(Toolbox.selectorRadius);
};

Toolbox.decreaseSelectorSize = () => {
    Toolbox.selectorSize -= 1;
    Toolbox.selectorRadius = THOTH.Utils.computeRadius(Toolbox.selectorSize);
    Toolbox.selectorMesh.scale.setScalar(Toolbox.selectorRadius);
};

Toolbox.setSelectorSize = (size) => {
    Toolbox.selectorSize = size;
    Toolbox.selectorRadius = THOTH.Utils.computeRadius(Toolbox.selectorSize);
    Toolbox.selectorMesh.scale.setScalar(Toolbox.selectorRadius);
};


// Lasso inits

Toolbox.createLassoCanvas = () => {
    Toolbox.canvas = document.createElement('canvas');
    Toolbox.canvas.id = 'lassoCanvas';
    document.body.appendChild(Toolbox.canvas);

    Object.assign(Toolbox.canvas.style, {
        position        : 'absolute',
        top             : '0',
        left            : '0',
        width           : '100%',
        height          : '100%',
        pointerEvents   : 'none',
        zIndex          : '10'
    });
    Toolbox.lassoCtx = Toolbox.canvas.getContext('2d');
};

Toolbox.resizeLassoCanvas = () => {
    const dpr = window.devicePixelRatio || 1;

    Toolbox.canvas.width    = THOTH._renderer.domElement.clientWidth * dpr;
    Toolbox.canvas.height   = THOTH._renderer.domElement.clientHeight * dpr;

    Toolbox.canvas.style.width  = THOTH._renderer.domElement.clientWidth + 'px';
    Toolbox.canvas.style.height = THOTH._renderer.domElement.clientHeight + 'px';
    
    Toolbox.lassoCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    Toolbox.lassoCtx.strokeStyle = 'rgba(0, 255, 0, 0.7)';
    Toolbox.lassoCtx.lineWidth   = 1;
};


// Update functions
Toolbox.getPixelPointerCoords = (e) => {
    const rect = THOTH._renderer.domElement.getBoundingClientRect();
    Toolbox.pixelPointerCoords = {
        x: (e.clientX - rect.left),
        y: (e.clientY - rect.top)
    };
};

Toolbox.moveSelector = () => {
    if (THOTH._queryData === undefined || !(THOTH.Toolbox.brushEnabled || THOTH.Toolbox.eraserEnabled)) {
        THOTH._renderer.domElement.style.cursor = 'default';
        Toolbox.selectorMesh.visible = false;
        return;
    }
    THOTH._renderer.domElement.style.cursor = 'none';
    Toolbox.selectorMesh.visible = true;
    Toolbox.selectorMesh.position.copy(THOTH._queryData.p);
};


// Selections

Toolbox.selectMultipleFaces = (mesh) => {
    if (THOTH._queryData === undefined) return false;

    if (mesh === undefined) mesh = THOTH.Scene.mainMesh;

    const inverseMatrix = new THREE.Matrix4();
    inverseMatrix.copy(mesh.matrixWorld).invert();

    const sphere = new THREE.Sphere();
    sphere.center.copy(Toolbox.selectorMesh.position).applyMatrix4(inverseMatrix);
    sphere.radius = Toolbox.selectorRadius;

    const faces   = [];
    const tempVec = new THREE.Vector3();

    if (mesh.geometry.boundsTree) {
        mesh.geometry.boundsTree.shapecast({
            intersectsBounds: box => {
                const intersects = sphere.intersectsBox(box);
                const {min, max} = box;
                if (intersects) {
                    for (let x=0; x<=1; x++) {
                        for (let y=0; y<=1; y++) {
                            for (let z=0; z<=1; z++) {
                                tempVec.set(
                                    x === 0 ? min.x : max.x,
                                    y === 0 ? min.y : max.y,
                                    z === 0 ? min.z : max.z
                                );
                                if (!sphere.containsPoint(tempVec)) {
                                    return INTERSECTED;
                                }
                            }
                        }
                    }
                    return CONTAINED
                }
                return intersects ? INTERSECTED: NOT_INTERSECTED
            },
            intersectsTriangle: (tri, i, contained) => {
                if (contained || tri.intersectsSphere(sphere)) {
                    faces.push(i)
                }
            }
        })
    }
    else {
        console.log("Face selection failed, geometry has no bounds tree.")
    }
    return faces
};

Toolbox.addFacesToSelection = (newFaces, selection) => {
    if (newFaces === undefined || !newFaces.length) return;
    
    const newSelection = new Set(selection)
    const newFacesSet  = new Set(newFaces);
        
    newFacesSet.forEach(f => {
        if (!newSelection.has(f)) {
            newSelection.add(f);
        }
    });

    return newSelection;
};

Toolbox.delFacesFromSelection = (newFaces, selection) => {
    if (newFaces === undefined || !newFaces.length) return;
    
    const newSelection = new Set(selection);
    const newFacesSet  = new Set(newFaces);

    newFacesSet.forEach(f => {
        if (newSelection.has(f)) {
            newSelection.delete(f);
        }
    });

    return newSelection;
};

// Brush

Toolbox.brushActive = () => {
    const newFaces = Toolbox.selectMultipleFaces();
    const highlightColor = THOTH.Utils.hex2rgb(THOTH.Scene.activeLayer.highlightColor);
    Toolbox.tempSelection = Toolbox.addFacesToSelection(newFaces, Toolbox.tempSelection);
    THOTH.highlightSelection(newFaces, highlightColor);
};

Toolbox.eraserActive = () => {
    const newFaces = Toolbox.selectMultipleFaces();
    const highlightColor = THOTH.Utils.hex2rgb('#ffffff');
    Toolbox.tempSelection = Toolbox.addFacesToSelection(newFaces, Toolbox.tempSelection);
    THOTH.highlightSelection(newFaces, highlightColor);
};

Toolbox.endBrush = () => {
    // Get only faces that don't already belong to layer
    return [...Toolbox.tempSelection].filter(f => !THOTH.Scene.activeLayer.selection.has(f));
};

Toolbox.endEraser = () => {
    // Get only faces that already belong to layer
    return [...Toolbox.tempSelection].filter(f => THOTH.Scene.activeLayer.selection.has(f));
};


// Lasso

Toolbox.cleanupLasso = () => {
    if (!Toolbox.lassoCtx) return;
    Toolbox.lassoCtx.clearRect(0, 0, 
        Toolbox.lassoCtx.canvas.width,
        Toolbox.lassoCtx.canvas.height
    );
    Toolbox._lassoIsActive = false;
};

Toolbox.startLasso = () => {
    Toolbox._lassoIsActive = true;
    
    Toolbox.lassoPoints = [Toolbox.pixelPointerCoords];

    Toolbox.lassoCtx.beginPath();
    Toolbox.lassoCtx.moveTo(
        Toolbox.pixelPointerCoords.x,
        Toolbox.pixelPointerCoords.y);
}; 

Toolbox.updateLasso = () => {
    if (!Toolbox._lassoIsActive) return;

    const previousPos = Toolbox.lassoPoints[Toolbox.lassoPoints.length - 1];
    const currentPos  = Toolbox.pixelPointerCoords;
    const dist = THOTH.Utils.pointDistance(previousPos, currentPos);
    
    // Reduce oversampling
    if (dist < 1 / Toolbox.lassoPrecision) return;
        
    Toolbox.lassoPoints.push(currentPos);
    
    Toolbox.lassoCtx.lineTo(currentPos.x, currentPos.y);
    Toolbox.lassoCtx.stroke();
};

Toolbox.endLassoAdd = () => {
    const newFaces = Toolbox.processLassoSelection(THOTH.Scene.mainMesh);
    if (newFaces === undefined || newFaces.length === 0) return;

    // Get only faces that don't already belong to the layer
    const faces = [...newFaces].filter(f => !THOTH.Scene.activeLayer.selection.has(f));

    Toolbox.cleanupLasso();
    Toolbox._lassoIsActive = false;

    return faces;
};

Toolbox.endLassoDel = () => {
    const newFaces = Toolbox.processLassoSelection(THOTH.Scene.mainMesh);
    if (newFaces === undefined && newFaces.length === 0) return;

    // Get only faces that already belong to layer
    const faces = [...newFaces].filter(f => THOTH.Scene.activeLayer.selection.has(f));

    Toolbox.cleanupLasso();
    Toolbox._lassoIsActive = false;

    return faces;
};

Toolbox.processLassoSelection = (mesh) => {
    if (!Toolbox.lassoPoints || Toolbox.lassoPoints.length < 3) return;

    const geometry  = mesh.geometry;
    const camera    = THOTH._camera;
    const width     = Toolbox.canvas.width;
    const height    = Toolbox.canvas.height;
    const lassoPts  = Toolbox.lassoPoints;
    const dpr       = window.devicePixelRatio || 1;

    const posAttr   = geometry.attributes.position;
    const normAttr  = geometry.attributes.normal;
    const indexAttr = geometry.index;

    const faceCount = indexAttr ? indexAttr.count / 3 : positionAttr.count / 9;
    const cameraPos = camera.getWorldPosition(new THREE.Vector3());

    const mvpMatrix = new THREE.Matrix4()
    .multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse)
    .multiply(mesh.matrixWorld);
    const frustum = new THREE.Frustum().setFromProjectionMatrix(mvpMatrix);
    
    const v1 = new THREE.Vector3();
    const v2 = new THREE.Vector3();
    const v3 = new THREE.Vector3();
    const n1 = new THREE.Vector3();
    const n2 = new THREE.Vector3();
    const n3 = new THREE.Vector3();

    const normal    = new THREE.Vector3();
    const centroid  = new THREE.Vector3();
    
    const camDir    = new THREE.Vector3();
    const rayDir    = new THREE.Vector3();
    const projected = new THREE.Vector3();
    
    const selectedFaces = [];

    for (let i=0; i<faceCount; i++) {
        let a, b, c;
        if (indexAttr) {
            a = indexAttr.getX(i * 3);
            b = indexAttr.getX(i * 3 + 1);
            c = indexAttr.getX(i * 3 + 2);
        } else {
            a = i * 3;
            b = i * 3 + 1;
            c = i * 3 + 2;
        }
        v1.fromBufferAttribute(posAttr, a);
        v2.fromBufferAttribute(posAttr, b);
        v3.fromBufferAttribute(posAttr, c);

        n1.fromBufferAttribute(normAttr, a);
        n2.fromBufferAttribute(normAttr, b);
        n3.fromBufferAttribute(normAttr, c);

        centroid.copy(v1).add(v2).add(v3).divideScalar(3);
        mesh.localToWorld(centroid);
        
        // Filter faces out of camera frustum
        
        if (!frustum.containsPoint(centroid)) continue;
        
        // Filter faces that are obstructed by other faces

        if (!Toolbox.selectObstructedFaces) {
            const maxDist = cameraPos.distanceTo(centroid);
            
            rayDir.subVectors(centroid, cameraPos).normalize();
            
            const ray = new THREE.Ray(cameraPos, rayDir);
            const hit = geometry.boundsTree.raycastFirst(ray, THREE.SingleSide);
            
            if (hit && hit.distance < maxDist - 0.01) continue;
        }
        
        // Filter faces that aren't facing the camera

        normal.copy(n1).add(n2).add(n3).divideScalar(3).normalize();
        camDir.subVectors(cameraPos, centroid).normalize();
        
        if (normal.dot(camDir) <= Toolbox.normalThreshold) continue;
        
        // Project to lasso polygon

        projected.copy(centroid).project(camera);
        
        const x = ((projected.x + 1) / 2) * width / dpr;
        const y = ((-projected.y + 1) / 2) * height / dpr;

        if (THOTH.Utils.isPointInPolygon({x, y}, lassoPts)) {
            selectedFaces.push(i);
        };
    }
    return selectedFaces;
};


// Activation

Toolbox.activate = () => Toolbox.enabled = true;

Toolbox.deactivate = () => {
    Toolbox.enabled         = false;
    Toolbox.brushEnabled    = false;
    Toolbox.eraserEnabled   = false;
    Toolbox.lassoEnabled    = false;
};

Toolbox.activateBrush = () => {
    Toolbox.enabled         = true;
    Toolbox.brushEnabled    = true;
    Toolbox.eraserEnabled   = false;
    Toolbox.lassoEnabled    = false;
};

Toolbox.activateEraser = () => {
    Toolbox.enabled         = true;
    Toolbox.brushEnabled    = false;
    Toolbox.eraserEnabled   = true
    Toolbox.lassoEnabled    = false;
};

Toolbox.activateLasso = () => {
    Toolbox.enabled         = true;
    Toolbox.brushEnabled    = false;
    Toolbox.eraserEnabled   = false;
    Toolbox.lassoEnabled    = true;
};

Toolbox.deactivateBrush = () => Toolbox.brushEnabled = false;
Toolbox.deactivateEraser = () => Toolbox.eraserEnabled = false;
Toolbox.deactivateLasso = () => Toolbox.lassoEnabled = false;



export default Toolbox;