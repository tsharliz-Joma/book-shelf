'strict';

var version = 2.0;
var tl = gsap.timeline();
var clock = gsap.timeline();
var images = [];
var timeline = {}
var ad, background, currentBrowser;
var bWidth, bHeight
var time = 0;

var clickTags = {
	F0: "clickTag",
	F1: "clickTag2",
	F2: "clickTag3",
	F3: "clickTag"
}

function setup(){
	ad = document.getElementById('ad');
	background = document.getElementById('background');
	background.addEventListener('click', onExit, false);
	background.addEventListener('mouseover', onMouseOver, false);
	background.addEventListener('mouseout', onMouseOut, false);
	background.addEventListener('contextmenu', onRestart, false);

	const imageTag = document.getElementsByTagName('IMG');
	for (let i = 0; i < imageTag.length; i++) {
		const t = `?t=${new Date().getTime()}`
		if (imageTag[i].dataset.src?.includes('images/')) {
			imageTag[i].src = `${imageTag[i].dataset.src}${t}`
			images.push(`${imageTag[i].dataset.src}${t}`); 
		}
	}

	bWidth = parseProp(".width", "width");
	bHeight = parseProp(".height", "height");
	
	preloadImages(images)
		.then(() => setupAnimation())
		.catch((error) => console.error('Error loading images:', error));
}

function setupTerms(mouseOver) {
	let termsTandC = document.getElementById("term-tandc")
	let termsPanel = document.getElementById("term-panel")
	let termsCopy = document.getElementById("term-panel-copy")

	let openEvent = (mouseOver) ? "mouseover" : "click";
	let closeEvent = (mouseOver) ? "mouseout" : "click";
	let y = (mouseOver) ? 0 : -bHeight;
	let closeElement = (mouseOver) ? termsTandC : termsPanel;

	if (termsCopy.innerHTML == "") {
		termsTandC.style.pointerEvents = "none";
		termsTandC.style.cursor = "pointer";
	} else {
		console.log("nothing set")
		
		gsap.set("#term-panel", { y: bHeight, display: "block" })
		
		if (mouseOver) {
			termsPanel.style.pointerEvents = "none"
		}

		termsTandC.addEventListener(openEvent, () => {
			gsap.to("#term-panel", { duration: 0.25, y: 0, ease: 'power1.out' })
			gsap.to("#term-tandc", { duration: 0.25, y: y, opacity: 0, ease: 'power1.out' })
			tl.pause()
		})
		closeElement.addEventListener(closeEvent, () => {
			gsap.to("#term-panel", { duration: 0.25, y: bHeight, ease: 'power1.in' })
			gsap.to("#term-tandc", { duration: 0.25, y: 0, opacity: 1, ease: 'power1.in' })
			tl.play()
		})
	}
}

const panel = {
	purple: '#CEC0DE',
	orange: '#F5A551',
	green: '#C7DD8F',
	pink: '#EFB6CA'
}

const compWidth = {
	mrec: {
		tens: '',
		hundreds: '97px',
		thousands: '117px',
	}, 
	billboard: {
		tens: '',
		hundreds: '130px',
		thousands: '173px',
	},
	halfpage: {
		tens: '',
		hundreds: '99px',
		thousands: '123px',
	},
	leaderboard: {
		tens: '',
		hundreds: '96px',
		thousands: '121px',
	},
	mobile: {
		tens: '',
		hundreds: '',
		thousands: '',
	},
	banner: {
		tens: '',
		hundreds: '',
		thousands: '',
	}
}


const left = (n) => {
	return {x: -n}
}
const right = (n) =>  {
	return {x: n}
}
const topp = (n) =>  {
	return {y: -n}
}
const bottom = (n) =>  {
	return {y: n}
}


function priceComponent(itemID){

    let regexDollar = /\$\d+/
	let regexCents= /\.\d+/
    let currentState = document.querySelector(itemID);
    let cardFront = document.querySelector('#front')
    let cardBack = document.querySelector('#back')

	function grabInnerText(element){
		let elArr = []
		let elInner = element.innerText
		valuesObject = {
			dollar: '',
			cent: '',
			dollar_amount: '',
			cent_amount: '',
			dot: '',
			getValues(){
				if(elInner.match(regexDollar) && !elInner.match(regexCents)){
					let elArr = elInner.split('')
					return {
						dollar: elArr.shift(),
						cent: '',
						dollar_amount: elArr.join(''),
						cent_amount: ''
					}
				} else if(elInner.match(regexDollar) && elInner.match(regexCents)) {
					let elArr = elInner.split('')
					return {
						dollar: elArr.shift(),
						cent_amount: elArr.splice(-2).join(''),
						dot: elArr.pop(),
						dollar_amount: elArr.join('')
					}
				} else if(!elInner.match(regexDollar) && elInner.match(regexCents)){
					let elArr = elInner.split('')
					return {
						dollar: '',
						cent: '¢',
						cent_amount: '',
						dollar_amount: elArr.splice(-2).join(''),
						dot: '',
					}
				}
				
			}
		}
		const result = valuesObject.getValues(element)
		return result
	}

	const front = grabInnerText(cardFront)
	const back = grabInnerText(cardBack)

    const newState = `
    <div id="price-content" class="price-content">  
        <div id="heads" class="face">
            <span id="dollar">${front.dollar}</span><span>${front.dollar_amount}</span><span class="centsAmount">${front.cent_amount}</span><span class="cents">${front.cent}</span>
        </div>
        <div id="tails" class="face">
			<span id="dollar">${back.dollar}</span><span>${back.dollar_amount}</span><span class="centsAmount">${back.cent_amount}</span>
        </div>
    </div>
    `

    return currentState.innerHTML = newState
}


function setupAnimation() {

	const pulse = (timeline, elementID) => {
		timeline
			.from(elementID, { duration: 0.5, opacity: 0, ease: 'power4.inOut'}, ">-0.45") // fade in
			.to(elementID, { duration: 0.5, opacity:0, ease: 'power4.inOut'}, ">-=0.45") // fadeout 
	}
	// INIT
	{

		// DEFAULT
		tl.set(ad, { display: 'block', perspective: 1000, opacity: 0 }, time);
		tl.set(`.cover`, { display: 'none' }, time);
		tl.set('IMG', { transformPerspective: 1000, transformOrigin: '50% 50%', force3D: true }, time);
		tl.addLabel(`F0`, 0);
		// CUSTOM
		priceComponent("#price-component");
		gsap.set(background, { backgroundColor: "#001080" })
		// gsap.set("#colored_panel", { background: panel.purple })
		gsap.set(".price-container", { perspective: 800 });
		gsap.set("#price-content", { transformStyle: "preserve-3d" });
		gsap.set(['#heads', '#tails'], { backfaceVisibility: 'hidden'})
		gsap.set("#tails", { rotationY:-180 })
		// FADE IN
		tl.to( ad, {duration: 0.5, opacity: 1, ease:'power1.inOut'}, time);
		tl.to( '.border', {duration: 0.5, opacity: 1, ease:'power1.inOut'}, time);
	}

	// FRAME 1
	{
		// phakathi
		tl.from("#dash,#background,.border,#underline,#p1", { duration: 0.5, x: 970, ease: 'power3.inOut'}, time + "+=0.0")
		tl.from('#copy-one-container,#logo-officeworks,#disclaimer,#underline', { duration: 0.5, opacity: 0, ease: 'power2.out'} , time + '+=0.6');
		// tl.add(pulse(tl, "#p1"), time + "+=0.0") 
		tl.to("#p1", { opacity: 0, ease: 'power4.inOut' }, time + "+=0.97")
		tl.add(pulse(tl, "#p2")) 
		tl.add(pulse(tl, "#p3")) 
		tl.add(pulse(tl, "#p4")) 

		wait(2.85)
		// ngaphandle
		tl.to("#logo-officeworks", { duration: 0.25, opacity: 0, ease: 'power2.inOut'}, time + "+=0.25");
		tl.to('#dash', { duration: 0.5, x: -14, ease: 'power2.out'}, time + "+=0.25")
		tl.to('.presents', { duration: 0.5, opacity: 0, ease: 'power2.out'}, time + "+=0.25")
		tl.to("#container_one,#disclaimer,#underline", { duration: 0.25, opacity: 0, ease: 'power2.inOut'}, time + "+=0.25");
		tl.set("#logo-officeworks", { x: 368, y: 35, scaleX: 174/123 , scaleY: 35/25 })
	}

	// FRAME 2
	{
		
		// phakathi
		tl.set("#price-component", {width: compWidth.billboard.hundreds }, time + "+=0.0");
		tl.from("#ctas,#copy-2", { duration: 0.5, opacity: 0, ease: 'power2.in'}, time + "+=0.15");
		tl.from("#price-content", {rotateY: 100, opacity: 0, ease: 'power2.out' }, time + "+=0.25");
		tl.from("#colored_panel,#colored_panel_2", { duration: 0.5, x: -bWidth, ease: 'power4.out'}, time + "+=0.25")
		tl.from("#hero-1", { duration: 0.5, x: -300, ease: 'power2.inOut'}, time + "+=0.25");
		tl.to('#hero-1', { duration: 2.5, x: 8, ease: 'power2.out' }, time + "+=0.75");
		tl.to('.panel', {  duration: 5, x: -10,  ease: 'power2.out'}, time + "+=0.75");
		
		wait(3);
	
		// Ngaphandle
		tl.to("#hero-1", { duration: 0.5, x: -300, ease: 'power2.out'}, time + "+=0.25")
		// phakathi
		tl.to("#colored_panel", { duration: 0.5, opacity: 0, ease: 'power2.out' }, time + "+=0.45");
		tl.from("#colored_panel_2", { duration: 0.5, opacity: 0, ease: 'power2.out' }, time + "+=0.5");
		tl.from(".hero-2", { duration: 0.5, x: -300, ease: 'power2.inOut'}, time + "+=0.5")
		tl.to('.hero-2', { duration: 2.5, x: 8, ease: 'power2.out' }, ">");
		tl.to("#price-content", {duration: 1, rotateY: 540, ease: 'power2.inOut'}, time + "+=0.0");
		// ngaphandle
		tl.to("#copy-2", { duration: 0.25, opacity: 0, ease: 'power2.inOut'}, time + "+=0.0");
		tl.to("#hero-2", { duration: 0.5, x: -bWidth, ease: 'power2.inOut'}, time + "+=0.0");
	}
	//  FRAME 3 
	{
		// phakathi
		tl.to('#colored_panel_2', { duration: 5, x: -13,  ease: 'power2.inOut'}, time + "-=2");
		tl.from("#copy-3", { duration: 0.5, opacity: 0, ease: 'power2.in'}, time + "+=0.0");

		wait(3);
		// ngaphandle 
		tl.to("#ctas", { duration: 0.25, opacity: 0, ease: 'power2.inOut'}, time + "+=0.25");
		tl.to("#copy-3,#price-component", { duration: 0.5, opacity: 0, ease: 'power1.in'}, time + "+=0.25");
		tl.to("#colored_panel_2,#hero-2", { duration: 0.5, x: -bWidth, ease: 'power2.inOut'}, time + "+=0.25")	
		tl.set(".cta-copy", { color: '#FFF' }, time + "+=0.5");
		tl.set(".cta", { borderColor: '#FFF' }, time + "+=0.5");
		tl.set("#ctas", { y: -55 }, time + "+=0.5");
	}
	// FRAME 4 
	{
		tl.to('#dash', { duration: 0.5, x: 0, ease: 'power2.out'}, time + "+=0.5")
		tl.from("#copy-4-container", { duration: 0.5, opacity: 0, ease: 'power2.inOut'}, time + "+=0.75");
		tl.to("#ctas,#logo-officeworks", { duration: 0.5, opacity: 1, ease: 'power2.inOut'}, time + "+=0.75")	
	}
	// END
	{
		// setupTerms(false);
		playWhenInView();
		setClickTags();
		debug();
	}
}


function playWhenInView() {
	var viewRatio = (bHeight > 250) ? 0.5 : 0.75;
	var observer = new IntersectionObserver(function (entries) {
		if (entries[0].intersectionRatio >= viewRatio) {
			tl.play();
		} else {
			tl.pause();
		}		
	}, { root: null, threshold: [0, viewRatio] });
	observer.observe(document.getElementById('ad'));
}

function setClickTags() {
	wait()
	for (let i = 0; i < Object.keys(tl.labels).length; i++) {
		clickTags[`F${i}`] = clickTags[`F${i}`] || clickTags[`F${i - 1}`];
	}
}

function wait($time, $out = -0.5) {

	time = ($time) ? time + $time : tl.duration()
	if ($time) tl.addLabel(`F${Object.keys(tl.labels).length}`, time);
	timeline[`F${Object.keys(timeline).length}`] = ($time) ? time + $out : time
	tl.set({}, {}, time)
}

function getProp($class, $property) {
	return window.getComputedStyle(document.querySelector($class), null).getPropertyValue($property)
}

function parseProp($class, $property) {
	return parseFloat(getProp($class, $property))
}

function getBounds($element) {
	return document.querySelector($element).getBoundingClientRect();
}

function preloadImages(urls) {
  const promises = [];
  for (const url of urls) {
    const promise = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => reject(url);
      img.src = url;
    });
    promises.push(promise);
  } 
	return Promise.all(promises);
}

function onRestart(e){
	tl.restart();
}

function onExit(e){
	/* EXIT:start */
	window.open(window[clickTags[tl.currentLabel()]]);
	/* EXIT:end */
}


function onMouseOver(e){
	if(tl.currentLabel() === 'F1' || tl.currentLabel() === 'F2'){
		gsap.to('.cta', { duration: 0.25, borderColor: '#F4CD24', color: '#F4CD24', ease: 'power1.out' });
		gsap.to('.cta-copy', { duration: 0.25, color: '#F4CD24', ease: 'power1.out' });
	} else {
		gsap.to('.cta', { duration: 0.25, borderColor: '#F4CD24', color: '#F4CD24', ease: 'power1.out' });
		gsap.to('.cta-copy', { duration: 0.25, color: '#F4CD24', ease: 'power1.out' });
	}
	
}

function onMouseOut(e){
	gsap.to('.cta', { duration: 0.25, borderColor: '#FFF', ease: 'power1.out' });
	gsap.to('.cta-copy', { duration: 0.25, color: '#FFF', ease: 'power1.out' });
}

