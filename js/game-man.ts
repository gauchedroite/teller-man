
class GameMan {
    runner: WebglRunner;

    constructor() {
        (<any>window).GameManInstance = this;
        let me = this;

        this.runner = new WebglRunner("vertex-shader", "fragment-shader");
        this.runner.run();

        let game: Game;

        document.querySelector(".start").addEventListener("click", () => {
            me.runner.pause();

            document.querySelector(".menu").classList.remove("display-none");
            document.querySelector(".primo-limbo").classList.add("display-none");

            let gameFrame = <HTMLIFrameElement>document.getElementById("game-frame");
            game = (<any>gameFrame.contentWindow).GameInstance;
            game.startGame();
        });

        document.querySelector(".play").addEventListener("click", () => {
            me.runner.pause();
            document.querySelector(".menu").classList.remove("zoome");
            game.resumeGame();
        });
    }

    raiseActionEvent = (op: OpAction, param?: any) => {
        if (window != window.top) 
            (<any>window.parent).onAction(op, param);
    };

    showMenu = () => {
        this.runner.resume();
        document.querySelector(".menu").classList.add("zoome");
    };
}
