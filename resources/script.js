var pointRadius = 4;
var patterns;
var shuffledPatterns;
var sortedPatterns;
var currentMode = "random";
var isModeChanged = false;

drawLayout();
drawPoints();
setSVGPaths();
debugger
getPatterns();

function beginRandomMode() {
	isModeChanged = true;
	currentMode = "random";
}

function beginSequentialMode() {
	isModeChanged = true;
	currentMode = "sequential";
}

function drawLayout() {
	if (screen.width > 1024)
		document.getElementById('text_container').style.left = document.getElementById('phone_frame').offsetWidth + 30;
}

function drawPoints() {
	var gridSize = 3;
	var startX = 0;
	var startY = 0;
	var phoneWidth = document.getElementById('phone_frame').offsetWidth;
	var pointSpacing = Math.floor(0.2 * phoneWidth);

	var points = document.getElementsByClassName('point');
	for (var i=0; i<points.length; i++) {
		points[i].style.top = startY + Math.floor(i/gridSize)*pointSpacing + pointRadius;
		points[i].style.left = startX + (i%gridSize)*pointSpacing + pointRadius;
	}

	var patternSVGStyle = document.getElementById('pattern').style;
	patternSVGStyle.height = patternSVGStyle.width = 2*pointSpacing + 4*pointRadius;
}

function setSVGPaths() {
	var points = document.getElementsByClassName('point');
	var paths = document.getElementsByClassName('pattern_path');
	for (var i=0; i<paths.length; i++) {
		var startPointStyle = points[paths[i].getAttribute('startpoint')].style;
		var endPointStyle = points[paths[i].getAttribute('endpoint')].style;
		
		var startX = startPointStyle.left.replace('px', '') - (-pointRadius);
		var startY = startPointStyle.top.replace('px', '') - (-pointRadius);
		var endX = endPointStyle.left.replace('px', '') - (-pointRadius);
		var endY = endPointStyle.top.replace('px', '') - (-pointRadius);
		
		paths[i].setAttribute('d', 'M' + startX + ' ' + startY + ' L' + endX + ' ' + endY);
		paths[i].setAttribute('stroke', '#DDDDDD');
		paths[i].setAttribute('stroke-width', 4);
		paths[i].setAttribute('stroke-miterlimit', 10);
		paths[i].setAttribute('stroke-opacity', 0);
		paths[i].setAttribute('data-ignore', true);
	}
}

function getPatterns() {
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function() { 
		if (xhr.readyState == 4 && xhr.status == 200) {
			patterns = xhr.responseText.split('\n');
			patterns.splice(-1, 1);
			shuffledPatterns = shuffle(patterns);
			sortedPatterns = patterns.slice();
			sortedPatterns.sort();
			drawPattern(shuffledPatterns[0], 0, true);
		}
	}
	xhr.open('GET', 'https://raw.githubusercontent.com/psyclone20/Android-Pattern-Generator/master/output/shuffled.txt', true);
	xhr.send(null);
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

function drawPattern(pattern, index, justBegun) {
	if (isModeChanged === true) {
		isModeChanged = false;
		if (currentMode == "sequential")
			patterns = sortedPatterns;
		else
			patterns = shuffledPatterns;

		drawPattern(patterns[0], 0, true);
		return;
	}

	var currentPoint = pattern.charAt(0);
	var nextPoint = pattern.charAt(1);

	if (justBegun === true) {
		resetPattern();
		document.getElementById('point' + currentPoint).classList.add('point-active');
	}

	var patternPath = document.getElementById('line_' + currentPoint + 'to' + nextPoint);
	patternPath.setAttribute('data-ignore', false);
	patternPath.setAttribute('stroke-opacity', 1);

	new Vivus('pattern', {duration: 15}, function(){
		document.getElementById('point' + nextPoint).classList.add('point-active');
		patternPath.setAttribute('data-ignore', true);

		if (pattern.length > 2)
			new Vivus('pattern', {duration: 15}, drawPattern(pattern.substring(1), index, false));
		else {
			var nextIndex = index+1;
			if (nextIndex < patterns.length)
				setTimeout(function() {
					drawPattern(patterns[nextIndex], nextIndex, true);
				}, 750);
		}
	});
}

function resetPattern(firstPoint) {
	var points = document.getElementsByClassName('point');
	for (var i=0; i<points.length; i++)
		points[i].classList.remove('point-active');

	var paths = document.getElementsByClassName('pattern_path');
	for (var i=0; i<paths.length; i++) {
		paths[i].setAttribute('stroke-opacity', 0);
		paths[i].setAttribute('data-ignore', true);
	}
}
