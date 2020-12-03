if ( WEBGL.isWebGLAvailable() === false ) {
    document.body.appendChild( WEBGL.getWebGLErrorMessage() );
}

var container;
var camera, controls, scene, renderer;

var pointsGood, pointsBottomed, pointsLive;
var mesh, geo, material;
var c;
var simplex;
var pos = 0;
var lastPos = 1;
var addAmount = .15;

var gui;

var obj = {
    position: {
        x:.2, 
        y:0, 
        z:0
    },
    scale: 1
};


init();
animate();

function init() {
    c = new THREE.Clock();
    c.start();

    simplex = new SimplexNoise();

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xffffff );

    camera = new THREE.PerspectiveCamera( 15, window.innerWidth / window.innerHeight, 0.01, 10000 );
    camera.position.x = .2;
    camera.position.y = 0;
    camera.position.z = - 5;
    camera.up.set( 0, 0, 1 );

    // camera.rotation.x = 3.1171776640007147;
    // camera.rotation.y = -0.010571918092587795
    // camera.rotation.z = -1.556827075831782

    controls = new THREE.TrackballControls( camera );
    controls.noZoom = true;
    // controls.noRotate = true;

    controls.rotateSpeed = 0.5;
    // controls.zoomSpeed = 5.0;
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

    var loading = document.getElementById("load");

   var loader = new THREE.PLYLoader();
   loader.load( '../3d/run_08_sm.ply', function ( geometry ) {
    load.style.visibility = "hidden";
    load.style.display = "none";
        geo = geometry;
        pointsGood = geo.attributes.position.array;
        console.log(pointsGood.length);
        pointsBottomed = new Float32Array(pointsGood.length);
        pointsLive = new Float32Array(pointsGood.length);

        var index = 0;

        for (var i=0; i<pointsLive.length; i++){
            var x = pointsGood[index];
            var y = pointsGood[index+1];
            var z = pointsGood[index+2];
            pointsBottomed[index++] = this.simplex.noise3D(x,y,z);////THREE.Math.randFloat(-20,20);//0;//pointsGood[index]; //x
            pointsBottomed[index++] = this.simplex.noise3D(z,x,y);;//THREE.Math.randFloat(-20,20);//pointsGood[index]; //y
            pointsBottomed[index++] = this.simplex.noise3D(y,z,x);;//THREE.Math.randFloat(-20,20);//pointsGood[index]; //z            
        }
        //    geo.computeVertexNormals();

        material = new THREE.PointsMaterial( { vertexColors: THREE.VertexColors, size: 0.01, sizeAttenuation: true });
        //    var material = new THREE.MeshStandardMaterial( { color: 0x0055ff, flatShading: true } );
        mesh = new THREE.Points( geo, material );

        // mesh.position.x = 0;
        //    mesh.position.y = -.85;
           mesh.position.z = 2;
        // mesh.rotation.x = - Math.PI /2;
        // mesh.rotation.y = Math.PI / 2;
        mesh.rotation.z = - Math.PI / 2;
           mesh.scale.multiplyScalar( .2 );

        //    mesh.castShadow = true;
        //    mesh.receiveShadow = true;

        scene.add( mesh );

   }, function(e){
    load.innerHTML = "Loaded "+Math.ceil(e.loaded/e.total*100)+" %";
       console.log(e);
   } );


   scene.add( new THREE.HemisphereLight( 0x443333, 0x111122 ) );

    container = document.createElement( 'div' );
    document.body.appendChild( container );
    container.appendChild( renderer.domElement );

    window.addEventListener( 'resize', onWindowResize, false );

    window.addEventListener( 'keypress', keyboard );
    document.addEventListener('wheel', function(e) {
        // pos += e.deltaY * .001;
        // if ( pos < 0 ) pos = 0;
        // if ( pos > 1 ) pos = 1;
    });

    // gui = new dat.gui.GUI();
    // gui.remember(obj);
    // gui.add(obj.position, 'x').min(-2).max(2).step(.05);
    // gui.add(obj.position, 'y').min(-2).max(2).step(.05);
    // gui.add(obj.position, 'z').min(-2).max(2).step(.05);
    // gui.add(obj, 'scale').min(.1).max(3.0).step(.1);
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


function animate() {
    requestAnimationFrame( animate );

    if ( mesh && pos < 1 ){
        pos = pos * .9 + .1;//THREE.Math.smoothstep(pos + addAmount,0,1);
        // addAmount *= .85;
        // addAmount = addAmount < .1 ? .1 : addAmount;

        // console.log(pos +":"+ addAmount);

        // console.log(pos);

        if (pos >= .999){
            pos = 1;
            addAmount = .25;
        }
    }

    var t = c.getElapsedTime();
    // var l = Math.abs(Math.sin(t * .25) * 1.25 );
    // if ( l > 1 ) l = 1;
    // console.log(l);
    
    // pos = THREE.Math.smoothstep(pos,0,1);

    if (mesh){
        // mesh.position.x = obj.position.x;
        // mesh.position.y = obj.position.y;
        // mesh.position.z = obj.position.z;
        // mesh.scale = new THREE.Vector3(obj.scale, obj.scale, obj.scale);
    }

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

    var bRotate = false;

    if ( mesh ){
        // mesh.rotation.x += .001;
        mesh.position.z = THREE.Math.lerp( -3,5, Math.abs(Math.sin(t*.1)) );;
        // var z = mesh.position.z;
        // mesh.position.z = z < -2 ? -2 : (z > 5 ? 5 : z);
    }

    controls.update();
    renderer.render( scene, camera );
}