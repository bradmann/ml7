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
	var nodes = [], links = [], selected = [];
	var mass = 10;

	$('#result').tabs().hide();
	
	function createWikipediaUrl(id) {
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
		return url;
		
	}
	
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
			var key = '<span style="background-color:' + nodes[nodeIdx]['c'] + '">&nbsp;&nbsp;&nbsp;&nbsp;</span> <span class="node">' + nodes[nodeIdx]['text'] + '</span>';
			var neighbors = [];
			for (var j=0; j<links.length; j++) {
				if (links[j]['a'] == nodeIdx) {
					neighbors.push(nodes[links[j]['b']]);
					if ($.inArray(links[j]['b'], allneighbors) != -1) {
						connections[links[j]['b'].toString()] = 1;
					} else {
						allneighbors.push(links[j]['b']);
					}
				} else if (links[j]['b'] == nodeIdx) {
					neighbors.push(nodes[links[j]['a']]);
					if ($.inArray(links[j]['a'], allneighbors) != -1) {
						connections[links[j]['a'].toString()] = 1;
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
			html += '<h4>' + key + "</h4><ul>";
			for (var i=0; i<neighbors.length; i++){
				html += '<li><span class="node">' + neighbors[i]['text'] + '</span></li>';
			}
			html += "</ul>";
		}

		var connectionmap = {};
		if (Object.keys(connections).length > 0) {
			html += "<h3>Connections</h3>";
			for (var key in connections) {
				var nodeIdx = parseInt(key);
				var key = '<span style="background-color:' + nodes[nodeIdx]['c'] + '">&nbsp;&nbsp;&nbsp;&nbsp;</span> <span class="node">' + nodes[nodeIdx]['text'] + '</span>';
				var neighbors = [];
				for (var j=0; j<links.length; j++) {
					if (links[j]['a'] == nodeIdx) {
						neighbors.push(nodes[links[j]['b']]);
					} else if (links[j]['b'] == nodeIdx) {
						neighbors.push(nodes[links[j]['a']]);
					}
				}
				connectionmap[key] = neighbors;
			}
		}
		for (var key in connectionmap) {
			var neighbors = connectionmap[key];
			html += "<h4>" + key + "</h4><ul>";
			for (var i=0; i<neighbors.length; i++){
				html += '<li><span class="node">' + neighbors[i]['text'] + '</span></li>';
			}
			html += "</ul>";
		}
		$('#tabdata').html(html);
	}
	

	function search() {
		$('#search').css('background', 'url(/images/loading.gif) no-repeat right 10px center');
		if (engine != null) {
			engine.destroy();
			delete engine;
			engine = null;
		}
		$('#result').html('<ul></ul>').hide();
		$('#tabdata').empty();
		
		$.ajax({
			url: '/main/search.json',
			data: {'q': $('#search').val()},
			type: 'get',
			dataType: 'json',
			success: function(data) {
				$('#search').css('background', '');
				if (data == null) {
					$('#message').html("Your question <b><i>" + $('#search').val() + "</i></b> returned no results." );
					return;
				}
				$('#message').html("Your question <b><i>" + $('#search').val() + "</i></b> returned the following answers from the US Code: " );
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
						nodes.push(createNode(section, '#849099', {'type': 'section', 'id': pair['section'].split('/').slice(-1)[0]}));
					}

					if (congress in nodemap) {
						congressIdx = nodemap[congress];
					} else {
						congressIdx = nodes.length;
						nodemap[congress] = congressIdx;
						nodes.push(createNode('Congress ' + congress, '#e20028', {'type': 'congress', 'id': congress}));
					}
					links.push({'a': sectionIdx, 'b': congressIdx});
				}

				$('#logo').fadeOut();
				engine = Object.create(NEV);
				engine.init(canvas, 60);
				engine.loadGraph(nodes, links);
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
			$('#result').html('<ul></ul>').hide();
			//$('#resultframe').hide();
			$('#tabdata').empty();
			selected = selectedNodes;
			return;
		}
		var index = null;
		for (var idx in nodes) {
			if (nodes[idx]['data']['id'] == node['data']['id']) {
				index = idx;
				break;
			}
		}
		if (selectedNodes.length < selected.length) {
			var id = node['data']['id'];
			$('#result *[data-id="' + id + '"]').remove();
			$('#result').tabs('refresh').show();
			$("#result").tabs("option", "active", $('#result ul li').length - 1);
			selected = selectedNodes;
		} else {
			if (selectedNodes.length == 1) {
				$('#result ul li,#result div').remove();
			}
			var data = node['data'];
			var id = data['id'];
			if (data['type'] == 'congress') {
				var url = createWikipediaUrl(id);
				$('#result ul').append('<li data-id="' + id + '"><a href="#tab_' + id + '">' + node['text'] + '</a></li>');
				$('#result').append('<div id="tab_' + id + '"><iframe></iframe></div>');
				$('#tab_' + id + ' iframe').attr('src', url);
				$('#result').tabs('refresh').show();
				$("#result").tabs("option", "active", $('#result ul li').length - 1);
			} else {
				data['q'] = $('#search').val();
				$.ajax({
					url: '/main/content.json',
					data: data,
					type: 'get',
					success: function(data) {
						$('#result ul').append('<li data-id="' + id + '"><a href="#tab_' + id + '">' + node['text'] + '</a></li>');
						$('#result').append('<div id="tab_' + id + '"></div>');
						$('#tab_' + id).html('<article>' + data['message'] + '</article>');
						$('#result').tabs('refresh').show();
						$("#result").tabs("option", "active", $('#result ul li').length - 1);
					}
				});
			}
			selected = selectedNodes;
		}

		nodeDetail(selectedNodes);
	});

	$('#search').keypress(function (e) {
	  if (e.which == 13) {
	    search();
	  }
	});
})