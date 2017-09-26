var deadState = {
    preload: function() {
        game.load.image('continue_button','/public/images/continue_button.png');
    },
    create: function () {
        game.stage.setBackgroundColor(0xfbf6d5);

        text = game.add.text(game.world.centerX, 250, 'SCORE: ' + score);
        text.anchor.set(0.5);
        text.align = 'center';
        text.font = 'Arial Black';
        text.fontSize = 60;
        text.fontWeight = 'bold';
        text.fill = '#ec008c';
        text.setShadow(0, 0, 'rgba(0,0,0,0.5)', 0);
        game.input.mouse.releasePointerLock();

        button = game.add.button(game.world.centerX - 95, 400, 'continue_button', this.actionOnClick, this, 2, 1, 0);
    },
    update: function () {
        var offset = moveToXY(game.input.activePointer, text.x, text.y, 8);
        text.setShadow(offset.x, offset.y, 'rgba(0, 0, 0, 0.5)', distanceToPointer(text, game.input.activePointer) / 30);
    },
    actionOnClick: function() {
        game.state.start('mainmenu');
    }
}

function distanceToPointer(displayObject, pointer) {

    this._dx = displayObject.x - pointer.x;
    this._dy = displayObject.y - pointer.y;

    return Math.sqrt(this._dx * this._dx + this._dy * this._dy);

}

function moveToXY(displayObject, x, y, speed) {

    var _angle = Math.atan2(y - displayObject.y, x - displayObject.x);

    var x = Math.cos(_angle) * speed;
    var y = Math.sin(_angle) * speed;

    return {
        x: x,
        y: y
    };
}