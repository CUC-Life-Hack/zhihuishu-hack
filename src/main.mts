import { window, Hack as HackBase, Utils } from '@cuclh/userscript-base';

class Hack extends HackBase {
	Delay(ms = 300) {
		let p = Math.random() - .5;
		p *= .5;
		ms *= Math.exp(p);
		return Utils.Delay(ms);
	}

	ListenerIsSuspicious(str) {
		if(str.indexOf('isTrusted') !== -1)
			return true;
		if(str.indexOf('0x53f') !== -1)
			return true;
		return false;
	}
	WrapEventListener(listener) {
		return function(ev) {
			const evCopy = {};
			for(let key in ev)
				evCopy[key] = ev[key];
			evCopy['__proto__'] = ev;
			evCopy['isTrusted'] = true;
			const args = Array.from(arguments);
			args[0] = evCopy;
			return listener.apply(this, args);
		}
	}
	HijackEventListenerAdder() {
		var original = HTMLElement.prototype.addEventListener;
		HTMLElement.prototype.addEventListener = function(this: HTMLElement, type, listener, initDict) {
			const hack = HackBase.instance as Hack;
			// if(hack.ListenerIsSuspicious(listener + '')) {
			// 	hack.panel.Log(`已拦截自动事件拦截事件的绑定（${this}: ${type}）`);
			// 	console.log(`已拦截自动事件拦截事件的绑定`, this, type, listener);
			// 	return;
			// }
			// original.call(this, type, listener, initDict);
			listener = hack.WrapEventListener(listener);
			original.call(this, type, listener, initDict);
		};
		this.panel.Log('已开启自动事件拦截事件的拦截');
	}

	ChooseLowRes() {
		const btn = window.document.querySelector('.line1bq') as HTMLButtonElement;
		if(!btn) {
			this.panel.Log('找不到画质切换按钮', 'warning');
			return;
		}
		btn.click();
	}
	ChooseHighPlaybackRate() {
		const button = window.document.querySelector('.speedTab') as HTMLElement;
		if(!button) {
			this.panel.Log('找不到倍速按钮', 'warning');
			return;
		}
		button.setAttribute('rate', '16');
		button.innerText = 'X 16';
		button.click();
	}

	get VideoElement(): HTMLVideoElement {
		return window.document.getElementById('vjs_container_html5_api') as HTMLVideoElement;
	}

	//#region 自动化相关逻辑
	beginAutoBtn: HTMLButtonElement;
	endAutoBtn: HTMLButtonElement;
	autoing: boolean = false;

	HasPoppedDialogueTest(): boolean {
		return !!window.document.querySelector('.dialog-test');
	}
	DoDialogueTestRandomly() {
		const option = window.document.querySelector('.topic-item') as HTMLElement;
		if(!option) {
			this.panel.Log('找不到测验选项元素', 'warning');
			return;
		}
		option.click();
	}
	CloseDialogueTest() {
		const button = window.document.querySelector('.dialog-test button') as HTMLButtonElement;
		if(!button) {
			this.panel.Log('找不到关闭测验按钮', 'warning');
			return;
		}
		button.click();
	}

	EntryIsFinished(entry: HTMLElement): boolean {
		if(!(entry instanceof HTMLElement))
			return false;
		return !!entry.querySelector('.time_icofinish');
	}
	async VideoReachedEnd() {
		const entry = window.document.querySelector('li.clearfix.video.current_play') as HTMLElement;
		return this.EntryIsFinished(entry);
	}
	GetNextUnfinishedEntry(): HTMLElement {
		const entries = Array.from(window.document.querySelectorAll('li.clearfix.video:not(.current_play)')) as HTMLElement[];
		const first = entries.find(entry => !this.EntryIsFinished(entry));
		return first || null;
	}

	VideoIsPaused(): boolean {
		const vid = this.VideoElement;
		if(!vid)
			return false;
		return vid.paused;
	}
	ContinueVideoPlayback() {
		window.document.getElementById('playButton')?.click();
	}

	async AutoFrame() {
		if(this.HasPoppedDialogueTest()) {
			this.panel.Log('弹出测验窗口');
			await this.Delay();
			this.DoDialogueTestRandomly();
			await this.Delay();
			this.CloseDialogueTest();
			return;
		}
		if(await this.VideoReachedEnd()) {
			this.panel.Log('视频播放完毕');
			await this.Delay(5200);	// 等待右侧 UI 进度更新，频率为 5s/次
			const next = this.GetNextUnfinishedEntry();
			if(!next) {
				this.panel.Log('没有更多未播放视频');
				this.EndAuto();
				return;
			}
			this.panel.Log('自动切换下一个未播放视频');
			next.click();
			await this.Delay(2500);	// Wait until new video is loaded
			this.ContinueVideoPlayback();
			await this.Delay(2500);
			return;
		}
		if(this.VideoIsPaused()) {
			this.panel.Log('视频暂停');
			this.ContinueVideoPlayback();
			await this.Delay();
			this.ChooseHighPlaybackRate();
			await this.Delay();
			// this.ChooseLowRes();
			// await this.Delay(1000);
			return;
		}
	}

	async BeginAuto() {
		this.panel.Log('开始自动');
		this.beginAutoBtn.disabled = true;
		this.endAutoBtn.disabled = false;
		this.autoing = true;
		while(this.autoing) {
			await this.Delay();
			await this.AutoFrame();
		}
	}
	EndAuto() {
		this.panel.Log('结束自动');
		this.autoing = false;
		this.beginAutoBtn.disabled = false;
		this.endAutoBtn.disabled = true;
	}
	//#endregion

	constructor() {
		super();
		
		this.HijackEventListenerAdder();

		this.panel.title = '智慧树 Hack';
		this.life.on('urlchange', () => {
			this.panel.Clear();

			this.beginAutoBtn = this.panel.Button('开始自动', () => this.BeginAuto());
			this.endAutoBtn = this.panel.Button('停止自动', () => this.EndAuto());
			this.endAutoBtn.disabled = true;

			this.panel.NewLine();

			this.panel.Button('低画质', () => this.ChooseLowRes());
			this.panel.Button('最高倍速', () => this.ChooseHighPlaybackRate());
		});
	}
}

const hack = new Hack();
