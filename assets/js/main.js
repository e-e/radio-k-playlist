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
			videoUrl: "",
		},
		created() {
			let today = new Date();
			// this.listDate = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
			// DEBUG ONLY
			this.listDate = `${today.getMonth() + 1}/${today.getDate() - 1}/${today.getFullYear()}`;
			this.checkAndLoad();
		},
		methods: {
			get(url) {
				return new Promise((resolve, reject) => {
					let ajax = new XMLHttpRequest();
					ajax.onreadystatechange = function() {
						if (this.readyState === 4) {
							resolve(this);
						}
					};
					ajax.open("GET", url, true);
					ajax.send(null);
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
					// ajax.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
					// ajax.send(vm.toParamStr(data));
					ajax.setRequestHeader("Content-Type", "application/json");
					ajax.send(JSON.stringify(data));
				});
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
					let data = JSON.parse(response.responseText);
					console.log("youtube search: ", data);
					let videoUrl = `https://www.youtube.com/embed/${data.id.videoId}`;
					this.videoUrl = videoUrl;
				}).catch(err => console.log("trouble getting youtube search...", err));
			},
			nextSong() {
				let nextIndex = this.songIndex + 1 >= this.songs.length ? 0 : this.songIndex + 1;
				let song = this.songs[nextIndex];
				this.songIndex = nextIndex;
				this.loadVideo(song, this.songIndex);
			},
			checkAndLoad() {
				this.loading = true;
				let val = this.listDate;
				if (this.isValidDate(val)) {
					this.get(`/songs/${this.dateForUrl(val)}`).then(res => {

						let data = JSON.parse(res.responseText);
						this.songs = data;
						this.loading = false;


					}).catch(err => console.log("trouble getting songs", err));
				}
			},
			closePlayer() {

			}
		},
		watch: {
			/*listDate: function(val) {
				if (this.isValidDate(val)) {
					this.get(`/songs/${this.dateForUrl(val)}`).then(res => {

						let data = JSON.parse(res.responseText);
						this.songs = data;


					}).catch(err => console.log("trouble getting songs", err));
				}
			}*/
		},
		computed: {
			showVideo() {
				return !!this.videoUrl.length;
			}
		}
	})
}

run();