define(function () {
	var resource = require('resource');

	var sfRescource = new resource();

	sfRescource.query = function(opt) {
		var data = 'A new page';
		return data;
	}

	return sfRescource;
});