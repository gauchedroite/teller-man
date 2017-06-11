/// <reference path="helpers.ts" />
/// <reference path="webgl-runner.ts" />
/// <reference path="igame-data.ts" />
/// <reference path="iinstance.ts" />

class GameMan implements IGameManInstance {
    runner: WebglRunner;

    constructor() {
        (<any>window).GameManInstance = this;
    }

    initialize = (frameSrc: string) => {
        let me = this;
        let game: IGameInstance;
        let confirming = false;

        FastClick.attach(document.body);

        this.runner = new WebglRunner("vertex-shader", "fragment-shader");
        this.runner.run();

        // Set main game url
        let gameFrame = <HTMLIFrameElement>document.getElementById("game-frame");
        gameFrame.setAttribute("src", frameSrc);

        const switchToGame = () => {
            me.runner.pause();

            document.body.classList.remove("show-menu");
            document.body.classList.add("show-game");

            let gameFrame = <HTMLIFrameElement>document.getElementById("game-frame");
            game = (<any>gameFrame.contentWindow).GameInstance;
            game.startGame();
        };

        // START button
        document.querySelector(".start-inner").addEventListener("click", switchToGame);

        // PLAY button
        document.querySelector(".play").addEventListener("click", () => {
            me.runner.pause();
            document.body.classList.remove("show-menu");
            document.body.classList.add("show-game");
            game.resumeGame();
        });

        // NEW GAME button
        document.querySelector(".new-game button").addEventListener("click", (e) => {
            if (confirming) {
                me.runner.pause();
                game.clearAllGameData();
                location.reload(true);
            }
            else {
                let button = document.querySelector(".new-game button");
                button.classList.add("confirm");
                (<HTMLDivElement>button.querySelector("div.text")).innerText = "Votre progrès sera effacé. OK?";
                confirming = true;
            }
            e.stopPropagation();
        });

        // Whole screen
        document.querySelector(".menu-wrap").addEventListener("click", () => {
            let button = document.querySelector(".new-game button");
            button.classList.remove("confirm");
            (<HTMLDivElement>button.querySelector("div.text")).innerText = "Nouvelle partie";
            confirming = false;
        });


        let autoStart = false;
        if (autoStart) {
            setTimeout(switchToGame, 500);
        }
    };

    // Proxy this call from the game frame to the IDE (if there's one)
    raiseActionEvent = (op: any, param?: any) => {
        if (window != window.top) 
            (<any>window.parent).onAction(op, param);
    };


    // Called from the game frame
    showMenu = () => {
        this.runner.resume();
        document.body.classList.remove("show-game");
        document.body.classList.add("show-menu");
    };




    christian = () => {
        this.christian_async();
    };

    delay = (ms: number) => {
        return new Promise<string>(resolve => setTimeout(() => { resolve("yo"); }, ms));
    };

    christian_trad = () => {
        console.log("TRAD");
        (function looper(i: number, callback: () => void) {
            setTimeout(function loop() {
                console.log(i);
                i--;
                if (i > 0) 
                    setTimeout(loop, 500);
                else
                    callback();
            }, 500);
        })(3, () => {
            console.log("world");
        });
    };

    christian_promises = () => {
        console.log("PROMISE");
        let me = this;
        (function loop(i) {
            if (i < 3) {
                me.delay(500).then(() => {
                    console.log(i + 1);
                    loop(i + 1);
                });
            }
            else {
                console.log("World!");
            }
        })(0);
    };

    async christian_async() {
        console.log("ASYNC");

        for (let i = 0; i < 3; i++) {
            let yo = await this.delay(500);
            console.log(`${yo} ${i}`);
        }

        console.log("world!");
    };
}
