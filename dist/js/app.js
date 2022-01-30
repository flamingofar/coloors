/** @format */

//Global Selections and Variables
const colorDivs = document.querySelectorAll(".color");
const generateBtn = document.querySelector(".generate");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll(".color h2");
const popup = document.querySelector(".copy-container");
const adjustButton = document.querySelectorAll(".adjust");
const lockButton = document.querySelectorAll(".lock");
const closedAdjustments = document.querySelectorAll(".close-adjustment");
const slidersContainers = document.querySelectorAll(".sliders");

// This is for local storage
let savedPalettes = [];

let initialsColors;

// Add our eventlisteners
generateBtn.addEventListener("click", randomColors);
sliders.forEach((slider) => {
	slider.addEventListener("input", hslControls);
});

colorDivs.forEach((div, index) => {
	div.addEventListener("change", () => {
		updateTextUI(index);
	});
});

currentHexes.forEach((hex) => {
	hex.addEventListener("click", () => {
		copyToClipboard(hex);
	});
});

popup.addEventListener("transitionend", () => {
	const popupBox = popup.children[0];
	popup.classList.remove("active");
	popupBox.classList.remove("active");
});

adjustButton.forEach((button, index) => {
	button.addEventListener("click", () => {
		openAdjustmentPanel(index);
	});
});

closedAdjustments.forEach((button, index) => {
	button.addEventListener("click", () => {
		closeAdjustmentPanel(index);
	});
});

lockButton.forEach((button, index) =>
	button.addEventListener("click", () => {
		toggleLock(index);
	})
);

// Functions

// Color Generator
function generateHex() {
	const hexColor = chroma.random();
	return hexColor;
}

randomHex = generateHex();

function randomColors() {
	//
	initialsColors = [];
	colorDivs.forEach((div, index) => {
		const hexText = div.children[0];
		const randomColor = generateHex();
		//Add color to array
		if (div.classList.contains("locked")) {
			initialsColors.push(hexText.innerText);
			return;
		} else {
			initialsColors.push(chroma(randomColor).hex());
		}

		console.log(randomColor.hex());

		// Add color to background
		div.style.backgroundColor = randomColor;
		hexText.innerText = randomColor;

		// CHECK TEXT CONTRAST
		checkTextContrast(randomColor, hexText);

		// Initialize Colorize Sliders
		const color = chroma(randomColor);
		const sliders = div.querySelectorAll(".sliders input");
		const hue = sliders[0];
		const brightness = sliders[1];
		const saturation = sliders[2];

		colorizeSliders(color, hue, brightness, saturation);
	});

	resetInputs();

	// Check for button contrast
	adjustButton.forEach((button, index) => {
		checkTextContrast(initialsColors[index], button);
		checkTextContrast(initialsColors[index], lockButton[index]);
	});
}

function checkTextContrast(color, text) {
	const luminance = chroma(color).luminance();

	if (luminance > 0.5) {
		text.style.color = "black";
	} else {
		text.style.color = "white";
	}
}

function colorizeSliders(color, hue, brightness, saturation) {
	// Scale Saturation
	const noSat = color.set("hsl.s", 0);
	const maxSat = color.set("hsl.s", 1);
	const scaleSat = chroma.scale([noSat, color, maxSat]);

	// Update Input Color
	saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(
		0
	)}, ${scaleSat(1)})`;

	// Scale Brightness
	const midBright = color.set("hsl.l", 0.5);
	const scaleBright = chroma.scale(["black", midBright, "white"]);

	// Update Input Color
	brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(
		0
	)}, ${scaleBright(0.5)},  ${scaleBright(1)})`;

	//Hue
	hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75), rgb(204,204,75), rgb(75,204,75), rgb(75,204,204), rgb(75,75, 204), rgb(204,75,204), rgb(204,75,75)`;
}

function hslControls(e) {
	const index =
		e.target.getAttribute("data-hue") ||
		e.target.getAttribute("data-bright") ||
		e.target.getAttribute("data-sat");

	let sliders = e.target.parentElement.querySelectorAll('input[type="range"]');

	const hue = sliders[0];
	const brightness = sliders[1];
	const saturation = sliders[2];

	const bgColor = initialsColors[index];

	let color = chroma(bgColor)
		.set("hsl.s", saturation.value)
		.set("hsl.l", brightness.value)
		.set("hsl.h", hue.value);

	colorDivs[index].style.backgroundColor = color;
	// Colorize sliders
	colorizeSliders(color, hue, brightness, saturation);

	console.log(bgColor);
}

function updateTextUI(index) {
	const activeDiv = colorDivs[index];
	const color = chroma(activeDiv.style.backgroundColor);
	const textHex = activeDiv.querySelector("h2");
	const icons = activeDiv.querySelectorAll(".controls button");
	textHex.innerText = color.hex();

	//Check contrast

	checkTextContrast(color, textHex);
	for (icon of icons) {
		checkTextContrast(color, icon);
	}
}

function resetInputs() {
	const sliders = document.querySelectorAll(".sliders input");

	sliders.forEach((slider) => {
		if (slider.name === "hue") {
			const hueColor = initialsColors[slider.getAttribute("data-hue")];
			const hueValue = chroma(hueColor).hsl()[0];
			slider.value = Math.floor(hueValue);
		}

		if (slider.name === "brightness") {
			const brightColor = initialsColors[slider.getAttribute("data-bright")];
			const brightValue = chroma(brightColor).hsl()[2];
			slider.value = Math.floor(brightValue * 100) / 100;
		}

		if (slider.name === "saturation") {
			const satColor = initialsColors[slider.getAttribute("data-sat")];
			const satValue = chroma(satColor).hsl()[1];
			slider.value = Math.floor(satValue * 100) / 100;
		}
	});
}

function copyToClipboard(hex) {
	const el = document.createElement("textarea");
	el.value = hex.innerText;
	document.body.appendChild(el);
	el.select();
	document.execCommand("copy");
	document.body.removeChild(el);

	// Popup animation
	const popupBox = popup.children[0];
	popup.classList.add("active");
	popupBox.classList.add("active");
}

function openAdjustmentPanel(index) {
	slidersContainers[index].classList.toggle("active");
}
function closeAdjustmentPanel(index) {
	slidersContainers[index].classList.remove("active");
}

function toggleLock(index) {
	colorDivs[index].classList.toggle("locked");
	lockButton[index].firstChild.classList.toggle("fa-lock-open");
	lockButton[index].firstChild.classList.toggle("fa-lock");
}

// Implement save to palette and LOCAL STORAGE STUFF
const saveBtn = document.querySelector(".save");
const submitSave = document.querySelector(".save-submit");
const closeSave = document.querySelector(".close-save");
const saveContainer = document.querySelector(".save-container");
const saveInput = document.querySelector(".save-container input");

// Event Listeners
saveBtn.addEventListener("click", openPalette);
closeSave.addEventListener("click", closePalette);
submitSave.addEventListener("click", savePalettes);

// Function
function openPalette(e) {
	const popup = saveContainer.children[0];
	saveContainer.classList.add("active");
	popup.classList.add("active");
}
function closePalette(e) {
	const popup = saveContainer.children[0];
	saveContainer.classList.remove("active");
	popup.classList.remove("active");
}

function savePalettes(e) {
	saveContainer.classList.remove("active");
	popup.classList.remove("active");
	const name = saveInput.value;
	const colors = [];
	currentHexes.forEach((hex) => {
		colors.push(hex.innerText);
	});
	// Generate Object
	let paletteNr = savedPalettes.length;
	const paletteObj = { name, colors, nr: paletteNr };
	savedPalettes.push(paletteObj);

	//Save to localstorage
	saveToLocal(paletteObj);
	saveInput.value = "";
}

function saveToLocal(paletteObj) {
	let localPalettes;
	if (localStorage.getItem("palettes") === null) {
		localPalettes = [];
	} else {
		localPalettes = JSON.parse(localstorage.getItem("palettes"));
	}

	localPalettes.push(paletteObj);
	localStorage.setItem("palettes", JSON.stringify(localPalettes));
}

randomColors();
