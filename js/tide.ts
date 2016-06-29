
class Tide {
    constructor () {

        var ied = <HTMLElement>document.querySelector("div.ide-editor");
        var igame = <HTMLElement>document.querySelector("div.ide-game");
        
        (<any>window).gameClicked = function () {
            console.log("from game");
            ied.style.zIndex = "1";
            igame.style.zIndex = "2";
        };

        (<any>window).editorClicked = function () {
            console.log("from editor");
            ied.style.zIndex = "2";
            igame.style.zIndex = "1";
        };

        document.body.addEventListener("click", (e) => {
            console.log("tide");
            ied.style.zIndex = "1";
            igame.style.zIndex = "2";
        });

    }
}
