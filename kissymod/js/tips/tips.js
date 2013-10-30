/*
 * TIPS for KISSY
 * @VinceSnow mail@vincesnow.com
 */

KISSY.add('tips/tips', function(S){

	var $ = S.all, DOM = S.DOM, Event = S.Event;


	var defaults = {
		width: 'auto',
		followMouse: false,
		placement: 's',
		tpl: function(){
			var _tpl = '<div class="vui-tips-cntr"></div>';
			return _tpl;
		},
		create: function(){
			var _tip;
			var _node = document.createElement('div');
			_node.className = 'vui-tips' + ((this.placement) ? ' vui-tips-'+this.placement : '') + ((this.skin) ? ' vui-tips-'+this.skin : '');
			_node.style.display = 'none';
			_node.innerHTML = this.tpl();
			_tip = document.body.appendChild(_node);
			this.node = _tip;
			this.setContent().setCss().events();
			
			return this;
		},
		setContent: function(elem){
			var ctnr = $('div.vui-tips-cntr', this.node)[0];
			
			if (typeof this.title === 'string' && this.title !== ''){
				ctnr.innerHTML = '<div class="vui-tips-title">' + this.title + '</div><div class="vui-tips-content">' + this.content + '</div>';
			} else {
				ctnr.innerHTML = this.content;
			}
			
			return this;
		},
		setCss: function(){
			if (typeof this.fontSize === 'string'){
	            this.node.style.fontSize = this.fontSize || '12px';
	        }
	        this.node.style.width = this.width || 'auto';

			var _left = 0, _top = 0;
			if (this.placement === 's'){
				var _left = (DOM.innerWidth(this.element) / 2 - DOM.innerWidth(this.node) / 2) + DOM.offset(this.element).left;
				var _top = DOM.innerHeight(this.element) + DOM.offset(this.element).top + 5;
			}
			if (this.placement === 'n'){
				var _left = (DOM.innerWidth(this.element) / 2 - DOM.innerWidth(this.node) / 2) + DOM.offset(this.element).left;
				var _top = DOM.offset(this.element).top - DOM.innerHeight(this.node) - 5;
			}
			if (this.placement === 'w'){
				var _left = DOM.offset(this.element).left - DOM.innerWidth(this.node) - 5;
				var _top = (DOM.innerHeight(this.element) / 2 - DOM.innerHeight(this.node) / 2) + DOM.offset(this.element).top;
			}
			if (this.placement === 'e'){
				var _left = DOM.offset(this.element).left + DOM.innerWidth(this.element) + 5;
				var _top = (DOM.innerHeight(this.element) / 2 - DOM.innerHeight(this.node) / 2) + DOM.offset(this.element).top;
			}
			this.node.style.left = _left+'px';
			this.node.style.top = _top+'px';
			
			
	        return this;
		},
		show: function(speed){
			if (this.followMouse){
				this.node.style.left = this.posx+5+'px';
				this.node.style.top = this.posy+5+'px';
			}
			var speed = speed || 0;
			$(this.node).show(speed);
		},
		hide: function(speed){
			var speed = speed || 0;
			$(this.node).hide(speed);
		},
		events: function(){
			var me = this;
			
			
			Event.on(this.element, 'mouseleave', function(e){
				//var evt = e || window.event;

				//if (isMouseLeaveOrEnter(evt, this)){
					me.hide();
				//}
			});

			
			if (this.followMouse){
				Event.on(this.element, 'mousemove', function(e){
					var evt = e || window.event;
					me.posx=0;
					me.posy=0;
					if (evt.pageX || evt.pageY){
						me.posx=evt.pageX;
						me.posy=evt.pageY;
					} else if (evt.clientX || evt.clientY){
						me.posx=evt.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
						me.posy=evt.clientY + document.documentElement.scrollTop + document.body.scrollTop;
					}
					
					me.show();
				});
			} else {
				Event.on(this.element, 'mouseenter', function(e){
					//var evt = e || window.event;
		
					//if (isMouseLeaveOrEnter(evt, this)){
						me.show();
					//}
				});
			}

		}
	}

	S.mix(S, {
		objectPlus: function(o, stuff){
		    var n;
		    function F(){}
		    F.prototype = o;
		    n = new F();
		    n.uber = o;
		    
		    for (var i in stuff){
		        n[i] = stuff[i];
		    }
		    return n;
		}
	});

	return function(elem, option){
			
			if (typeof option !== 'object'){
				var option = {};
			}


			S.each($(elem), function(item){
				var prop, opt = S.objectPlus(defaults, option);
				opt.element = item;
				var param = item.getAttribute('j_tips').split('|');
				for (var i = 0; i < param.length; i++){
					prop = param[i].split(':');
					if (prop[0] === 'followMouse'){
						opt.followMouse = true;
					} else if (prop.length === 1 && prop[0] !== ''){
						opt.content = prop[0];
					} else {
						switch (prop[0]){
							case 'title':
								opt.title = prop[1];
								break;
							case 'content':
								opt.content = prop[1];
								break;
							case 'placement':
								opt.placement = prop[1];
								break;
							case 'width':
								opt.width = prop[1];
								break;
							case 'fontSize':
								opt.fontSize = prop[1];
								break;
						}
					}
				}
				
				if (typeof opt.content !== 'string' || opt.content === '') return false;
				
			
				
				opt.create(item);

				console.log(opt);
			});
		}

}, {
    requires: [
        'node',
        'dom',
        'event',
        'sizzle',
        'tips/tips.css'
    ]
});