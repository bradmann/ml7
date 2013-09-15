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
	

	function nodeDetail(selectedNodes) {
		var nodemap = {};
		var allneighbors = [];
		var connections = {};
		for (var i=0; i<selectedNodes.length; i++) {
			var nodeIdx = selectedNodes[i];
			var key = nodes[nodeIdx]['text'];
			var neighbors = [];
			for (var j=0; j<links.length; j++) {
				if (links[j]['a'] == nodeIdx) {
					var neighbortext = nodes[links[j]['b']]['text'];
					neighbors.push(neighbortext);
					if (links[j]['b'] in allneighbors) {
						connections[links[j]['b']] = 1;
					} else {
						allneighbors.push(links[j]['b']);
					}
				} else if (links[j]['b'] == nodeIdx) {
					var neighbortext = nodes[links[j]['a']]['text'];
					neighbors.push(neighbortext);
					if (links[j]['a'] in allneighbors) {
						connections[links[j]['a']] = 1;
					} else {
						allneighbors.push(links[j]['a']);
					}
				}
			}
			nodemap[key] = neighbors;
		}
		var html = "<h3>Selection</h3>";
		for (var key in nodemap) {
			var neighbors = nodemap[key];
			html += "<h4>" + key + "</h4><ul>";
			for (var i=0; i<neighbors.length; i++){
				html += "<li>" + neighbors[i] + "</li>";
			}
			html += "</ul>";
		}

		html += "<h3>Connections</h3>";
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
				var nodemap = {};
				for (var i=0; i < data.length; i++) {
					var pair = data[i];
					var section = (pair['section']).split('/').slice(-1)[0];
					section = "Title " + section.split('_')[0].substr(1) + " Section " + section.split('_')[1].substr(1);
					var congress = (pair['congress']).split('/').slice(-1)[0];
					var sectionIdx = 0;
					var congressIdx = 0;
					if (section in nodemap) {
						sectionIdx = nodemap[section];
					} else {
						sectionIdx = nodes.length;
						nodemap[section] = sectionIdx;
						nodes.push(createNode(section, '#00FF00', {'type': 'section', 'id': pair['section'].split('/').slice(-1)[0]}));
					}

					if (congress in nodemap) {
						congressIdx = nodemap[congress];
					} else {
						congressIdx = nodes.length;
						nodemap[congress] = congressIdx;
						nodes.push(createNode('Congress ' + congress, '#FF0000', {'type': 'congress', 'id': congress}));
					}
					links.push({'a': sectionIdx, 'b': congressIdx});
				}

				$('#logo').fadeOut();
				engine = Object.create(NEV);
				engine.init(canvas, 60);
				engine.loadGraph(nodes, links);
				$('#search').css('background', '');
			}
		});
	}

	$('#canvas').on('mousewheel', function(evt, delta, deltaX, deltaY) {
		evt.preventDefault();
		if (!engine) {
			return;
		}
		if (delta < 0) {
			engine.zoomOut(-delta);
		} else {
			engine.zoomIn(delta);
		}
	});

	$(document).on('nev:nodeselect', function(evt, node, selectedNodes) {
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

		nodeDetail(selectedNodes);
	});

	$('#search').keypress(function (e) {
	  if (e.which == 13) {
	    search();
	  }
	});
})