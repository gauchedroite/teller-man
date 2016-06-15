
declare var Dom7: any;
declare var Template7: any;

interface String {
    startsWith(s: string): boolean
}

interface IGame {
    id: number
    name: string
    startsid: number
}

interface ISituation {
    id: number
    name: string
    when: string
    tags: Array<string>
    sids: Array<number>
    npcids: Array<number>
}

interface IScene {
    id: number
    name: string
    desc: string
    bids: Array<number>
    aids: Array<number>
}

interface IMoment {
    id: number
    when: string
    text: string
}

interface IGameData {
    game: IGame
    situations: Array<ISituation>
    scenes: Array<IScene>
    moments: Array<IMoment>
    me: any
    meid: number
}

class Game {
    $: any;
    app: any;
    leftView: any;
    centerView: any;
    rightView: any;

    constructor() {
        this.$ = Dom7;
        var $ = Dom7;
        var data = this.loadGame();
        for (var i = 0; i < data.situations.length; i++) {
            var sit = data.situations[i];
            (<any>sit).selected = (sit.id == data.game.startsid ? "selected" : "");
        }
        var gameinfo = document.getElementById("ted-game-info");
        var content = gameinfo.innerHTML;
        var template = Template7.compile(content);
        gameinfo.innerHTML = template(data);
    }

    preprocess(content: string, url: any, next: any) {
        var game = this;
        var pages = [
            {
                url: "http://", 
                fix: function (data: IGameData, id: number) {
                    for (var i = 0; i < data.situations.length; i++) {
                        var sit = data.situations[i];
                        (<any>sit).selected = (sit.id == data.game.startsid ? "selected" : "");
                    }
                }
            },
            {
                url: "page/situation-index.html", 
                fix: function (data: IGameData, id: number) {
                }
            },
            {
                url: "page/situation.html", 
                fix: function (data: IGameData, id: number) {
                    var me = game.getSituation(game.situations, id);
                    data.me = me;
                    data.meid = id;
                    data.me.scenes = [];
                    for (var i = 0; i < me.sids.length; i ++) {
                        var sid = me.sids[i];
                        data.me.scenes.push(data.scenes[sid]);
                    }
                }
            },
            {
                url: "page/scene.html", 
                fix: function (data: IGameData, id: number) {
                    var me = game.getScene(game.scenes, id);
                    data.me = me;
                    data.meid = id;
                    data.me.moments = [];
                    for (var i = 0; i < me.bids.length; i ++) {
                        var bid = me.bids[i];
                        data.me.moments.push(data.moments[bid]);
                    }
                }
            },
            {
                url: "page/moment.html", 
                fix: function (data: IGameData, id: number) {
                    var me = game.getMoment(game.moments, id);
                    data.me = me;
                    data.meid = id;
                }
            }
        ];
        for (var i = 0; i < pages.length; i++) {
            if (url == undefined) return;
            var page = pages[i];
            if (url.startsWith(page.url)) {
                var id = this.$.parseUrlQuery(url).id;
                var data = this.loadGame();
                page.fix(data, id);
                var template = Template7.compile(content);
                var resultContent = template(data);
                return resultContent;
            }
        }
        return (content);
    };

    init = (app: any, leftView: any, centerView: any, rightView: any) => {
        
        this.app = app;
        this.leftView = leftView;
        this.centerView = centerView;
        this.rightView = rightView;

        var $ = this.$;

        app.onPageInit("*", function (page: any) {
            if (page.url == undefined) return;
            if (page.url.startsWith("page/scene.html")) {
                rightView.router.back({ url: rightView.history[0], force: true });
            }
        });

        app.onPageBack("*", function (page: any) {
            if (page.url == undefined) return;
            if (page.url.startsWith("page/scene.html")) {
                rightView.router.back({ url: rightView.history[0], force: true });
            }
            if (page.url.startsWith("page/situation.html")) {
                centerView.router.back({ url: centerView.history[0], force: true });
            }
        });

        $(document).on("click", "div#ted-situations li", (e: any) => {
            $(e.target.closest("ul")).find("li").removeClass("ted-selected");
            $(e.target.closest("li")).addClass("ted-selected"); 
        });

        $(document).on("click", "div#ted-scenes li", (e: any) => {
            $(e.target.closest("ul")).find("li").removeClass("ted-selected");
            $(e.target.closest("li")).addClass("ted-selected"); 
        });

        $(document).on("click", "div#ted-moments li", (e: any) => {
            $(e.target.closest("ul")).find("li").removeClass("ted-selected");
            $(e.target.closest("li")).addClass("ted-selected"); 
        });

        $(document).on("click", "#ted-mock-game", (e: any) => {
            app.confirm("This will ovewrite the current game data. Is this ok?", "Mock Game Data", this.mockData);
        });

        $(document).on("click", "#ted-load-game", (e: any) => {
            var data = this.loadGame();
            delete data.me;
            delete data.meid;
            var text = JSON.stringify(data);
            $("#ted-game-data").val(text);
        });

        $(document).on("click", "#ted-save-game", (e: any) => {
            app.confirm("This will ovewrite the current game data. Is this ok?", "Save Game Data", () => {
                //
            });
        });

        $(document).on("click", "#ted-add-situation", (e: any) => {
            var id = this.addSituation();
            var li = '<li class="ted-selected">'
                   +    '<a href="page/situation.html?id=' + id + '" class="item-link">'
                   +        '<div class="item-content">'
                   +            '<div class="item-inner">'
                   +                '<div class="item-title"></div>'
                   +            '</div>'
                   +        '</div>'
                   +    '</a>'
                   +'</li>';
            var $ul = $("#ted-situations ul");
            $ul.find("li").removeClass("ted-selected");
            $ul.append(li);
            leftView.router.load({ url: "page/situation.html?id=" + id });
        });

        $(document).on("click", "#ted-delete-situation", (e: Event) => {
            app.confirm("Are you sure?", "Delete Situation", () => {
                this.deleteSituation(Game.getMeId(e.target));
                var history = this.leftView.history;
                this.leftView.router.back({
                    url: history[history.length - 2],
                    force: true,
                    ignoreCache: true
                 });
            });
        });

        $(document).on("change", "#ted-game-name", (e: any) => {
            this.saveGameName(e.target.value);
        });

        $(document).on("click", "input[name^='radio-']", (e: any) => {
            var $ssp = $(e.target).closest("div.smart-select-popup");
            if ($ssp.length == 0) return;
            var $dp = $ssp.find("div[data-page]");
            var $pc = $dp.find("div.page-content input:checked");
            var $it = $pc.next("div.item-inner").find("div.item-title");
            this.saveGameStartSituation($it.text());
        });

        $(document).on("change", "#ted-situation-name", (e: any) => {
            this.saveSituationName(e.target.value, Game.getMeId(e.target));
            $("#ted-situations li.ted-selected div.item-title").text(e.target.value);
        });

        $(document).on("change", "#ted-situation-when", (e: any) => {
            this.saveSituationWhen(e.target.value, Game.getMeId(e.target));
        });

        $(document).on("change", "#ted-situation-tags", (e: any) => {
            this.saveSituationTags(e.target.value, Game.getMeId(e.target));
        });

        $(document).on("change", "#ted-scene-name", (e: any) => {
            this.saveSceneName(e.target.value, Game.getMeId(e.target));
            $("#ted-scenes li.ted-selected div.item-title").text(e.target.value);
        });

        $(document).on("change", "#ted-scene-desc", (e: any) => {
            this.saveSceneDesc(e.target.value, Game.getMeId(e.target));
        });

        $(document).on("change", "#ted-moment-when", (e: any) => {
            this.saveMomentWhen(e.target.value, Game.getMeId(e.target));
            $("#ted-moments li.ted-selected div.item-title").text(e.target.value);
        });

        $(document).on("change", "#ted-moment-text", (e: any) => {
            this.saveMomentText(e.target.value, Game.getMeId(e.target));
        });
    }

    mockData = () => {
        localStorage.clear();
        var game: IGame = {
            id: 0, name: "Le jeu de paume", startsid: 0
        };
        var situations: Array<ISituation> = [
            { id: 0, name: "Beginning", when: "undef cheval", tags: ["chap1", "trésor"], sids: [0, 1, 2, 3], npcids: [0] },
            { id: 1, name: "Dead dog", when: "todo", tags: ["chap1", "dog"], sids: [], npcids: [] }
        ];
        var scenes: Array<IScene> = [
            { id: 0, name: "Bord de l'eau", desc: "EXT. Bord de l'eau", bids: [], aids: [] },
            { id: 1, name: "Conductrice", desc: "EXT. Conductrice", bids: [0], aids: [] },
            { id: 2, name: "Camion", desc: "EXT. Le camion accidenté", bids: [0, 1, 2], aids: [0] },
            { id: 3, name: "Capot", desc: "EXT. Le capot", bids: [], aids: [] }
        ];
        var moments: Array<IMoment> = [
            { id: 0, when: "not cheval", text: "[0] .a Jack" },
            { id: 1, when: "undef inv.crowbar", text: "[1] .a Jack" },
            { id: 2, when: "inv.crowbar", text: "[2] .a Jack" },
            { id: 3, when: "not inv.crowbar", text: "[3] .a Jack" }
        ];
        localStorage.setItem("game", JSON.stringify(game));
        localStorage.setItem("situations", JSON.stringify(situations));
        localStorage.setItem("scenes", JSON.stringify(scenes));
        localStorage.setItem("moments", JSON.stringify(moments));
    }

    loadGame = () => {
        var game = <IGame> JSON.parse(localStorage.getItem("game"));
        var sits = <Array<ISituation>> JSON.parse(localStorage.getItem("situations"));
        var scns = <Array<IScene>> JSON.parse(localStorage.getItem("scenes"));
        var moms = <Array<IMoment>> JSON.parse(localStorage.getItem("moments"));
        return <IGameData> { 
            game: game, 
            situations: sits,
            scenes: scns,
            moments: moms,
            me: null,
            meid: null
        };
    }

    static getMeId = (target: any) => {
        return parseInt(target.closest("div.page").getAttribute("data-ted-meid"));
    }

    saveGameName = (name: string) => {
        var game = this.game;
        game.name = name;
        this.game = game;
    }

    saveGameStartSituation = (text: string) => {
        var game = this.game;
        var sits = this.situations;
        for (var i = 0; i < sits.length; i++) {
            var sit = sits[i];
            if (sit.name == text) {
                game.startsid = sit.id;
                this.game = game;
                return;
            }
        }
    }

    addSituation = () => {
        var id = -1;
        var sits = this.situations;
        for (var i = 0; i < sits.length; i++) {
            var sit = sits[i];
            if (sit.id > id) id = sit.id;
        }
        id++;
        var sit: ISituation = { id: id, name: null, when: null, tags: [], sids: [], npcids: [] };
        sits.push(sit);
        this.situations = sits;
        return id;
    }

    deleteSituation = (id: number) => {
        var sits = this.situations;
        var index = this.getSituationIndex(sits, id);
        sits.splice(index, 1);
        this.situations = sits;
    }

    saveSituationName = (name: string, id: number) => {
        var sits = this.situations;
        var sit = this.getSituation(sits, id);
        sit.name = name;
        this.situations = sits;
    }

    saveSituationWhen = (when: string, id: number) => {
        var sits = this.situations;
        var sit = this.getSituation(sits, id);
        sit.when = when;
        this.situations = sits;
    }

    saveSituationTags = (name: string, id: number) => {
        //TODO
    }

    saveSceneName = (name: string, id: number) => {
        var scns = this.scenes;
        var scn = this.getScene(scns, id);
        scn.name = name;
        this.scenes = scns;
    }

    saveSceneDesc = (desc: string, id: number) => {
        var scns = this.scenes;
        var scn = this.getScene(scns, id);
        scn.desc = desc;
        this.scenes = scns;
    }

    saveMomentWhen = (when: string, id: number) => {
        var moms = this.moments;
        var mom = this.getMoment(moms, id);
        mom.when = when;
        this.moments = moms;
    }

    saveMomentText = (text: string, id: number) => {
        var moms = this.moments;
        var mom = this.getMoment(moms, id);
        mom.text = text;
        this.moments = moms;
    }

    get game() {
        return <IGame> JSON.parse(localStorage.getItem("game"));
    }

    set game(game: IGame) {
        localStorage.setItem("game", JSON.stringify(game));
    }

    get situations() : Array<ISituation> {
        return JSON.parse(localStorage.getItem("situations"));
    }

    set situations(sits: Array<ISituation>) {
        localStorage.setItem("situations", JSON.stringify(sits));
    }

    getSituation = (sits: Array<ISituation>, id: number) => {
        return (sits[this.getSituationIndex(sits, id)]);
    }

    getSituationIndex = (sits: Array<ISituation>, id: number) => {
        for (var i = 0; i < sits.length; i++) {
            if (sits[i].id == id)
                return i;
        }
    }

    get scenes() : Array<IScene> {
        return JSON.parse(localStorage.getItem("scenes"));
    }

    set scenes(moms: Array<IScene>) {
        localStorage.setItem("scenes", JSON.stringify(moms));
    }

    getScene = (scns: Array<IScene>, id: number) => {
        for (var i = 0; i < scns.length; i++) {
            if (scns[i].id == id)
                return scns[i];
        }
    }

    get moments() : Array<IMoment> {
        return JSON.parse(localStorage.getItem("moments"));
    }

    set moments(moms: Array<IMoment>) {
        localStorage.setItem("moments", JSON.stringify(moms));
    }

    getMoment = (moms: Array<IMoment>, id: number) => {
        for (var i = 0; i < moms.length; i++) {
            if (moms[i].id == id)
                return moms[i];
        }
    }
}
