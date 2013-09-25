(function(){
	var self = null;
	var VisEngine = {
		timer: null, engine: null, canvas: null, ctx: null, interval: null, nodes: null, links: null, width: 1000, height: 500, scaleX: 1, scaleY: -1,
		transX: 0, transY: 0, mousedown: false, images: {}, clickTimer: null, dragFlag: false, nodePalette: {},
		init: function(engine, canvas, fps){
			self = this;
			this.engine = engine;
			this.canvas = canvas;
			this.lastPos = null;
			this.activeNode = null;
			this.transX = this.width/2;
			this.transY = -this.height/2;
			this.ctx = canvas.getContext('2d');
			this.ctx.setTransform(1,0,0,1,0,0);
			this.interval = Math.floor(1/fps * 1000);
			this.ctx.textAlign = 'center';
			this.ctx.lineWidth = 1;
			this.canvas.addEventListener('mousedown', this.canvasMouseDown, false);
			this.canvas.addEventListener('mouseup', this.canvasMouseUp, false);
			this.canvas.addEventListener('mousemove', this.canvasMouseMove, false);
			this.canvas.addEventListener('click', this.canvasClick, false);
			this.canvas.addEventListener('contextmenu', this.canvasContextMenu, false);
		},
		canvasMouseDown: function(evt) {
			if (evt.button !== 0) {return;}
			self.mousedown = true;
			self.clickTimer = new Date();
			self.lastPos = self.getWorldCoords(evt);
			self.engine.postMessage({"cmd": "mousedown", "params": {"coords": self.lastPos}});
			self.activeNode = self.getNodeIdxAtCoords(self.lastPos);
			evt.preventDefault();
			return false;
		},
		canvasMouseUp: function(evt) {
			if (evt.button !== 0 || !self.mousedown) {return;}
			self.mousedown = false;
			self.activeNode = null;
			$(self.canvas).css('cursor', 'default');
			self.engine.postMessage({"cmd": "mouseup", "params": {"coords": self.getWorldCoords(evt)}});
		},
		canvasMouseMove: function(evt) {
			if (!self.mousedown) {return;}
			self.dragFlag = true;
			$(self.canvas).css('cursor', 'url(https://mail.google.com/mail/images/2/closedhand.cur)');
			var currentPos = self.getWorldCoords(evt);
			self.engine.postMessage({"cmd": "drag", "params": {"from": self.lastPos, "to": currentPos}});
			if (self.activeNode == null) {
				self.pan(self.lastPos, currentPos);
			}
		},
		canvasClick: function(evt) {
			if ((new Date()) - self.clickTimer > 500 || self.dragFlag) {
				self.clickTimer = null;
				self.dragFlag = false;
				return false;
			}
			self.engine.postMessage({"cmd": "click", "params": {"coords": self.getWorldCoords(evt), "shiftKey": evt.shiftKey}});
		},
		canvasContextMenu: function(evt) {
			evt.preventDefault();
			self.engine.postMessage({"cmd": "pin", "params": {"coords": self.getWorldCoords(evt)}});
			self.mousedown = false;
		},
		buildPalette: function(nodes) {
			for (var i=0; i<nodes.length; i++) {
				var node = nodes[i];
				var color = node['img'] ? node['img'] : node['c'];
				var mass = node['m'];
				if (color in this.nodePalette) {
					var tmp = this.nodePalette[color];
					if (mass in tmp) {
						continue;
					}
				} else {
					this.nodePalette[color] = {};
				}
				var cvs = document.createElement('canvas');
				cvs.width = (mass * 2) + 4;
				cvs.height = (mass * 2) + 4;
				var ctx = cvs.getContext('2d');
				ctx.save();
				ctx.fillStyle = node['c'];
				ctx.beginPath();
				ctx.arc(cvs.width/2, cvs.height/2, mass, 0, 2 * Math.PI, false);
				ctx.closePath();
				ctx.stroke();
				ctx.fill();
				ctx.restore();
				this.nodePalette[color][mass] = cvs;
			}
		},
		clear: function() {
			this.ctx.setTransform(1,0,0,1,0,0);
			this.ctx.clearRect(0, 0, canvas.width, canvas.height);
			this.nodes = [];
			this.links = [];
			this.canvas.removeEventListener('mousedown', this.canvasMouseDown, false);
			this.canvas.removeEventListener('mouseup', this.canvasMouseUp, false);
			this.canvas.removeEventListener('mousemove', this.canvasMouseMove, false);
			this.canvas.removeEventListener('click', this.canvasClick, false);
			this.canvas.removeEventListener('contextmenu', this.canvasContextMenu, false);
		},
		getWorldCoords: function(evt) {
			var bounds = this.canvas.getBoundingClientRect();
			var x = evt.clientX - bounds.left - 1;
			var y = evt.clientY - bounds.top - 1;
			return [(x/this.scaleX) - ((this.width / 2) / this.scaleX) + ((this.width/2) - this.transX)/this.scaleX, (y/this.scaleY) - ((this.height / 2) / this.scaleY) - ((this.height/2) + this.transY)/-this.scaleY];
		},
		getNodeIdxAtCoords: function(coords) {
			var x = coords[0];
			var y = coords[1];
			for (var i=0, l=this.nodes.length; i < l; i++) {
				var node = this.nodes[i];
				var pos = node['r'];
				var mass = 10;
				var xMin = pos[0] - mass;
				var xMax = pos[0] + mass;
				var yMin = pos[1] - mass;
				var yMax = pos[1] + mass;
				if (xMin <= x && xMax >= x && yMin <= y && yMax >= y) {
					return i;
				}
			}
			return null;
		},
		draw: function() {
			this.ctx.save();
			this.ctx.clearRect(0, 0, this.width, this.height);
			this.ctx.beginPath();
			this.ctx.rect(0, 0, this.width, this.height);
			this.ctx.clip();
			this.ctx.translate(this.transX, -this.transY);
			this.ctx.scale(this.scaleX, this.scaleY);
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
			this.ctx.restore();
		},
		drawNode: function(node) {
			var pos = node['r'];
			var mass = 10;
			var vel = node['v'];
			var force = node['f'];
			if (node['img']) {
				var img = node['img'];
				if (!this.images[img]) {
					this.images[img] = new Image();
					this.images[img].src = img;
				}
				this.ctx.drawImage(this.images[img], pos[0] - mass, pos[1] - mass, mass*2, mass*2);
			} else {
				/*
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
				*/
				var color = node['c'];
				var mass = node['m'];
				var cvs = this.nodePalette[color][mass];
				this.ctx.drawImage(cvs, 0, 0, cvs.width, cvs.height, pos[0] - cvs.width/2, pos[1] - cvs.height/2, cvs.width, cvs.height);
			}
			
			if (node['text']) {
				var txt = node['text'];
				this.ctx.save();
				this.ctx.fillStyle = "#000000";
				this.ctx.scale(1, -1);
				this.ctx.fillText(txt, pos[0], - (pos[1] - 20));
				this.ctx.restore();
			}
		},
		drawLink: function(link) {
			var posA = this.nodes[link['a']]['r'];
			var posB = this.nodes[link['b']]['r'];
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
		},
		message: function(message) {
			this.ctx.save();
			this.ctx.scale(this.scaleX, this.scaleY);
			this.ctx.fillStyle = "#000000";
			this.ctx.fillText(message, -(this.width / 2) + 100, (this.height / 2));
			this.ctx.restore();
		},
		pan: function(from, to) {
			this.transX += (to[0] - from[0]) * this.scaleX;
			this.transY += (to[1] - from[1]) * Math.abs(this.scaleY);
			this.draw();
		},
		zoomIn: function(delta) {
			if (this.scaleY - (delta * .05) <= -1) {
				this.scaleX = 1;
				this.scaleY = -1;
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
			this.visEngine.buildPalette(nodes);
			this.computeEngine.postMessage({"cmd": "init", "params": {"nodes": nodes, "links": links, "width": 1000, "height": 1000}});
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
			var selectedNodes = params['selectedNodes'];
			$(document).trigger('nev:nodeselect', [node, selectedNodes]);
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