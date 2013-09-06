if (typeof Object.create !== 'function') {
	Object.create = function (o, props) {
		function F() {}
		F.prototype = o;
		var tmp = new F();
		if (props) {
			for (var key in props) {
				if (props.hasOwnProperty(key)) {
					tmp[key] = props[key];
				}
			}
		}
		return tmp;
	};
}

$(function(){
	var engine = null;
	var canvas = $('#canvas')[0];
	var nodes = [], links = [];
	var mass = 10;

	function createNode(text, color, data) {
		text = text ? text : "";
		color = color ? color : '#000000';
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		return {'r': [x,y], 'v': [0,0], 'c': color, 'm': mass, 'data': data, 'text': text};
	}

	function search() {
		if (engine != null) {
			engine.destroy();
			delete engine;
		}
		$.ajax({
			url: '/main/search.json',
			data: {'q': $('#search').val()},
			type: 'get',
			dataType: 'json',
			success: function(data) {
				//nodes.push(createNode("Association"));
				var positions = {};
				for (var key in data) {
					var idx = nodes.length;
					nodes.push(createNode("Section " + key, '#00FF00', {'type': 'section', 'id': key}));
					//links.push({'a': 0, 'b': idx});

					var congress = data[key];
					if (congress instanceof Array) {
						for (var i=0; i < congress.length; i++) {
							var c = congress[i];
							if (!(c in positions)) {
								positions[c] = nodes.length;
								nodes.push(createNode("Congress " + c, '#FF0000', {'type': 'congress', 'id': c}));
								
							}
							links.push({'a': idx, 'b': positions[c]});
						}
					} else {
						var c = congress;
						if (!(c in positions)) {
							positions[c] = nodes.length;
							nodes.push(createNode("Congress " + c, '#FF0000', {'type': 'congress', 'id': c}));
						}
						links.push({'a': idx, 'b': positions[c]});
					}
				}

				engine = Object.create(NEV);
				engine.init(canvas, 60);
				engine.loadGraph(nodes, links);
			}
		});
	}

	$(document).on('nev:nodeselect', function(evt, node) {
		if (node == undefined) {
			return;
		}
		var data = node['data'];
		if (data['type'] == 'congress') {
			$('#result').hide();
			var id = data['id'];
			var url = 'http://en.wikipedia.org/wiki/' + id.toString();
			if (id.toString().substr(-1) == '1' && id.toString().substr(-2) != '11') {
				url += 'st';
			} else if (id.toString().substr(-1) == '2') {
				url += 'nd';
			} else if (id.toString().substr(-1) == '3') {
				url += 'rd';
			} else {
				url += 'th';
			}
			url += '_United_States_Congress';
			$('#resultframe').attr('src', url);
			$('#resultframe').show();
			return;
		} else {
			$('#resultframe').hide();
			$('#result').show();
		}

		$.ajax({
			url: '/main/content.json',
			data: data,
			type: 'get',
			success: function(data) {
				$('#result').html(data['message']);
			}
		});
	});

	$('#search').keypress(function (e) {
	  if (e.which == 13) {
	    search();
	  }
	});

	/*for (var i=0; i < 15; i++) {
		nodes.push(createNode());
	}

	for (var i=1; i < 15; i++) {
		links.push({'a': i, 'b': 0});
	}*/
	/*nodes.push({'r': [0,0], 'v': [0,0], 'c': '#666666', 'm': mass, 'data': '', 'text': 'fruchterman-reingold'});
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': mass, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': mass, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': mass, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#0000FF', 'm': mass, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': mass, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#000000', 'm': mass, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': mass, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#000000', 'm': mass, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': mass, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#000000', 'm': mass, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': mass, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#000000', 'm': mass, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
	var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
	nodes.push({'r': [x,y], 'v': [0,0], 'c': '#00FF00', 'm': mass, 'data': '', 'img': 'images/youtube.png'});
	for (var i=1; i < 20; i++) {
		var x = Math.floor((Math.random()*canvas.width)+1) - canvas.width / 2;
		var y = Math.floor((Math.random()*canvas.height)+1) - canvas.height / 2;
		var node = {'r': [x,y], 'v': [0,0], 'c': '#000000', 'm': mass, 'data': '', 'img': 'images/twitter.png'};
		nodes.push(node);
	}
	for (var i=2; i < 21; i++) {
		links.push({'a': 1, 'b': i});
	}
	for (var i=22; i < 41; i++) {
		links.push({'a': 21, 'b': i});
	}
	for (var i=42; i < 61; i++) {
		links.push({'a': 41, 'b': i});
	}
	for (var i=62; i < 81; i++) {
		links.push({'a': 61, 'b': i});
	}
	for (var i=82; i < 101; i++) {
		links.push({'a': 81, 'b': i});
	}
	for (var i=102; i < 121; i++) {
		links.push({'a': 101, 'b': i});
	}
	for (var i=122; i < 141; i++) {
		links.push({'a': 121, 'b': i});
	}
	links.push({'a': 0, 'b': 1});
	links.push({'a': 0, 'b': 21});
	links.push({'a': 0, 'b': 41});
	links.push({'a': 0, 'b': 61});
	links.push({'a': 0, 'b': 81});
	links.push({'a': 0, 'b': 101});
	links.push({'a': 0, 'b': 121});*/
})