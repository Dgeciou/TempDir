var PenPen = {
	name: 'PenPen',
	options: {}, // Nuthin'
	
	gameTimes: 0,
	indexs: [-1,1,2,3,4,-1,-1,-1,-1],
	
	weight: {
		'wood': 204000,
		'fur': 204000,
		'meat': 204000,
		'bait': 102000,
		'leather': 34000,
		'cured meat': 18545,
		'sulphur': 17000,
		'scales': 1360,
		'teeth': 680,
		'iron': 26,
		'coal': 13,
		'steel': 9,
		'medicine': 12,
		'bullets': 136,
		'energy cell': 45,
		'bolas': 68,
		'grenade': 7,
		'bayonet': 1,
		'alien alloy': 1
	},
	
	randomId: function(weightMap)
	{
		if (weightMap.length <= 0)
			return "";

		var total = 0;
		var idList = new Array();
		for (var k in weightMap)
		{
			total += weightMap[k];
			idList.push(k);
		}

		var now = 0;
		var rate = Math.floor(Math.random() * total) + 1;
		for (var i = 0; i < idList.length; ++i)
		{
			var id = idList[i];
			now += weightMap[id];
			if (now >= rate)
				return id;
		}
		return "";
	},

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
		document.getElementById('gameArea').style.cssText = 'height: 220px; width: 420px; margin-bottom: 50px; overflow: hidden; display: flex; align-items: flex-end; justify-content: space-between;';
		var grid = $('<div>').attr('id', 'grid').appendTo(gameArea);	
		document.getElementById('grid').style.cssText = 'display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 0; height: 212px; width: 212px; border: 1px solid black;';
		var order = [1,2,3,4,0,5,6,7,8];
		for (var j in order)
		{
			var i = order[j];
			var t = PenPen.number2Emoji(PenPen.indexs[i]);
			$('<div>').attr('id', 'cell_' + i).text(t).appendTo(grid);	
			document.getElementById('cell_' + i).style.cssText = 'aspect-ratio: 1; display: flex; justify-content: center; align-items: center; font-size: 2.5rem; border: 1px solid black;';
		}
		var createArea = $('<div>').appendTo(gameArea);
		var box = $('<div>').attr('id', 'box').text('?').appendTo(createArea);
		document.getElementById('box').style.cssText = 'height: 70px; width: 70px; aspect-ratio: 1; display: flex; justify-content: center; align-items: center; font-size: 2.5rem; border: 2px solid black;';
		var boxNum = $('<div>').attr('id', 'boxNum').text(_('盲盒数量：{0}', PenPen.gameTimes)).appendTo(createArea);
		document.getElementById('boxNum').style.cssText = 'text-align: center; font-size: 0.8rem;';
		
		var buttonBox = $('<div>').attr('id', 'buttonBox').appendTo(this.panel);	
		document.getElementById('buttonBox').style.cssText = 'display: grid; grid-template-columns: repeat(2, 1fr); width: 300px;';
		// Add the draw button
		new Button.Button({
			id: 'drawOneButton',
			text: _('wood') + '*10' + String.fromCharCode(10) + '单抽',
			click: PenPen.drawOne,
			width: '80px',
			cooldown: 0
		}).appendTo(buttonBox).css('text-align', 'center').css('white-space', 'pre-line');
		
		new Button.Button({
			id: 'drawTenButton',
			text: _('wood') + '*100' + String.fromCharCode(10) + '十连',
			click: PenPen.drawTen,
			width: '80px',
			cooldown: 0
		}).appendTo(buttonBox).css('text-align', 'center').css('white-space', 'pre-line');
		
		Engine.updateSlider();
		
		//subscribe to stateUpdates
		$.Dispatch('stateUpdate').subscribe(PenPen.handleStateUpdates);
	},
	
	updateGameArea: function() {
		var gameArea = $('div#gameArea');
		for (var i = 0; i < PenPen.indexs.length; i++)
		{
			var t = PenPen.number2Emoji(PenPen.indexs[i]);
			$('div#cell_' + i, gameArea).text(t);
		}
		PenPen.checkBtn();
	},
	
	number2Emoji: function(num)
	{
		var text = "";
		switch(num)
		{
			case 1:
				text = '🍺';
			break;
			case 2:
				text = '🎂';
			break;
			case 3:
				text = '🌹';
			break;
			case 4:
				text = '🌙';
			break;
			case 5:
				text = '☀️';
			break;
			case 6:
				text = '🀄';
			break;
			case 7:
				text = '️🎆';
			break;
			case 8:
				text = '🧧';
			break;
			case 9:
				text = '🎁';
			break;
		}
		return text;
	},
	
    flyEmojiToCell: function(emoji, cellId, callback) {
		const box = document.getElementById('box');
		const targetCell = document.getElementById(`cell_${cellId}`);
		
		// 创建飞行表情元素
		const flyingEmoji = document.createElement('div');
		flyingEmoji.style.cssText = 'position: absolute; font-size: 2.5rem; z-index: 10;';
		box.textContent = emoji;
		
		// 获取起始位置（box的位置）
		const boxRect = box.getBoundingClientRect();
		const startX = boxRect.left + 10;
		const startY = boxRect.top + 10;
		
		// 获取目标位置（单元格的位置）
		const targetRect = targetCell.getBoundingClientRect();
		const targetX = targetRect.left + 10;
		const targetY = targetRect.top + 10;
		
		// 设置飞行表情的初始位置
		flyingEmoji.style.left = `${startX}px`;
		flyingEmoji.style.top = `${startY}px`;
		document.body.appendChild(flyingEmoji);
		
		// 执行动画
		flyingEmoji.animate([
			{ transform: `translate(0, 0)`},
			{ transform: `translate(0, 0)`}
		], {
			duration: 200,
		}).onfinish = function(){
			box.textContent = '?';
			flyingEmoji.textContent = emoji;
			flyingEmoji.animate([
				{ transform: `translate(0, 0)`},
				{ transform: `translate(${targetX - startX}px, ${targetY - startY}px)`}
			], {
				duration: 400,
			}).onfinish = function(){
				targetCell.textContent = emoji;
				flyingEmoji.remove();
				callback();
			};
		};
	},
	
	changeTimes: function(num){
		PenPen.gameTimes += num;
		document.getElementById('boxNum').textContent = _('盲盒数量：{0}', PenPen.gameTimes);
	},
	
	checkBtn: function(){
		var can = $SM.get('stores.wood', true) > 10;
		Button.setDisabled($('#drawOneButton'), !can);
		var can = $SM.get('stores.wood', true) >= 100;
		Button.setDisabled($('#drawTenButton'), !can);
	},
	
	createEmoji: function(){
		// 生成
		// 1 2 3
		// 4 0 5
		// 6 7 8
		for (var i = 0; i < 9 && PenPen.gameTimes > 0; i ++)
		{
			if (PenPen.indexs[i] > 0) continue;
			PenPen.indexs[i] = Math.floor(Math.random() * 9) + 1;
			PenPen.changeTimes(-1);
			var t = PenPen.number2Emoji(PenPen.indexs[i]);
			PenPen.flyEmojiToCell(t, i, PenPen.createEmoji);
			return;
		}
		PenPen.allClear();
	},
	
	drawOne: function()
	{	
		PenPen.draw(1);
	},
	
	drawTen: function() {
		PenPen.draw(10);
	},
	
	running : false,
	draw: function(num) {
		if (PenPen.running)
		{
			return;
		}
		
		var have = $SM.get('stores.wood', true);
		if(have < num * 10) 
		{
			return;
		}
		$SM.set('stores.wood', have - num * 10);
		PenPen.checkBtn();
		
		PenPen.running = true;
		PenPen.changeTimes(num);		
		PenPen.createEmoji();
	},
	
	randomReward: function(num){
		var map = {};
		for(var i = 0; i < num; i++)
		{
			var id = PenPen.randomId(PenPen.weight);
			if (id != "")
			{
				$SM.add('stores["' + id + '"]', 1);
				if (map[id])
					map[id] += 1;
				else
					map[id] = 1;
			}
		}
		for (var k in map)
		{
			Notifications.notify(PenPen, _('获得物品：{0}*{1}', _(k), map[k]));	
		}
	},
		
	allClear: function() {
		//是否全清
		var isAll = true;
		var checkMap = {}
		for (var i = 0; i < PenPen.indexs.length; i ++)
		{
			var num = PenPen.indexs[i];
			if (num <= 0 || checkMap[num])
			{
				isAll = false;
				break;
			}
			checkMap[num] = true;
		}
		if (isAll)
		{
			//移除所有 
			var arr = []; 
			for (var i = 0; i < PenPen.indexs.length; i++)
			{
				if (PenPen.indexs[i] > 0)
					arr.push(i);
				PenPen.indexs[i] = -1;
			}
			PenPen.changeTimes(5);
			PenPen.randomReward(6);
			PenPen.matchAnimate(arr, PenPen.allClear);
			return;
		}
		PenPen.sanLian();
	},
	
	sanLian: function(){
		//三连
		// 竖
		var perpIndex = [[ 1, 4, 6 ], [ 2, 0, 7 ], [ 3, 5, 8 ]];                            
		// 横
		var horiIndex = [[ 1, 2, 3 ], [ 4, 0, 5 ], [ 6, 7, 8 ]]; 
		// 竖
		var perpNum = 0;
		for (var i = 0; i < perpIndex.length; i++)
		{
			var arr = perpIndex[i];
			if (PenPen.indexs[arr[0]] > 0 && PenPen.indexs[arr[0]] == PenPen.indexs[arr[1]] && PenPen.indexs[arr[0]] == PenPen.indexs[arr[2]])
			{
				perpNum += 1;
			}
		}
		// 横
		var horiNum = 0;
		for (var i = 0; i < horiIndex.length; i++)
		{
			var arr = horiIndex[i];
			if (PenPen.indexs[arr[0]] > 0 && PenPen.indexs[arr[0]] == PenPen.indexs[arr[1]] && PenPen.indexs[arr[0]] == PenPen.indexs[arr[2]])
			{
				horiNum += 1;
			}
		}                            
		var first = perpNum >= horiNum; // ture竖先，false横先
		for (var i = 0; i < 2; i++)
		{
			for (var j = 0; j < 3; j++)
			{
				var arr = first ? perpIndex[j] : horiIndex[j];
				if (PenPen.indexs[arr[0]] > 0 && PenPen.indexs[arr[0]] == PenPen.indexs[arr[1]] && PenPen.indexs[arr[0]] == PenPen.indexs[arr[2]])
				{
					PenPen.indexs[arr[0]] = -1;
					PenPen.indexs[arr[1]] = -1;
					PenPen.indexs[arr[2]] = -1;
					PenPen.changeTimes(3);
					PenPen.randomReward(2);
					PenPen.matchAnimate(arr, PenPen.sanLian);
					return;
				}
			}
			first = !first;
		}
		// 斜
		var biasIndex = [[ 1, 0, 8], [ 3, 0, 6]];
		for (var i = 0; i < biasIndex.length; i++)
		{
			var arr = biasIndex[i];
			if (PenPen.indexs[arr[0]] > 0 && PenPen.indexs[arr[0]] == PenPen.indexs[arr[1]] && PenPen.indexs[arr[0]] == PenPen.indexs[arr[2]])
			{
				PenPen.indexs[arr[0]] = -1;
				PenPen.indexs[arr[1]] = -1;
				PenPen.indexs[arr[2]] = -1;
				PenPen.changeTimes(3);
				PenPen.randomReward(2);
				PenPen.matchAnimate(arr, PenPen.sanLian);
				return;
			}
		}
		PenPen.penpen();
	},
	
	penpen: function(){
		//碰碰
		var map = {};
		for (var j = 0; j < PenPen.indexs.length; j++)
		{
			var num = PenPen.indexs[j];
			if (num <= 0)
				continue;
			if (map[num] >= 0)
			{          
				var arr = [j, map[num]]; 
				PenPen.indexs[j] = -1;		
				PenPen.indexs[map[num]] = -1;								
				map[num] = -1;
				PenPen.changeTimes(1);
				PenPen.randomReward(1);
				PenPen.matchAnimate(arr, PenPen.penpen);
				return;
			}
			else
			{
				map[num] = j;
			}                      
		}
		if (PenPen.gameTimes > 0)
			PenPen.createEmoji();
		else
			PenPen.running = false;
	},
	
	matchAnimate: function(matchArr, callback){
		for (var i = 0; i < matchArr.length; i++)
		{
			const targetCell = document.getElementById(`cell_${matchArr[i]}`);
			// 创建飞行表情元素
			const flyingEmoji = document.createElement('div');
			flyingEmoji.style.cssText = 'position: absolute; font-size: 2.5rem; z-index: 10;';
			// 获取起始位置
			const targetRect = targetCell.getBoundingClientRect();
			const startX = targetRect.left + 10;
			const startY = targetRect.top + 10;			
			// 设置飞行表情的初始位置
			flyingEmoji.style.left = `${startX}px`;
			flyingEmoji.style.top = `${startY}px`;
			document.body.appendChild(flyingEmoji);
			
			// 执行动画
			flyingEmoji.textContent = targetCell.textContent;
			targetCell.textContent = "";
			flyingEmoji.animate([
				{ transform: `translate(0, 0)`},
				{ transform: `translate(0, -30px)`}
			], {
				duration: 500,
			}).onfinish = function(){
				flyingEmoji.remove();
			};
		}
		setTimeout(callback, 500);
	},
	
	onArrival: function() {
		PenPen.updateGameArea();
	},
	
	handleStateUpdates: function(e){
		if(e.category == 'stores' || e.category == 'income'){
			PenPen.checkBtn();
		} 
	}
};
PenPen.init();
