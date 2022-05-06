import { en } from "./languages/en.js";
import { ru } from "./languages/ru.js";
const languages = { en, ru }

class Keyboard {

	constructor(element) {
		this.main = null;
		this.output = element;
		this.keyboard = null;
		this.isCaps = false;
		this.keysPressed = new Set();
		this.langs = languages;
		this.keyBtns = [];
		this.init();
	}

	keysOrder = [
		'Backquote', 'Digit1', 'Digit2', 'Digit3', 'Digit4', 'Digit5', 'Digit6', 'Digit7', 'Digit8', 'Digit9', 'Digit0', 'Minus', 'Equal', 'Backspace',
		'Tab', 'KeyQ', 'KeyW', 'KeyE', 'KeyR', 'KeyT', 'KeyY', 'KeyU', 'KeyI', 'KeyO', 'KeyP', 'BracketLeft', 'BracketRight', 'Backslash', 'Delete',
		'CapsLock', 'KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyG', 'KeyH', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon', "Quote", 'Enter',
		'ShiftLeft', 'KeyZ', 'KeyX', 'KeyC', 'KeyV', 'KeyB', 'KeyN', 'KeyM', 'Comma', 'Period', 'Slash', 'ArrowUp', 'ShiftRight',
		'ControlLeft', 'MetaLeft', 'AltLeft', 'Space', 'AltRight', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'ControlRight',
	];

	init() {
		this.currentLang = JSON.parse(window.localStorage.getItem('storageLang') || null) || 'ru';
		this.main = document.createElement('div');
		this.main.classList.add('kb-wrap');

		this.output = document.createElement('textarea');
		this.output.classList.add('kb-input');
		this.output.placeholder = 'Click here!';
		this.output.cols = '10';
		this.main.append(this.output);
		
		this.keyboard = document.createElement('div');
		this.keyboard.classList.add('kb-box');
		this.main.append(this.keyboard);
		
		this.switchSpan = document.createElement('code');
		this.switchSpan.classList.add('kb-caption');
		this.switchSpan.innerHTML = 'Shortcut for switching a language: Alt + Shift';
		this.main.append(this.switchSpan);

		this.keysOrder.forEach(el => this.createKeys(this.langs[this.currentLang], el))
		document.body.append(this.main)
		
		window.localStorage.setItem('storageLang', JSON.stringify(this.currentLang));
		
		document.addEventListener('keydown', this.handleEvent)
		document.addEventListener('keyup', this.handleEvent)
		document.addEventListener('mousedown', this.preHandleEvent)
		document.addEventListener('mouseup', this.preHandleEvent)
	}
	
	createKeys(lang, key){
		const brs = ['Tab', 'CapsLock', 'ShiftLeft', 'ControlLeft'];
		if (brs.includes(key)) {
			const br = document.createElement('div');
			br.classList.add('kb-br');
			this.keyboard.append(br);
		}
		const newKey = new Key(...lang.filter(el => el.code == key));
		this.keyBtns.push(newKey);
		this.keyboard.append(newKey.keyDiv)
	}

	preHandleEvent = (e) => {
		e.stopPropagation();
		const keyDiv = e.target.closest('.kb-key');
		if (!keyDiv) return;
		const { dataset: { code }} = keyDiv;
		const type = e.type === 'mousedown' ? 'keydown' : 'keyup';
		keyDiv.addEventListener('mouseleave', (e) => e.target.classList.remove('kb-pressed'));
		this.handleEvent({code, type});
	}
	
	handleEvent = (e) => {
		const { code, type, key } = e;
		const keyObj = this.keyBtns.find(btn => btn.code === code);

		if (!keyObj) return;
		this.output.focus();

		if (type === 'keydown'){
			if (e.preventDefault) e.preventDefault();
			this.keysPressed.add(key);
			keyObj.keyDiv.classList.add('kb-pressed');
		}

		if (type === 'keyup') {
			this.keysPressed.delete(key);
			keyObj.keyDiv.classList.remove('kb-pressed');
		}

		if (this.keysPressed.has('Alt') && this.keysPressed.has('Shift'))
			this.switchLang();

		if (code === 'CapsLock' && type == 'keydown') {
			this.isCaps = !this.isCaps;
			this.keyBtns.forEach(btn => {
				if (btn.shift == btn.small.toUpperCase()) {
				btn.letter.innerHTML = this.isCaps ? btn.shift : btn.small;
				}
			});
		}

		if (this.keysPressed.has('Shift') && !e.repeat){
			this.keyBtns.forEach(btn => {
				if (btn.shift) {
					if (this.isCaps)
						btn.letter.innerHTML = btn.shift == btn.small.toUpperCase() ? btn.small : btn.shift;
					else
						btn.letter.innerHTML = btn.shift;
					btn.sub.innerHTML = '';
				}
			});
		}

		if (type === 'keyup' && key === 'Shift'){
			this.keyBtns.forEach(btn => {
				if (btn.shift) {
					if (this.isCaps) {
						btn.letter.innerHTML = btn.shift == btn.small.toUpperCase() ? btn.shift : btn.small;
					}else
						btn.letter.innerHTML = btn.small;

					if (btn.shift !== btn.small.toUpperCase()){
						btn.sub.innerHTML = btn.shift;
					} 
				}
			});
		}

		if (type === 'keydown') this.printToOutput(code, keyObj)
	}

	printToOutput(code, keyObj){
		let cursorPos =  this.output.selectionStart;
		const left = this.output.value.slice(0, cursorPos);
		const right = this.output.value.slice(cursorPos);
		const fnBtnsHandler = {
			Tab: () => {
				this.output.value = left + '  ' + right;
				cursorPos += 2;
			},
			Space: () => {
				this.output.value = left + ' ' + right;
				cursorPos++;
			},
			Enter: () => {
				this.output.value = left + '\n' + right;
				cursorPos++;
			},
			Backspace: () => {
				this.output.value = left.slice(0, -1) + right;
				cursorPos--;
			},
			Delete: () => {
				this.output.value = left + right.slice(1);
			},
			ArrowLeft: () => {
				cursorPos = cursorPos == 0 ? 0 : cursorPos - 1;
			},
			ArrowRight: () => {
				cursorPos = cursorPos == this.output.value.length ? this.output.value.length : cursorPos + 1; 
			},
			ArrowUp: () => {
				let w = Math.floor( (this.output.getBoundingClientRect().width - 10) / 11.00624942779541);
				if (cursorPos <= w) cursorPos = 0;
				else cursorPos -= w;
				
			},
			ArrowDown: () => {
				let w = Math.floor( (this.output.getBoundingClientRect().width - 10) / 11.00624942779541);
				if (cursorPos + w <= this.output.value.length) cursorPos += w;
				else cursorPos = this.output.value.length;
			},
		}

		if (keyObj.keyDiv.dataset.fn){
			if (fnBtnsHandler[code]) fnBtnsHandler[code]();
		} else {
			this.output.value = left + keyObj.letter.textContent + right;
			cursorPos++;
		}
		this.output.setSelectionRange(cursorPos, cursorPos)
	}

	switchLang = () => {
		const langsArr = Object.keys(this.langs);
		let langIndx = langsArr.indexOf(this.currentLang);
		langIndx = langIndx + 1 >= langsArr.length ? 0 : langIndx + 1;
		this.currentLang = langsArr[langIndx];
		
		window.localStorage.setItem('storageLang', JSON.stringify(langsArr[langIndx]));

		this.keyBtns.forEach(btn => {
			const keyObj = languages[this.currentLang].find(el => el.code === btn.code);
			btn.small = keyObj.small;
			btn.shift = keyObj.shift
			btn.letter.innerHTML = this.isCaps ? btn.small.toUpperCase() : btn.small;
			btn.sub.innerHTML = (btn.shift !== btn.small.toUpperCase()) ? btn.shift : '';
		})

	}
}

class Key {

	constructor({small, shift, code}){
		this.code = code;
		this.small = small;
		this.shift = shift;
		this.isFnKey = this.fnKey.includes(code);
		this.sub = (shift !== small.toUpperCase()) ? this.create('div', 'kb-sub', shift, code) : this.create('div', 'kb-sub', '', code);
		this.letter = this.create('div', 'kb-text', small);
		this.keyDiv = this.create('div', 'kb-key'+(code !== 'Space' && this.isFnKey ? ' kb-key--dark' : ''), [this.sub, this.letter], code, this.isFnKey);
		this.keyDiv.style.width = `calc(var(${this.keySizes.basic}) * ${this.keySizes[small] || 1})`;
		this.keyDiv.style.minWidth = `calc( 40px * ${this.keySizes[small] || 1})`;
	}

	fnKey = [
		'Backspace', 'Tab', 'CapsLock', 'Enter', 'ShiftLeft', 'ShiftRight', 'ControlLeft', 'ControlRight',
		'AltLeft', 'AltRight', 'Space', 'Delete', 'MetaLeft', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'
	];

	keySizes = {
		basic: '--basic-key-width',
		Backspace: 2.14,
		Tab: 1.09,
		CapsLock: 1.6,
		Enter: 2.62,
		Shift: 2.11,
		Space: 7.45,
		Ctrl: 1.05,
	};

	create(elem, elemClass, textContent, code, isFnKey) {
		const el = document.createElement(elem);
		el.className = elemClass;
	
		if (Array.isArray(textContent))
			textContent.forEach(child => el.appendChild(child));
		else
			el.innerHTML = textContent;
	
		if (code) el.dataset.code = code;
		if (isFnKey) el.dataset.fn = isFnKey;
	
		return el;
	}
}

new Keyboard();