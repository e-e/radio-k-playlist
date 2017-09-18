/*todo

*/


function run() {
	const youtubeSearchUrl = "http://gdata.youtube.com/feeds/api/videos?v=2&alt=jsonc&q=";
	const youtubeAPIKey = "AIzaSyBE43P6I1BikZ_Z8aH_jmTaYkG9MDg1zps";

	const app = new Vue({
		el: '#app',
		data: {
			loading: true,
			listDate: "",
			songs: [],
			songIndex: 0,
			currentSong: {
				name: "",
				artist: "",
				album: "",
			},
			videoUrl: "",
			iframeRatio: (300 / 169),
			iframeWidth: 300,
			iframeHeight: 169,
			resizeCounter: 0,
			resizeLimit: 5,
		},
		created() {
			let today = new Date();
			// this.listDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
			// DEBUG ONLY
			this.listDate = `${today.getMonth() + 1}/${today.getDate() - 1}/${today.getFullYear()}`;
			this.checkDateAndLoad();
			let iframeWrap = document.querySelector(".iframe-wrap");
			window.addEventListener("resize", this.calculateIframeWidth.bind(this));
		},
		methods: {
			get(url) {
				return new Promise((resolve, reject) => {
					try {
						let ajax = new XMLHttpRequest();
						ajax.onreadystatechange = function() {
							if (this.readyState === 4) {
								resolve(this);
							}
						};
						ajax.open("GET", url, true);
						ajax.send(null);
					} catch (ex) {
						console.log("ex: ", ex);
						reject("uh oh!");
					}	
				});
			},
			post(url, data) {
				let vm = this;
				return new Promise((resolve, reject) => {
					let ajax = new XMLHttpRequest();
					ajax.onreadystatechange = function() {
						if (this.readyState === 4) {
							resolve(this);
						}
					};
					ajax.open("POST", url, true);
					ajax.setRequestHeader("Content-Type", "application/json");
					ajax.send(JSON.stringify(data));
				});
			},
			calculateIframeWidth(e) {
				console.log("showVideo? ", this.showVideo);
				if (!this.showVideo) {
					return;
				}
				// console.log(e, wrap);
				this.resizeCounter++;
				if (e.forceResize || this.resizeCounter > this.resizeLimit) {
					let wrap = document.querySelector(".iframe-wrap");
					this.resizeCounter = 0;

					let width = wrap.offsetWidth;
					let height = Math.floor(width / this.iframeRatio);
					this.iframeWidth = width;
					this.iframeHeight = height;
					if (!width) {
						setTimeout(this.calculateIframeWidth.bind(this, e), 100);
					}
				}
			},
			toParamStr(obj) {
				let paramStr = Object.keys(obj).reduce((str, key) => {
					return str + (str.length ? "&" : "") + key + "=" + encodeURIComponent(obj[key]);
				}, "");
				console.log("param string: ", paramStr);
				return paramStr;
			},
			dateForUrl(val) {
				return val.replace(/\//g, "_");
			},
			getDateParts(val) {
				return val.split("/").map(n => parseInt(n, 10));
			},
			isValidDate(val) {
				let parts = this.getDateParts(val);
				if (parts.length === 3) {
					if (
						(parts[0] >= 1 && parts[0] <= 12) &&
						(parts[1] >= 1 && parts[1] <= 31) &&
						parts[2] > 2000

					) {
						return true;
					}
				}
				return false;
			},

			// https://www.youtube.com/embed/s-5dsCJNCxg
			loadVideo(song, index) {
				this.songIndex = index;
				let url = `/song/${song.name}/${song.artist}/${song.album}`;
				this.get(url).then(response => {
					try {
						let data = JSON.parse(response.responseText);
						console.log("youtube search: ", data);
						let videoUrl = `https://www.youtube.com/embed/${data.id.videoId}`;
						this.videoUrl = videoUrl;
						console.log("setting song... ", this.videoUrl);
						this.calculateIframeWidth({forceResize: true});
					} catch(ex) {
						console.log(ex, "data: ", data)
					}
						
				}).catch(err => console.log("trouble getting youtube search...", err));
			},
			nextSong() {
				let nextIndex = this.songIndex + 1 >= this.songs.length ? 0 : this.songIndex + 1;
				let song = this.songs[nextIndex];
				this.songIndex = nextIndex;
				this.loadVideo(song, this.songIndex);
			},
			checkDateAndLoad() {
				this.loading = true;
				let val = this.listDate;
				if (this.isValidDate(val)) {
					this.get(`/songs/${this.dateForUrl(val)}`).then(res => {

						let data = JSON.parse(res.responseText);
						this.songs = data;
						this.loading = false;

						this.loadVideo(this.songs[this.songIndex], this.songIndex);
					}).catch(err => console.log("trouble getting songs", err));
				}
			},
			closePlayer() {

			},
			pad(n, mask, padWith = 0) {
				const l = mask.length;
				padWith = padWith.toString();
				n = n.toString();
				while (n.length < l) n = `${padWith}${n}`;
				return n;
			},
			prettyTime(time) {
				if (!time.trim().length) return "";
				let parts = time.split(":");
				let hour = parseInt(parts[0], 10);
				let minute = parseInt(parts[1], 10);
				let ampm = "am";
				if (hour >= 12) {
					ampm = "pm";
					if (hour > 12) {
						hour = hour % 12;
					}
				}
				return `${this.pad(hour, "00", 0)}:${this.pad(minute, "00", 0)} ${ampm}`;
			}
		},
		watch: {},
		computed: {
			showVideo() {
				return !!this.videoUrl.length;
			},
			playlistUrl() {
				return `http://www.radiok.org/playlist?date=${encodeURIComponent(this.listDate)}`;
			}
		}
	})
}

run();