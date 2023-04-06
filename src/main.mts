import { window, Hack as HackBase, Media } from '@cuclh/userscript-base';

class Hack extends HackBase {
	constructor() {
		super();

		this.panel.title = '智慧树 Hack';
		this.life.on('urlchange', () => {
			this.panel.Clear();

			this.panel.Button('低画质', () => {
				const btn = window.document.querySelector('.line1bq') as HTMLButtonElement;
				if(!btn) {
					this.panel.Log('找不到画质切换按钮', 'warning');
					return;
				}
				btn.click();
			}).disabled = true;		// 智慧树也会检测 Event.isTrusted
			this.panel.Button('16 倍速', () => {
				const vid = window.document.getElementById('vjs_container_html5_api') as HTMLVideoElement;
				if(!vid) {
					this.panel.Log('找不到视频元素', 'warning');
					return;
				}
				vid.playbackRate = 16;
			});
		});
	}
}

const hack = new Hack();
