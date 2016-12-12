/// <reference path="webgl-runner.ts" />

class GameMan {
    runner: WebglRunner;

    constructor() {
        (<any>window).GameManInstance = this;
    }

    initialize = () => {
        let me = this;
        let game: any; //<Game>
        let confirming = false;

        this.runner = new WebglRunner("vertex-shader", "fragment-shader");
        this.runner.run();

        // Set main game url
        document.querySelector(".primo-limbo").classList.remove("hidden");
        let gameFrame = <HTMLIFrameElement>document.getElementById("game-frame");
        gameFrame.setAttribute("src", "main.html");

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

        // NEW GAME button
        document.querySelector(".new-game div").addEventListener("click", (e) => {
            if (confirming) {
                me.runner.pause();
                game.clearAllGameData();
                location.reload(true);
            }
            else {
                let div = document.querySelector(".new-game div");
                div.classList.add("confirm");
                div.querySelector("h3").innerText = "Votre progrès sera effacé. OK?";
                confirming = true;
            }
            e.stopPropagation();
        });

        // Whole screen
        document.querySelector(".menu-wrap").addEventListener("click", () => {
            let div = document.querySelector(".new-game div");
            div.classList.remove("confirm");
            div.querySelector("h3").innerText = "Nouvelle partie";
            confirming = false;
        });


        let autoStart = true;
        if (autoStart) {
            setTimeout(() => {
                me.runner.pause();

                document.querySelector(".menu").classList.remove("hidden");
                document.querySelector(".primo-limbo").classList.add("hidden");

                let gameFrame = <HTMLIFrameElement>document.getElementById("game-frame");
                game = (<any>gameFrame.contentWindow).GameInstance;
                game.startGame();
            }, 500);
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
        document.querySelector(".menu").classList.add("zoome");
    };




    christian = () => {
        this.christian_async();
    };

    delay = (ms: number) => {
        return new Promise<void>(resolve => setTimeout(resolve, ms));
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
            await this.delay(500);
            console.log(i);
        }

        console.log("world!");
    };
}
