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
	

	function nodeDetail(name, neighbors) {
		html = "<h3>" + name + "</h3>";
		for (var idx in neighbors) {
			html += "<li>" + neighbors[idx] + "</li>";
		}
		html += "</ul>";
		$('#tabdata').html(html);
	}
	

	function search() {
		$('#search').css('background', 'url(/images/loading.gif) no-repeat right 10px center');
		if (engine != null) {
			engine.destroy();
			delete engine;
		}
		$('#result').hide();
		$('#resultframe').hide();
		$('#tabdata').empty();
		$.ajax({
			url: '/main/search.json',
			data: {'q': $('#search').val()},
			type: 'get',
			dataType: 'json',
			success: function(data) {
				nodes = [];
				links = [];
				var positions = {};
				var hmtlContent = ''; 
				var congressUrl ='';
				var sectionUrl ='';
				for (var key in data) {
					var idx = nodes.length;
					var title = "Title " + key.split('_')[0].substr(1) + " Section " + key.split('_')[1].substr(1);
					nodes.push(createNode(title, '#00FF00', {'type': 'section', 'id': key}));

					var congress = data[key];
					if (congress instanceof Array) {
						for (var i=0; i < congress.length; i++) {
							var c = congress[i];
							if (!(c in positions)) {
								positions[c] = nodes.length;
								nodes.push(createNode("Congress " + c, '#FF0000', {'type': 'congress', 'id': c}));							}
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
				$('#search').css('background', '');
			}
		});
	}

	$('#canvas').on('mousewheel', function(evt, delta, deltaX, deltaY) {
		evt.preventDefault();
		if (delta < 0) {
			engine.zoomOut(-delta);
		} else {
			engine.zoomIn(delta);
		}
	});

	$(document).on('nev:nodeselect', function(evt, node) {
		if (node == undefined) {
			$('#result').hide();
			$('#resultframe').hide();
			$('#tabdata').empty();
			return;
		}
		var index = null;
		for (var idx in nodes) {
			if (nodes[idx]['data']['id'] == node['data']['id']) {
				index = idx;
				break;
			}
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
		} else {
			data['q'] = $('#search').val();
			$.ajax({
				url: '/main/content.json',
				data: data,
				type: 'get',
				success: function(data) {
					$('#result').html('<article>' + data['message'] + '</article>');
				}
			});
			$('#resultframe').hide();
			$('#result').show();
		}

		var neighbors = [];
		for (var idx in links) {
			if (links[idx]['a'] == index) {
				neighbors.push(nodes[links[idx]['b']]['text']);
			} else if (links[idx]['b'] == index) {
				neighbors.push(nodes[links[idx]['a']]['text']);
			}
		}
		nodeDetail(node['text'], neighbors);
	});

	$('#search').keypress(function (e) {
	  if (e.which == 13) {
	    search();
	  }
	});
})