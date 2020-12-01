if ( WEBGL.isWebGLAvailable() === false ) {
    document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

var container;
var camera, controls, scene, renderer;

var pointsGood, pointsBottomed, pointsLive;
var mesh, geo, material;
var c;
var simplex;
var pos = 1;


init();
animate();

function init() {
    c = new THREE.Clock();
    c.start();

    simplex = new SimplexNoise();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    camera = new THREE.PerspectiveCamera( 15, window.innerWidth / window.innerHeight, 0.01, 40 );
    camera.position.x = 0.4;
    camera.position.z = - 1;
    camera.up.set( 0, 0, 1 );

    controls = new THREE.TrackballControls( camera );
    // controls.noZoom = true;
    // controls.noRotate = true;

    controls.rotateSpeed = 0.5;
    controls.zoomSpeed = 1.0;
    controls.panSpeed = 0.2;

    // controls.noZoom = false;
    // controls.noPan = false;

    controls.staticMoving = true;
    controls.dynamicDampingFactor = 0.3;

    controls.minDistance = 0.3;
    controls.maxDistance = 0.3 * 100;

    scene.add( camera );

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    /*
    var loader = new THREE.PCDLoader();
    loader.load( '../3d/point_cloud.pcd', function ( points ) {
        console.log('yes');

        scene.add( points );
        var center = points.geometry.boundingSphere.center;
        controls.target.set( center.x, center.y, center.z );
        controls.update();

    } );
    */


   var loader = new THREE.PLYLoader();
   loader.load( '../3d/niconook.ply', function ( geometry ) {
        geo = geometry;
        pointsGood = geo.attributes.position.array;
        pointsBottomed = new Float32Array(pointsGood.length);
        pointsLive = new Float32Array(pointsGood.length);

        var index = 0;

        for (var i=0; i<pointsLive.length; i++){
            pointsBottomed[index++] = THREE.Math.randFloat(-20,20);//0;//pointsGood[index]; //x
            pointsBottomed[index++] = THREE.Math.randFloat(-20,20);//pointsGood[index]; //y
            pointsBottomed[index++] = THREE.Math.randFloat(-20,20);//pointsGood[index]; //z            
        }
        //    geo.computeVertexNormals();

        material = new THREE.PointsMaterial( { vertexColors: THREE.VertexColors, size: .01, sizeAttenuation: true });
        //    var material = new THREE.MeshStandardMaterial( { color: 0x0055ff, flatShading: true } );
        mesh = new THREE.Points( geo, material );

        mesh.position.x = 0;
           mesh.position.y = -.85;
        //    mesh.position.z = 2.5;
        mesh.rotation.x = - Math.PI /4;
        // mesh.rotation.y = Math.PI / 2;
        mesh.rotation.z = - Math.PI / 2;
           mesh.scale.multiplyScalar( 0.5 );

        //    mesh.castShadow = true;
        //    mesh.receiveShadow = true;

        scene.add( mesh );

   } );


   scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );

    container = document.createElement( 'div' );
    document.body.appendChild( container );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    window.addEventListener( 'keypress', keyboard );
    document.addEventListener('wheel', function(e) {
        pos += e.deltaY * .001;
        if ( pos < 0 ) pos = 0;
        if ( pos > 1 ) pos = 1;
    });

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    controls.handleResize();

}

function keyboard( ev ) {

    // var points = scene.getObjectByName( 'point_cloud.pcd' );

    // switch ( ev.key || String.fromCharCode( ev.keyCode || ev.charCode ) ) {

    //     case '+':
    //         points.material.size *= 1.2;
    //         points.material.needsUpdate = true;
    //         break;

    //     case '-':
    //         points.material.size /= 1.2;
    //         points.material.needsUpdate = true;
    //         break;

    //     case 'c':
    //         points.material.color.setHex( Math.random() * 0xffffff );
    //         points.material.needsUpdate = true;
    //         break;

    // }

}

var lastPos = 0;

function animate() {
    requestAnimationFrame( animate );

    var t = c.getElapsedTime();
    // var l = Math.abs(Math.sin(t * .25) * 1.25 );
    // if ( l > 1 ) l = 1;
    // console.log(l);
    
    // pos = THREE.Math.smoothstep(pos,0,1);

    if ( mesh && lastPos != pos ){
        lastPos = pos;
        var index = 0;
        for (var i=0; i<pointsLive.length; i++){
            var x = pointsGood[index];
            var y = pointsGood[index+1];
            var z = pointsGood[index+2];
            pointsLive[index++] = THREE.Math.lerp( pointsBottomed[index], x, pos );// + this.simplex.noise3D(x+t,y,z); //x
            
            pointsLive[index++] = THREE.Math.lerp( pointsBottomed[index], y, pos );// + this.simplex.noise3D(x,y+t,z); //y

            pointsLive[index++] = THREE.Math.lerp( pointsBottomed[index], z, pos );//+ this.simplex.noise3D(x,y,z+t); //z  
            
        }
        // console.log(mesh.geometry);
        geo.addAttribute("position", new THREE.BufferAttribute( pointsLive, 3 ) );
        geo.attributes.position.needsUpdate = true;

        // scene.remove(mesh);
        // mesh = new THREE.Points( geo, material );
        // scene.add(mesh);
    }

    controls.update();
    renderer.render( scene, camera );
}