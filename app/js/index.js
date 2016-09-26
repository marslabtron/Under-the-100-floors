var gameController = {
	_animation: null,
	_canvasWidth: 0,
	_canvasHeight: 0,
	_currentFloor: 0,
	_floorWidth: 90,
	_floorDeltaY: 50,
	_speed: 50, //pixel per second
	_$canvas: $('.canvas'),
	_$scroller: $('.scroller'),
	_$people: $('.people'),
	_peopleSpeed: 50, //pixel per second
	_peopleVerticalSpeed: 100, //pixel per second
	_scrollerHeight: $('.scroller').height(),
	__currentScrollerY: 0,
	__currentPeopleY: 0,
	__currentPeopleVertical: 0,
	__frameIndex: 0,
	createFloorSpan: function() {
		this._currentFloor++;
		//计算楼梯位置，200px 刚开始从距离顶部200px开始
		var _top = this._currentFloor * this._floorDeltaY + 200,
			//楼梯横向位置随机出现
			_left = Math.random() * (this._canvasWidth - this._floorWidth);
		$('<i class="floor"></i>').css({
			top: _top,
			left: _left
		}).appendTo(this._$scroller);
	},
	removeFloorSpan: function() {
		$('.floor').eq(0).remove();
	},
	people: function(fps) {
		//人物纵向每帧移动距离
		var _deltaPeopleY = this._peopleSpeed / fps;
		//人物横向每帧移动距离
		var _deltaPeopleVertical = this._peopleVerticalSpeed / fps;
		//当前人物纵向位置
		this.__currentPeopleY += _deltaPeopleY;
		//设定纵向位置
		this._$people.css({
			top: this.__currentPeopleY
		});
		//处理人物向左运动
		if(this._peopleGoLeft) {
			if (this.__currentPeopleVertical <= 0) {
				return;
			}
			this.__currentPeopleVertical -= _deltaPeopleVertical;
			this._$people.css({
				left: this.__currentPeopleVertical
			});
		}
		//处理人物向右运动
		if(this._peopleGoRight) {
			if (this.__currentPeopleVertical >= this._canvasWidth - 15) {
				return;
			}
			this.__currentPeopleVertical += _deltaPeopleVertical;
			this._$people.css({
				left: this.__currentPeopleVertical
			});
		}
	},
	peopleUserController: function() {
		var _this = this;
		//监听按键按下，改变人物左右运动方向
		$(window).keydown(function(ev) {
			console.log(ev.key);
			if(ev.key == 'ArrowRight') {
				_this._peopleGoRight = true;
				_this._peopleGoLeft = false;//预防按键同时按下的冲突情况 
				return;
			}
			if(ev.key == 'ArrowLeft') {
				_this._peopleGoRight = false;//预防按键同时按下的冲突情况
				_this._peopleGoLeft = true;
				return;
			}
		});

		//按键弹起，取消该方向人物运动
		$(window).keyup(function(ev) {
			if(ev.key == 'ArrowRight') {
				_this._peopleGoRight = false;
				return;
			}
			if(ev.key == 'ArrowLeft') {
				_this._peopleGoLeft = false;
				return;
			}
		});
	},
	core: function(fps) {
		// console.log('i');
		var _this = this,
			_deltaY = this._speed / fps, //卷轴纵向每帧移动距离
			framePerFloor = (this._floorDeltaY / _deltaY); //每层台阶移动所需帧数
		//计算总帧数
		this.__frameIndex++;

		//计算卷轴位置
		this.__currentScrollerY -= _deltaY;

		//使用3D变换来移动卷轴（启用GPU加速）
		this._$scroller.css({
			'transform': 'translate3d(0, '+ _this.__currentScrollerY + 'px, 0)',
		});

		//每个台阶移出视野则清除台阶，并且在底部增加一个新的台阶
		if(this.__frameIndex > framePerFloor * 6 && this.__frameIndex % framePerFloor == 0) {
			this.createFloorSpan();
			this.removeFloorSpan();
		}

		//调用人物渲染
		this.people(fps);

	},
	run: function(fps) {
		//不允许执行多个动画渲染函数（你想卡死么！
		if(this._animation) {
			console.error('Animation is aready in process please do not run again!');
			return ;
		}

		fps = fps || 60;
		var looptime = 1000 / fps, //每帧间隔时间
			_this = this;

		//循环调用渲染函数，并把循环handle暴露出去，方便外部暂停动画
		return this._animation = setInterval(function() {
			_this.core(fps);
		}, looptime);
	},
	stop: function() {
		clearInterval(this._animation);//暂停动画
	},
	init: function() {
		var _this = this,
			floorLoop = 0;

		//当视窗大小变动时，重新计算画布宽高
		$(window).resize(function() {
			_this._canvasWidth = _this._$canvas.width();
			_this._canvasHeight = _this._$canvas.height();
		});
		_this._canvasWidth = $('.canvas').width();
		_this._canvasHeight = _this._$canvas.height();

		//初始化台阶
		while(floorLoop++ < 13) {
			this.createFloorSpan();
		}

		//初始化任务控制
		this.peopleUserController();

		//以每秒60帧执行游戏动画
		this.run(60);
	}
};

$(function() {
	gameController.init();
});