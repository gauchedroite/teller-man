/// <reference path="webgl-runner.ts" />
var GameMan = (function () {
    function GameMan() {
        var _this = this;
        this.initialize = function () {
            var me = _this;
            var game; //<Game>
            _this.runner = new WebglRunner("vertex-shader", "fragment-shader");
            _this.runner.run();
            // We have to manually set the iframe source otherwise Chrome will get mixed up because the page and the frame use the same css. 
            setTimeout(function () {
                document.querySelector(".primo-limbo").classList.remove("hidden");
                var gameFrame = document.getElementById("game-frame");
                gameFrame.setAttribute("src", "main.html");
            }, 500);
            // START button
            document.querySelector(".start").addEventListener("click", function () {
                me.runner.pause();
                document.querySelector(".menu").classList.remove("hidden");
                document.querySelector(".primo-limbo").classList.add("hidden");
                var gameFrame = document.getElementById("game-frame");
                game = gameFrame.contentWindow.GameInstance;
                game.startGame();
            });
            // PLAY button
            document.querySelector(".play").addEventListener("click", function () {
                me.runner.pause();
                document.querySelector(".menu").classList.remove("zoome");
                game.resumeGame();
            });
        };
        // Proxy this call from the game frame to the IDE (if there's one)
        this.raiseActionEvent = function (op, param) {
            if (window != window.top)
                window.parent.onAction(op, param);
        };
        // Called from the game frame
        this.showMenu = function () {
            _this.runner.resume();
            document.querySelector(".menu").classList.add("zoome");
        };
        window.GameManInstance = this;
    }
    return GameMan;
}());
