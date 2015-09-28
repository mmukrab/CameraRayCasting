var width = window.innerWidth, height = window.innerHeight;
var viewAngle = 75, near = 1, far = 1000;
var aspect = width / height;

var renderer, camera, scene, controls;
var blocker, instructions;
var hitMesh, rayLine, platform;
var time = Date.now();
var rayCastDistance = 10;

function startScene(container) {

	blocker = document.getElementById('blocker');
	instructions = document.getElementById('instructions');
	//blocker.style.display = 'none';

	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;
	if (havePointerLock) {
		var element = document.body;
		var pointerlockchange = function(event) {
			if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
				controls.enabled = true;
				blocker.style.display = 'none';
			} else {
				controls.enabled = false;

				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';
			}
		}
		var pointerlockerror = function(event) {
			instructions.style.display = '';
		}
		// Hook pointer lock state change events
		document.addEventListener('pointerlockchange', pointerlockchange, false);
		document.addEventListener('mozpointerlockchange', pointerlockchange, false);
		document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

		document.addEventListener('pointerlockerror', pointerlockerror, false);
		document.addEventListener('mozpointerlockerror', pointerlockerror, false);
		document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

		instructions.addEventListener('click', function(event) {
			instructions.style.display = 'none';
			// Ask the browser to lock the pointer
			element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

			if (/Firefox/i.test(navigator.userAgent)) {
				var fullscreenchange = function(event) {
					if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {
						document.removeEventListener('fullscreenchange', fullscreenchange);
						document.removeEventListener('mozfullscreenchange', fullscreenchange);

						element.requestPointerLock();
					}

				}

				document.addEventListener('fullscreenchange', fullscreenchange, false);
				document.addEventListener('mozfullscreenchange', fullscreenchange, false);

				element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

				element.requestFullscreen();

			} else {

				element.requestPointerLock();

			}

		}, false);

	} else {

		instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

	}

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(viewAngle, aspect, near, far);

	var ambient = new THREE.AmbientLight(0x404040);
	scene.add(ambient);

	var pointLight = new THREE.PointLight(0xFFFFFF);
	pointLight.position.x = 0;
	pointLight.position.y = 150;
	pointLight.position.z = 70;
	pointLight.intensity = 1;
	//scene.add(pointLight);

	var pointLight = new THREE.PointLight(0xFFFFFF);
	pointLight.position.x = 60;
	pointLight.position.y = 70;
	pointLight.position.z = -150;
	pointLight.intensity = 0.7;
	//scene.add(pointLight);

	var spotLight = new THREE.SpotLight(0xFFFFFF);
	spotLight.position.set(100, 100, 60);
	spotLight.target.position.set(0,0,0);
	spotLight.castShadow = true;
	spotLight.shadowMapWidth = 1024;
	spotLight.shadowMapHeight = 1024;
	spotLight.shadowCameraNear = 10;
	spotLight.shadowCameraFar = 4000;
	spotLight.shadowCameraFov = 30;
	scene.add(spotLight);

	var spotLight = new THREE.SpotLight(0xFFFFFF);
	spotLight.position.set(10, 60, 10);
	spotLight.target.position.set(0,0,0);
	spotLight.castShadow = true;
	spotLight.shadowMapWidth = 1024;
	spotLight.shadowMapHeight = 1024;
	spotLight.shadowCameraNear = 10;
	spotLight.shadowCameraFar = 4000;
	spotLight.shadowCameraFov = 30;
	scene.add(spotLight);

	var shadowCube = new THREE.CubeGeometry(10, 100, 10);
	shadowCube = new THREE.Mesh(shadowCube, new THREE.MeshPhongMaterial({color: 0xEDCBA0}));
	shadowCube.position.set(-60, 0, 0);
	shadowCube.castShadow = true;
	shadowCube.receiveShadow = true;
	scene.add(shadowCube);

	var geometry = new THREE.PlaneGeometry( 100, 100);
	var material = new THREE.MeshLambertMaterial( {color: 0x555555, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );
	plane.position.set(-60,0,0);
	plane.rotation.x = -90;
	//scene.add( plane );

	controls = new THREE.PointerLockControls(camera);
	controls.getObject().position.x = 0;
	controls.getObject().position.z = 60;
	scene.add(controls.getObject());

	// Axis helper
	var axes = new THREE.AxisHelper(300);
	scene.add(axes);

	// floor
//	var floor = new THREE.Mesh(new THREE.CubeGeometry(420, 420, 5), new THREE.MeshLambertMaterial({
//		color: 0xEDCBA0
//	}));
//	floor.position.set(0, 0, 0);
//	floor.rotation.x = Math.PI / 2;
	//scene.add(floor);

	/*
	// Cube
	var materials = [
		leftSide = new THREE.MeshBasicMaterial({color: 0x7D3B1A}),	// Left side
		rightSide = new THREE.MeshBasicMaterial({color: 0x7D3B1A}),	// Right side
		topSide = new THREE.MeshBasicMaterial({color: 0x477D1D}),	// Top side
		bottomSide = new THREE.MeshBasicMaterial({color: 0x4D2D42}),// Bottom side
		frontSide = new THREE.MeshBasicMaterial({color: 0x3B619D}),	// Front side
		backSide = new THREE.MeshBasicMaterial({color: 0x3B619D})	// Back side
	];
	var cube = new THREE.CubeGeometry(20, 25, 40, 4, 4, 4);
	hitMesh = new THREE.Mesh(cube, new THREE.MeshFaceMaterial(materials));
	hitMesh.position.set(0, 0, 0);
	scene.add(hitMesh);
*/
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);
	renderer.shadowMapEnabled = true;
	renderer.shadowMapType = THREE.PCFSoftShadowMap;

	container.append(renderer.domElement);

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	container.append(stats.domElement);

	//

	// make original platform mesh constructor
	function makePlatform( jsonUrl, textureUrl) {
		console.log("platform build");
		var placeholder = new THREE.Object3D();
		var texture = THREE.ImageUtils.loadTexture( textureUrl );
		texture.minFilter = THREE.LinearFilter;
		//texture.anisotropy = textureQuality;
		var loader = new THREE.JSONLoader();
		var platformMaterials = [
			new THREE.MeshLambertMaterial({color:0x00FF00}),
      new THREE.MeshPhongMaterial({color:0x0000FF}),
     	new THREE.MeshBasicMaterial({color:0xFFFF00}),
     	new THREE.MeshBasicMaterial({color:0x00FFFF}),
     	new THREE.MeshBasicMaterial({color:0xFFFFFF})
		];

		var platformMainMaterial = new THREE.MeshFaceMaterial(platformMaterials);
		loader.load( jsonUrl, function( geometry ) {
			geometry.computeFaceNormals();
			platform = new THREE.Mesh( geometry, platformMainMaterial );
			platform.position.set(0, 0, 0);
			platform.name = "platform";
			platform.castShadow = true;
			platform.receiveShadow = true;
			placeholder.add( platform );
		});
		return placeholder;
	}

	scene.add( makePlatform(
		'resources/meshes/KleineZaal.json',
		'resources/textures/whitesolid.jpg'
  ));
	//
	animate();
}

function animate() {
	detectCollision();

	var delta = (Date.now() - time) * 2;
	controls.update(delta);

	stats.update();

	renderer.render(scene, camera);

	time = Date.now();

	requestAnimationFrame(animate);
}

function detectCollision() {
	unlockAllDirection();

	var rotationMatrix;
	var cameraDirection = controls.getDirection(new THREE.Vector3(0, 0, 0)).clone();

	if (controls.moveForward()) {
		// Nothing to do!
	}
	else if (controls.moveBackward()) {
		rotationMatrix = new THREE.Matrix4();
		rotationMatrix.makeRotationY(180 * Math.PI / 180);
	}
	else if (controls.moveLeft()) {
		rotationMatrix = new THREE.Matrix4();
		rotationMatrix.makeRotationY(90 * Math.PI / 180);
	}
	else if (controls.moveRight()) {
		rotationMatrix = new THREE.Matrix4();
		rotationMatrix.makeRotationY((360-90) * Math.PI / 180);
	}
	else return;

	if (rotationMatrix !== undefined){
		cameraDirection.applyMatrix4(rotationMatrix);
	}
	var rayCaster = new THREE.Raycaster(controls.getObject().position, cameraDirection);
	var intersects = rayCaster.intersectObject(platform, true);// here the geometry mesh is added to the collision. hitMesh was replaced by platform

	$("#status").html("camera direction x: " + cameraDirection.x + " , z: " + cameraDirection.z);

	if ((intersects.length > 0 && intersects[0].distance < rayCastDistance)) {
		lockDirection();
		$("#status").append("<br />Collision detected @ " + intersects[0].distance);

		var geometry = new THREE.Geometry();
		geometry.vertices.push(intersects[0].point);
		geometry.vertices.push(controls.getObject().position);
		scene.remove(rayLine);
		rayLine = new THREE.Line(geometry, new THREE.LineBasicMaterial({color: 0xFF00FF, linewidth: 2}));
		scene.add(rayLine);
	}
}

function lockDirection() {
	if (controls.moveForward()) {
		controls.lockMoveForward(true);
	}
	else if (controls.moveBackward()) {
		controls.lockMoveBackward(true);
	}
	else if (controls.moveLeft()) {
		controls.lockMoveLeft(true);
	}
	else if (controls.moveRight()) {
		controls.lockMoveRight(true);
	}
}

function unlockAllDirection(){
	controls.lockMoveForward(false);
	controls.lockMoveBackward(false);
	controls.lockMoveLeft(false);
	controls.lockMoveRight(false);
}
