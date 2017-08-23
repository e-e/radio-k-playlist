class Result {
	constructor() {
		this.sent = false;
		this.success = true;
		this.message = '';
		this.data = null;
	}
	done(res) {
		if (!this.sent) {
			this.sent = true;
			res.send({
				success: this.success,
				message: this.message,
				data: this.data
			});
		}
	}
	error(message) {
		this.success = false;
		this.message = message;
	}
}
module.exports = Result;