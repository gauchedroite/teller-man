
class Tide {
    constructor () {

        var ied = <HTMLElement>document.querySelector("div.ide-editor");
        var igame = <HTMLElement>document.querySelector("div.ide-game");

        var gdata = new GameData();
        var options = gdata.options;
        if (options == undefined) {
            options = <IOptions> { skipFileLoad: false };
            gdata.options = options;
        }

        document.getElementById("ide-play-edit").addEventListener("click", (e) => {
            if (ied.classList.contains("show"))
                ied.classList.remove("show");
            else
                ied.classList.add("show");
        });

        document.getElementById("ide-gamefile").addEventListener("click", (e) => {
            var checked = (<any>e.target).checked;
            var options = gdata.options;
            options.skipFileLoad = checked;
            gdata.options = options;
        });

        (<any>document.getElementById("ide-gamefile")).checked = options.skipFileLoad;

        window.addEventListener("storage", (e: StorageEvent) => {
            if (e.key == "state") {
                var table = <HTMLTableElement>document.querySelector("div.debug-content table");

                for (var i = table.rows.length - 1; i >= 0; i--)
                    table.deleteRow(i);

                var thead = table.createTHead();
                var row = thead.insertRow(0);
                row.insertCell(0).innerText = "Name";
                row.insertCell(1).innerText = "Value";

                var nv = JSON.parse(<any>e.newValue);
                console.log(nv);

                var tbody = table.createTBody();
                var rownum = 0;
                for (var property in nv) {
                    row = tbody.insertRow(rownum++);
                    row.insertCell(0).innerText = property;
                    row.insertCell(1).innerText = nv[property];
                }
            }
        });

        // Load the iframes at run time to make sure the ide is fully loaded first.
        igame.querySelector("iframe").setAttribute("src", "index.html");
        ied.querySelector("iframe").setAttribute("src", "index-edit.html");
    }
}
