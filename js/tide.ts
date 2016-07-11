
class Tide {
    constructor () {

        var ied = <HTMLElement>document.querySelector("div.ide-editor");
        var igame = <HTMLElement>document.querySelector("div.ide-game");
        var gameFile = <HTMLInputElement>document.getElementById("ide-gamefile");
        var startClean = <HTMLInputElement>document.getElementById("ide-start");

        document.getElementById("ide-play-edit").addEventListener("click", (e) => {
            if (ied.classList.contains("show"))
                ied.classList.remove("show");
            else
                ied.classList.add("show");
        });

        // (<any>document).getQaz = () => { return qaz; }; //from tide
        //
        // if (window != window.top) { //from embedded iframe
        //	 qaz = (<any>window.parent.document).getQaz();

        var gdata = new GameData();
        gdata.options = <IdeOptions> {
            useGameFile: false,
            startingNewGame: false
        };

        // Load the iframes at run time to make sure the ide is fully loaded first.
        igame.querySelector("iframe").setAttribute("src", "index.html");
        ied.querySelector("iframe").setAttribute("src", "index-edit.html");
    }
}
