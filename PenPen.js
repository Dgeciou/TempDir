var PenPen = {
	name: 'PenPen',
	options: {}, // Nuthin'
	init: function(options) {
		this.options = $.extend(
			this.options,
			options
		);
		
		// Create the PenPen tab
		this.tab = Header.addLocation(_("盲盒碰碰"), "penpen", PenPen);
		
		// Create the Path panel
		this.panel = $('<div>').attr('id', "penpenPanel")
			.addClass('location')
			.appendTo('div#locationSlider');
		
		// Add the game area
		var gameArea = $('<div>').attr('id', 'gameArea').appendTo(this.panel);
		
		// Add the draw button
		new Button.Button({
			id: 'drawOneButton',
			text: _("单抽"),
			click: PenPen.drawOne,
			width: '80px',
			cooldown: 0
		}).appendTo(this.panel);
				new Button.Button({
			id: 'drawTenButton',
			text: _("十连"),
			click: PenPen.drawTen,
			width: '80px',
			cooldown: 0
		}).appendTo(this.panel);
		
		Engine.updateSlider();
		
		//subscribe to stateUpdates
		$.Dispatch('stateUpdate').subscribe(Path.handleStateUpdates);
	},
	
	updateGameArea: function() {
		var gameArea = $('div#gameArea');
			var store = carryable[k];
			var have = $SM.get('stores["'+k+'"]');
			var num = Path.outfit[k];
			num = typeof num == 'number' ? num : 0;
			var numAvailable = $SM.get('stores["'+k+'"]', true);
			var row = $('div#outfit_row_' + k.replace(' ', '-'), outfit);
			if((store.type == 'tool' || store.type == 'weapon') && have > 0) {
				total += num * Path.getWeight(k);
				if(row.length == 0) {
					row = Path.createOutfittingRow(k, num, store.name);
					
					var curPrev = null;
					outfit.children().each(function(i) {
						var child = $(this);
						if(child.attr('id').indexOf('outfit_row_') == 0) {
							var cName = child.attr('id').substring(11).replace('-', ' ');
							if(cName < k && (curPrev == null || cName > curPrev)) {
								curPrev = cName;
							}
						}
					});
					if(curPrev == null) {
						row.insertAfter(wRow);
					} 
					else 
					{
						row.insertAfter(outfit.find('#outfit_row_' + curPrev.replace(' ', '-')));
					}
				} else {
					$('div#' + row.attr('id') + ' > div.row_val > span', outfit).text(num);
					$('div#' + row.attr('id') + ' .tooltip .numAvailable', outfit).text(numAvailable - num);
				}
				if(num == 0) {
					$('.dnBtn', row).addClass('disabled');
					$('.dnManyBtn', row).addClass('disabled');
				} else {
					$('.dnBtn', row).removeClass('disabled');
					$('.dnManyBtn', row).removeClass('disabled');
				}
				if(num >= numAvailable || space < Path.getWeight(k)) {
					$('.upBtn', row).addClass('disabled');
					$('.upManyBtn', row).addClass('disabled');
				} else if(space >= Path.getWeight(k)) {
					$('.upBtn', row).removeClass('disabled');
					$('.upManyBtn', row).removeClass('disabled');
				}
			} else if(have == 0 && row.length > 0) {
				row.remove();
			}
		}
		
	},

	drawOne: function() {
		draw(1);
	},
	
	drawTen: function() {
		draw(10);
	},
	
	draw: function(num) {
		
	},
	
	handleStateUpdates: function(e){
		if(e.category == 'stores'){

		} 
	}
};