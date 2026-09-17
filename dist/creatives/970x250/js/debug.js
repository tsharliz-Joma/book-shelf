'strict';

var tl = (tl || gsap.timeline());
var width = (width || 300)
var height = (height || 250)
var mouseDown = false;
var mouseIn = false;
var magic = 30;
var theCurrentLabel = "";

function debug() {
	//findEventListeners()
	setupEvents()
	durationCheck()
	clickTagCheck()
	setupTimeline()
	setupLabels()
	setupEverythingElse()
}





function findEventListeners() {
	const elements = getElementsWithEventListeners();
	console.log(elements);
	for (var i in elements) {
		//gsap.set(elements[i], {border:"border 2px solid green"})
	}
}

function setupEvents() {
	document.addEventListener("keydown", onKeyDown, false);
	var n=49
	for (var i in tl.labels) {
		(function(n,t)
			{				
				document.addEventListener("keydown", (e) => {
					if (e.which == n) {
						if (!tl.paused()) tl.pause();
						tl.seek(t)
						checkClickTag();
					}
				}, false);
			}
		)(n,tl.labels[i])
		if (n<57) n++

	}
}

function setupTimeline() {
	var timelineBox
	var timelineTags
	var timelineBackground
	var timeline15sec 
	var timelineProgress
	var timelineScrub
	var timelineLines
	var timelineClickTag

	magic = Math.min(30, Math.max(1, (width - 20) / Math.max(tl.duration(), 15)));
	document.body.style.cssText +="height:"+(height+75)+"px;overflow:hidden;"

	timelineBox = document.createElement('div');
	timelineBox.style.cssText = 'position:absolute;top:'+height+'px;left:0;width:100%;height:75px;display:block;background-color:#EEE';
	timelineBox.setAttribute("id", "tl-box");

	timelineScrub = document.createElement('div');
	timelineScrub.style.cssText = 'position:absolute;top:'+0+'px;left:10px;width:'+(tl.duration()*magic)+'px;height:'+35+'px;background:#EEE;cursor: pointer;';
	timelineScrub.setAttribute("id", "tl-scrub");

	timelineBackground = document.createElement('div');
	if (tl.duration() > 15) {
		timelineBackground.style.cssText = 'position:absolute;top:'+25+'px;left:10px;width:'+(tl.duration()*magic)+'px;height:'+5+'px;background:#AAA;pointer-events: none;';
	} else {
		timelineBackground.style.cssText = 'position:absolute;top:'+25+'px;left:'+((tl.duration()*magic)+10)+'px;width:'+((15*magic)-(tl.duration()*magic))+'px;height:'+5+'px;background:#333;pointer-events: none;';
	}
	timelineBackground.setAttribute("id", "tl-bg");

	timelineTags = document.createElement('div');
	timelineTags.style.cssText = 'position:absolute;top:'+35+'px;left:10px;width:'+(tl.duration()*magic)+'px;height:'+5+'px;';
	timelineTags.setAttribute("id", "tl-tags");
	
	timeline15sec = document.createElement('div');
	if (tl.duration() > 15) {
		timeline15sec.style.cssText = 'position:absolute;top:'+25+'px;left:10px;width:'+(15*magic)+'px;height:'+5+'px;background:#CCC;pointer-events: none;';
	} else {
		timeline15sec.style.cssText = 'position:absolute;top:'+25+'px;left:10px;width:'+((tl.duration()*magic))+'px;height:'+5+'px;background:#CCC;pointer-events: none;';
	}
	timeline15sec.setAttribute("id", "tl-15sec");

	timelineProgress = document.createElement('div');
	timelineProgress.style.cssText = 'position:absolute;top:'+25+'px;left:10px;width:'+(tl.duration()*magic)+'px;height:'+5+'px;background:#009900;pointer-events: none;';
	timelineProgress.setAttribute("id", "tl-progress");

	timelineClickTag = document.createElement('div');
	timelineClickTag.style.cssText = 'position:absolute;top:'+25+'px;right:10px;height:'+10+'px;pointer-events: none;font-family:sans-serif;font-size:11px;color:#000;display:none';
	timelineClickTag.setAttribute("id", "tl-clicktag");
	
	document.body.appendChild(timelineBox);

	document.getElementById("tl-box").appendChild(timelineScrub);

	var duration = Math.ceil(tl.duration())
	if (duration <= 15) duration = 15;

	for (var i=0; i<=duration; i++) {
		timelineLines = document.createElement('div');
		timelineLines.style.cssText = 'position:absolute;top:'+0+'px;left:'+(10+i*magic)+'px;width:1px;height:'+75+'px;background:#CCC;border-left:1px solid #DDD';
		//timelineScrub.setAttribute("id", "tl-scrub");
		document.getElementById("tl-box").appendChild(timelineLines);
	}
	document.getElementById("tl-box").appendChild(timelineBackground);
	document.getElementById("tl-box").appendChild(timelineTags);
	document.getElementById("tl-box").appendChild(timeline15sec);
	document.getElementById("tl-box").appendChild(timelineProgress);
	document.getElementById("tl-box").appendChild(timelineClickTag);



	document.getElementById("tl-scrub").addEventListener("mousedown", (e) => {
		if (e.target == document.getElementById("tl-scrub")) {
			tl.pause().seek(e.offsetX / magic)
			checkClickTag();
			mouseDown = true;
			mouseIn = true;
		}
	}, false);

	//document.getElementById("tl-scrub").addEventListener("mousemove", (e) => {
	document.addEventListener("mousemove", (e) => {
		if (mouseDown && mouseIn) {
			tl.seek(e.offsetX / magic)
			checkClickTag();
		}
		if (mouseDown && !mouseIn) {
			tl.seek((e.clientX-10) / magic)
			checkClickTag();
		}
	}, false);

	document.addEventListener("mouseup", (e) => {
		mouseDown = false;
	}, false);

	document.getElementById("tl-scrub").addEventListener("mouseout", (e) => {
		mouseIn = false;
	}, false);

	document.getElementById("tl-scrub").addEventListener("mouseenter", (e) => {
		mouseIn = true;
	}, false);

}

function setupLabels () {
	var labelBox, labelLine, labelCopy
	for (var i in tl.labels) {

		labelBox = document.createElement('div');
		labelLine = document.createElement('div');
		labelCopy = document.createElement('div');

		labelBox.style.cssText = "postition:absolute;width:30px;text-align: center;position: absolute;background-color:rgba(225,225,225,0);cursor: pointer;"
		
		labelBox.style.cssText += "left: "+(tl.labels[i] *magic-16)+"px; top: 0px;"
		labelBox.setAttribute("id", "label-box-"+i);
		
		labelLine.style.cssText = "position: relative;left: 10px;margin-left: 5px; border-left: 1px solid #999;width: 1px;height: 20px;"
		labelLine.setAttribute("id", "label-line-"+i);
		
		labelCopy.style.cssText = "position:relative;font-family:sans-serif;font-size:11px;color:#999"
		labelCopy.setAttribute("id", "label-copy-"+i);
		labelCopy.innerHTML = i.toUpperCase();

		document.getElementById("tl-tags").appendChild(labelBox);
		
		document.getElementById("label-box-"+i).appendChild(labelLine);
		document.getElementById("label-box-" + i).appendChild(labelCopy);
		

		(function(i,t){
			document.getElementById("label-box-"+i).addEventListener("click", (e) => {
				if (!tl.paused()) tl.pause();
				tl.seek(t)
				checkClickTag();
			}, false);
		})(i,tl.labels[i]);

		tl.eventCallback("onUpdate", () => {
			checkClickTag();
		});
	}
	setupFrames ()
}

function setupFrames () {
	var labelBox, labelLine, labelCopy
	for (var i in timeline) {

		labelBox = document.createElement('div');
		labelLine = document.createElement('div');
		labelCopy = document.createElement('div');

		labelBox.style.cssText = "postition:absolute;width:30px;text-align: center;position: absolute;background-color:rgba(225,225,225,0);cursor: pointer;"
		
		labelBox.style.cssText += "left: "+(timeline[i] *magic-16)+"px; top: 0px;"
		labelBox.setAttribute("id", "timeline-box-"+i);
		
		labelLine.style.cssText = "position: relative;left: 10px;margin-left: 5px; border-left: 1px solid black;width: 1px;height: 5px;"
		labelLine.setAttribute("id", "timeline-line-"+i);
		
		labelCopy.style.cssText = "position:relative;font-family:sans-serif;font-size:11px;color:#000"
		labelCopy.setAttribute("id", "timeline-copy-"+i);
		labelCopy.innerHTML = i.toUpperCase();

		document.getElementById("tl-tags").appendChild(labelBox);
		document.getElementById("timeline-box-"+i).appendChild(labelLine);
		document.getElementById("timeline-box-"+i).appendChild(labelCopy);

		(function(i,t){
			document.getElementById("timeline-box-"+i).addEventListener("click", (e) => {
				if (!tl.paused()) tl.pause();
				tl.seek(t)
				checkClickTag();
			}, false);
		})(i,timeline[i]);

		tl.eventCallback("onUpdate", () => {
			checkClickTag();
		});
	}
}

function checkClickTag() {
	if (tl.currentLabel() != theCurrentLabel) {
		theCurrentLabel = tl.currentLabel()
		document.getElementById("tl-clicktag").innerText = clickTags[tl.currentLabel()]
	}
}

function setupEverythingElse() {

	tl.from("#tl-progress", {duration: tl.duration(), scaleX:0.0, transformOrigin:'0% 0%', ease:"none"}, 0)
	if (tl.duration() > 15) {
		tl.to("#tl-progress", {duration: 0.1, backgroundColor:'#FF0000', ease:"sine.inOut"}, 15)
	}
}


function durationCheck(){
	var duration = tl.duration();
	if (duration > 15){
		console.log('%c duration '+ duration +'sec ', 'background: #f52a0e; color: #fff; border-radius: 10px; padding:2px 5px;');
	} else {
		console.log('%c duration '+ duration +'sec ', 'background: #009900; color: #fff; border-radius: 10px; padding:2px 5px;');
	}
}

function clickTagCheck() {
	if (window["clickTags"] == null) {
		console.log(`%c Error: clickTag object not found`, 'background: #f52a0e; color: #fff; border-radius: 10px; padding:2px 5px;');
		return null
	}
	for (let i = 0; i < Object.keys(tl.labels).length; i++) {
		let ct = clickTags[`F${i}`]
		//console.log(clickTags[`F${i}`])
		if (window[ct] == null) {
			tl.to('.border', { duration: 0.5, yoyo: true, repeat: 5, border: "4px solid red", opacity: 1 }, `F${i}`)
			console.log(`%c Error: ${ct} not defined in index.html `, 'background: #f52a0e; color: #fff; border-radius: 10px; padding:2px 5px;');
		} 
	}
	console.log(clickTags)
	background.addEventListener(
		'click', 
		(e) => {
			console.log(`%c clicked: ${tl.currentLabel()} → ${clickTags[tl.currentLabel()]} `, 'background: #00a5e9; color: #fff; border-radius: 10px; padding:2px 5px;')
		}, 
		false);

	let clickTagObjects = Object.keys(window).filter(key => /^clickTag\d+$/.test(key));
	let found
	clickTagObjects.push("clickTag")
	for (let i in clickTagObjects) {
		found = false
		for (let j in clickTags) {
			if (clickTags[j] == clickTagObjects[i]) found = true;
		}
		if (!found) {
			console.log(`%c Error: ${clickTagObjects[i]} not defined in logic.js `, 'background: #f52a0e; color: #fff; border-radius: 10px; padding:2px 5px;')
			tl.to('.border', { duration: 0.5, yoyo: true, repeat: 5, border: "4px solid red", opacity: 1 }, 0)
		}
	}
}

function getElementsWithEventListeners() {
  const allElements = document.getElementsByTagName('div');
  const elementsWithListeners = [];

  for (let i = 0; i < allElements.length; i++) {
    const listeners = getEventListeners(allElements[i]);
    const eventTypes = Object.keys(listeners);

    if (eventTypes.length > 0) {
      elementsWithListeners.push(allElements[i]);
    }
  }

  return elementsWithListeners;
}

function onKeyDown(event) {
	console.log("key: ", event.which)
	switch(event.which) {
		case 13: tl.restart().timeScale(1).repeat(0); break; // restart and reset
		case 32: (tl.paused()) ? tl.resume() : tl.pause(); break; // spacebar: play/pause
		case 37: tl.pause().seek(tl.previousLabel()); checkClickTag(); break; // left arrow: skip to previous label
		case 39: (tl.progress()==1) ? tl.seek(0).seek(tl.nextLabel()) : tl.pause().seek(tl.nextLabel()); checkClickTag(); break;  // right arrow: skip to next label
		case 38: tl.play(); break; // Down arrow: Play reverse
		case 40: tl.reverse();	break; // Up arrow: Play forward
		case 34: tl.timeScale(tl.timeScale() * 0.5); break; // PageUp: speed up
		case 33: tl.timeScale(tl.timeScale() * 2); break;  // PageDn: slow down
		case 48: tl.timeScale(1); break; // 0 key: set speed to normal
		case 82: tl.repeat(-1); break; // R key: repeat
		case 67: findEventListeners(); break; // R key: repeat
 	}
}
