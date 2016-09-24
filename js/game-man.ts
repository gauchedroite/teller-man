/// <reference path="webgl-runner.ts" />

class GameMan {
    runner: WebglRunner;

    constructor() {
        (<any>window).GameManInstance = this;
    }

    initialize = () => {
        let me = this;
        let game: any; //<Game>

        this.runner = new WebglRunner("vertex-shader", "fragment-shader");
        this.runner.run();

        // We have to manually set the iframe source otherwise Chrome will get mixed up because the page and the frame use the same css. 
        setTimeout(function() {
            document.querySelector(".primo-limbo").classList.remove("hidden");
            let gameFrame = <HTMLIFrameElement>document.getElementById("game-frame");
            gameFrame.setAttribute("src", "main.html");
        }, 500);

        // START button
        document.querySelector(".start").addEventListener("click", () => {
            me.runner.pause();

            document.querySelector(".menu").classList.remove("hidden");
            document.querySelector(".primo-limbo").classList.add("hidden");

            let gameFrame = <HTMLIFrameElement>document.getElementById("game-frame");
            game = (<any>gameFrame.contentWindow).GameInstance;
            game.startGame();
        });

        // PLAY button
        document.querySelector(".play").addEventListener("click", () => {
            me.runner.pause();
            document.querySelector(".menu").classList.remove("zoome");
            game.resumeGame();
        });
    };

    // Proxy this call from the game frame to the IDE (if there's one)
    raiseActionEvent = (op: any, param?: any) => {
        if (window != window.top) 
            (<any>window.parent).onAction(op, param);
    };


    // Called from the game frame
    showMenu = () => {
        this.runner.resume();
        document.querySelector(".menu").classList.add("zoome");
    };
}
