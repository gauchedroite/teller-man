
declare var Dom7: any;
declare var Template7: any;

interface String {
    startsWith(s: string): boolean
}

class Editor {
    gdata: GameData;
    $: any;
    app: any;
    leftView: any;
    centerView: any;
    rightView: any;

    constructor() {
        this.gdata = new GameData();
        this.$ = Dom7;
        var $ = Dom7;
        var data = this.gdata.loadGame();
        for (var sit of data.situations) {
            (<any>sit).selected = (sit.id == data.game.startsid ? "selected" : "");
        }
        var gameinfo = document.querySelector("div.pages");
        var content = gameinfo.innerHTML;
        var template = Template7.compile(content);
        gameinfo.innerHTML = template(data);
    }

    preprocess(content: string, url: any, next: any) {
        var gdata = this.gdata;
        var pages = [
            {
                url: "http://", 
                getData: function (id: number): IGameData {
                    var data = gdata.loadGame();
                    for (var sit of data.situations) {
                        (<any>sit).selected = (sit.id == data.game.startsid ? "selected" : null);
                    }
                    return data;
                }
            },
            {
                url: "page/situation-index.html", 
                getData: function (id: number): IGameData {
                    return gdata.loadGame();
                }
            },
            {
                url: "page/situation.html", 
                getData: function (id: number): IGameData {
                    var data = gdata.loadGame();
                    var me = gdata.getSituation(gdata.situations, id);
                    data.me = me;
                    data.meid = id;
                    data.me.scenes = gdata.getScenesOf(me);
                    data.me.actors = gdata.getActorsOf(me);
                    return data;
                }
            },
            {
                url: "page/scene.html", 
                getData: function (id: number): IGameData {
                    var data = gdata.loadGame();
                    var me = gdata.getScene(gdata.scenes, id);
                    data.me = me;
                    data.meid = id;
                    data.me.moments = gdata.getMomentsOf(me);
                    data.me.actions = gdata.getActionsOf(me);
                    return data;
                }
            },
            {
                url: "page/moment.html", 
                getData: function (id: number): IGameData {
                    var data = gdata.loadGame();
                    var me = gdata.getMoment(gdata.moments, id);
                    data.me = me;
                    data.meid = id;
                    return data;
                }
            },
            {
                url: "page/action.html", 
                getData: function (id: number): IGameData {
                    var data = gdata.loadGame();
                    var me = gdata.getAction(gdata.moments, id);
                    data.me = me;
                    data.meid = id;
                    return data;
                }
            },
            {
                url: "page/player.html", 
                getData: function (id: number): IGameData {
                    var data = gdata.loadGame();
                    var me = gdata.getActor(gdata.actors, id);
                    data.me = me;
                    data.meid = id;
                    data.me.messages = gdata.getMessageToOf(me);
                    return data;
                }
            },
            {
                url: "page/actor.html", 
                getData: function (id: number): IGameData {
                    var data = gdata.loadGame();
                    var me = gdata.getActor(gdata.actors, id);
                    data.me = me;
                    data.meid = id;
                    data.me.messages = gdata.getMessageFromOf(me);
                    return data;
                }
            },
            {
                url: "page/message-to.html", 
                getData: function (id: number): IGameData {
                    var data = gdata.loadGame();
                    var me = gdata.getMessageTo(gdata.moments, id);
                    data.me = me;
                    data.meid = id;
                    data.me.actors = gdata.getActorsForMessageTo(data, me);
                    for (var act of data.me.actors) {
                        act.selected = (act.id == me.to ? "selected" : null);
                    }
                    return data;
                }
            },
            {
                url: "page/message-from.html", 
                getData: function (id: number): IGameData {
                    var data = gdata.loadGame();
                    var me = gdata.getMessageFrom(gdata.moments, id);
                    data.me = me;
                    data.meid = id;
                    return data;
                }
            }
        ];
        if (url == undefined) return;
        for (var page of pages) {
            if (url.startsWith(page.url)) {
                var id = this.$.parseUrlQuery(url).id;
                var data = page.getData(id);
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
            if (page.url.startsWith("page/actor.html")) {
                rightView.router.back({ url: rightView.history[0], force: true });
            }
            if (page.url.startsWith("page/player.html")) {
                rightView.router.back({ url: rightView.history[0], force: true });
            }
        });

        app.onPageBack("*", function (page: any) {
            if (page.url == undefined) return;
            console.log(page.url);
            if (page.url.startsWith("page/scene.html")) {
                rightView.router.back({ url: rightView.history[0], force: true });
            }
            if (page.url.startsWith("page/player.html")) {
                rightView.router.back({ url: rightView.history[0], force: true });
            }
            if (page.url.startsWith("page/actor.html")) {
                rightView.router.back({ url: rightView.history[0], force: true });
            }
            if (page.url.startsWith("page/situation.html")) {
                centerView.router.back({ url: centerView.history[0], force: true });
            }
        });

        $(document).on("click", "div#ted-situations li", (e: any) => {
            $(e.target.closest(".page")).find("li").removeClass("ted-selected");
            $(e.target.closest("li")).addClass("ted-selected"); 
        });

        $(document).on("click", "div#ted-scenes li", (e: any) => {
            $(e.target.closest(".page")).find("li").removeClass("ted-selected");
            $(e.target.closest("li")).addClass("ted-selected"); 
        });

        $(document).on("click", "div#ted-actors li", (e: any) => {
            $(e.target.closest(".page")).find("li").removeClass("ted-selected");
            $(e.target.closest("li")).addClass("ted-selected"); 
        });

        $(document).on("click", "div#ted-moments li", (e: any) => {
            $(e.target.closest(".page")).find("li").removeClass("ted-selected");
            $(e.target.closest("li")).addClass("ted-selected"); 
        });

        $(document).on("click", "div#ted-actions li", (e: any) => {
            $(e.target.closest(".page")).find("li").removeClass("ted-selected");
            $(e.target.closest("li")).addClass("ted-selected"); 
        });

        $(document).on("click", "div#ted-messages-to li", (e: any) => {
            $(e.target.closest(".page")).find("li").removeClass("ted-selected");
            $(e.target.closest("li")).addClass("ted-selected"); 
        });

        $(document).on("click", "div#ted-messages-from li", (e: any) => {
            $(e.target.closest(".page")).find("li").removeClass("ted-selected");
            $(e.target.closest("li")).addClass("ted-selected"); 
        });

        $(document).on("click", "#ted-load-game", (e: any) => {
            var data = this.gdata.loadGame();
            delete data.me;
            delete data.meid;
            var text = JSON.stringify(data);
            $("#ted-game-data").val(text);
        });

        $(document).on("click", "#ted-load-game2", (e: any) => {
            var data = this.gdata.loadGame();
            delete data.me;
            delete data.meid;
            var text = JSON.stringify(data);
            $("#ted-game-data2").val(text);
        });

        $(document).on("click", "#ted-save-game", (e: any) => {
            app.confirm("This will ovewrite the current game data. A manual refresh of the game will be required. Is this ok?", "Save Game Data", () => {
                var text = $("#ted-game-data").val();
                this.gdata.saveData(text);
            });
        });

        $(document).on("click", "#ted-add-situation", (e: any) => {
            var gameid = Editor.getMeId(e.target);
            var id = this.gdata.addSituation(gameid);
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
                this.gdata.deleteSituation(Editor.getMeId(e.target));
                var history = this.leftView.history;
                this.leftView.router.back({
                    url: history[history.length - 2],
                    force: true,
                    ignoreCache: true
                 });
            });
        });

        $(document).on("click", "#ted-add-scene", (e: any) => {
            var sitid = Editor.getMeId(e.target);
            var id = this.gdata.addScene(sitid);
            var li = '<li class="ted-selected">'
                   +    '<a href="page/scene.html?id=' + id + '" data-view=".view-center" class="item-link">'
                   +        '<div class="item-content">'
                   +            '<div class="item-inner">'
                   +                '<div class="item-title"></div>'
                   +            '</div>'
                   +        '</div>'
                   +    '</a>'
                   +'</li>';
            var $ul = $("#ted-scenes ul");
            $ul.find("li").removeClass("ted-selected");
            $ul.append(li);
            centerView.router.load({ url: "page/scene.html?id=" + id });
        });

        $(document).on("click", "#ted-delete-scene", (e: Event) => {
            app.confirm("Are you sure?", "Delete Scene", () => {
                this.gdata.deleteScene(Editor.getMeId(e.target));
                var history = this.centerView.history;
                this.centerView.router.back({
                    url: history[0],
                    force: true,
                    ignoreCache: true
                 });
                 this.leftView.router.refreshPage();
            });
        });

        $(document).on("click", "#ted-add-actor", (e: any) => {
            var sitid = Editor.getMeId(e.target);
            var id = this.gdata.addActor(sitid);
            var li = '<li class="ted-selected">'
                   +    '<a href="page/actor.html?id=' + id + '" data-view=".view-center" class="item-link">'
                   +        '<div class="item-content">'
                   +            '<div class="item-inner">'
                   +                '<div class="item-title"></div>'
                   +            '</div>'
                   +        '</div>'
                   +    '</a>'
                   +'</li>';
            var $ul = $("#ted-actors ul");
            $ul.find("li").removeClass("ted-selected");
            $ul.append(li);
            centerView.router.load({ url: "page/actor.html?id=" + id });
        });

        $(document).on("click", "#ted-delete-actor", (e: Event) => {
            app.confirm("Are you sure?", "Delete Actor", () => {
                this.gdata.deleteActor(Editor.getMeId(e.target));
                var history = this.centerView.history;
                this.centerView.router.back({
                    url: history[0],
                    force: true,
                    ignoreCache: true
                 });
                 this.leftView.router.refreshPage();
            });
        });

        $(document).on("click", "#ted-add-moment", (e: any) => {
            var momid = Editor.getMeId(e.target);
            var id = this.gdata.addMoment(momid);
            var li = '<li class="ted-selected">'
                   +    '<a href="page/moment.html?id=' + id + '" data-view=".view-right" class="item-link">'
                   +        '<div class="item-content">'
                   +            '<div class="item-inner">'
                   +                '<div class="item-title"></div>'
                   +            '</div>'
                   +        '</div>'
                   +    '</a>'
                   +'</li>';
            var $ul = $("#ted-moments ul");
            $ul.find("li").removeClass("ted-selected");
            $ul.append(li);
            rightView.router.load({ url: "page/moment.html?id=" + id });
        });

        $(document).on("click", "#ted-delete-moment", (e: Event) => {
            app.confirm("Are you sure?", "Delete Moment", () => {
                this.gdata.deleteSceneMoment(Editor.getMeId(e.target));
                var history = this.rightView.history;
                this.rightView.router.back({
                    url: history[0],
                    force: true,
                    ignoreCache: true
                 });
                 this.centerView.router.refreshPage();
            });
        });

        $(document).on("click", "#ted-add-action", (e: any) => {
            var actid = Editor.getMeId(e.target);
            var id = this.gdata.addAction(actid);
            var li = '<li class="ted-selected">'
                   +    '<a href="page/action.html?id=' + id + '" data-view=".view-right" class="item-link">'
                   +        '<div class="item-content">'
                   +            '<div class="item-inner">'
                   +                '<div class="item-title"></div>'
                   +            '</div>'
                   +        '</div>'
                   +    '</a>'
                   +'</li>';
            var $ul = $("#ted-actions ul");
            $ul.find("li").removeClass("ted-selected");
            $ul.append(li);
            rightView.router.load({ url: "page/action.html?id=" + id });
        });

        $(document).on("click", "#ted-delete-action", (e: Event) => {
            app.confirm("Are you sure?", "Delete Action", () => {
                this.gdata.deleteAction(Editor.getMeId(e.target));
                var history = this.rightView.history;
                this.rightView.router.back({
                    url: history[0],
                    force: true,
                    ignoreCache: true
                 });
                 this.centerView.router.refreshPage();
            });
        });

        $(document).on("click", "#ted-add-message-to", (e: any) => {
            var actid = Editor.getMeId(e.target);
            var id = this.gdata.addMessageTo(actid);
            var li = '<li class="ted-selected">'
                   +    '<a href="page/message-to.html?id=' + id + '" data-view=".view-right" class="item-link">'
                   +        '<div class="item-content">'
                   +            '<div class="item-inner">'
                   +                '<div class="item-title"></div>'
                   +            '</div>'
                   +        '</div>'
                   +    '</a>'
                   +'</li>';
            var $ul = $("#ted-messages-to ul");
            $ul.find("li").removeClass("ted-selected");
            $ul.append(li);
            rightView.router.load({ url: "page/message-to.html?id=" + id });
        });

        $(document).on("click", "#ted-delete-message-to", (e: Event) => {
            app.confirm("Are you sure?", "Delete Message", () => {
                this.gdata.deleteMessageTo(Editor.getMeId(e.target));
                var history = this.rightView.history;
                this.rightView.router.back({
                    url: history[0],
                    force: true,
                    ignoreCache: true
                 });
                 this.centerView.router.refreshPage();
            });
        });

        $(document).on("click", "#ted-add-message-from", (e: any) => {
            var actid = Editor.getMeId(e.target);
            var id = this.gdata.addMessageFrom(actid);
            var li = '<li class="ted-selected">'
                   +    '<a href="page/message-from.html?id=' + id + '" data-view=".view-right" class="item-link">'
                   +        '<div class="item-content">'
                   +            '<div class="item-inner">'
                   +                '<div class="item-title"></div>'
                   +            '</div>'
                   +        '</div>'
                   +    '</a>'
                   +'</li>';
            var $ul = $("#ted-messages-from ul");
            $ul.find("li").removeClass("ted-selected");
            $ul.append(li);
            rightView.router.load({ url: "page/message-from.html?id=" + id });
        });

        $(document).on("click", "#ted-delete-message-from", (e: Event) => {
            app.confirm("Are you sure?", "Delete Message", () => {
                this.gdata.deleteMessageTo(Editor.getMeId(e.target));
                var history = this.rightView.history;
                this.rightView.router.back({
                    url: history[0],
                    force: true,
                    ignoreCache: true
                 });
                 this.centerView.router.refreshPage();
            });
        });


        $(document).on("change", "#ted-game-name", (e: any) => {
            this.gdata.saveGameName(e.target.value);
        });

        $(document).on("click", "input[name^='radio-']", (e: any) => {
            var $ssp = $(e.target).closest("div.smart-select-popup");
            if ($ssp.length == 0) return;
            //
            var $dp = $ssp.find("div[data-page]");
            var $dsn = $dp.find("div[data-select-name]");
            var $pc = $dp.find("div.page-content input:checked");
            var $it = $pc.next("div.item-inner").find("div.item-title");
            //
            var name = <string>$dsn[0].getAttribute("data-select-name");
            if (name == "situations") {
                this.gdata.saveGameStartSituation($it.text());
            } else if (name.startsWith("actors-for-")) {
                var toid = parseInt($pc.val());
                var meid = parseInt(name.substr("actors-for-".length));
                this.gdata.saveMessageToActorTo(toid, meid);
            }
        });

        $(document).on("change", "#ted-situation-name", (e: any) => {
            this.gdata.saveSituationName(e.target.value, Editor.getMeId(e.target));
            $("#ted-situations li.ted-selected div.item-title").text(e.target.value);
        });

        $(document).on("change", "#ted-situation-when", (e: any) => {
            this.gdata.saveSituationWhen(e.target.value, Editor.getMeId(e.target));
        });

        $(document).on("change", "#ted-situation-tags", (e: any) => {
            this.gdata.saveSituationTags(e.target.value, Editor.getMeId(e.target));
        });

        $(document).on("change", "#ted-scene-name", (e: any) => {
            this.gdata.saveSceneName(e.target.value, Editor.getMeId(e.target));
            $("#ted-scenes li.ted-selected div.item-title").text(e.target.value);
        });

        $(document).on("change", "#ted-scene-desc", (e: any) => {
            this.gdata.saveSceneDesc(e.target.value, Editor.getMeId(e.target));
        });

        $(document).on("change", "#ted-player-name", (e: any) => {
            this.gdata.saveActorName(e.target.value, Editor.getMeId(e.target));
        });

        $(document).on("change", "#ted-actor-name", (e: any) => {
            this.gdata.saveActorName(e.target.value, Editor.getMeId(e.target));
            $("#ted-actors li.ted-selected div.item-title").text(e.target.value);
        });

        $(document).on("change", "#ted-moment-when", (e: any) => {
            this.gdata.saveMomentWhen(e.target.value, Editor.getMeId(e.target));
            $("#ted-moments li.ted-selected div.item-title").text(e.target.value);
        });

        $(document).on("change", "#ted-moment-text", (e: any) => {
            this.gdata.saveMomentText(e.target.value, Editor.getMeId(e.target));
        });

        $(document).on("change", "#ted-action-name", (e: any) => {
            this.gdata.saveActionName(e.target.value, Editor.getMeId(e.target));
            $("#ted-actions li.ted-selected div.item-title").text(e.target.value);
        });

        $(document).on("change", "#ted-action-when", (e: any) => {
            this.gdata.saveActionWhen(e.target.value, Editor.getMeId(e.target));
        });

        $(document).on("change", "#ted-action-text", (e: any) => {
            this.gdata.saveActionText(e.target.value, Editor.getMeId(e.target));
        });

        $(document).on("change", "#ted-message-to-name", (e: any) => {
            this.gdata.saveMessageToName(e.target.value, Editor.getMeId(e.target));
            $("#ted-messages-to li.ted-selected div.item-title").text(e.target.value);
        });

        $(document).on("change", "#ted-message-to-when", (e: any) => {
            this.gdata.saveMessageToWhen(e.target.value, Editor.getMeId(e.target));
        });

        $(document).on("change", "#ted-message-to-text", (e: any) => {
            this.gdata.saveMessageToText(e.target.value, Editor.getMeId(e.target));
        });

        $(document).on("change", "#ted-message-from-when", (e: any) => {
            this.gdata.saveMessageFromWhen(e.target.value, Editor.getMeId(e.target));
            $("#ted-messages-from li.ted-selected div.item-title").text(e.target.value);
        });

        $(document).on("change", "#ted-message-from-text", (e: any) => {
            this.gdata.saveMessageFromText(e.target.value, Editor.getMeId(e.target));
        });
    }

    static getMeId = (target: any) => {
        return parseInt(target.closest("div.page").getAttribute("data-ted-meid"));
    }
}
