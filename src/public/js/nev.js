(function(){
	var VisEngine = {
		timer: null, engine: null, canvas: null, ctx: null, interval: null, nodes: null, links: null, width: 1000, height: 500, scaleX: 1, scaleY: -1, mousedown: false,
		images: {},
		init: function(engine, canvas, fps){
			var self = this;
			this.engine = engine;
			this.canvas = canvas;
			this.ctx = canvas.getContext('2d');
			this.ctx.setTransform(1,0,0,1,0,0);
			this.ctx.scale(this.scaleX, this.scaleY);
			this.ctx.translate(this.width/2, -this.height/2);
			this.interval = Math.floor(1/fps * 1000);
			this.ctx.textAlign = 'center';
			this.ctx.lineWidth = 1;
			this.canvas.addEventListener('mousedown', function(evt) {
				if (evt.button !== 0) {return;}
				self.mousedown = true;
				engine.postMessage({"cmd": "mousedown", "params": {"coords": self.getWorldCoords(evt)}});
			}, false);
			this.canvas.addEventListener('mouseup', function(evt) {
				if (evt.button !== 0 || !self.mousedown) {return;}
				self.mousedown = false;
				engine.postMessage({"cmd": "mouseup", "params": {"coords": self.getWorldCoords(evt)}});
			}, false);
			this.canvas.addEventListener('mousemove', function(evt) {
				if (!self.mousedown) {return;}
				var bounds = this.getBoundingClientRect();
				var x = evt.clientX - bounds.left - 1;
				var y = evt.clientY - bounds.top - 1;
				engine.postMessage({"cmd": "drag", "params": {"coords": self.getWorldCoords(evt)}});
			}, false);
			this.canvas.addEventListener('click', function(evt) {
				engine.postMessage({"cmd": "click", "params": {"coords": self.getWorldCoords(evt)}});
			}, false);
			this.canvas.addEventListener('contextmenu', function(evt) {
				evt.preventDefault();
				engine.postMessage({"cmd": "pin", "params": {"coords": self.getWorldCoords(evt)}});
				self.mousedown = false;
			}, false);
		},
		clear: function() {
			this.ctx.setTransform(1,0,0,1,0,0);
			this.ctx.clearRect(0, 0, canvas.width, canvas.height);
		},
		getWorldCoords: function(evt) {
			var bounds = this.canvas.getBoundingClientRect();
			var x = evt.clientX - bounds.left - 1;
			var y = evt.clientY - bounds.top - 1;
			return [(x/this.scaleX) - ((this.width / this.scaleX)/2), -(y/this.scaleY) + ((this.height / this.scaleY)/2)];
		},
		draw: function() {
			this.ctx.clearRect(-this.width/2, -this.height/2, this.width, this.height);
			var selected = [];
			for (var idx in this.links) {
				var link = this.links[idx];
				if (link['selected']) {
					selected.push(link);
				} else {
					this.drawLink(link);
				}
			}
			for (var idx in selected) {
				this.drawLink(selected[idx]);
			}
			for (var idx in this.nodes) {
				var node = this.nodes[idx];
				this.drawNode(node);
			}
		},
		drawNode: function(node) {
			var pos = node['r'];
			var mass = 10;
			var vel = node['v'];
			var force = node['f'];
			this.ctx.save();
			this.ctx.scale(this.scaleX, this.scaleY);
			if (node['img']) {
				var img = node['img'];
				if (!this.images[img]) {
					this.images[img] = new Image();
					this.images[img].src = img;
				}
				this.ctx.drawImage(this.images[img], pos[0] - mass, -pos[1] - mass, mass*2, mass*2);
			} else {
				this.ctx.fillStyle = node['c'];
				this.ctx.beginPath();
				this.ctx.arc(pos[0], pos[1], mass, 0, 2 * Math.PI, false);
				this.ctx.closePath();
				if (node['selected']) {
					this.ctx.lineWidth = 3;
				} else {
					this.ctx.lineWidth = 1;
				}
				this.ctx.stroke();
				this.ctx.fill();
			}
			
			if (node['text']) {
				var txt = node['text'];
				this.ctx.fillStyle = "#000000";
				this.ctx.fillText(txt, pos[0], pos[1] + 20);
			}
			this.ctx.restore();
		},
		drawLink: function(link) {
			var posA = this.nodes[link['a']]['r'];
			var posB = this.nodes[link['b']]['r'];
			this.ctx.save();
			this.ctx.scale(this.scaleX, this.scaleY);
			this.ctx.beginPath();
			this.ctx.moveTo(posA[0], posA[1]);
			this.ctx.lineTo(posB[0], posB[1]);
			this.ctx.closePath();
			if (link['selected']) {
				this.ctx.strokeStyle = '#000000';
			} else {
				this.ctx.strokeStyle = '#cccccc';
			}
			this.ctx.stroke();
			this.ctx.restore();
		},
		message: function(message) {
			this.ctx.save();
			this.ctx.scale(this.scaleX, this.scaleY);
			this.ctx.fillStyle = "#000000";
			this.ctx.fillText(message, -(this.width / 2) + 100, (this.height / 2));
			this.ctx.restore();
		},
		zoomIn: function(delta) {
			if (this.scaleY - (delta * .1) > 0) {
				return;
			}
			this.scaleX += (delta * .05);
			this.scaleY -= (delta * .05);
			this.draw();
		},
		zoomOut: function(delta) {
			if (this.scaleX - (delta * .1) < 0) {
				return;
			}
			this.scaleX -= (delta * .05);
			this.scaleY += (delta * .05);
			this.draw();
		}
	};
	
	NEV = {
		visEngine: null, computeEngine: null, canvas: null,
		nodes: [], links: [],
		init: function(canvas, fps) {
			var self = this;
			this.computeEngine = new Worker('js/compute.js');
			this.computeEngine.addEventListener('message', function(evt){
				self[evt.data['cmd']](evt.data['params']);
			}, false);
			this.canvas = canvas;
			this.visEngine = Object.create(VisEngine);
			this.visEngine.init(this.computeEngine, canvas, fps);
		},
		loadGraph: function(nodes, links) {
			this.nodes = nodes;
			this.links = links;
			this.computeEngine.postMessage({"cmd": "init", "params": {"nodes": this.nodes, "links": this.links, "width": 1000, "height": 1000}});
			this.visEngine.nodes = this.nodes;
		},
		update: function(params) {
			this.visEngine.nodes = params["nodes"];
			this.visEngine.links = params["links"];
			this.visEngine.draw();
		},
		log: function(params) {
			console.log(params['message']);
		},
		message: function(params) {
			this.visEngine.message(params['message']);
		},
		nodeSelect: function(params) {
			var node = params['node'];
			$(document).trigger('nev:nodeselect', node);
		},
		destroy: function() {
			this.visEngine.clear();
			this.computeEngine.terminate();
			delete this.visEngine;
		},
		zoomIn: function(delta) {
			this.visEngine.zoomIn(delta);
		},
		zoomOut: function(delta) {
			this.visEngine.zoomOut(delta);
		}
	};
})();