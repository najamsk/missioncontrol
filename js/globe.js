var container, stats;
var camera, scene, globe, renderer, particles, geometry, material, i, h, color, colors = [], sprite, size, x, y, z;
var mouseX = 0, mouseY = 0;

var context, canvas;

var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;

var targetRotation = 0;
var targetRotationOnMouseDown = 0;

var mouseX = 0;
var mouseXOnMouseDown = 0;			

var cityData = null, mapData = null;

function dataLoaded() {

	if (cityData != null && mapData != null) {

		//$('.menu').delay(2000).fadeIn("slow");
		//$('.label').delay(2000).fadeIn("slow");
		
		$('#input').hoverIntent(
			function () {
				//$('#inputLabel').fadeOut("fast");
				//$('.menu').fadeIn( 'fast', function() {$(this).siblings().fadeIn("fast")});
				$("#input").animate({"bottom":"0em"});
			},
			function () {
				//$('.label').delay(400).fadeOut("fast", function () {
				//	$(this).siblings().fadeOut( 'fast')
				//	$('#inputLabel').fadeIn("fast");	
				//});
				$("#input").animate({"bottom":"-8em"});
			}	
		);		

		populateMenu("#continent", []);
		init();
		animate();
	}
}


function init() {

	// Setup Scene
	//////////////

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.Camera( 50, window.innerWidth / window.innerHeight, 1, 3000 );
	camera.position.z = 1400;
	

	scene = new THREE.Scene();
	//scene.fog = new THREE.FogExp2( 0x000000, 0.0005 );
	
	globeWhole = new THREE.Object3D;
	globe = new THREE.Object3D;

	//globeWhole.position.x = 360;
	globeWhole.rotation.z = .465;
	globeWhole.rotation.x = .3;

	renderer = new THREE.WebGLRenderer( { clearAlpha: 1 });
	renderer.setSize( window.innerWidth, window.innerHeight );
	//renderer.setClearColorHex( 0x000000, 0 );
	container.appendChild( renderer.domElement );

	/*
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	container.appendChild( stats.domElement );				
	*/


	// Add Plates
	///////////
	
	dishMaterial = new THREE.MeshBasicMaterial( { opacity: 1,  map: THREE.ImageUtils.loadTexture( 'images/lights.jpg' ), blending: THREE.AdditiveBlending, transparent:true} );
	dish = new THREE.Mesh( new THREE.Plane( 1920, 1200, 1, 1 ), dishMaterial );
	//dish.rotation.x = -Math.PI/2;
	dish.scale.x = dish.scale.y = .15	;
	dish.position.z += 1200;
	dishMaterial.opacity= 0;
	/*
	new TWEEN.Tween( dishMaterial)
		.delay(1000)
		.to( {opacity: 1 }, 2000)
		.easing( TWEEN.Easing.Quadratic.EaseOut)
		.start();		
	*/
	
	plateMaterial = new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( 'images/background.jpg' )} );
	plate = new THREE.Mesh( new THREE.Plane( 1920, 1200, 1, 1 ),  plateMaterial);
	plate.scale.x = plate.scale.y = 2	;
	plate.position.z -= 1175;
	plateMaterial.opacity= 0;
	new TWEEN.Tween( plateMaterial)
		.to( {opacity: 1}, 2000)
		.easing( TWEEN.Easing.Quadratic.EaseOut)
		.start();	
		
	/*
	mapMaterial = new THREE.MeshBasicMaterial( { color: 0x336699, depthTest: false,  blending: THREE.AdditiveBlending, transparent : true, opacity: .1} )
	map = new THREE.Mesh( new THREE.Sphere(400, 24, 120), mapMaterial );
	mapMaterial.opacity= 0;
	new TWEEN.Tween( mapMaterial)
		.to( {opacity: .1}, 2000)
		.delay(1000)		
		.easing( TWEEN.Easing.Quadratic.EaseOut)
		.start();		
	globe.addChild(map);
	*/
	

	// Add Cities
	/////////////

	countries = cityData.locations;
	cityGeometry = new THREE.Geometry();

	var colorIndex = 0;
	
	var continents = cityData.continents;
	for (var continentIndex in continents) {

		subContinents = continents[continentIndex].subContinents;
		for (var subContinentIndex in subContinents) {

			countries = subContinents[subContinentIndex].countries;
			for (var countryIndex in countries) {

				regions = countries[countryIndex].regions;
				for (var regionIndex in regions) {
				
					cities = regions[regionIndex].cities;
					for(var cityIndex in cities) {
		
						cityLocation = cities[cityIndex].location
		
						curVisits = cities[cityIndex].visits;
						curLat = 90 - cities[cityIndex].location[0];
						curLong = 180 - cities[cityIndex].location[1];
						
						curLong *= Math.PI/180;
						curLat *= Math.PI/180;
							 
						x = 410 * Math.cos(curLong) * Math.sin(curLat);
						z = 410 * Math.sin(curLong) * Math.sin(curLat);
						y = 410 * Math.cos(curLat); 
										
						if (cities[cityIndex].location[0] != null, cities[cityIndex].location[1] != null ) {
										
							vector = new THREE.Vector3( x, y, z );
							cityGeometry.vertices.push( new THREE.Vertex( vector ) );	
	
							colors[ colorIndex++ ] = new THREE.Color( 0x9c7630 );
							//colors[ colorIndex++ ].setHSV( .25, .85, curVisits/5 );	
							//colors[ colorIndex++ ].setHSV( .65, .0, 1.0 );
						}
					}
				}
			}
		}
	}
	
	cityMaterial = new THREE.ParticleBasicMaterial( { size: 32, vertexColors: true, map: THREE.ImageUtils.loadTexture( "textures/sprites/ball.png" ) , depthTest: false,  blending: THREE.AdditiveBlending, transparent : true } );
	cityGeometry.colors = colors;
			
	cityParticles = new THREE.ParticleSystem( cityGeometry, cityMaterial );
	//cityParticles.sortParticles = true;
	cityParticles.updateMatrix();
// 				cityParticles.scale.x = cityParticles.scale.y = 1.2;
// 				
// 				new TWEEN.Tween( cityParticles.scale )
// 					.delay( 200 )
// 					.to( { x: 1, y: 1 }, 800 )
// 					.easing( TWEEN.Easing.Quadratic.EaseOut)
// 					.start();
	
	cityMaterial.opacity= 0;
	new TWEEN.Tween( cityMaterial)
		.delay(2000)
		.to( {opacity: 1}, 1600)
		.easing( TWEEN.Easing.Quadratic.EaseOut)
		.start();
		

	// Add Pointer
	//////////////
	
	pointerGeometry = new THREE.Geometry();
	pointerRadius = 400;
	
	pointerColors = [];
	pointerColorIndex = 0;	
	
	for (var pointerX = 0; pointerX <= pointerRadius; pointerX+=4) {		
		vector = new THREE.Vector3( pointerX, 0, 0 );
		pointerGeometry.vertices.push( new THREE.Vertex( vector ) );

		pointerColors[ pointerColorIndex ] = new THREE.Color( 0xffffff );
		pointerColors[ pointerColorIndex ].setHSV( .55, pointerX/pointerRadius/2, 1 +  (pointerX/pointerRadius/2));	

		pointerColorIndex++;		
		
	}		
	
	pointerGeometry.colors = pointerColors;
	
	pointerMaterial = new THREE.ParticleBasicMaterial( { size: 16, vertexColors: true, map: THREE.ImageUtils.loadTexture( "textures/sprites/circle.png" ) , depthTest: false,  blending: THREE.AdditiveBlending, transparent : true } );
	pointerMaterial.opacity=0;

	pointerParticles = new THREE.ParticleSystem( pointerGeometry, pointerMaterial);
	pointerParticles.scale.x=.0001;		
	
	pointerNav = new THREE.Object3D;
	pointerSpin = new THREE.Object3D;	
	pointerNav.addChild( pointerParticles );
	pointerSpin.addChild( pointerNav );	
	
/*		
	pointerGeometry = new THREE.Cube(1, 1.5, 1.5);	
	pointerMaterial = new THREE.MeshBasicMaterial( { color: 0x9c7630,  blending: THREE.AdditiveBlending } );
	
	pointer = new THREE.Mesh( pointerGeometry, pointerMaterial );
	//pointer.position.x = 205;
	
	//pointer.scale.x=410;
	
	pointerNav = new THREE.Object3D;
	pointerSpin = new THREE.Object3D;
	
	//pointer.overdraw = true;
	
	pointerNav.addChild( pointer );
	pointerSpin.addChild( pointerNav );
		
		
	new TWEEN.Tween( pointer.scale)
		.delay(3000)			
		.to( {x: 410}, 1000)
		.easing( TWEEN.Easing.Quadratic.EaseOut)
		.start();		
		
	new TWEEN.Tween( pointer.position)
		.delay(3000)			
		.to( {x: 205}, 1000)
		.easing( TWEEN.Easing.Quadratic.EaseOut)
		.start();		
		
	pointerNav.lookAt(50,100,200);
*/


	// Add Globe
	/////////////

	geometry = new THREE.Geometry();
	earthColors = [];

	colorIndex = 0;
	var xIndex = 0;
	for (var longitude = 2*Math.PI; longitude >= 0; longitude-=2*Math.PI/(480)) {
		var yIndex = 0;
		for (var latitude= 0; latitude <= Math.PI; latitude+=Math.PI/(240)) {
		
					if (mapData[yIndex][xIndex] == 0) {
		
						x = 400 * Math.cos(longitude) * Math.sin(latitude);
						z = 400 * Math.sin(longitude) * Math.sin(latitude);
						y = 400 * Math.cos(latitude); 						
	
						vector = new THREE.Vector3( x, y, z );
						geometry.vertices.push( new THREE.Vertex( vector ) );				

						earthColors[ colorIndex ] = new THREE.Color( 0xffffff );
						earthColors[ colorIndex ].setHSV( .12, 0, .5 );	
	
						colorIndex++;
	
					} else {
						//earthColors[ colorIndex ] = new THREE.Color( 0xffffff );
						//earthColors[ colorIndex ].setHSV( .65, .0, .25 );							
					}
					
			yIndex++;
		}
		xIndex++;
	}
	
	geometry.colors = earthColors;

	//material = new THREE.ParticleBasicMaterial( { size: 24, map: sprite, vertexColors: true,blending: THREE.AdditiveBlending } );
	material = new THREE.ParticleBasicMaterial( { size: 12, vertexColors: true,map: THREE.ImageUtils.loadTexture( "textures/sprites/circle.png" ) , depthTest: false,  blending: THREE.AdditiveBlending, transparent : true } );
	//material.color.setHSV( .56, .45, 1.2 );
	//material.color.setHSV( .65, .0, .5 );

	particles = new THREE.ParticleSystem( geometry, material );
	//particles.sortParticles = true;
	particles.updateMatrix();
	
	material.opacity= 0;
	new TWEEN.Tween( material)
		.delay(1000)
		.to( {opacity: 1}, 2000)
		.easing( TWEEN.Easing.Quadratic.EaseOut)
		.start();				
	

	
	// Add Lines
	////////////
	
	lineGeometry = new THREE.Geometry();
	lineRadius = 480;
	
	for (var longitude = 2*Math.PI; longitude >= 0; longitude-=Math.PI/12) {
		for (var latitude= 0; latitude <= Math.PI; latitude+=Math.PI/30) {
	

								
			x = lineRadius * Math.cos(longitude) * Math.sin(latitude);
			z = lineRadius * Math.sin(longitude) * Math.sin(latitude);
			y = lineRadius * Math.cos(latitude); 						
		
			vector = new THREE.Vector3( x, y, z );
			lineGeometry.vertices.push( new THREE.Vertex( vector ) );						 
		}	
	}			
	
	lineMaterial = new THREE.ParticleBasicMaterial( { size: 12,map: THREE.ImageUtils.loadTexture( "textures/sprites/circle.png" ) , depthTest: false,  blending: THREE.AdditiveBlending, transparent : true } );
	lineMaterial.color.setHSV( .55, .45, 1.4 );

	lineParticles = new THREE.ParticleSystem( lineGeometry, lineMaterial );
	//lineParticles.sortParticles = true;
	lineParticles.updateMatrix();	
	
	
	tickMaterial = new THREE.LineBasicMaterial( { opacity: .8, linewidth: 1, depthTest: false,  blending: THREE.AdditiveBlending, transparent : true } );
	//tickMaterial.color.setRGB( .8, .2, .2 );
	tickMaterial.color.setHSV( .65, .0, 1.0 );
	ticks = new THREE.Object3D;
	for (var longitude = 2*Math.PI; longitude >= Math.PI/30; longitude-=Math.PI/30) {
		//for (var latitude= 0; latitude <= Math.PI; latitude+=Math.PI/4) {

			tickGeometry = new THREE.Geometry();
			latitude = Math.PI /2;			

								
			x = lineRadius * Math.cos(longitude) * Math.sin(latitude);
			z = lineRadius * Math.sin(longitude) * Math.sin(latitude);
			y = lineRadius * Math.cos(latitude); 						
		
			xb = (lineRadius + 15) * Math.cos(longitude) * Math.sin(latitude);
			zb = (lineRadius + 15) * Math.sin(longitude) * Math.sin(latitude);
			yb = (lineRadius + 15) * Math.cos(latitude); 
		
			vector = new THREE.Vector3( x, y, z );
			vectorb = new THREE.Vector3( xb, yb, zb );
			
			tickGeometry.vertices.push( new THREE.Vertex( vector ) );
			tickGeometry.vertices.push( new THREE.Vertex( vectorb ) );
			
			tick = new THREE.Line( tickGeometry, tickMaterial, THREE.LineStrip );
			ticks.addChild( tick );
			
			//lineGeometry.vertices.push( new THREE.Vertex( vector ) );						 
		//}	
	}					
	
	
	tickMaterial.opacity= 0;
	new TWEEN.Tween( tickMaterial)
		.to( {opacity: .25}, 2000)
		.delay(1000)		
		.easing( TWEEN.Easing.Quadratic.EaseOut)
		.start();	
		

	// Add core
	///////////
	
	coreGeometry = new THREE.Geometry();
	
	for (var i = 0; i < 1800; i++) {
	
			radius = Math.random() * 380;
			longitude = Math.PI - (Math.random() * (2*Math.PI));
			latitude =  (Math.random() * Math.PI);
			
			x = radius * Math.cos(longitude) * Math.sin(latitude);
			z = radius * Math.sin(longitude) * Math.sin(latitude);
			y = radius * Math.cos(latitude); 	
	
		vector = new THREE.Vector3( x, y, z );
		coreGeometry.vertices.push( new THREE.Vertex( vector ) );				
	
	}	
	
	coreMaterial = new THREE.ParticleBasicMaterial( { size: 12,map: THREE.ImageUtils.loadTexture( "textures/sprites/circle.png" ) , depthTest: false,  blending: THREE.AdditiveBlending, transparent : true } );
	//orbitMaterial = new THREE.ParticleBasicMaterial( { color: 0xff0000, size: 1 , depthTest: false,  blending: THREE.AdditiveBlending, transparent : true } );
	coreMaterial.color.setHSV( .65, .0, .5 );

	coreParticles = new THREE.ParticleSystem( coreGeometry, coreMaterial );
	//orbitParticles.sortParticles = true;
	coreParticles.updateMatrix();
	
	coreMaterial.opacity= 0;
	new TWEEN.Tween( coreMaterial)
		.delay(500)
		.to( {opacity: 1}, 4000)
		.easing( TWEEN.Easing.Quadratic.EaseOut)
		.start();					
	
	coreParticles.scale.x = .1;
	coreParticles.scale.y = .1;
	new TWEEN.Tween( coreParticles.scale )
		.delay( 200 )
		.to( { x: 1, y: 1 }, 2000 )
		.easing( TWEEN.Easing.Quadratic.EaseOut)
		.start();				
	
	// Add orbit
	////////////				
	
	orbitGeometry = new THREE.Geometry();
	
	for (var i = 0; i < 600; i++) {
	
			radius = 400 + (Math.random() * 800);
			longitude = Math.PI - (Math.random() * (2*Math.PI));
			latitude =  (Math.random() * Math.PI);
			
			x = radius * Math.cos(longitude) * Math.sin(latitude);
			z = radius * Math.sin(longitude) * Math.sin(latitude);
			y = radius * Math.cos(latitude); 	
	
		vector = new THREE.Vector3( x, y, z );
		orbitGeometry.vertices.push( new THREE.Vertex( vector ) );				
	
	}
	
	orbitMaterial = new THREE.ParticleBasicMaterial( { size: 12,map: THREE.ImageUtils.loadTexture( "textures/sprites/circle.png" ) , depthTest: false,  blending: THREE.AdditiveBlending, transparent : true } );
	//orbitMaterial = new THREE.ParticleBasicMaterial( { color: 0xff0000, size: 1 , depthTest: false,  blending: THREE.AdditiveBlending, transparent : true } );
	orbitMaterial.color.setHSV( .65, .0, .5 );

	orbitParticles = new THREE.ParticleSystem( orbitGeometry, orbitMaterial );
	//orbitParticles.sortParticles = true;
	orbitParticles.updateMatrix();
	
	orbitMaterial.opacity= 0;
	new TWEEN.Tween( orbitMaterial)
		.delay(500)
		.to( {opacity: 1}, 4000)
		.easing( TWEEN.Easing.Quadratic.EaseOut)
		.start();					
	
	orbitParticles.scale.x = .1;
	orbitParticles.scale.y = .1;
	new TWEEN.Tween( orbitParticles.scale )
		.delay( 200 )
		.to( { x: 1, y: 1 }, 2000 )
		.easing( TWEEN.Easing.Quadratic.EaseOut)
		.start();				
	

	// Add Scene Elements
	
	globeWhole.addChild(globe);
	scene.addObject(globeWhole);	
	scene.addChild(dish);		
	scene.addObject(plate);
	
	//globe.addChild( lineParticles );		
	globe.addChild(pointerSpin);
	globe.addChild( particles );
	globe.addChild( cityParticles );	
	globe.addChild( ticks );	
	globe.addChild( coreParticles );		
	globe.addChild( orbitParticles );		

	
	// Add Listeners
	////////////////

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'touchstart', onDocumentTouchStart, false );
	document.addEventListener( 'touchmove', onDocumentTouchMove, false );
	window.addEventListener( 'resize', onWindowResize, false );

}


// Listeners
////////////////

function onDocumentMouseDown( event ) {

	event.preventDefault();

	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mouseout', onDocumentMouseOut, false );

	mouseXOnMouseDown = event.clientX - windowHalfX;
	targetRotationOnMouseDown = targetRotation;
}

function onDocumentMouseMove( event ) {

	mouseX = event.clientX - windowHalfX;

	targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.02;
}

function onDocumentMouseUp( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentMouseOut( event ) {

	document.removeEventListener( 'mousemove', onDocumentMouseMove, false );
	document.removeEventListener( 'mouseup', onDocumentMouseUp, false );
	document.removeEventListener( 'mouseout', onDocumentMouseOut, false );
}

function onDocumentTouchStart( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		mouseXOnMouseDown = event.touches[ 0 ].pageX - windowHalfX;
		targetRotationOnMouseDown = targetRotation;

	}
}

function onDocumentTouchMove( event ) {

	if ( event.touches.length == 1 ) {

		event.preventDefault();

		mouseX = event.touches[ 0 ].pageX - windowHalfX;
		targetRotation = targetRotationOnMouseDown + ( mouseX - mouseXOnMouseDown ) * 0.05;

	}
}


function onWindowResize( event ) {

	newWidth = (window.innerWidth > 1920) ? 1920 : window.innerWidth;
	newHeight = (window.innerHeight > 1200) ? 1200 : window.innerHeight;

	percent = newWidth / 1920;
	newFontSize = 12 * percent;

	//$("body").css("font-size", newFontSize + "pt");

	camera.aspect = newWidth / newHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( newWidth, newHeight );

}

// Loop Events
//////////////

function animate() {

	requestAnimationFrame( animate );

	render();
	//stats.update();

}

function render() {

	var time = new Date().getTime() * 0.00005;
	dishMaterial.opacity = .3 + (Math.sin(time * 25) + 1) /8;	
	
	particles.rotation.y += .005;
	cityParticles.rotation.y += .005;
	lineParticles.rotation.y += .005;
	pointerSpin.rotation.y += .005;
	orbitParticles.rotation.y -= .0015;
	coreParticles.rotation.y -= .0025;
	ticks.rotation.y -= .0025;
	
	//cityParticles.scale *= .5;
	//cityParticles.rotation.y += .01;
	//cityParticles.opacity = .1;
	
	globe.rotation.y += ( targetRotation - globe.rotation.y ) * 0.05;

	TWEEN.update();

	renderer.render( scene, camera );
}