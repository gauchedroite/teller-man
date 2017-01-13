var ChunkKind;
(function (ChunkKind) {
    ChunkKind[ChunkKind["dialog"] = 0] = "dialog";
    ChunkKind[ChunkKind["text"] = 1] = "text";
    ChunkKind[ChunkKind["background"] = 2] = "background";
    ChunkKind[ChunkKind["inline"] = 3] = "inline";
    ChunkKind[ChunkKind["heading"] = 4] = "heading";
    ChunkKind[ChunkKind["doo"] = 5] = "doo";
    ChunkKind[ChunkKind["minigame"] = 6] = "minigame";
    ChunkKind[ChunkKind["gameresult"] = 7] = "gameresult";
    ChunkKind[ChunkKind["waitclick"] = 8] = "waitclick";
})(ChunkKind || (ChunkKind = {}));
var Op;
(function (Op) {
    Op[Op["START_BLURBING"] = 0] = "START_BLURBING";
    Op[Op["BLURB"] = 1] = "BLURB";
    Op[Op["BUILD_CHOICES"] = 2] = "BUILD_CHOICES";
})(Op || (Op = {}));
var OpAction;
(function (OpAction) {
    OpAction[OpAction["SHOWING_CHOICES"] = 0] = "SHOWING_CHOICES";
    OpAction[OpAction["GAME_START"] = 1] = "GAME_START";
    OpAction[OpAction["SHOWING_MOMENT"] = 2] = "SHOWING_MOMENT";
})(OpAction || (OpAction = {}));
var Kind;
(function (Kind) {
    Kind[Kind["Moment"] = 0] = "Moment";
    Kind[Kind["Action"] = 1] = "Action";
    Kind[Kind["MessageTo"] = 2] = "MessageTo";
    Kind[Kind["MessageFrom"] = 3] = "MessageFrom";
})(Kind || (Kind = {}));
var AKind;
(function (AKind) {
    AKind[AKind["Player"] = 0] = "Player";
    AKind[AKind["NPC"] = 1] = "NPC";
})(AKind || (AKind = {}));
/// <reference path="igame-data.ts" />
/// <reference path="igame-data.ts" />
/// <reference path="igame.ts" />
var GameStorage = (function () {
    function GameStorage() {
        this.clearStorage = function () {
            localStorage.clear();
        };
    }
    Object.defineProperty(GameStorage.prototype, "game", {
        //
        // game
        //
        get: function () {
            return JSON.parse(localStorage.getItem("game"));
        },
        set: function (game) {
            localStorage.setItem("game", JSON.stringify(game));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameStorage.prototype, "situations", {
        //
        // situations
        //
        get: function () {
            return JSON.parse(localStorage.getItem("situations")) || [];
        },
        set: function (sits) {
            localStorage.setItem("situations", JSON.stringify(sits));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameStorage.prototype, "scenes", {
        //
        // scenes
        //
        get: function () {
            return JSON.parse(localStorage.getItem("scenes")) || [];
        },
        set: function (moms) {
            localStorage.setItem("scenes", JSON.stringify(moms));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameStorage.prototype, "actors", {
        //
        // actors
        //
        get: function () {
            return JSON.parse(localStorage.getItem("actors")) || [];
        },
        set: function (moms) {
            localStorage.setItem("actors", JSON.stringify(moms));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameStorage.prototype, "moments", {
        //
        // moments
        //
        get: function () {
            return JSON.parse(localStorage.getItem("moments")) || [];
        },
        set: function (moms) {
            localStorage.setItem("moments", JSON.stringify(moms));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameStorage.prototype, "state", {
        //
        // state
        //
        get: function () {
            return JSON.parse(localStorage.getItem("state"));
        },
        set: function (moms) {
            localStorage.setItem("state", JSON.stringify(moms));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameStorage.prototype, "history", {
        //
        // history
        //
        get: function () {
            return JSON.parse(localStorage.getItem("history"));
        },
        set: function (mids) {
            localStorage.setItem("history", JSON.stringify(mids));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameStorage.prototype, "options", {
        //
        // options
        //
        get: function () {
            return JSON.parse(localStorage.getItem("options"));
        },
        set: function (options) {
            localStorage.setItem("options", JSON.stringify(options));
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GameStorage.prototype, "continueState", {
        //
        // continue state
        //
        get: function () {
            return JSON.parse(localStorage.getItem("continueState"));
        },
        set: function (moms) {
            localStorage.setItem("continueState", JSON.stringify(moms));
        },
        enumerable: true,
        configurable: true
    });
    return GameStorage;
}());
;
if (!String.prototype.startsWith) {
    String.prototype.startsWith = function (searchString, position) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}
if (!String.prototype.endsWith) {
    String.prototype.endsWith = function (searchString, position) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}
/// <reference path="helpers.ts" />
;
var GameHelper = (function () {
    function GameHelper() {
    }
    return GameHelper;
}());
GameHelper.getCommands = function (text) {
    if (text == undefined)
        return [];
    var inComment = false;
    var commands = new Array();
    var parts = text.split("\n");
    for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
        var part = parts_1[_i];
        if (part.length > 0) {
            if (part.startsWith("/*")) {
                inComment = true;
            }
            else if (inComment) {
                inComment = (part.startsWith("*/") == false);
            }
            else if (part.startsWith(".r ") || part.startsWith(".f ") || part.startsWith(".x ")) {
                commands.push(part);
            }
        }
    }
    return commands;
};
GameHelper.getWhens = function (text) {
    if (text == undefined)
        return [];
    var whens = new Array();
    var parts = text.split(",");
    for (var _i = 0, parts_2 = parts; _i < parts_2.length; _i++) {
        var part = parts_2[_i];
        if (part.length > 0) {
            whens.push(part.trim());
        }
    }
    return whens;
};
/// <reference path="igame.ts" />
/// <reference path="igame-data.ts" />
/// <reference path="iinstance.ts" />
/// <reference path="game-storage.ts" />
/// <reference path="game-helper.ts" />
var Tide = (function () {
    function Tide() {
        var _this = this;
        this.initialize = function () {
            var ied = document.querySelector("div.ide-editor");
            var igame = document.querySelector("div.ide-game");
            var gdata = new GameStorage();
            var options = gdata.options;
            if (options == undefined) {
                options = { skipFileLoad: false, syncEditor: true };
                gdata.options = options;
            }
            document.getElementById("ide-gamefile").addEventListener("click", function (e) {
                var checked = e.target.checked;
                var options = gdata.options;
                options.skipFileLoad = checked;
                gdata.options = options;
            });
            document.getElementById("ide-sync").addEventListener("click", function (e) {
                var checked = e.target.checked;
                var options = gdata.options;
                options.syncEditor = checked;
                gdata.options = options;
            });
            document.getElementById("ide-fast").addEventListener("click", function (e) {
                var checked = e.target.checked;
                var options = gdata.options;
                options.fastStory = checked;
                gdata.options = options;
            });
            document.getElementById("ide-res-iphone").addEventListener("click", function (e) {
                var game = document.querySelector(".ide-game");
                if (game.classList.contains("iphone"))
                    game.classList.remove("iphone");
                else
                    game.classList.add("iphone");
            });
            document.getElementById("ide-play-edit").addEventListener("click", function (e) {
                if (ied.classList.contains("show"))
                    ied.classList.remove("show");
                else
                    ied.classList.add("show");
            });
            document.getElementById("ide-reload-game").addEventListener("click", function (e) {
                igame.querySelector("iframe").setAttribute("src", "dist/index.html");
            });
            document.getElementById("ide-reload-editor").addEventListener("click", function (e) {
                ied.querySelector("iframe").setAttribute("src", "index-edit.html");
            });
            document.querySelector(".debug-state a").addEventListener("click", function (e) {
                var link = e.target;
                var div = link.nextElementSibling;
                if (div.classList.contains("hidden") == false) {
                    div.classList.add("hidden");
                    return;
                }
                div.classList.remove("hidden");
                var text = JSON.stringify(gdata.state);
                var textarea = div.getElementsByTagName("textarea")[0];
                textarea.value = text;
            });
            document.getElementById("ide-save-state").addEventListener("click", function (e) {
                var button = e.target;
                var textarea = button.previousElementSibling;
                var div = textarea.parentElement;
                div.classList.add("hidden");
                gdata.state = JSON.parse(textarea.value);
                _this.action(OpAction.SHOWING_CHOICES);
            });
            var debugMoments = document.getElementsByClassName("debug-moment");
            for (var i = 0; i < debugMoments.length; i++) {
                debugMoments[i].addEventListener("click", function (e) {
                    var target = e.target;
                    var div = target;
                    while (true) {
                        if (div.classList.contains("debug-moment"))
                            break;
                        div = div.parentElement;
                    }
                    var iframe = document.querySelector("div.ide-editor iframe");
                    var editor = iframe.contentWindow.EditorInstance;
                    var moment = _this.moments[div.id];
                    if (moment != undefined)
                        editor.gotoMoment(moment);
                });
            }
            window.onAction = _this.action;
            document.getElementById("ide-gamefile").checked = options.skipFileLoad;
            document.getElementById("ide-sync").checked = options.syncEditor;
            document.getElementById("ide-fast").checked = options.fastStory;
            // Load the iframes at run time to make sure the ide is fully loaded first.
            igame.querySelector("iframe").setAttribute("src", "dist/index.html");
            ied.querySelector("iframe").setAttribute("src", "index-edit.html");
        };
        this.action = function (op, param) {
            if (op == OpAction.SHOWING_CHOICES) {
                var state = new GameStorage().state;
                ;
                var all = new Array();
                for (var property in _this.prevState) {
                    all.push({ name: property, prev: _this.prevState[property], now: undefined });
                }
                for (var property in state) {
                    var found = false;
                    for (var _i = 0, all_1 = all; _i < all_1.length; _i++) {
                        var prev = all_1[_i];
                        if (prev.name == property) {
                            prev.now = state[property];
                            found = true;
                            break;
                        }
                    }
                    if (found)
                        continue;
                    all.push({ name: property, prev: undefined, now: state[property] });
                }
                all.sort(function (a, b) { return a.name.localeCompare(b.name); });
                var div = document.querySelector("div.debug-content");
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
                for (var _a = 0, all_2 = all; _a < all_2.length; _a++) {
                    var one = all_2[_a];
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
                        cell.title = "previous value: " + one.prev;
                    }
                }
                _this.prevState = JSON.parse(JSON.stringify(state));
            }
            else if (op == OpAction.GAME_START) {
                _this.prevState = {};
                var div = document.querySelector("div.debug-content");
                div.classList.add("hidden");
                var table = div.getElementsByTagName("table")[0];
                for (var i = table.rows.length - 1; i >= 0; i--)
                    table.deleteRow(i);
            }
            else if (op == OpAction.SHOWING_MOMENT) {
                if (document.getElementById("ide-sync").checked) {
                    var iframe = document.querySelector("div.ide-editor iframe");
                    var editor = iframe.contentWindow.EditorInstance;
                    var moment = param.moment;
                    var source = param.source;
                    editor.gotoMoment(moment);
                    var id = (source == undefined ? "moment-main" : "moment-child");
                    _this.moments[id] = JSON.parse(JSON.stringify(moment));
                    var whens = GameHelper.getWhens(moment.when);
                    var divs = Array.prototype.map.call(whens, function (when) {
                        return "<div>" + when + "</div>";
                    });
                    document.querySelector("#" + id + " #id-when").innerHTML = divs.join("");
                    var cmds = GameHelper.getCommands(moment.text);
                    divs = Array.prototype.map.call(cmds, function (cmd) {
                        return "<div>" + cmd + "</div>";
                    });
                    document.querySelector("#" + id + " #id-command").innerHTML = divs.join("");
                }
            }
        };
        this.moments = {};
    }
    return Tide;
}());
//# sourceMappingURL=app-ide.js.map