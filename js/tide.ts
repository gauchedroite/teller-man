/// <reference path="game-data.ts" />
/// <reference path="igame.ts" />
/// <reference path="editor.ts" />
/// <reference path="game.ts" />

namespace TellerMan {
    document.addEventListener('DOMContentLoaded', function () {
        var ide = new Tide();
    }, false);
}

class Tide {

    prevState: any;

    constructor () {

        var ied = <HTMLElement>document.querySelector("div.ide-editor");
        var igame = <HTMLElement>document.querySelector("div.ide-game");

        var gdata = new GameData();
        var options = gdata.options;
        if (options == undefined) {
            options = <IOptions> { skipFileLoad: false, syncEditor: true };
            gdata.options = options;
        }

        document.getElementById("ide-gamefile").addEventListener("click", (e) => {
            var checked = (<any>e.target).checked;
            var options = gdata.options;
            options.skipFileLoad = checked;
            gdata.options = options;
        });

        document.getElementById("ide-sync").addEventListener("click", (e) => {
            var checked = (<any>e.target).checked;
            var options = gdata.options;
            options.syncEditor = checked;
            gdata.options = options;
        });

        document.getElementById("ide-fast").addEventListener("click", (e) => {
            var checked = (<any>e.target).checked;
            var options = gdata.options;
            options.fastStory = checked;
            gdata.options = options;
        });

        document.getElementById("ide-res-iphone").addEventListener("click", (e) => {
            let game = document.querySelector(".ide-game");
            if (game.classList.contains("iphone"))
                game.classList.remove("iphone");
            else
                game.classList.add("iphone");
        });

        document.getElementById("ide-play-edit").addEventListener("click", (e) => {
            if (ied.classList.contains("show"))
                ied.classList.remove("show");
            else
                ied.classList.add("show");
        });

        document.getElementById("ide-reload-game").addEventListener("click", (e) => {
             igame.querySelector("iframe").setAttribute("src", "dist/index.html");
        });

        document.getElementById("ide-reload-editor").addEventListener("click", (e) => {
             ied.querySelector("iframe").setAttribute("src", "index-edit.html");
        });

        document.querySelector(".debug-state a").addEventListener("click", (e) => {
            var link = <HTMLLinkElement>e.target;
            var div = <HTMLDivElement>link.nextElementSibling;
            if (div.classList.contains("hidden") == false) {
                div.classList.add("hidden");
                return;
            }
            div.classList.remove("hidden");
            let text = JSON.stringify(gdata.state);
            let textarea = <HTMLTextAreaElement>div.getElementsByTagName("textarea")[0];
            textarea.value = text;
        });

        document.getElementById("ide-save-state").addEventListener("click", (e) => {
            var button = <HTMLButtonElement>e.target;
            var textarea = <HTMLTextAreaElement>button.previousElementSibling;
            var div = <HTMLDivElement>textarea.parentElement;
            div.classList.add("hidden");
            gdata.state = JSON.parse(textarea.value);
            this.action(OpAction.SHOWING_CHOICES);
        });

        (<any>window).onAction = this.action;

        (<any>document.getElementById("ide-gamefile")).checked = options.skipFileLoad;
        (<any>document.getElementById("ide-sync")).checked = options.syncEditor;
        (<any>document.getElementById("ide-fast")).checked = options.fastStory;


        // Load the iframes at run time to make sure the ide is fully loaded first.
        igame.querySelector("iframe").setAttribute("src", "dist/index.html");
        ied.querySelector("iframe").setAttribute("src", "index-edit.html");
    }


    action = (op: OpAction, param?: any) => {
        if (op == OpAction.SHOWING_CHOICES) {
            var state = new GameData().state;

            interface IProp { name: string, prev: any, now: any };
            var all = new Array<IProp>();
            for (var property in this.prevState) {
                all.push({ name: property, prev: this.prevState[property], now: undefined });
            }
            for (var property in state) {
                var found = false;
                for (var prev of all) {
                    if (prev.name == property) {
                        prev.now = state[property];
                        found = true;
                        break;
                    }
                }
                if (found) continue;
                all.push({ name: property, prev: undefined, now: state[property] });
            }
            all.sort((a: IProp, b: IProp) => { return a.name.localeCompare(b.name); });

            let div = <HTMLDivElement>document.querySelector("div.debug-content");
            div.classList.remove("hidden");
            var table = div.getElementsByTagName("table")[0];
            for (var i = table.rows.length - 1; i >= 0; i--)
                table.deleteRow(i);

            var thead = table.createTHead();
            var row = thead.insertRow(0);
            row.insertCell(0).innerText = "Name";
            row.insertCell(1).innerText = "Value";

            var tbody = table.createTBody();
            var rownum = 0;
            for (var one of all) {
                row = tbody.insertRow(rownum++);
                row.insertCell(0).innerText = one.name;
                var cell = row.insertCell(1);
                cell.innerText = one.now;
                if (one.prev == undefined) {
                    row.className = "new";
                }
                else if (one.now == undefined) {
                    cell.innerText = one.prev;
                    row.className = "deleted";
                }
                else if (one.prev != one.now) {
                    row.className = "changed";
                    cell.title = `previous value: ${one.prev}`;
                }
            }

            this.prevState = JSON.parse(JSON.stringify(state));
        }
        else if (op == OpAction.GAME_START) {
            this.prevState = {};

            let div = <HTMLDivElement>document.querySelector("div.debug-content");
            div.classList.add("hidden");
            var table = div.getElementsByTagName("table")[0];
            for (var i = table.rows.length - 1; i >= 0; i--)
                table.deleteRow(i);
        }
        else if (op == OpAction.SHOWING_MOMENT) {
            if ((<any>document.getElementById("ide-sync")).checked) {
                let iframe = <HTMLIFrameElement>document.querySelector("div.ide-editor iframe");
                let editor = <Editor>(<any>iframe.contentWindow).EditorInstance;
                let moment = <IMoment>param;
                editor.gotoMoment(moment);

                let whens = Game.getWhens(moment.when);
                let divs = Array.prototype.map.call(whens, function (when:string) {
                    return `<div>${when}</div>`;
                })
                document.getElementById("id-when").innerHTML = divs.join("");

                var cmds = Game.getCommands(moment.text);
                divs = Array.prototype.map.call(cmds, function (cmd:string) {
                    return `<div>${cmd}</div>`;
                })
                document.getElementById("id-command").innerHTML = divs.join("");
            }
        }
    };
}
