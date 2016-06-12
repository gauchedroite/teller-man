
declare var Template7: any;

interface String {
    startsWith(s: string): boolean
}


class Game {

    static $: any;

    static preprocess(content: string, url: any, next: any) {
        const pages = [
            {
                url: "page/game.html", 
                fix: function (data: any, id: number) {
            }},
            {
                url: "page/situation-index.html", 
                fix: function (data: any, id: number) {
            }},
            {
                url: "page/situation.html", 
                fix: function (data: any, id: number) {
                    var me = data.situations[id];
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
                fix: function (data: any, id: number) {
                    var me = data.scenes[id];
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
                fix: function (data: any, id: number) {
                    var me = data.moments[id];
                    data.me = me;
                    data.meid = id;
                }
            }
        ];
        for (var i = 0; i < pages.length; i++) {
            if (url == undefined) return;
            var page = pages[i];
            if (url.startsWith(page.url)) {
                var id = Game.$.parseUrlQuery(url).id;
                var data = Game.loadGame();
                page.fix(data, id);
                var template = Template7.compile(content);
                var resultContent = template(data);
                return resultContent;
            }
        }
        return (content);
    };

    constructor(private app: any, private $: any, private leftView: any, private centerView: any, private rightView: any) {
        Game.$ = $;

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

        $(document).on("click", "div#ted-scenes li", function (e: any) {
            $(e.target.closest("ul")).find("li").removeClass("ted-selected");
            $(e.target.closest("li")).addClass("ted-selected"); 
        });

        $(document).on("click", "div#ted-moments li", function (e: any) {
            $(e.target.closest("ul")).find("li").removeClass("ted-selected");
            $(e.target.closest("li")).addClass("ted-selected"); 
        });

        $("#ted-save-game").on("click", function (e: any) {
            app.confirm("Are you sure?", "Mock Game Data", function () {
                Game.mockData();
            });
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

    static mockData = () => {
        localStorage.clear();
        var game = {
            id: 0, name: "Le jeu de paume", startsid: 0
        };
        var situations = [
            { id: 0, name: "Beginning", when: "undef cheval", tags: ["chap1", "trésor"], sids: [0, 1, 2, 3], npcids: [0] },
            { id: 1, name: "Dead dog", when: "todo", tags: ["chap1", "dog"], sids: [], npcids: [] }
        ];
        var scenes = [
            { id: 0, name: "Bord de l'eau", desc: "EXT. Bord de l'eau", bids: [], aids: [] },
            { id: 1, name: "Conductrice", desc: "EXT. Conductrice", bids: [0], aids: [] },
            { id: 2, name: "Camion", desc: "EXT. Le camion accidenté", bids: [0, 1, 2], aids: [0] },
            { id: 3, name: "Capot", desc: "EXT. Le capot", bids: [], aids: [] }
        ];
        var moments = [
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

    static loadGame = () => {
        var game = JSON.parse(localStorage.getItem("game"));
        var sits = JSON.parse(localStorage.getItem("situations"));
        var scns = JSON.parse(localStorage.getItem("scenes"));
        var moms = JSON.parse(localStorage.getItem("moments"));
        return { 
            game: game, 
            situations: sits,
            scenes: scns,
            moments: moms,
            me: <any>null,
            meid: <number>null
        };
    }

    static getMeId = (target: any) => {
        return parseInt(target.closest("div.page").getAttribute("data-ted-meid"));
    }

    saveSceneName = (name: string, id: number) => {
        var scns = this.scenes;
        scns[id].name = name;
        this.scenes = scns;
    }

    saveSceneDesc = (desc: string, id: number) => {
        var scns = this.scenes;
        scns[id].desc = desc;
        this.scenes = scns;
    }

    saveMomentWhen = (when: string, id: number) => {
        var moms = this.moments;
        moms[id].when = when;
        this.moments = moms;
    }

    saveMomentText = (text: string, id: number) => {
        var moms = this.moments;
        moms[id].text = text;
        this.moments = moms;
    }

    get scenes() {
        return JSON.parse(localStorage.getItem("scenes"));
    }

    set scenes(moms: any) {
        localStorage.setItem("scenes", JSON.stringify(moms));
    }

    get moments() {
        return JSON.parse(localStorage.getItem("moments"));
    }

    set moments(moms: any) {
        localStorage.setItem("moments", JSON.stringify(moms));
    }
}
