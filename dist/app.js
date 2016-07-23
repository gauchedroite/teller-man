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
var GameData = (function () {
    function GameData() {
        var _this = this;
        this.loadGame = function () {
            var game = _this.game;
            var sits = _this.situations;
            var scns = _this.scenes;
            var acts = _this.actors;
            var moms = _this.moments;
            var gdata = {
                game: game || { id: 0, name: null, initialstate: null, desc: null },
                situations: sits,
                scenes: scns,
                actors: acts,
                moments: moms,
                me: null,
                meid: null
            };
            if (game == null) {
                var text = JSON.stringify(gdata);
                _this.saveData(text);
            }
            return gdata;
        };
        this.saveData = function (text) {
            var gdata = JSON.parse(text);
            _this.game = gdata.game;
            _this.situations = gdata.situations;
            _this.scenes = gdata.scenes;
            _this.actors = gdata.actors;
            _this.moments = gdata.moments;
        };
        //
        // game
        //
        this.saveGameName = function (name) {
            var game = _this.game;
            game.name = name;
            _this.game = game;
        };
        this.saveGameInitialState = function (text) {
            var game = _this.game;
            game.initialstate = text;
            _this.game = game;
        };
        this.saveGameDesc = function (text) {
            var game = _this.game;
            game.desc = text;
            _this.game = game;
        };
        //
        // situations
        //
        this.addSituation = function (gameid) {
            var id = -1;
            var sits = _this.situations;
            for (var _i = 0, sits_1 = sits; _i < sits_1.length; _i++) {
                var sit = sits_1[_i];
                if (sit.id > id)
                    id = sit.id;
            }
            id++;
            var sit = { id: id, gameid: gameid, name: null, when: null, tags: [], sids: [], aids: [], aid: null };
            sits.push(sit);
            _this.situations = sits;
            //
            var aid = _this.addActor(id, AKind.Player);
            _this.saveSituationPlayerId(aid, id);
            //
            return id;
        };
        this.deleteSituation = function (id) {
            var sits = _this.situations;
            var index = _this.getSituationIndex(sits, id);
            var sit = sits[index];
            //
            for (var _i = 0, _a = sit.sids; _i < _a.length; _i++) {
                var sid = _a[_i];
                _this.deleteScene(sid);
            }
            //
            _this.deleteActor(sit.aid);
            for (var _b = 0, _c = sit.aids; _b < _c.length; _b++) {
                var aid = _c[_b];
                _this.deleteActor(aid);
            }
            //
            sits.splice(index, 1);
            _this.situations = sits;
        };
        this.saveSituationName = function (name, id) {
            var sits = _this.situations;
            var sit = _this.getSituation(sits, id);
            sit.name = name;
            _this.situations = sits;
        };
        this.saveSituationWhen = function (when, id) {
            var sits = _this.situations;
            var sit = _this.getSituation(sits, id);
            sit.when = when;
            _this.situations = sits;
        };
        this.saveSituationPlayerId = function (aid, id) {
            var sits = _this.situations;
            var sit = _this.getSituation(sits, id);
            sit.aid = aid;
            sit.aids = [];
            _this.situations = sits;
        };
        this.saveSituationTags = function (name, id) {
            //TODO
        };
        this.getSituation = function (sits, id) {
            return (sits[_this.getSituationIndex(sits, id)]);
        };
        this.getSituationIndex = function (sits, id) {
            for (var i = 0; i < sits.length; i++) {
                if (sits[i].id == id)
                    return i;
            }
        };
        this.getSituationOfMessageTo = function (sits, msg) {
            var aid = msg.parentid;
        };
        //
        // scenes
        //
        this.addScene = function (sitid) {
            var id = -1;
            var scns = _this.scenes;
            for (var _i = 0, scns_1 = scns; _i < scns_1.length; _i++) {
                var scn = scns_1[_i];
                if (scn.id > id)
                    id = scn.id;
            }
            id++;
            var scn = { id: id, sitid: sitid, name: null, desc: null, mids: [] };
            scns.push(scn);
            _this.scenes = scns;
            //
            var sits = _this.situations;
            var sit = _this.getSituation(sits, sitid);
            sit.sids.push(id);
            _this.situations = sits;
            return id;
        };
        this.deleteScene = function (id) {
            var scns = _this.scenes;
            var index = _this.getSceneIndex(scns, id);
            var scn = scns[index];
            //
            for (var _i = 0, _a = scn.mids; _i < _a.length; _i++) {
                var mid = _a[_i];
                _this.deleteSceneMoment(mid);
            }
            //
            scns.splice(index, 1);
            _this.scenes = scns;
            //
            var sits = _this.situations;
            for (var _b = 0, sits_2 = sits; _b < sits_2.length; _b++) {
                var sit = sits_2[_b];
                for (var i = 0; i < sit.sids.length; i++) {
                    if (sit.sids[i] == id) {
                        sit.sids.splice(i, 1);
                        break;
                    }
                }
            }
            _this.situations = sits;
        };
        this.saveSceneName = function (name, id) {
            var scns = _this.scenes;
            var scn = _this.getScene(scns, id);
            scn.name = name;
            _this.scenes = scns;
        };
        this.saveSceneDesc = function (desc, id) {
            var scns = _this.scenes;
            var scn = _this.getScene(scns, id);
            scn.desc = desc;
            _this.scenes = scns;
        };
        this.getScene = function (scns, id) {
            return (scns[_this.getSceneIndex(scns, id)]);
        };
        this.getSceneIndex = function (scns, id) {
            for (var i = 0; i < scns.length; i++) {
                if (scns[i].id == id)
                    return i;
            }
        };
        this.getScenesOf = function (sit) {
            var scenes = _this.scenes;
            var scns = [];
            for (var _i = 0, _a = sit.sids; _i < _a.length; _i++) {
                var sid = _a[_i];
                for (var _b = 0, scenes_1 = scenes; _b < scenes_1.length; _b++) {
                    var scene = scenes_1[_b];
                    if (scene.id == sid) {
                        scns.push(scene);
                        break;
                    }
                }
            }
            return scns;
        };
        //
        // actors
        //
        this.addActor = function (sitid, akind) {
            var id = -1;
            var acts = _this.actors;
            for (var _i = 0, acts_1 = acts; _i < acts_1.length; _i++) {
                var act = acts_1[_i];
                if (act.id > id)
                    id = act.id;
            }
            id++;
            var kind = (akind == undefined ? AKind.NPC : akind);
            var act = { id: id, sitid: sitid, kind: kind, name: null, desc: null, mids: [] };
            acts.push(act);
            _this.actors = acts;
            //
            var sits = _this.situations;
            var sit = _this.getSituation(sits, sitid);
            sit.aids.push(id);
            _this.situations = sits;
            return id;
        };
        this.deleteActor = function (id) {
            var acts = _this.actors;
            var index = _this.getActorIndex(acts, id);
            var act = acts[index];
            //
            for (var _i = 0, _a = act.mids; _i < _a.length; _i++) {
                var mid = _a[_i];
                _this.deleteActorMoment(mid);
            }
            //
            acts.splice(index, 1);
            _this.actors = acts;
            //
            var sits = _this.situations;
            for (var _b = 0, sits_3 = sits; _b < sits_3.length; _b++) {
                var sit = sits_3[_b];
                for (var i = 0; i < sit.aids.length; i++) {
                    if (sit.aids[i] == id) {
                        sit.aids.splice(i, 1);
                        break;
                    }
                }
            }
            _this.situations = sits;
        };
        this.saveActorName = function (name, id) {
            var acts = _this.actors;
            var act = _this.getActor(acts, id);
            act.name = name;
            _this.actors = acts;
        };
        this.saveActorDesc = function (desc, id) {
            var acts = _this.actors;
            var act = _this.getActor(acts, id);
            act.desc = desc;
            _this.actors = acts;
        };
        this.getActor = function (acts, id) {
            return (acts[_this.getActorIndex(acts, id)]);
        };
        this.getActorIndex = function (acts, id) {
            for (var i = 0; i < acts.length; i++) {
                if (acts[i].id == id)
                    return i;
            }
        };
        this.getActorsOf = function (sit) {
            var actors = _this.actors;
            var acts = [];
            for (var _i = 0, _a = sit.aids; _i < _a.length; _i++) {
                var aid = _a[_i];
                for (var _b = 0, actors_1 = actors; _b < actors_1.length; _b++) {
                    var actor = actors_1[_b];
                    if (actor.id == aid) {
                        acts.push(actor);
                        break;
                    }
                }
            }
            return acts;
        };
        //
        // moments
        //
        this.addMoment = function (scnid) {
            var id = -1;
            var moms = _this.moments;
            for (var _i = 0, moms_1 = moms; _i < moms_1.length; _i++) {
                var mom = moms_1[_i];
                if (mom.id > id)
                    id = mom.id;
            }
            id++;
            var mom = { kind: Kind.Moment, id: id, parentid: scnid, when: null, text: null };
            moms.push(mom);
            _this.moments = moms;
            //
            var scns = _this.scenes;
            var scn = _this.getScene(scns, scnid);
            scn.mids.push(id);
            _this.scenes = scns;
            return id;
        };
        this.deleteSceneMoment = function (id) {
            var moms = _this.moments;
            var index = _this.getMomentIndex(moms, id);
            var mom = moms[index];
            //
            moms.splice(index, 1);
            _this.moments = moms;
            //
            var scns = _this.scenes;
            for (var _i = 0, scns_2 = scns; _i < scns_2.length; _i++) {
                var scn = scns_2[_i];
                for (var i = 0; i < scn.mids.length; i++) {
                    if (scn.mids[i] == id) {
                        scn.mids.splice(i, 1);
                        break;
                    }
                }
            }
            _this.scenes = scns;
        };
        this.deleteActorMoment = function (id) {
            var moms = _this.moments;
            var index = _this.getMomentIndex(moms, id);
            var mom = moms[index];
            //
            moms.splice(index, 1);
            _this.moments = moms;
            //
            var acts = _this.actors;
            for (var _i = 0, acts_2 = acts; _i < acts_2.length; _i++) {
                var act = acts_2[_i];
                for (var i = 0; i < act.mids.length; i++) {
                    if (act.mids[i] == id) {
                        act.mids.splice(i, 1);
                        break;
                    }
                }
            }
            _this.actors = acts;
        };
        this.saveMomentWhen = function (when, id) {
            var moms = _this.moments;
            var mom = _this.getMoment(moms, id);
            mom.when = when;
            _this.moments = moms;
        };
        this.saveMomentText = function (text, id) {
            var moms = _this.moments;
            var mom = _this.getMoment(moms, id);
            mom.text = text;
            _this.moments = moms;
        };
        this.getMoment = function (moms, id) {
            return (moms[_this.getMomentIndex(moms, id)]);
        };
        this.getMomentIndex = function (moms, id) {
            for (var i = 0; i < moms.length; i++) {
                if (moms[i].id == id)
                    return i;
            }
        };
        this.getMomentsOf = function (scn) {
            var moments = _this.moments;
            var moms = [];
            for (var _i = 0, _a = scn.mids; _i < _a.length; _i++) {
                var mid = _a[_i];
                for (var _b = 0, moments_1 = moments; _b < moments_1.length; _b++) {
                    var moment = moments_1[_b];
                    if (moment.id == mid && moment.kind == Kind.Moment) {
                        moms.push(moment);
                        break;
                    }
                }
            }
            return moms;
        };
        //
        // actions
        //
        this.addAction = function (scnid) {
            var id = -1;
            var moms = _this.moments;
            for (var _i = 0, moms_2 = moms; _i < moms_2.length; _i++) {
                var mom = moms_2[_i];
                if (mom.id > id)
                    id = mom.id;
            }
            id++;
            var act = { kind: Kind.Action, id: id, parentid: scnid, when: null, text: null, name: null };
            moms.push(act);
            _this.moments = moms;
            //
            var scns = _this.scenes;
            var scn = _this.getScene(scns, scnid);
            scn.mids.push(id);
            _this.scenes = scns;
            return id;
        };
        this.deleteAction = function (id) {
            _this.deleteSceneMoment(id);
        };
        this.saveActionWhen = function (when, id) {
            _this.saveMomentWhen(when, id);
        };
        this.saveActionName = function (text, id) {
            var moms = _this.moments;
            var act = _this.getAction(moms, id);
            act.name = text;
            _this.moments = moms;
        };
        this.saveActionText = function (text, id) {
            _this.saveMomentText(text, id);
        };
        this.getAction = function (acts, id) {
            return _this.getMoment(acts, id);
        };
        this.getActionsOf = function (scn) {
            var moments = _this.moments;
            var moms = [];
            for (var _i = 0, _a = scn.mids; _i < _a.length; _i++) {
                var mid = _a[_i];
                for (var _b = 0, moments_2 = moments; _b < moments_2.length; _b++) {
                    var moment = moments_2[_b];
                    if (moment.id == mid && moment.kind == Kind.Action) {
                        moms.push(moment);
                        break;
                    }
                }
            }
            return moms;
        };
        //
        // messages TO
        //
        this.addMessageTo = function (actid) {
            var id = -1;
            var moms = _this.moments;
            for (var _i = 0, moms_3 = moms; _i < moms_3.length; _i++) {
                var mom = moms_3[_i];
                if (mom.id > id)
                    id = mom.id;
            }
            id++;
            var msg = { kind: Kind.MessageTo, id: id, parentid: actid, when: null, text: null, name: null, to: null };
            moms.push(msg);
            _this.moments = moms;
            //
            var acts = _this.actors;
            var act = _this.getActor(acts, actid);
            act.mids.push(id);
            _this.actors = acts;
            return id;
        };
        this.deleteMessageTo = function (id) {
            _this.deleteActorMoment(id);
        };
        this.saveMessageToWhen = function (when, id) {
            _this.saveMomentWhen(when, id);
        };
        this.saveMessageToName = function (text, id) {
            var moms = _this.moments;
            var msg = _this.getMessageTo(moms, id);
            msg.name = text;
            _this.moments = moms;
        };
        this.saveMessageToText = function (text, id) {
            _this.saveMomentText(text, id);
        };
        this.saveMessageToActorTo = function (to, id) {
            var moms = _this.moments;
            var msg = _this.getMessageTo(moms, id);
            msg.to = to;
            _this.moments = moms;
        };
        this.getMessageTo = function (msgs, id) {
            return _this.getMoment(msgs, id);
        };
        this.getMessageToOf = function (act) {
            var moments = _this.moments;
            var moms = [];
            for (var _i = 0, _a = act.mids; _i < _a.length; _i++) {
                var mid = _a[_i];
                for (var _b = 0, moments_3 = moments; _b < moments_3.length; _b++) {
                    var moment = moments_3[_b];
                    if (moment.id == mid && moment.kind == Kind.MessageTo) {
                        moms.push(moment);
                        break;
                    }
                }
            }
            return moms;
        };
        this.getActorsForMessageTo = function (data, msg) {
            var player = _this.getActor(data.actors, msg.parentid);
            var sit = _this.getSituation(data.situations, player.sitid);
            var actors = data.actors;
            var acts = [];
            for (var _i = 0, _a = sit.aids; _i < _a.length; _i++) {
                var aid = _a[_i];
                for (var _b = 0, actors_2 = actors; _b < actors_2.length; _b++) {
                    var actor = actors_2[_b];
                    if (actor.id == aid && actor.id != sit.aid) {
                        acts.push(actor);
                        break;
                    }
                }
            }
            return acts;
        };
        //
        // messages FROM
        //
        this.addMessageFrom = function (actid) {
            var id = -1;
            var moms = _this.moments;
            for (var _i = 0, moms_4 = moms; _i < moms_4.length; _i++) {
                var mom = moms_4[_i];
                if (mom.id > id)
                    id = mom.id;
            }
            id++;
            var msg = { kind: Kind.MessageFrom, id: id, parentid: actid, when: null, text: null };
            moms.push(msg);
            _this.moments = moms;
            //
            var acts = _this.actors;
            var act = _this.getActor(acts, actid);
            act.mids.push(id);
            _this.actors = acts;
            return id;
        };
        this.deleteMessageFrom = function (id) {
            _this.deleteActorMoment(id);
        };
        this.saveMessageFromWhen = function (when, id) {
            _this.saveMomentWhen(when, id);
        };
        this.saveMessageFromText = function (text, id) {
            _this.saveMomentText(text, id);
        };
        this.getMessageFrom = function (msgs, id) {
            return _this.getMoment(msgs, id);
        };
        this.getMessageFromOf = function (act) {
            var moments = _this.moments;
            var moms = [];
            for (var _i = 0, _a = act.mids; _i < _a.length; _i++) {
                var mid = _a[_i];
                for (var _b = 0, moments_4 = moments; _b < moments_4.length; _b++) {
                    var moment = moments_4[_b];
                    if (moment.id == mid && moment.kind == Kind.MessageFrom) {
                        moms.push(moment);
                        break;
                    }
                }
            }
            return moms;
        };
        //
        // localstorage
        //
        this.clearStorage = function () {
            localStorage.clear();
        };
    }
    Object.defineProperty(GameData.prototype, "game", {
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
    Object.defineProperty(GameData.prototype, "situations", {
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
    Object.defineProperty(GameData.prototype, "scenes", {
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
    Object.defineProperty(GameData.prototype, "actors", {
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
    Object.defineProperty(GameData.prototype, "moments", {
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
    Object.defineProperty(GameData.prototype, "state", {
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
    Object.defineProperty(GameData.prototype, "history", {
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
    Object.defineProperty(GameData.prototype, "options", {
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
    Object.defineProperty(GameData.prototype, "continueState", {
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
    return GameData;
}());
var Editor = (function () {
    function Editor() {
        var _this = this;
        this.init = function (app, leftView, centerView, rightView) {
            _this.app = app;
            _this.leftView = leftView;
            _this.centerView = centerView;
            _this.rightView = rightView;
            var $ = _this.$;
            app.onPageInit("*", function (page) {
                if (page.url == undefined)
                    return;
                if (page.query.hasOwnProperty("direct"))
                    return;
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
            app.onPageBack("*", function (page) {
                if (page.url == undefined)
                    return;
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
            app.onPageAfterAnimation("*", function (page) {
                if (page.url == undefined)
                    return;
                if (page.query.select == undefined)
                    return;
                var $view = $(page.view.selector);
                $view.find(".ted-selected").removeClass("ted-selected");
                var $a = $view.find(".page-on-center").find("a[href='" + page.query.select + "']");
                var $li = $a.closest("li");
                $li.addClass("ted-selected");
            });
            $(document).on("click", "div#ted-situations li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "div#ted-scenes li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "div#ted-actors li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "div#ted-moments li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "div#ted-actions li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "div#ted-messages-to li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "div#ted-messages-from li", function (e) {
                $(e.target.closest(".page")).find("li").removeClass("ted-selected");
                $(e.target.closest("li")).addClass("ted-selected");
            });
            $(document).on("click", "#ted-load-game", function (e) {
                var data = _this.gdata.loadGame();
                delete data.me;
                delete data.meid;
                var text = JSON.stringify(data);
                $("#ted-game-data").val(text);
            });
            $(document).on("click", "#ted-load-game2", function (e) {
                var data = _this.gdata.loadGame();
                delete data.me;
                delete data.meid;
                var text = JSON.stringify(data);
                $("#ted-game-data2").val(text);
            });
            $(document).on("click", "#ted-save-game", function (e) {
                app.confirm("This will ovewrite the current game data. A manual refresh of the game will be required. Is this ok?", "Save Game Data", function () {
                    var text = $("#ted-game-data").val();
                    _this.gdata.saveData(text);
                });
            });
            $(document).on("click", "#ted-add-situation", function (e) {
                var gameid = _this.getMeId(e.target);
                var id = _this.gdata.addSituation(gameid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/situation.html?id=' + id + '" class="item-link">'
                    + '<div class="item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-situations ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                leftView.router.load({ url: "page/situation.html?id=" + id });
            });
            $(document).on("click", "#ted-back-situations", function (e) {
                //if the editor is synced with the game this page might not have history, so go to home page 
                leftView.router.back({ url: leftView.history[0], force: true });
            });
            $(document).on("click", "#ted-delete-situation", function (e) {
                app.confirm("Are you sure?", "Delete Situation", function () {
                    _this.gdata.deleteSituation(_this.getMeId(e.target));
                    var history = _this.leftView.history;
                    _this.leftView.router.back({
                        url: history[history.length - 2],
                        force: true,
                        ignoreCache: true
                    });
                });
            });
            $(document).on("click", "#ted-add-scene", function (e) {
                var sitid = _this.getMeId(e.target);
                var id = _this.gdata.addScene(sitid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/scene.html?id=' + id + '" data-view=".view-center" class="item-link">'
                    + '<div class="item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-scenes ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                centerView.router.load({ url: "page/scene.html?id=" + id });
            });
            $(document).on("click", "#ted-back-situation", function (e) {
                //if the editor is synced with the game we will have a lot of pages in the history, so bypass them
                leftView.router.back({ url: "page/situation-index.html", force: true });
            });
            $(document).on("click", "#ted-delete-scene", function (e) {
                app.confirm("Are you sure?", "Delete Scene", function () {
                    _this.gdata.deleteScene(_this.getMeId(e.target));
                    var history = _this.centerView.history;
                    _this.centerView.router.back({
                        url: history[0],
                        force: true,
                        ignoreCache: true
                    });
                    _this.leftView.router.refreshPage();
                });
            });
            $(document).on("click", "#ted-add-actor", function (e) {
                var sitid = _this.getMeId(e.target);
                var id = _this.gdata.addActor(sitid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/actor.html?id=' + id + '" data-view=".view-center" class="item-link">'
                    + '<div class="item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-actors ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                centerView.router.load({ url: "page/actor.html?id=" + id });
            });
            $(document).on("click", "#ted-delete-actor", function (e) {
                app.confirm("Are you sure?", "Delete Actor", function () {
                    _this.gdata.deleteActor(_this.getMeId(e.target));
                    var history = _this.centerView.history;
                    _this.centerView.router.back({
                        url: history[0],
                        force: true,
                        ignoreCache: true
                    });
                    _this.leftView.router.refreshPage();
                });
            });
            $(document).on("click", "#ted-add-moment", function (e) {
                var momid = _this.getMeId(e.target);
                var id = _this.gdata.addMoment(momid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/moment.html?id=' + id + '" data-view=".view-right" class="item-link item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title-row">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '<div class="item-text">'
                    + '</div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-moments > div > ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                rightView.router.load({ url: "page/moment.html?id=" + id });
            });
            $(document).on("click", "#ted-delete-moment", function (e) {
                app.confirm("Are you sure?", "Delete Moment", function () {
                    _this.gdata.deleteSceneMoment(_this.getMeId(e.target));
                    var history = _this.rightView.history;
                    _this.rightView.router.back({
                        url: history[0],
                        force: true,
                        ignoreCache: true
                    });
                    _this.centerView.router.refreshPage();
                });
            });
            $(document).on("click", "#ted-add-action", function (e) {
                var actid = _this.getMeId(e.target);
                var id = _this.gdata.addAction(actid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/action.html?id=' + id + '" data-view=".view-right" class="item-link item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title-row">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '<div class="item-subtitle"></div>'
                    + '<div class="item-text">'
                    + '</div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-actions > div > ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                rightView.router.load({ url: "page/action.html?id=" + id });
            });
            $(document).on("click", "#ted-delete-action", function (e) {
                app.confirm("Are you sure?", "Delete Action", function () {
                    _this.gdata.deleteAction(_this.getMeId(e.target));
                    var history = _this.rightView.history;
                    _this.rightView.router.back({
                        url: history[0],
                        force: true,
                        ignoreCache: true
                    });
                    _this.centerView.router.refreshPage();
                });
            });
            $(document).on("click", "#ted-add-message-to", function (e) {
                var actid = _this.getMeId(e.target);
                var id = _this.gdata.addMessageTo(actid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/message-to.html?id=' + id + '" data-view=".view-right" class="item-link item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title-row">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '<div class="item-subtitle"></div>'
                    + '<div class="item-text"></div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-messages-to > div > ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                rightView.router.load({ url: "page/message-to.html?id=" + id });
            });
            $(document).on("click", "#ted-delete-message-to", function (e) {
                app.confirm("Are you sure?", "Delete Message", function () {
                    _this.gdata.deleteMessageTo(_this.getMeId(e.target));
                    var history = _this.rightView.history;
                    _this.rightView.router.back({
                        url: history[0],
                        force: true,
                        ignoreCache: true
                    });
                    _this.centerView.router.refreshPage();
                });
            });
            $(document).on("click", "#ted-add-message-from", function (e) {
                var actid = _this.getMeId(e.target);
                var id = _this.gdata.addMessageFrom(actid);
                var li = '<li class="ted-selected">'
                    + '<a href="page/message-from.html?id=' + id + '" data-view=".view-right" class="item-link item-content">'
                    + '<div class="item-inner">'
                    + '<div class="item-title-row">'
                    + '<div class="item-title"></div>'
                    + '</div>'
                    + '<div class="item-text"></div>'
                    + '</div>'
                    + '</a>'
                    + '</li>';
                var $ul = $("#ted-messages-from > div > ul");
                $ul.find("li").removeClass("ted-selected");
                $ul.append(li);
                rightView.router.load({ url: "page/message-from.html?id=" + id });
            });
            $(document).on("click", "#ted-delete-message-from", function (e) {
                app.confirm("Are you sure?", "Delete Message", function () {
                    _this.gdata.deleteMessageTo(_this.getMeId(e.target));
                    var history = _this.rightView.history;
                    _this.rightView.router.back({
                        url: history[0],
                        force: true,
                        ignoreCache: true
                    });
                    _this.centerView.router.refreshPage();
                });
            });
            $(document).on("change", "#ted-game-name", function (e) {
                _this.gdata.saveGameName(e.target.value);
            });
            $(document).on("change", "#ted-game-initialstate", function (e) {
                _this.gdata.saveGameInitialState(e.target.value);
            });
            $(document).on("change", "#ted-game-desc", function (e) {
                _this.gdata.saveGameDesc(e.target.value);
            });
            $(document).on("change", "#ted-situation-name", function (e) {
                _this.gdata.saveSituationName(e.target.value, _this.getMeId(e.target));
                $("#ted-situations li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-situation-when", function (e) {
                _this.gdata.saveSituationWhen(e.target.value, _this.getMeId(e.target));
            });
            $(document).on("change", "#ted-situation-tags", function (e) {
                _this.gdata.saveSituationTags(e.target.value, _this.getMeId(e.target));
            });
            $(document).on("change", "#ted-scene-name", function (e) {
                _this.gdata.saveSceneName(e.target.value, _this.getMeId(e.target));
                $("#ted-scenes li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-scene-desc", function (e) {
                _this.gdata.saveSceneDesc(e.target.value, _this.getMeId(e.target));
            });
            $(document).on("change", "#ted-player-name", function (e) {
                _this.gdata.saveActorName(e.target.value, _this.getMeId(e.target));
            });
            $(document).on("change", "#ted-player-desc", function (e) {
                _this.gdata.saveActorDesc(e.target.value, _this.getMeId(e.target));
            });
            $(document).on("change", "#ted-actor-name", function (e) {
                _this.gdata.saveActorName(e.target.value, _this.getMeId(e.target));
                $("#ted-actors li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-actor-desc", function (e) {
                _this.gdata.saveActorDesc(e.target.value, _this.getMeId(e.target));
            });
            $(document).on("change", "#ted-moment-when", function (e) {
                _this.gdata.saveMomentWhen(e.target.value, _this.getMeId(e.target));
                $("#ted-moments li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-moment-text", function (e) {
                _this.gdata.saveMomentText(e.target.value, _this.getMeId(e.target));
                var ul = "<ul><li>" + Game.getCommands(e.target.value).join("</li><li>") + "</li></ul>";
                $("#ted-moments li.ted-selected div.item-text").html(ul);
            });
            $(document).on("change", "#ted-action-name", function (e) {
                _this.gdata.saveActionName(e.target.value, _this.getMeId(e.target));
                $("#ted-actions li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-action-when", function (e) {
                _this.gdata.saveActionWhen(e.target.value, _this.getMeId(e.target));
                $("#ted-actions li.ted-selected div.item-subtitle").text(e.target.value);
            });
            $(document).on("change", "#ted-action-text", function (e) {
                _this.gdata.saveActionText(e.target.value, _this.getMeId(e.target));
                var ul = "<ul><li>" + Game.getCommands(e.target.value).join("</li><li>") + "</li></ul>";
                $("#ted-actions li.ted-selected div.item-text").html(ul);
            });
            $(document).on("change", "#ted-message-to-name", function (e) {
                _this.gdata.saveMessageToName(e.target.value, _this.getMeId(e.target));
                $("#ted-messages-to li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-message-to-when", function (e) {
                _this.gdata.saveMessageToWhen(e.target.value, _this.getMeId(e.target));
                $("#ted-messages-to li.ted-selected div.item-subtitle").text(e.target.value);
            });
            $(document).on("click", "input[name^='radio-']", function (e) {
                var $ssp = $(e.target).closest("div.smart-select-popup");
                if ($ssp.length == 0)
                    return;
                //
                var $dp = $ssp.find("div[data-page]");
                var $dsn = $dp.find("div[data-select-name]");
                var $pc = $dp.find("div.page-content input:checked");
                var $it = $pc.next("div.item-inner").find("div.item-title");
                //
                var name = $dsn[0].getAttribute("data-select-name");
                if (name.startsWith("actors-for-")) {
                    var toid = parseInt($pc.val());
                    var meid = parseInt(name.substr("actors-for-".length));
                    _this.gdata.saveMessageToActorTo(toid, meid);
                }
            });
            $(document).on("change", "#ted-message-to-text", function (e) {
                _this.gdata.saveMessageToText(e.target.value, _this.getMeId(e.target));
                var ul = "<ul><li>" + Game.getCommands(e.target.value).join("</li><li>") + "</li></ul>";
                $("#ted-messages-to li.ted-selected div.item-text").html(ul);
            });
            $(document).on("change", "#ted-message-from-when", function (e) {
                _this.gdata.saveMessageFromWhen(e.target.value, _this.getMeId(e.target));
                $("#ted-messages-from li.ted-selected div.item-title").text(e.target.value);
            });
            $(document).on("change", "#ted-message-from-text", function (e) {
                _this.gdata.saveMessageFromText(e.target.value, _this.getMeId(e.target));
                var ul = "<ul><li>" + Game.getCommands(e.target.value).join("</li><li>") + "</li></ul>";
                $("#ted-messages-from li.ted-selected div.item-text").html(ul);
            });
        };
        this.getMeId = function (target) {
            return parseInt(target.closest("div.page").getAttribute("data-ted-meid"));
        };
        this.gdata = new GameData();
        this.$ = Dom7;
        var $ = Dom7;
        var data = this.gdata.loadGame();
        var gameinfo = document.querySelector("div.pages");
        var content = gameinfo.innerHTML;
        var template = Template7.compile(content);
        gameinfo.innerHTML = template(data);
        window.EditorInstance = this;
    }
    Editor.prototype.preprocess = function (content, url, next) {
        var gdata = this.gdata;
        var pages = [
            {
                url: "http://",
                getData: function (id) {
                    var data = gdata.loadGame();
                    return data;
                }
            },
            {
                url: "page/situation-index.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    return data;
                }
            },
            {
                url: "page/situation.html",
                getData: function (id) {
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
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getScene(gdata.scenes, id);
                    data.me = me;
                    data.meid = id;
                    data.me.moments = gdata.getMomentsOf(me);
                    data.me.actions = gdata.getActionsOf(me);
                    for (var _i = 0, _a = data.me.moments; _i < _a.length; _i++) {
                        var mom = _a[_i];
                        mom.commands = Game.getCommands(mom.text);
                    }
                    for (var _b = 0, _c = data.me.actions; _b < _c.length; _b++) {
                        var act = _c[_b];
                        act.commands = Game.getCommands(act.text);
                    }
                    return data;
                }
            },
            {
                url: "page/moment.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getMoment(gdata.moments, id);
                    data.me = me;
                    data.meid = id;
                    return data;
                }
            },
            {
                url: "page/action.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getAction(gdata.moments, id);
                    data.me = me;
                    data.meid = id;
                    return data;
                }
            },
            {
                url: "page/player.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getActor(gdata.actors, id);
                    data.me = me;
                    data.meid = id;
                    data.me.messages = gdata.getMessageToOf(me);
                    for (var _i = 0, _a = data.me.messages; _i < _a.length; _i++) {
                        var msg = _a[_i];
                        msg.commands = Game.getCommands(msg.text);
                    }
                    return data;
                }
            },
            {
                url: "page/actor.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getActor(gdata.actors, id);
                    data.me = me;
                    data.meid = id;
                    data.me.messages = gdata.getMessageFromOf(me);
                    for (var _i = 0, _a = data.me.messages; _i < _a.length; _i++) {
                        var msg = _a[_i];
                        msg.commands = Game.getCommands(msg.text);
                    }
                    return data;
                }
            },
            {
                url: "page/message-to.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getMessageTo(gdata.moments, id);
                    data.me = me;
                    data.meid = id;
                    data.me.actors = gdata.getActorsForMessageTo(data, me);
                    for (var _i = 0, _a = data.me.actors; _i < _a.length; _i++) {
                        var act = _a[_i];
                        act.selected = (act.id == me.to ? "selected" : null);
                    }
                    return data;
                }
            },
            {
                url: "page/message-from.html",
                getData: function (id) {
                    var data = gdata.loadGame();
                    var me = gdata.getMessageFrom(gdata.moments, id);
                    data.me = me;
                    data.meid = id;
                    return data;
                }
            }
        ];
        if (url == undefined)
            return;
        for (var _i = 0, pages_1 = pages; _i < pages_1.length; _i++) {
            var page = pages_1[_i];
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
    ;
    Editor.prototype.gotoMoment = function (moment) {
        if (moment.kind == Kind.Moment || moment.kind == Kind.Action) {
            var scenes = this.gdata.scenes;
            var scene = this.gdata.getScene(scenes, moment.parentid);
            var sits = this.gdata.situations;
            var sit = this.gdata.getSituation(sits, scene.sitid);
            var rightUrl = null;
            if (moment.kind == Kind.Moment)
                rightUrl = "page/moment.html?id=" + moment.id;
            else
                rightUrl = "page/action.html?id=" + moment.id;
            var centerUrl = "page/scene.html?id=" + moment.parentid;
            var leftUrl = "page/situation.html?id=" + sit.id;
            this.rightView.router.load({ url: rightUrl, animatePages: false, ignoreCache: true, query: { direct: true } });
            this.centerView.router.load({ url: centerUrl + "&mid=" + moment.id, animatePages: false, ignoreCache: true, query: { direct: true, select: rightUrl } });
            this.leftView.router.load({ url: leftUrl + "&mpid=" + moment.parentid, animatePages: false, ignoreCache: true, query: { direct: true, select: centerUrl } });
        }
        else {
            var acts = this.gdata.actors;
            var actor = this.gdata.getActor(acts, moment.parentid);
            var sits = this.gdata.situations;
            var sit = this.gdata.getSituation(sits, actor.sitid);
            var rightUrl = null;
            if (moment.kind == Kind.MessageTo)
                rightUrl = "page/message-to.html?id=" + moment.id;
            else
                rightUrl = "page/message-from.html?id=" + moment.id;
            var centerUrl = null;
            if (actor.id == sit.aid)
                centerUrl = "page/player.html?id=" + moment.parentid;
            else
                centerUrl = "page/actor.html?id=" + moment.parentid;
            var leftUrl = "page/situation.html?id=" + sit.id;
            this.rightView.router.load({ url: rightUrl, animatePages: false, ignoreCache: true, query: { direct: true } });
            this.centerView.router.load({ url: centerUrl + "&mid=" + moment.id, animatePages: false, ignoreCache: true, query: { direct: true, select: rightUrl } });
            this.leftView.router.load({ url: leftUrl + "&mpid=" + moment.parentid, animatePages: false, ignoreCache: true, query: { direct: true, select: centerUrl } });
        }
    };
    return Editor;
}());
var Op;
(function (Op) {
    Op[Op["WAITING"] = 0] = "WAITING";
    Op[Op["MOMENT"] = 1] = "MOMENT";
    Op[Op["BLURB"] = 2] = "BLURB";
    Op[Op["CHOICES"] = 3] = "CHOICES";
    Op[Op["MENU_BOOT"] = 4] = "MENU_BOOT";
    Op[Op["MENU_INGAME"] = 5] = "MENU_INGAME";
    Op[Op["NEWGAME"] = 6] = "NEWGAME";
    Op[Op["CONTINUE_SAVEDGAME"] = 7] = "CONTINUE_SAVEDGAME";
    Op[Op["CONTINUE_INGAME"] = 8] = "CONTINUE_INGAME";
})(Op || (Op = {}));
var OpAction;
(function (OpAction) {
    OpAction[OpAction["SHOWING_CHOICES"] = 0] = "SHOWING_CHOICES";
    OpAction[OpAction["GAME_START"] = 1] = "GAME_START";
    OpAction[OpAction["SHOWING_MOMENT"] = 2] = "SHOWING_MOMENT";
})(OpAction || (OpAction = {}));
var CKind;
(function (CKind) {
    CKind[CKind["scene"] = 0] = "scene";
    CKind[CKind["action"] = 1] = "action";
    CKind[CKind["messageTo"] = 2] = "messageTo";
    CKind[CKind["messageFrom"] = 3] = "messageFrom";
})(CKind || (CKind = {}));
var UI = (function () {
    function UI(update, opmenu, skipMenu, menuPage, ready) {
        var _this = this;
        this.update = update;
        this.typing = false;
        this.stopTyping = false;
        this.onBlurbTap = function (op) {
            _this.blurbOp = op;
        };
        this.alert = function (op, text) {
            var content = document.querySelector(".content");
            content.classList.add("overlay");
            content.style.pointerEvents = "none";
            var panel = document.querySelector(".modal-inner");
            panel.innerHTML = "<p>" + text + "</p>";
            var modal = document.querySelector(".modal");
            modal.classList.add("show");
            var me = _this;
            modal.addEventListener("click", function click(e) {
                modal.removeEventListener("click", click);
                modal.classList.remove("show");
                setTimeout(function () {
                    content.classList.remove("overlay");
                    content.style.pointerEvents = "";
                    me.update(op);
                }, 250);
            });
        };
        this.showChoices = function (op, sceneChoices) {
            var panel = document.querySelector(".choice-panel");
            panel.innerHTML = "";
            var ul = document.createElement("ul");
            for (var i = 0; i < sceneChoices.length; i++) {
                var choice = sceneChoices[i];
                var icon = "ion-ios-location";
                if (choice.kind == CKind.action)
                    icon = "ion-flash";
                if (choice.kind == CKind.messageTo)
                    icon = "ion-android-person";
                if (choice.kind == CKind.messageFrom)
                    icon = "ion-chatbubble-working";
                var li = document.createElement("li");
                li.setAttribute("data-kind", choice.kind.toString());
                li.setAttribute("data-id", choice.id.toString());
                var html = "\n                <div class=\"kind\"><div><i class=\"icon " + icon + "\"></i></div></div>\n                <div class=\"choice\">" + choice.text + "</div>";
                if (choice.subtext != undefined) {
                    html = html + "<div class=\"choice subtext\">" + choice.subtext + "</div>";
                }
                li.innerHTML = html;
                ul.appendChild(li);
            }
            panel.appendChild(ul);
            var content = document.querySelector(".content");
            content.classList.add("overlay");
            panel.style.top = "calc(100% - " + panel.offsetHeight + "px)";
            var text = document.querySelector(".content-inner");
            text.style.marginBottom = panel.offsetHeight + "px";
            _this.scrollContent(text.parentElement);
            var me = _this;
            var lis = document.querySelectorAll(".choice-panel li");
            var onChoice = function (e) {
                for (var i = 0; i < lis.length; i++) {
                    lis[i].removeEventListener("click", onChoice);
                }
                var target = e.target;
                var li = target;
                while (true) {
                    if (li.nodeName == "LI")
                        break;
                    li = li.parentElement;
                }
                me.update(op, {
                    kind: parseInt(li.getAttribute("data-kind")),
                    id: parseInt(li.getAttribute("data-id")),
                    text: ""
                });
            };
            for (var i = 0; i < lis.length; i++) {
                lis[i].addEventListener("click", onChoice);
            }
        };
        this.hideChoices = function (callback) {
            var content = document.querySelector(".content");
            content.classList.remove("overlay");
            content.style.pointerEvents = "auto";
            // make sure the first blurb will be visible
            var shell = document.querySelector(".shell");
            shell.scrollTop = content.offsetTop;
            var panel = document.querySelector(".choice-panel");
            panel.style.top = "100%";
            var text = document.querySelector(".content-inner");
            text.style.marginBottom = "0";
            text.setAttribute("style", "");
            setTimeout(callback, 0);
        };
        this.initScene = function (data, callback) {
            var title = document.querySelector(".title span");
            title.textContent = data.title;
            if (data.image == undefined)
                callback();
            _this.changeBackground(data.image, callback);
        };
        this.addBlurb = function (chunk) {
            var html = _this.markupChunk(chunk);
            var content = document.querySelector(".content-inner");
            var div = document.createElement("div");
            div.innerHTML = html;
            var section = div.firstChild;
            var spans = section.querySelectorAll("span");
            section.style.opacity = "0";
            content.appendChild(section);
            _this.scrollContent(content.parentElement);
            setTimeout(function () {
                section.style.opacity = "1";
                section.style.transition = "all 0.15s ease";
                if (spans.length > 0) {
                    _this.typing = true;
                    _this.stopTyping = false;
                    var ispan = 0;
                    var show_1 = function () {
                        if (_this.stopTyping) {
                            while (ispan < spans.length)
                                spans[ispan++].removeAttribute("style");
                            _this.typing = false;
                        }
                        else {
                            spans[ispan++].removeAttribute("style");
                            if (ispan < spans.length)
                                setTimeout(show_1, 25);
                            else
                                _this.typing = false;
                        }
                    };
                    setTimeout(show_1, 100);
                }
            }, 0);
        };
        this.addBlurbFast = function (chunk) {
            var html = _this.markupChunk(chunk)
                .replace(/ style\="visibility:hidden"/g, "")
                .replace(/<span>/g, "")
                .replace(/<\/span>/g, "");
            var content = document.querySelector(".content-inner");
            var div = document.createElement("div");
            div.innerHTML = html;
            var section = div.firstChild;
            content.appendChild(section);
        };
        this.clearBlurb = function () {
            var content = document.querySelector(".content-inner");
            content.innerHTML = "";
        };
        this.showMenu = function (opNewGame, opContinue) {
            var menu = document.querySelector(".menu");
            menu.style.right = "0";
            var options = { continue: "disabled" };
            if (opContinue != undefined)
                options.continue = "enabled";
            var iframe = document.querySelector("div.menu iframe");
            var configureMenu = iframe.contentWindow.configureMenu;
            configureMenu(options, function (name) {
                if (name == "continue") {
                    menu.style.right = "100%";
                    setTimeout(function () { _this.update(opContinue); }, 250);
                }
                else {
                    setTimeout(function () { _this.update(opNewGame); }, 500);
                }
            });
        };
        this.changeBackground = function (assetName, callback) {
            if (assetName == undefined) {
                callback();
                return;
            }
            var isImg = false;
            for (var _i = 0, _a = [".jpg", ".jpeg", ".png", ".gif"]; _i < _a.length; _i++) {
                var img = _a[_i];
                if (assetName.endsWith(img))
                    isImg = true;
            }
            var inner = document.querySelector(".graphics-inner");
            var zero = inner.children[0];
            var one = inner.children[1];
            var back = (zero.style.zIndex == "0" ? zero : one);
            var front = (zero.style.zIndex == "0" ? one : zero);
            var backFrame = back.firstElementChild;
            var frontFrame = front.firstElementChild;
            var sceneUrl = "dist/game/_image.html";
            if (isImg == false)
                sceneUrl = "dist/game/" + assetName;
            if (frontFrame.src.indexOf(sceneUrl) != -1)
                callback();
            var fader = inner.children[2];
            fader.style.opacity = "0.35";
            fader.style.zIndex = "2";
            var preloader = document.querySelector(".preloader");
            preloader.classList.add("change-bg");
            localStorage.setItem("ding", null);
            localStorage.setItem("_image_file", assetName);
            window.addEventListener("storage", function done(e) {
                if (e.key == "ding" && (JSON.parse(e.newValue).content == "ready")) {
                    window.removeEventListener("storage", done);
                    back.style.opacity = "1";
                    front.style.opacity = "0";
                    fader.style.opacity = "0";
                    preloader.classList.remove("change-bg");
                    fader.addEventListener("transitionend", function done() {
                        fader.removeEventListener("transitionend", done);
                        fader.style.zIndex = "0";
                        back.style.zIndex = "1";
                        front.style.zIndex = "0";
                        if (callback != undefined)
                            callback();
                    });
                }
            });
            back.style.opacity = "0";
            backFrame.setAttribute("src", sceneUrl);
        };
        this.markupChunk = function (chunk) {
            var dialog = chunk;
            var html = Array();
            if (dialog.actor != undefined) {
                html.push("<section class=\"dialog\">");
                html.push("<h1>" + dialog.actor + "</h1>");
                if (dialog.parenthetical != undefined)
                    html.push("<h2>" + dialog.parenthetical + "</h2>");
                for (var _i = 0, _a = dialog.lines; _i < _a.length; _i++) {
                    var line = _a[_i];
                    var spans = Array.prototype.map.call(line, function (char) {
                        return "<span style=\"visibility:hidden\">" + char + "</span>";
                    });
                    html.push("<p>" + spans.join("") + "</p>");
                }
                html.push("</section>");
            }
            else {
                html.push("<section class=\"text\">");
                for (var _b = 0, _c = dialog.lines; _b < _c.length; _b++) {
                    var line = _c[_b];
                    html.push("<p>" + line + "</p>");
                }
                html.push("</section>");
            }
            return html.join("");
        };
        this.scrollContent = function (element) {
            var start = element.scrollTop;
            var end = (element.scrollHeight - element.clientHeight);
            if (end <= start)
                return;
            var top = start;
            setTimeout(function scroll() {
                top += 10;
                element.scrollTop = top + 1;
                if (top < end)
                    setTimeout(scroll, 10);
            }, 10);
        };
        var me = this;
        document.querySelector(".content").addEventListener("click", function (e) {
            me.stopTyping = true;
            var wasTyping = me.typing;
            var check = function () {
                if (me.typing)
                    setTimeout(check, 10);
                else if (wasTyping == false)
                    me.update(me.blurbOp);
            };
            setTimeout(check, 10);
        });
        document.querySelector(".goto-menu").addEventListener("click", function (e) {
            e.stopPropagation();
            _this.update(opmenu);
        });
        if (document.querySelector("body").classList.contains("landscape")) {
            var navbar = document.querySelector(".navbar");
            var shell = document.querySelector(".shell");
            navbar.addEventListener("click", function (e) {
                if (shell.classList.contains("retracted"))
                    shell.classList.remove("retracted");
                else
                    shell.classList.add("retracted");
            });
        }
        if ("addEventListener" in document) {
            document.addEventListener("DOMContentLoaded", function () {
                FastClick.attach(document.body);
            }, false);
        }
        localStorage.setItem("ding", null);
        window.addEventListener("storage", function done(e) {
            if (e.key == "ding" && (JSON.parse(e.newValue).menu == "ready")) {
                window.removeEventListener("storage", done);
                var preloader = document.querySelector(".preloader");
                setTimeout(function () {
                    preloader.style.opacity = "0";
                    preloader.addEventListener("transitionend", function done() {
                        preloader.removeEventListener("transitionend", done);
                        preloader.classList.remove("full-white");
                        preloader.removeAttribute("style");
                    });
                }, 750);
                setTimeout(ready, 0);
            }
        });
        var menuUrl = "dist/game/" + menuPage;
        document.querySelector(".menu iframe").setAttribute("src", menuUrl);
    }
    ;
    return UI;
}());
var Game = (function () {
    function Game() {
        var _this = this;
        this.fastUi = false;
        this.update = function (op, param) {
            _this.data = _this.gdata.loadGame();
            var ui = _this.ui;
            if (op == Op.MOMENT) {
                _this.saveContinueState();
                if (_this.currentMoment == null) {
                    ui.alert(Op.WAITING, "Il ne se passe plus rien pour le moment.");
                    return null;
                }
                _this.chunks = _this.parseMoment(_this.currentMoment);
                _this.cix = 0;
                var kind = _this.currentMoment.kind;
                if (kind == Kind.Moment || kind == Kind.Action) {
                    _this.currentScene = _this.getSceneOf(_this.currentMoment);
                }
                ui.initScene(_this.parseScene(_this.currentScene), function () {
                    ui.clearBlurb();
                    ui.onBlurbTap(Op.BLURB);
                    _this.raiseActionEvent(OpAction.SHOWING_MOMENT, _this.currentMoment);
                    setTimeout(function () { _this.update(Op.BLURB); }, 0);
                });
            }
            else if (op == Op.BLURB) {
                if (_this.cix < _this.chunks.length) {
                    var chunk = _this.chunks[_this.cix++];
                    if (chunk.asset != undefined) {
                        ui.changeBackground(chunk.asset, function () {
                            setTimeout(function () { _this.update(Op.BLURB); }, 0);
                        });
                    }
                    else {
                        var notLast = _this.cix < _this.chunks.length;
                        var goFast = _this.fastUi && notLast;
                        if (goFast) {
                            ui.addBlurbFast(chunk);
                            setTimeout(function () { _this.update(Op.BLURB); }, 50);
                        }
                        else {
                            ui.addBlurb(chunk);
                        }
                    }
                }
                else {
                    var state = _this.gdata.state;
                    if (state.intro != undefined) {
                        delete state.intro;
                        _this.gdata.state = state;
                    }
                    _this.executeMoment(_this.currentMoment.id);
                    _this.raiseActionEvent(OpAction.SHOWING_CHOICES);
                    var moments = _this.getAllPossibleMoments();
                    var messages = _this.getAllPossibleMessages();
                    var choices = _this.buildChoices(moments, messages);
                    if (choices.length > 0) {
                        ui.showChoices(Op.CHOICES, choices);
                    }
                    else {
                        ui.alert(Op.WAITING, "Il ne se passe plus rien pour le moment.");
                    }
                }
            }
            else if (op == Op.CHOICES) {
                ui.hideChoices(function () {
                    var choice = param;
                    _this.currentMoment = _this.getChosenMoment(choice);
                    _this.updateTimedState();
                    setTimeout(function () { _this.update(Op.MOMENT); }, 0);
                });
            }
            else if (op == Op.MENU_BOOT) {
                if (_this.gdata.options == undefined)
                    ui.showMenu(Op.NEWGAME);
                else
                    ui.showMenu(Op.NEWGAME, Op.CONTINUE_SAVEDGAME);
            }
            else if (op == Op.MENU_INGAME) {
                ui.showMenu(Op.NEWGAME, Op.CONTINUE_INGAME);
            }
            else if (op == Op.CONTINUE_SAVEDGAME) {
                if (_this.gdata.options == undefined || _this.gdata.options.skipFileLoad == false) {
                    _this.getDataFile("dist/game/app.json", function (text) {
                        _this.gdata.saveData(text);
                        _this.restoreContinueState();
                        setTimeout(function () { _this.update(Op.MOMENT); }, 0);
                    });
                }
                else {
                    _this.restoreContinueState();
                    setTimeout(function () { _this.update(Op.MOMENT); }, 0);
                }
            }
            else if (op == Op.CONTINUE_INGAME) {
            }
            else if (op == Op.NEWGAME) {
                _this.newGame();
            }
            else if (op == Op.WAITING) {
                _this.raiseActionEvent(OpAction.SHOWING_CHOICES);
                _this.currentMoment = _this.selectOne(_this.getAllPossibleEverything());
                _this.updateTimedState();
                setTimeout(function () { _this.update(Op.MOMENT); }, 0);
            }
            else {
                ui.alert(Op.WAITING, "Game Over?");
            }
        };
        this.saveContinueState = function () {
            _this.gdata.continueState = {
                moment: _this.currentMoment,
                scene: _this.currentScene,
                forbiddenSceneId: _this.forbiddenSceneId,
                state: _this.gdata.state,
                history: _this.gdata.history
            };
        };
        this.restoreContinueState = function () {
            var cstate = _this.gdata.continueState;
            if (cstate != undefined) {
                _this.currentMoment = cstate.moment;
                _this.currentScene = cstate.scene;
                _this.forbiddenSceneId = cstate.forbiddenSceneId;
                _this.gdata.state = cstate.state;
                _this.gdata.history = cstate.history;
            }
        };
        this.newGame = function () {
            var state = { intro: true };
            state[_this.gdata.game.initialstate] = true;
            _this.gdata.state = state; //clear and init state
            _this.gdata.history = []; //init the list of showned moments
            _this.gdata.continueState = null;
            var options = _this.gdata.options;
            if (options == undefined)
                options = { skipFileLoad: false };
            options.skipMenu = true;
            _this.gdata.options = options;
            _this.raiseActionEvent(OpAction.GAME_START);
            if (options.skipFileLoad == false) {
                _this.getDataFile("dist/game/app.json", function (text) {
                    _this.gdata.saveData(text);
                    setTimeout(function () { location.href = "index.html"; }, 0);
                });
            }
            else {
                setTimeout(function () { location.href = "index.html"; }, 0);
            }
        };
        this.raiseActionEvent = function (op, param) {
            if (window != window.top)
                window.parent.onAction(op, param);
        };
        this.getAllPossibleMoments = function () {
            var data = _this.data;
            var sits = data.situations;
            var situation;
            for (var _i = 0, sits_4 = sits; _i < sits_4.length; _i++) {
                var sit = sits_4[_i];
                if (_this.isValidSituation(sit)) {
                    situation = sit;
                    break;
                }
            }
            var sids = Array();
            //
            for (var _a = 0, _b = data.scenes; _a < _b.length; _a++) {
                var scene = _b[_a];
                if (scene.sitid == situation.id) {
                    sids.push(scene.id);
                }
            }
            var moments = Array();
            //
            for (var _c = 0, _d = data.moments; _c < _d.length; _c++) {
                var moment = _d[_c];
                if (moment.kind == Kind.Moment || moment.kind == Kind.Action) {
                    if (sids.indexOf(moment.parentid) != -1) {
                        if (_this.isValidMoment(moment)) {
                            moments.push(moment);
                        }
                    }
                }
            }
            //
            return moments;
        };
        this.getAllPossibleMessages = function () {
            var data = _this.data;
            var sits = data.situations;
            var situation;
            for (var _i = 0, sits_5 = sits; _i < sits_5.length; _i++) {
                var sit = sits_5[_i];
                if (_this.isValidSituation(sit)) {
                    situation = sit;
                    break;
                }
            }
            var aids = Array();
            //
            for (var _a = 0, _b = data.actors; _a < _b.length; _a++) {
                var actor = _b[_a];
                if (actor.sitid == situation.id) {
                    aids.push(actor.id);
                }
            }
            var messages = Array();
            //
            for (var _c = 0, _d = data.moments; _c < _d.length; _c++) {
                var moment = _d[_c];
                if (moment.kind == Kind.MessageTo || moment.kind == Kind.MessageFrom) {
                    if (aids.indexOf(moment.parentid) != -1) {
                        if (_this.isValidMoment(moment)) {
                            messages.push(moment);
                        }
                    }
                }
            }
            //
            return messages;
        };
        this.getAllPossibleEverything = function () {
            var all = _this.getAllPossibleMoments();
            Array.prototype.push.apply(all, _this.getAllPossibleMessages());
            return all;
        };
        this.buildChoices = function (moments, messages) {
            var scenes = Array();
            var actions = Array();
            for (var _i = 0, moments_5 = moments; _i < moments_5.length; _i++) {
                var moment = moments_5[_i];
                if (moment.kind == Kind.Moment) {
                    var scene = _this.getSceneOf(moment);
                    if (_this.forbiddenSceneId == null || _this.forbiddenSceneId != scene.id) {
                        if (scenes.indexOf(scene) == -1)
                            scenes.push(scene);
                    }
                }
                else {
                    actions.push(moment);
                }
            }
            var choices = Array();
            choices = scenes.map(function (obj) {
                return {
                    kind: CKind.scene,
                    id: obj.id,
                    text: obj.name
                };
            });
            var choices2 = Array();
            choices2 = actions.map(function (obj) {
                return {
                    kind: CKind.action,
                    id: obj.id,
                    text: obj.name
                };
            });
            choices = choices.concat(choices2);
            for (var _a = 0, messages_1 = messages; _a < messages_1.length; _a++) {
                var message = messages_1[_a];
                if (message.kind == Kind.MessageFrom) {
                    choices.push({
                        kind: CKind.messageFrom,
                        id: message.id,
                        text: "Message de " + _this.getActorOf(message).name
                    });
                }
                else {
                    var msg = message;
                    choices.push({
                        kind: CKind.messageTo,
                        id: msg.id,
                        text: "Contacter " + _this.getActorById(msg.to).name,
                        subtext: msg.name
                    });
                }
            }
            _this.forbiddenSceneId = null;
            return choices;
        };
        this.getChosenMoment = function (choice) {
            if (choice.kind == CKind.scene) {
                var data = _this.data;
                var scene = void 0;
                for (var _i = 0, _a = data.scenes; _i < _a.length; _i++) {
                    scene = _a[_i];
                    if (scene.id == choice.id)
                        break;
                }
                var moments = Array();
                for (var _b = 0, _c = data.moments; _b < _c.length; _b++) {
                    var moment = _c[_b];
                    if (moment.kind == Kind.Moment) {
                        if (scene.mids.indexOf(moment.id) != -1) {
                            if (_this.isValidMoment(moment)) {
                                moments.push(moment);
                            }
                        }
                    }
                }
                return _this.selectOne(moments);
            }
            else {
                var id = choice.id;
                for (var _d = 0, _e = _this.data.moments; _d < _e.length; _d++) {
                    var moment = _e[_d];
                    if (moment.id == id)
                        return moment;
                }
            }
            return null;
        };
        this.selectOne = function (moments) {
            if (moments.length == 0)
                return null;
            var winner = Math.floor(Math.random() * moments.length);
            var moment = moments[winner];
            return moment;
        };
        this.isValidMoment = function (moment) {
            var when = moment.when || "";
            if (when == "")
                return false;
            var state = _this.gdata.state;
            //
            if (typeof state.intro !== "undefined") {
                if (when == "intro")
                    return true;
                return false;
            }
            // a moment can't be played twice
            var history = _this.gdata.history;
            if (history.indexOf(moment.id) != -1)
                return false;
            //
            return _this.isValidCondition(state, when);
        };
        this.isValidSituation = function (situation) {
            var when = situation.when || "";
            if (when == "")
                return false;
            return _this.isValidCondition(_this.gdata.state, when);
        };
        this.isValidCondition = function (state, when) {
            var ok = true;
            var conds = when.split(",");
            for (var _i = 0, conds_1 = conds; _i < conds_1.length; _i++) {
                var cond = conds_1[_i];
                var parts = cond.replace("=", ":").split(":");
                var name_1 = parts[0].trim();
                var value = (parts.length == 2 ? parts[1].trim() : "true");
                if (value == "true" || value == "false")
                    value = (value == "true");
                var statevalue = state[name_1];
                if (value === "undef") {
                    if (typeof statevalue !== "undefined")
                        ok = false;
                }
                else {
                    if (typeof statevalue === "undefined")
                        ok = false;
                    else if (statevalue !== value)
                        ok = false;
                }
                if (ok == false)
                    break;
            }
            return ok;
        };
        this.getSceneOf = function (moment) {
            var scenes = _this.data.scenes;
            for (var _i = 0, scenes_2 = scenes; _i < scenes_2.length; _i++) {
                var scene = scenes_2[_i];
                if (scene.id == moment.parentid) {
                    return scene;
                }
            }
        };
        this.getActorOf = function (message) {
            var actors = _this.data.actors;
            for (var _i = 0, actors_3 = actors; _i < actors_3.length; _i++) {
                var actor = actors_3[_i];
                if (actor.id == message.parentid) {
                    return actor;
                }
            }
        };
        this.getActorById = function (id) {
            var actors = _this.data.actors;
            for (var _i = 0, actors_4 = actors; _i < actors_4.length; _i++) {
                var actor = actors_4[_i];
                if (actor.id == id) {
                    return actor;
                }
            }
        };
        this.parseMoment = function (moment) {
            var parsed = Array();
            var current = {};
            var fsm = "";
            var inComment = false;
            if (moment.text == null)
                return parsed;
            var parts = moment.text.split("\n");
            for (var _i = 0, parts_1 = parts; _i < parts_1.length; _i++) {
                var part = parts_1[_i];
                if (part.length > 0) {
                    if (part.startsWith("/*")) {
                        inComment = true;
                    }
                    else if (inComment) {
                        inComment = (part.startsWith("*/") == false);
                    }
                    else if (part.startsWith("//")) {
                    }
                    else if (part.startsWith(".a ")) {
                        var actor = part.substring(2).trim();
                        var aa = actor.split("/");
                        var dialog = current = {};
                        if (aa.length == 2) {
                            dialog.actor = aa[0];
                            dialog.mood = aa[1];
                        }
                        else {
                            dialog.actor = aa[0];
                        }
                        fsm = "DIALOG";
                    }
                    else if (part.startsWith("(")) {
                        current.parenthetical = part;
                    }
                    else if (part.startsWith(".b")) {
                        var asset = { asset: part.substring(2).trim() };
                        parsed.push(asset);
                    }
                    else if (part.startsWith(".")) {
                    }
                    else {
                        if (fsm == "DIALOG") {
                            var lines = part.split("/");
                            var my = current;
                            my.lines = Array();
                            for (var _a = 0, lines_1 = lines; _a < lines_1.length; _a++) {
                                var line = lines_1[_a];
                                my.lines.push(line);
                            }
                            parsed.push(current);
                            fsm = "";
                        }
                        else {
                            var lines = part.split("/");
                            var my = {};
                            my.lines = Array();
                            for (var _b = 0, lines_2 = lines; _b < lines_2.length; _b++) {
                                var line = lines_2[_b];
                                my.lines.push(line);
                            }
                            parsed.push(my);
                        }
                    }
                }
            }
            return parsed;
        };
        this.executeMoment = function (id) {
            var moment = _this.gdata.getMoment(_this.gdata.moments, id); //we might have edited the moment
            var inComment = false;
            var canRepeat = false;
            var parts = moment.text.split("\n");
            for (var _i = 0, parts_2 = parts; _i < parts_2.length; _i++) {
                var part = parts_2[_i];
                if (part.length > 0) {
                    if (part.startsWith("/*")) {
                        inComment = true;
                    }
                    else if (inComment) {
                        inComment = (part.startsWith("*/") == false);
                    }
                    else if (part.startsWith(".r ")) {
                        var rems = part.substring(2).split(",");
                        for (var _a = 0, rems_1 = rems; _a < rems_1.length; _a++) {
                            var rem = rems_1[_a];
                            var parts_3 = rem.replace("=", ":").split(":");
                            var name_2 = parts_3[0].trim();
                            var value = (parts_3.length == 2 ? parts_3[1].trim() : "true");
                            if (value == "true" || value == "false")
                                value = (value == "true");
                            var state = _this.gdata.state;
                            if (value === "undef")
                                delete state[name_2];
                            else
                                state[name_2] = value;
                            _this.gdata.state = state;
                        }
                    }
                    else if (part.startsWith(".f ")) {
                        var flags = part.substring(2).split(",");
                        for (var _b = 0, flags_1 = flags; _b < flags_1.length; _b++) {
                            var oneflag = flags_1[_b];
                            var flag = oneflag.trim();
                            if (flag == "can-repeat")
                                canRepeat = true;
                            if (flag == "must-leave-scene")
                                _this.forbiddenSceneId = _this.getSceneOf(moment).id;
                        }
                    }
                }
            }
            if (canRepeat == false) {
                var history_1 = _this.gdata.history;
                history_1.push(moment.id);
                _this.gdata.history = history_1;
            }
        };
        this.parseScene = function (scene) {
            var data = {};
            data.title = scene.name;
            data.image = scene.desc;
            return data;
        };
        this.updateTimedState = function () {
            var state = _this.gdata.state;
            var change = false;
            for (var prop in state) {
                var parts = prop.split("/");
                if (parts.length == 2) {
                    var value = state[prop];
                    var name = parts[0];
                    var countdown = parseInt(parts[1]) - 1;
                    if (countdown == 0) {
                        state[name] = value;
                    }
                    else {
                        state[(name + "/" + countdown)] = value;
                    }
                    delete state[prop];
                    change = true;
                }
            }
            if (change) {
                _this.gdata.state = state;
            }
        };
        this.getDataFile = function (url, callback) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url, true);
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200)
                    callback(xhr.responseText);
            };
            xhr.send();
        };
        this.gdata = new GameData();
        var options = this.gdata.options;
        var skipMenu = (options != undefined && options.skipMenu);
        window.GameInstance = this;
        this.ui = new UI(this.update, Op.MENU_INGAME, skipMenu, this.gdata.game.desc, function () {
            if (skipMenu) {
                options.skipMenu = false;
                _this.gdata.options = options;
                _this.update(Op.WAITING);
            }
            else {
                _this.update(Op.MENU_BOOT);
            }
        });
    }
    Game.getCommands = function (text) {
        if (text == undefined)
            return [];
        var inComment = false;
        var commands = new Array();
        var parts = text.split("\n");
        for (var _i = 0, parts_4 = parts; _i < parts_4.length; _i++) {
            var part = parts_4[_i];
            if (part.length > 0) {
                if (part.startsWith("/*")) {
                    inComment = true;
                }
                else if (inComment) {
                    inComment = (part.startsWith("*/") == false);
                }
                else if (part.startsWith(".r ") || part.startsWith(".f ")) {
                    commands.push(part);
                }
            }
        }
        return commands;
    };
    return Game;
}());
var Tide = (function () {
    function Tide() {
        var _this = this;
        this.action = function (op, param) {
            if (op == OpAction.SHOWING_CHOICES) {
                var state = new GameData().state;
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
                var table = document.querySelector("div.debug-content table");
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
                var table = document.querySelector("div.debug-content table");
                for (var i = table.rows.length - 1; i >= 0; i--)
                    table.deleteRow(i);
            }
            else if (op == OpAction.SHOWING_MOMENT) {
                if (document.getElementById("ide-sync").checked) {
                    var iframe = document.querySelector("div.ide-editor iframe");
                    var editor = iframe.contentWindow.EditorInstance;
                    editor.gotoMoment(param);
                }
            }
        };
        var ied = document.querySelector("div.ide-editor");
        var igame = document.querySelector("div.ide-game");
        var gdata = new GameData();
        var options = gdata.options;
        if (options == undefined) {
            options = { skipFileLoad: false, syncEditor: true };
            gdata.options = options;
        }
        document.getElementById("ide-play-edit").addEventListener("click", function (e) {
            if (ied.classList.contains("show"))
                ied.classList.remove("show");
            else
                ied.classList.add("show");
        });
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
        window.onAction = this.action;
        document.getElementById("ide-gamefile").checked = options.skipFileLoad;
        document.getElementById("ide-sync").checked = options.syncEditor;
        // Load the iframes at run time to make sure the ide is fully loaded first.
        igame.querySelector("iframe").setAttribute("src", "index.html");
        ied.querySelector("iframe").setAttribute("src", "index-edit.html");
    }
    return Tide;
}());
var TellerMan;
(function (TellerMan) {
    if (document.title === "Teller Editor") {
        var editor = new Editor();
        var app = new Framework7({
            cache: false,
            preprocess: editor.preprocess.bind(editor)
        });
        var leftView = app.addView(".view-left", { dynamicNavbar: true });
        var centerView = app.addView(".view-center", { dynamicNavbar: true });
        var rightView = app.addView(".view-right", { dynamicNavbar: true });
        editor.init(app, leftView, centerView, rightView);
    }
    else if (document.title === "Teller IDE") {
        var ide = new Tide();
    }
    else {
        var game = new Game();
    }
})(TellerMan || (TellerMan = {}));
//# sourceMappingURL=app.js.map