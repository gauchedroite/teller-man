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
    Op[Op["CURRENT_MOMENT"] = 0] = "CURRENT_MOMENT";
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
/// <reference path="igame.ts" />
/// <reference path="igame-data.ts" />
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
                game: game || { id: 0, name: null, initialstate: null, text: null },
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
        this.saveGameText = function (text) {
            var game = _this.game;
            game.text = text;
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
            var sit = { id: id, gameid: gameid, name: null, when: null, text: null, sids: [], aids: [], aid: null };
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
        this.saveSituationText = function (text, id) {
            var sits = _this.situations;
            var sit = _this.getSituation(sits, id);
            sit.text = text;
            _this.situations = sits;
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
            var scn = { id: id, sitid: sitid, name: null, text: null, mids: [] };
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
        this.saveSceneText = function (text, id) {
            var scns = _this.scenes;
            var scn = _this.getScene(scns, id);
            scn.text = text;
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
            var act = { id: id, sitid: sitid, kind: kind, name: null, text: null, mids: [] };
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
        this.saveActorText = function (text, id) {
            var acts = _this.actors;
            var act = _this.getActor(acts, id);
            act.text = text;
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
        this.clearState = function () {
            localStorage.removeItem("state");
        };
        this.clearHistory = function () {
            localStorage.removeItem("history");
        };
        this.clearContinueState = function () {
            localStorage.removeItem("continueState");
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
/// <reference path="helpers.ts" />
/// <reference path="igame.ts" />
/// <reference path="iui.ts" />
var UI = (function () {
    function UI() {
        var _this = this;
        this.portrait = false;
        this.initialize = function (onmenu) {
            document.querySelector(".goto-menu").addEventListener("click", function (e) {
                e.stopPropagation();
                setTimeout(onmenu, 0);
            });
            if ("addEventListener" in document) {
                document.addEventListener("DOMContentLoaded", function () {
                    FastClick.attach(document.body);
                    _this.portrait = window.innerWidth < 750;
                    var format = (_this.portrait ? "portrait" : "landscape");
                    document.body.classList.add(format);
                }, false);
            }
            window.onresize = function () {
                _this.portrait = window.innerWidth < 750;
                var format = (_this.portrait ? "portrait" : "landscape");
                if (document.body.classList.contains(format) == false) {
                    document.body.removeAttribute("class");
                    document.body.classList.add(format);
                }
            };
        };
        this.alert = function (text, canclose, onalert) {
            var content = document.querySelector(".content");
            content.classList.add("overlay");
            content.style.pointerEvents = "none";
            var next = document.querySelector(".next");
            var panel = document.querySelector(".modal-inner");
            panel.innerHTML = "<p>" + text + "</p>";
            var modal = document.querySelector(".modal");
            modal.classList.add("show");
            var waitForClick = function (done) {
                var onclick = function () {
                    modal.removeEventListener("click", onclick);
                    next.removeEventListener("click", onclick);
                    return done();
                };
                modal.addEventListener("click", onclick);
                next.addEventListener("click", onclick);
            };
            waitForClick(function () {
                panel.innerHTML = "<div class=\"bounce1\"></div><div class=\"bounce2\"></div>";
                var waitForClose = function () {
                    var ready = canclose();
                    if (ready) {
                        modal.classList.remove("show");
                        modal.classList.remove("disable");
                        setTimeout(function () {
                            content.classList.remove("overlay");
                            content.style.pointerEvents = "";
                            setTimeout(onalert, 0);
                        }, 250);
                    }
                    else {
                        modal.classList.add("disable");
                        setTimeout(waitForClose, 100);
                    }
                };
                waitForClose();
            });
        };
        this.showChoices = function (sceneChoices, onchoice) {
            var panel = document.querySelector(".choice-panel");
            panel.innerHTML = "";
            var ul = document.createElement("ul");
            for (var i = 0; i < sceneChoices.length; i++) {
                var choice = sceneChoices[i];
                var icon = "ion-ios-location";
                if (choice.kind == ChoiceKind.action)
                    icon = "ion-flash";
                if (choice.kind == ChoiceKind.messageTo)
                    icon = "ion-android-person";
                if (choice.kind == ChoiceKind.messageFrom)
                    icon = "ion-chatbubble-working";
                icon = "ion-arrow-right-b";
                //icon = "ion-arrow-right-c";
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
            var storyInner = document.querySelector(".story-inner");
            storyInner.style.height = "calc(25% + " + panel.offsetHeight + "px)";
            var text = document.querySelector(".content-inner");
            text.style.marginBottom = panel.offsetHeight + "px";
            _this.scrollContent(text.parentElement);
            var next = document.querySelector(".next");
            next.classList.add("hidden");
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
                setTimeout(function () {
                    onchoice({
                        kind: parseInt(li.getAttribute("data-kind")),
                        id: parseInt(li.getAttribute("data-id")),
                        text: ""
                    });
                }, 0);
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
            var storyInner = document.querySelector(".story-inner");
            storyInner.scrollTop = content.offsetTop;
            storyInner.style.height = "25%";
            var panel = document.querySelector(".choice-panel");
            panel.style.top = "100%";
            var text = document.querySelector(".content-inner");
            text.style.marginBottom = "0";
            text.setAttribute("style", "");
            var next = document.querySelector(".next");
            next.classList.remove("hidden");
            setTimeout(callback, 250 /*matches .choice-panel transition*/);
        };
        this.initScene = function (data, callback) {
            var title = document.querySelector(".title span");
            title.textContent = data.title;
            if (data.image == undefined)
                return callback();
            _this.changeBackground(data.image, callback);
        };
        this.addBlurb = function (chunk, callback) {
            var html = _this.markupChunk(chunk);
            var content = document.querySelector(".content");
            var inner = document.querySelector(".content-inner");
            var next = document.querySelector(".next");
            var div = document.createElement("div");
            div.innerHTML = html;
            var section = div.firstChild;
            var waitForClick = function (done) {
                var onclick = function () {
                    content.removeEventListener("click", onclick);
                    next.removeEventListener("click", onclick);
                    return done();
                };
                content.addEventListener("click", onclick);
                next.addEventListener("click", onclick);
            };
            if (chunk.kind == ChunkKind.background) {
                if (_this.portrait)
                    return callback();
                var bg_1 = chunk;
                _this.changeBackground(bg_1.asset, function () {
                    if (bg_1.wait) {
                        waitForClick(callback);
                    }
                    else
                        callback();
                });
            }
            else if (chunk.kind == ChunkKind.inline) {
                section.style.opacity = "0";
                inner.appendChild(section);
                _this.scrollContent(inner.parentElement);
                section.style.opacity = "1";
                section.style.transition = "opacity 0.1s ease";
                section.style.animation = "color-cycle 5s infinite";
                var assetName_1 = chunk.image.replace(/ /g, "%20").replace(/'/g, "%27");
                if (assetName_1.indexOf(".") == -1)
                    assetName_1 += ".jpg";
                assetName_1 = "game/assets/" + assetName_1;
                var image = new Image();
                image.onload = function () {
                    section.style.animation = "";
                    var img = section.firstElementChild;
                    img.style.backgroundImage = "url(" + assetName_1 + ")";
                    img.style.height = "100%";
                    return callback();
                };
                image.src = assetName_1;
            }
            else if (chunk.kind == ChunkKind.text || chunk.kind == ChunkKind.dialog || chunk.kind == ChunkKind.gameresult) {
                section.style.opacity = "0";
                inner.appendChild(section);
                _this.scrollContent(inner.parentElement);
                section.style.opacity = "1";
                section.style.transition = "all 0.15s ease";
                if (chunk.kind == ChunkKind.dialog) {
                    var dialog = chunk;
                    if (dialog.mood != undefined) {
                        var assetName_2 = "game/assets/" + dialog.mood.replace(/ /g, "%20").replace(/'/g, "%27");
                        if (assetName_2.indexOf(".") == -1)
                            assetName_2 += ".jpg";
                        var head_1 = section.getElementsByClassName("head")[0];
                        var image_1 = new Image();
                        image_1.onload = function () {
                            head_1.style.backgroundImage = "url(" + assetName_2 + ")";
                            head_1.classList.add("show");
                        };
                        setTimeout(function () { image_1.src = assetName_2; }, 100);
                    }
                }
                var spans_1 = section.querySelectorAll("span");
                if (spans_1.length == 0) {
                    waitForClick(callback);
                }
                else {
                    var ispan_1 = 0;
                    waitForClick(function () {
                        clearTimeout(showTimer);
                        while (ispan_1 < spans_1.length)
                            spans_1[ispan_1++].removeAttribute("style");
                        return callback();
                    });
                    var showTimer = setTimeout(function show() {
                        spans_1[ispan_1++].removeAttribute("style");
                        if (ispan_1 < spans_1.length)
                            showTimer = setTimeout(show, 25);
                    }, 100);
                }
            }
            else if (chunk.kind == ChunkKind.heading) {
                var heading_1 = document.querySelector(".heading");
                var inner_1 = document.querySelector(".heading-inner");
                inner_1.innerHTML = html;
                heading_1.classList.add("show", "showing");
                heading_1.addEventListener("click", function onclick() {
                    heading_1.removeEventListener("click", onclick);
                    heading_1.classList.remove("showing");
                    setTimeout(function () { heading_1.classList.remove("show"); callback(); }, 500);
                });
            }
            else if (chunk.kind == ChunkKind.doo) {
                var choices = Array();
                choices.push({
                    kind: ChoiceKind.action,
                    id: 0,
                    text: chunk.text
                });
                _this.showChoices(choices, function (chosen) {
                    _this.hideChoices(callback);
                });
            }
            else if (chunk.kind == ChunkKind.minigame) {
                _this.setupMinigame(chunk, callback);
            }
            else if (chunk.kind == ChunkKind.waitclick) {
                waitForClick(callback);
            }
            else {
                callback();
            }
        };
        this.addBlurbFast = function (chunk, callback) {
            var html = _this.markupChunk(chunk)
                .replace(/ style\="visibility:hidden"/g, "")
                .replace(/<span>/g, "")
                .replace(/<\/span>/g, "");
            var content = document.querySelector(".content-inner");
            var div = document.createElement("div");
            div.innerHTML = html;
            var section = div.firstChild;
            content.appendChild(section);
            callback();
        };
        this.clearBlurb = function () {
            var content = document.querySelector(".content-inner");
            content.innerHTML = "";
        };
        this.changeBackground = function (assetName, callback) {
            if (assetName == undefined)
                return callback();
            assetName = assetName.replace(/ /g, "%20").replace(/'/g, "%27");
            if (document.body.classList.contains("portrait"))
                return callback();
            var solid = document.querySelector(".solid-inner");
            var zero = solid.children[0];
            var one = solid.children[1];
            var back = (zero.style.zIndex == "0" ? zero : one);
            var front = (zero.style.zIndex == "0" ? one : zero);
            var backFrame = back.firstElementChild;
            var frontFrame = front.firstElementChild;
            if (assetName.indexOf(".") == -1)
                assetName += ".jpg";
            var sceneUrl;
            if (assetName.endsWith(".html"))
                sceneUrl = "game/" + assetName;
            else
                sceneUrl = "game/teller-image.html?" + assetName;
            if (frontFrame.src.indexOf(sceneUrl) != -1)
                return callback();
            if (sceneUrl == _this.previousSceneUrl)
                return callback();
            _this.previousSceneUrl = sceneUrl;
            _this.fader(true);
            var preloader = document.querySelector(".preloader");
            preloader.classList.add("change-bg");
            window.eventHubAction = function (result) {
                if (result.content == "ready") {
                    back.style.opacity = "1";
                    front.style.opacity = "0";
                    _this.fader(false);
                    preloader.classList.remove("change-bg");
                    setTimeout(function () {
                        back.style.zIndex = "1";
                        front.style.zIndex = "0";
                        callback();
                    }, 500);
                }
            };
            back.style.opacity = "0";
            backFrame.setAttribute("src", sceneUrl);
        };
        this.setupMinigame = function (chunk, callback) {
            var minigame = chunk;
            var game = document.querySelector(".game");
            var inner = document.querySelector(".story-inner");
            var panel = document.querySelector(".choice-panel");
            var preloader = document.querySelector(".preloader");
            var ready = false;
            var fadedout = false;
            _this.runMinigame(minigame.url, function (result) {
                if (result.ready != undefined) {
                    if (fadedout) {
                        game.classList.add("show");
                        inner.classList.add("retracted");
                        _this.fader(false);
                        preloader.classList.remove("change-bg");
                    }
                    ready = true;
                }
                else {
                    game.classList.remove("show");
                    inner.classList.remove("retracted");
                    panel.classList.remove("disabled");
                    _this.hideChoices(function () {
                        var text = (result.win == true ? minigame.winText : minigame.loseText);
                        setTimeout(function () { callback(result); }, 0);
                    });
                }
            });
            var choices = Array();
            choices.push({
                kind: ChoiceKind.action,
                id: 0,
                text: minigame.text
            });
            _this.showChoices(choices, function (chosen) {
                if (ready) {
                    game.classList.add("show");
                    inner.classList.add("retracted");
                }
                else {
                    fadedout = true;
                    _this.fader(true);
                    preloader.classList.add("change-bg");
                }
                panel.classList.add("disabled");
            });
        };
        this.runMinigame = function (url, callback) {
            var src = "game/" + url.replace(/ /g, "%20").replace(/'/g, "%27");
            var game = document.querySelector(".game");
            var gameFrame = game.firstElementChild;
            window.eventHubAction = function (result) {
                setTimeout(function () { callback(result); }, 0);
            };
            gameFrame.setAttribute("src", src);
        };
        this.fader = function (enable) {
            var solid = document.querySelector(".solid-inner");
            var fader = solid.children[3];
            if (enable) {
                fader.style.opacity = "0.35";
                fader.style.zIndex = "3";
            }
            else {
                fader.style.opacity = "0";
                setTimeout(function () { fader.style.zIndex = "0"; }, 500);
            }
        };
        this.markupChunk = function (chunk) {
            var html = Array();
            if (chunk.kind == ChunkKind.text) {
                var text = chunk;
                html.push("<section class='text'>");
                for (var _i = 0, _a = text.lines; _i < _a.length; _i++) {
                    var line = _a[_i];
                    html.push("<p>" + line + "</p>");
                }
                html.push("</section>");
            }
            else if (chunk.kind == ChunkKind.dialog) {
                var dialog = chunk;
                var hasImage = (dialog.mood != undefined);
                html.push("<section class='dialog'>");
                if (hasImage) {
                    html.push("<div class='head-placeholder'></div>");
                    html.push("<div class='head'></div>");
                    html.push("<div class='text'>");
                }
                html.push("<h1>" + dialog.actor + "</h1>");
                if (dialog.parenthetical != undefined)
                    html.push("<h2>" + dialog.parenthetical + "</h2>");
                for (var _b = 0, _c = dialog.lines; _b < _c.length; _b++) {
                    var line = _c[_b];
                    var spans = Array.prototype.map.call(line, function (char) {
                        return "<span style='visibility:hidden'>" + char + "</span>";
                    });
                    html.push("<p>" + spans.join("") + "</p>");
                }
                if (hasImage)
                    html.push("</div>");
                html.push("</section>");
            }
            else if (chunk.kind == ChunkKind.gameresult) {
                var result = chunk;
                html.push("<section class='result'>");
                html.push("<p>" + result.text + "</p>");
                html.push("</section>");
            }
            else if (chunk.kind == ChunkKind.inline) {
                html.push("<section class='image'>");
                html.push("<div></div>");
                html.push("</section>");
            }
            else if (chunk.kind == ChunkKind.heading) {
                var heading = chunk;
                html.push("<h1>" + heading.title + "</h1>");
                if (heading.subtitle != undefined)
                    html.push("<h2>" + heading.subtitle + "</h2>");
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
    }
    return UI;
}());
/// <reference path="helpers.ts" />
/// <reference path="igame.ts" />
/// <reference path="iui.ts" />
var UI9 = (function () {
    function UI9() {
        var _this = this;
        this.portrait = false;
        this.initialize = function (onmenu) {
            document.querySelector(".goto-menu").addEventListener("click", function (e) {
                e.stopPropagation();
                setTimeout(onmenu, 0);
            });
            var navbar = document.querySelector(".navbar");
            var inner = document.querySelector(".story-inner");
            navbar.addEventListener("click", function (e) {
                if (document.body.classList.contains("landscape")) {
                    if (inner.classList.contains("retracted"))
                        inner.classList.remove("retracted");
                    else
                        inner.classList.add("retracted");
                }
            });
            if ("addEventListener" in document) {
                document.addEventListener("DOMContentLoaded", function () {
                    FastClick.attach(document.body);
                    _this.portrait = window.innerWidth < 750;
                    var format = (_this.portrait ? "portrait" : "landscape");
                    document.body.classList.add(format);
                }, false);
            }
            window.onresize = function () {
                _this.portrait = window.innerWidth < 750;
                var format = (_this.portrait ? "portrait" : "landscape");
                if (document.body.classList.contains(format) == false) {
                    document.body.removeAttribute("class");
                    document.body.classList.add(format);
                }
            };
        };
        this.alert = function (text, canclose, onalert) {
            var content = document.querySelector(".content");
            content.classList.add("overlay");
            content.style.pointerEvents = "none";
            var panel = document.querySelector(".modal-inner");
            panel.innerHTML = "<p>" + text + "</p>";
            var modal = document.querySelector(".modal");
            modal.classList.add("show");
            var onclick = function () {
                modal.removeEventListener("click", onclick);
                panel.innerHTML = "<div class=\"bounce1\"></div><div class=\"bounce2\"></div>";
                var waitForClose = function () {
                    var ready = canclose();
                    if (ready) {
                        modal.classList.remove("show");
                        modal.classList.remove("disable");
                        setTimeout(function () {
                            content.classList.remove("overlay");
                            content.style.pointerEvents = "";
                            setTimeout(onalert, 0);
                        }, 250);
                    }
                    else {
                        modal.classList.add("disable");
                        setTimeout(waitForClose, 100);
                    }
                };
                waitForClose();
            };
            modal.addEventListener("click", onclick);
        };
        this.showChoices = function (sceneChoices, onchoice) {
            var panel = document.querySelector(".choice-panel");
            panel.innerHTML = "";
            var ul = document.createElement("ul");
            for (var i = 0; i < sceneChoices.length; i++) {
                var choice = sceneChoices[i];
                var icon = "ion-ios-location";
                if (choice.kind == ChoiceKind.action)
                    icon = "ion-flash";
                if (choice.kind == ChoiceKind.messageTo)
                    icon = "ion-android-person";
                if (choice.kind == ChoiceKind.messageFrom)
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
                setTimeout(function () {
                    onchoice({
                        kind: parseInt(li.getAttribute("data-kind")),
                        id: parseInt(li.getAttribute("data-id")),
                        text: ""
                    });
                }, 0);
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
            var inner = document.querySelector(".story-inner");
            inner.scrollTop = content.offsetTop;
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
                return callback();
            _this.changeBackground(data.image, callback);
        };
        this.addBlurb = function (chunk, callback) {
            var html = _this.markupChunk(chunk);
            var content = document.querySelector(".content");
            var inner = document.querySelector(".content-inner");
            var div = document.createElement("div");
            div.innerHTML = html;
            var section = div.firstChild;
            if (chunk.kind == ChunkKind.background) {
                if (_this.portrait)
                    return callback();
                var bg_2 = chunk;
                _this.changeBackground(bg_2.asset, function () {
                    if (bg_2.wait) {
                        content.addEventListener("click", function onclick() {
                            content.removeEventListener("click", onclick);
                            return callback();
                        });
                    }
                    else
                        callback();
                });
            }
            else if (chunk.kind == ChunkKind.inline) {
                section.style.opacity = "0";
                inner.appendChild(section);
                _this.scrollContent(inner.parentElement);
                section.style.opacity = "1";
                section.style.transition = "opacity 0.1s ease";
                section.style.animation = "color-cycle 5s infinite";
                var assetName_3 = chunk.image.replace(/ /g, "%20").replace(/'/g, "%27");
                if (assetName_3.indexOf(".") == -1)
                    assetName_3 += ".jpg";
                assetName_3 = "game/assets/" + assetName_3;
                var image = new Image();
                image.onload = function () {
                    section.style.animation = "";
                    var img = section.firstElementChild;
                    img.style.backgroundImage = "url(" + assetName_3 + ")";
                    img.style.height = "100%";
                    return callback();
                };
                image.src = assetName_3;
            }
            else if (chunk.kind == ChunkKind.text || chunk.kind == ChunkKind.dialog || chunk.kind == ChunkKind.gameresult) {
                section.style.opacity = "0";
                inner.appendChild(section);
                _this.scrollContent(inner.parentElement);
                section.style.opacity = "1";
                section.style.transition = "all 0.15s ease";
                if (chunk.kind == ChunkKind.dialog) {
                    var dialog = chunk;
                    if (dialog.mood != undefined) {
                        var assetName_4 = "game/assets/" + dialog.mood.replace(/ /g, "%20").replace(/'/g, "%27");
                        if (assetName_4.indexOf(".") == -1)
                            assetName_4 += ".jpg";
                        var head_2 = section.getElementsByClassName("head")[0];
                        var image_2 = new Image();
                        image_2.onload = function () {
                            head_2.style.backgroundImage = "url(" + assetName_4 + ")";
                            head_2.classList.add("show");
                        };
                        setTimeout(function () { image_2.src = assetName_4; }, 100);
                    }
                }
                var spans_2 = section.querySelectorAll("span");
                if (spans_2.length == 0) {
                    content.addEventListener("click", function onclick() {
                        content.removeEventListener("click", onclick);
                        return callback();
                    });
                }
                else {
                    var ispan_2 = 0;
                    content.addEventListener("click", function onclick() {
                        content.removeEventListener("click", onclick);
                        clearTimeout(showTimer);
                        while (ispan_2 < spans_2.length)
                            spans_2[ispan_2++].removeAttribute("style");
                        return callback();
                    });
                    var showTimer = setTimeout(function show() {
                        spans_2[ispan_2++].removeAttribute("style");
                        if (ispan_2 < spans_2.length)
                            showTimer = setTimeout(show, 25);
                    }, 100);
                }
            }
            else if (chunk.kind == ChunkKind.heading) {
                var heading_2 = document.querySelector(".heading");
                var inner_2 = document.querySelector(".heading-inner");
                inner_2.innerHTML = html;
                heading_2.classList.add("show", "showing");
                heading_2.addEventListener("click", function onclick() {
                    heading_2.removeEventListener("click", onclick);
                    heading_2.classList.remove("showing");
                    setTimeout(function () { heading_2.classList.remove("show"); callback(); }, 500);
                });
            }
            else if (chunk.kind == ChunkKind.doo) {
                var choices = Array();
                choices.push({
                    kind: ChoiceKind.action,
                    id: 0,
                    text: chunk.text
                });
                _this.showChoices(choices, function (chosen) {
                    _this.hideChoices(callback);
                });
            }
            else if (chunk.kind == ChunkKind.minigame) {
                _this.setupMinigame(chunk, callback);
            }
            else if (chunk.kind == ChunkKind.waitclick) {
                content.addEventListener("click", function onclick() {
                    content.removeEventListener("click", onclick);
                    return callback();
                });
            }
            else {
                callback();
            }
        };
        this.addBlurbFast = function (chunk, callback) {
            var html = _this.markupChunk(chunk)
                .replace(/ style\="visibility:hidden"/g, "")
                .replace(/<span>/g, "")
                .replace(/<\/span>/g, "");
            var content = document.querySelector(".content-inner");
            var div = document.createElement("div");
            div.innerHTML = html;
            var section = div.firstChild;
            content.appendChild(section);
            callback();
        };
        this.clearBlurb = function () {
            var content = document.querySelector(".content-inner");
            content.innerHTML = "";
        };
        this.changeBackground = function (assetName, callback) {
            if (assetName == undefined)
                return callback();
            assetName = assetName.replace(/ /g, "%20").replace(/'/g, "%27");
            if (document.body.classList.contains("portrait"))
                return callback();
            var inner = document.querySelector(".graphics-inner");
            var zero = inner.children[0];
            var one = inner.children[1];
            var back = (zero.style.zIndex == "0" ? zero : one);
            var front = (zero.style.zIndex == "0" ? one : zero);
            var backFrame = back.firstElementChild;
            var frontFrame = front.firstElementChild;
            if (assetName.indexOf(".") == -1)
                assetName += ".jpg";
            var sceneUrl;
            if (assetName.endsWith(".html"))
                sceneUrl = "game/" + assetName;
            else
                sceneUrl = "game/teller-image.html?" + assetName;
            if (frontFrame.src.indexOf(sceneUrl) != -1)
                return callback();
            _this.fader(true);
            var preloader = document.querySelector(".preloader");
            preloader.classList.add("change-bg");
            window.eventHubAction = function (result) {
                if (result.content == "ready") {
                    back.style.opacity = "1";
                    front.style.opacity = "0";
                    _this.fader(false);
                    preloader.classList.remove("change-bg");
                    setTimeout(function () {
                        back.style.zIndex = "1";
                        front.style.zIndex = "0";
                        callback();
                    }, 500);
                }
            };
            back.style.opacity = "0";
            backFrame.setAttribute("src", sceneUrl);
        };
        this.setupMinigame = function (chunk, callback) {
            var minigame = chunk;
            var game = document.querySelector(".game");
            var story = document.querySelector(".story-inner");
            var panel = document.querySelector(".choice-panel");
            var preloader = document.querySelector(".preloader");
            var ready = false;
            var fadedout = false;
            _this.runMinigame(minigame.url, function (result) {
                if (result.ready != undefined) {
                    if (fadedout) {
                        game.classList.add("show");
                        story.classList.add("retracted");
                        _this.fader(false);
                        preloader.classList.remove("change-bg");
                    }
                    ready = true;
                }
                else {
                    game.classList.remove("show");
                    story.classList.remove("retracted");
                    panel.classList.remove("disabled");
                    _this.hideChoices(function () {
                        var text = (result.win == true ? minigame.winText : minigame.loseText);
                        setTimeout(function () { callback(result); }, 0);
                    });
                }
            });
            var choices = Array();
            choices.push({
                kind: ChoiceKind.action,
                id: 0,
                text: minigame.text
            });
            _this.showChoices(choices, function (chosen) {
                if (ready) {
                    game.classList.add("show");
                    story.classList.add("retracted");
                }
                else {
                    fadedout = true;
                    _this.fader(true);
                    preloader.classList.add("change-bg");
                }
                panel.classList.add("disabled");
            });
        };
        this.runMinigame = function (url, callback) {
            var src = "game/" + url.replace(/ /g, "%20").replace(/'/g, "%27");
            var game = document.querySelector(".game");
            var gameFrame = game.firstElementChild;
            window.eventHubAction = function (result) {
                setTimeout(function () { callback(result); }, 0);
            };
            gameFrame.setAttribute("src", src);
        };
        this.fader = function (enable) {
            var inner = document.querySelector(".graphics-inner");
            var div = inner.children[3];
            if (enable) {
                div.style.opacity = "0.35";
                div.style.zIndex = "3";
            }
            else {
                div.style.opacity = "0";
                setTimeout(function () { div.style.zIndex = "0"; }, 500);
            }
        };
        this.markupChunk = function (chunk) {
            var html = Array();
            if (chunk.kind == ChunkKind.text) {
                var text = chunk;
                html.push("<section class='text'>");
                for (var _i = 0, _a = text.lines; _i < _a.length; _i++) {
                    var line = _a[_i];
                    html.push("<p>" + line + "</p>");
                }
                html.push("</section>");
            }
            else if (chunk.kind == ChunkKind.dialog) {
                var dialog = chunk;
                var hasImage = (dialog.mood != undefined);
                html.push("<section class='dialog'>");
                if (hasImage) {
                    html.push("<div class='head-placeholder'></div>");
                    html.push("<div class='head'></div>");
                    html.push("<div class='text'>");
                }
                html.push("<h1>" + dialog.actor + "</h1>");
                if (dialog.parenthetical != undefined)
                    html.push("<h2>" + dialog.parenthetical + "</h2>");
                for (var _b = 0, _c = dialog.lines; _b < _c.length; _b++) {
                    var line = _c[_b];
                    var spans = Array.prototype.map.call(line, function (char) {
                        return "<span style='visibility:hidden'>" + char + "</span>";
                    });
                    html.push("<p>" + spans.join("") + "</p>");
                }
                if (hasImage)
                    html.push("</div>");
                html.push("</section>");
            }
            else if (chunk.kind == ChunkKind.gameresult) {
                var result = chunk;
                html.push("<section class='result'>");
                html.push("<p>" + result.text + "</p>");
                html.push("</section>");
            }
            else if (chunk.kind == ChunkKind.inline) {
                html.push("<section class='image'>");
                html.push("<div></div>");
                html.push("</section>");
            }
            else if (chunk.kind == ChunkKind.heading) {
                var heading = chunk;
                html.push("<h1>" + heading.title + "</h1>");
                if (heading.subtitle != undefined)
                    html.push("<h2>" + heading.subtitle + "</h2>");
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
    }
    return UI9;
}());
/// <reference path="game-ui.ts" />
/// <reference path="game-ui9.ts" />
var ChoiceKind;
/// <reference path="game-ui.ts" />
/// <reference path="game-ui9.ts" />
(function (ChoiceKind) {
    ChoiceKind[ChoiceKind["scene"] = 0] = "scene";
    ChoiceKind[ChoiceKind["action"] = 1] = "action";
    ChoiceKind[ChoiceKind["messageTo"] = 2] = "messageTo";
    ChoiceKind[ChoiceKind["messageFrom"] = 3] = "messageFrom";
})(ChoiceKind || (ChoiceKind = {}));
/// <reference path="helpers.ts" />
/// <reference path="game-data.ts" />
/// <reference path="iinstance.ts" />
/// <reference path="igame.ts" />
/// <reference path="iui.ts" />
var Game = (function () {
    function Game(ui) {
        var _this = this;
        this.initialize = function () {
            _this.ui.initialize(function () { _this.gameMan.showMenu(); });
        };
        this.startGame = function () {
            if (_this.gdata.moments.length == 0) {
                _this.getDataFile("game/app.json", function (text) {
                    if (text != undefined && text.length > 0)
                        _this.gdata.saveData(text);
                    _this.startNewGame();
                });
            }
            else {
                _this.continueExistingGame();
            }
        };
        this.startNewGame = function () {
            _this.gdata.history = []; //init the list of showed moments
            _this.gdata.continueState = null;
            var options = _this.gdata.options;
            if (options == undefined)
                options = {
                    skipFileLoad: false,
                    syncEditor: false,
                    fastStory: false
                };
            _this.gdata.options = options;
            var state = { intro: true };
            state[_this.gdata.game.initialstate] = true;
            _this.gdata.state = state;
            _this.gameMan.raiseActionEvent(OpAction.GAME_START);
            _this.data = _this.gdata.loadGame();
            _this.gameMan.raiseActionEvent(OpAction.SHOWING_CHOICES);
            _this.currentMoment = _this.selectOne(_this.getAllPossibleEverything());
            if (_this.currentMoment != null) {
                setTimeout(function () { _this.update(Op.CURRENT_MOMENT); }, 0);
            }
            else {
                _this.refreshGameAndAlert("AUCUN POINT DE DEPART POUR LE JEU", function () {
                    _this.update(Op.BUILD_CHOICES);
                });
            }
        };
        this.continueExistingGame = function () {
            _this.restoreContinueState();
            _this.ui.initScene(_this.parseScene(_this.currentScene), function () {
                _this.update(_this.currentMoment != null ? Op.CURRENT_MOMENT : Op.BUILD_CHOICES);
            });
        };
        this.resumeGame = function () {
        };
        this.clearAllGameData = function () {
            var options = _this.gdata.options;
            if (options.skipFileLoad) {
                _this.gdata.clearContinueState();
                _this.gdata.clearHistory();
                _this.gdata.clearState();
                //
                _this.startNewGame();
            }
            else {
                _this.gdata.clearStorage();
            }
            _this.gdata.options = options;
        };
        this.update = function (op) {
            _this.data = _this.gdata.loadGame();
            var ui = _this.ui;
            if (op == Op.CURRENT_MOMENT) {
                _this.chunks = _this.parseMoment(_this.currentMoment);
                _this.cix = 0;
                var kind = _this.currentMoment.kind;
                if (kind == Kind.Moment || kind == Kind.Action) {
                    _this.currentScene = _this.getSceneOf(_this.currentMoment);
                }
                _this.saveContinueState();
                ui.clearBlurb();
                ui.initScene(_this.parseScene(_this.currentScene), function () {
                    _this.gameMan.raiseActionEvent(OpAction.SHOWING_MOMENT, _this.currentMoment);
                    setTimeout(function () { _this.update(Op.BLURB); }, 0);
                });
            }
            else if (op == Op.BLURB) {
                if (_this.cix < _this.chunks.length) {
                    var chunk = _this.chunks[_this.cix++];
                    var first = _this.cix == 1;
                    var notLast = _this.cix < _this.chunks.length;
                    var goFast = _this.gdata.options.fastStory && notLast;
                    if (goFast) {
                        ui.addBlurbFast(chunk, function () { setTimeout(function () { _this.update(Op.BLURB); }, 50); });
                    }
                    else {
                        if (chunk.kind == ChunkKind.minigame) {
                            var minigame_1 = chunk;
                            ui.addBlurb(chunk, function (result) {
                                var command = (result.win == true ? minigame_1.winCommand : minigame_1.loseCommand);
                                var moment = { id: -1, text: command, parentid: _this.currentScene.id };
                                _this.executeMoment(moment);
                                var text = (result.win == true ? minigame_1.winText : minigame_1.loseText);
                                var resultChunk = { kind: ChunkKind.gameresult, text: text };
                                _this.chunks.splice(_this.cix, 0, resultChunk);
                                setTimeout(function () { _this.update(Op.BLURB); }, 500);
                            });
                        }
                        else {
                            var showBlurb_1 = function () {
                                ui.addBlurb(chunk, function () { setTimeout(function () { _this.update(Op.BLURB); }, 50); });
                            };
                            if (first)
                                setTimeout(function () { showBlurb_1(); }, 500);
                            else
                                showBlurb_1();
                        }
                    }
                }
                else {
                    var state = _this.gdata.state;
                    if (state.intro != undefined) {
                        delete state.intro;
                        _this.gdata.state = state;
                    }
                    _this.currentMoment = _this.gdata.getMoment(_this.gdata.moments, _this.currentMoment.id); //we might have edited the moment
                    _this.executeMoment(_this.currentMoment);
                    _this.update(Op.BUILD_CHOICES);
                }
            }
            else if (op == Op.BUILD_CHOICES) {
                _this.gameMan.raiseActionEvent(OpAction.SHOWING_CHOICES);
                var moments = _this.getAllPossibleMoments();
                var messages = _this.getAllPossibleMessages();
                var choices = _this.buildChoices(moments, messages);
                _this.updateTimedState();
                if (choices.length > 0) {
                    ui.showChoices(choices, function (chosen) {
                        ui.hideChoices(function () {
                            _this.currentMoment = _this.getChosenMoment(chosen);
                            _this.update(Op.CURRENT_MOMENT);
                        });
                    });
                }
                else {
                    _this.refreshGameAndAlert("Il ne se passe plus rien pour le moment.", function () {
                        _this.update(Op.BUILD_CHOICES);
                    });
                }
            }
            else {
                _this.refreshGameAndAlert("!!! DEAD END !!!", function () {
                    _this.update(Op.BUILD_CHOICES);
                });
            }
        };
        this.saveContinueState = function () {
            _this.gdata.continueState = {
                momentId: (_this.currentMoment != undefined ? _this.currentMoment.id : undefined),
                sceneId: (_this.currentScene != undefined ? _this.currentScene.id : undefined),
                forbiddenSceneId: _this.forbiddenSceneId,
                state: _this.gdata.state,
                history: _this.gdata.history
            };
        };
        this.restoreContinueState = function () {
            var cstate = _this.gdata.continueState;
            if (cstate != undefined) {
                _this.currentMoment = (cstate.momentId != undefined ? _this.gdata.getMoment(_this.gdata.moments, cstate.momentId) : undefined);
                _this.currentScene = (cstate.sceneId != undefined ? _this.gdata.getScene(_this.gdata.scenes, cstate.sceneId) : undefined);
                _this.forbiddenSceneId = cstate.forbiddenSceneId;
                _this.gdata.state = cstate.state;
                _this.gdata.history = cstate.history;
            }
        };
        this.refreshGameAndAlert = function (text, callback) {
            var skipFileLoad = (_this.gdata.options != undefined && _this.gdata.options.skipFileLoad);
            if (skipFileLoad == false) {
                _this.getDataFile("game/app.json", function (text) {
                    if (text != undefined && text.length > 0)
                        _this.gdata.saveData(text);
                    skipFileLoad = true;
                });
            }
            _this.ui.alert(text, function () { return skipFileLoad; }, function () {
                callback();
            });
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
            if (situation == undefined)
                return Array();
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
            if (situation == undefined)
                return Array();
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
                    kind: ChoiceKind.scene,
                    id: obj.id,
                    text: obj.name
                };
            });
            var choices2 = Array();
            choices2 = actions.map(function (obj) {
                return {
                    kind: ChoiceKind.action,
                    id: obj.id,
                    text: obj.name
                };
            });
            choices = choices.concat(choices2);
            for (var _a = 0, messages_1 = messages; _a < messages_1.length; _a++) {
                var message = messages_1[_a];
                if (message.kind == Kind.MessageFrom) {
                    choices.push({
                        kind: ChoiceKind.messageFrom,
                        id: message.id,
                        text: "Message de " + _this.getActorOf(message).name
                    });
                }
                else {
                    var msg = message;
                    choices.push({
                        kind: ChoiceKind.messageTo,
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
            if (choice.kind == ChoiceKind.scene) {
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
            var dialog = {};
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
                        dialog = { kind: ChunkKind.dialog };
                        if (aa.length == 2) {
                            dialog.actor = aa[0].trim();
                            dialog.mood = aa[1].trim();
                        }
                        else {
                            dialog.actor = aa[0];
                        }
                        fsm = "DIALOG";
                    }
                    else if (part.startsWith("(")) {
                        dialog.parenthetical = part;
                    }
                    else if (part.startsWith(".b")) {
                        var wait = part.endsWith("/w");
                        if (wait)
                            part = part.substr(0, part.length - 2);
                        var asset = { kind: ChunkKind.background, asset: part.substring(2).trim(), wait: wait };
                        parsed.push(asset);
                    }
                    else if (part.startsWith(".i")) {
                        var image = { kind: ChunkKind.inline, image: part.substring(2).trim() };
                        parsed.push(image);
                    }
                    else if (part.startsWith(".d ")) {
                        var text = part.substring(2).trim();
                        var pause = { kind: ChunkKind.doo, text: text };
                        parsed.push(pause);
                    }
                    else if (part.startsWith(".d")) {
                        var space = part.indexOf(" ");
                        if (space != -1) {
                            var chance = parseInt(part.substring(2, space));
                            if ((Math.random() * chance) < 1) {
                                var lines_1 = part.substr(space).trim().split("/");
                                var text = { kind: ChunkKind.text };
                                text.lines = Array();
                                for (var _a = 0, lines_2 = lines_1; _a < lines_2.length; _a++) {
                                    var line = lines_2[_a];
                                    text.lines.push(line);
                                }
                                parsed[parsed.length - 1] = text;
                            }
                        }
                    }
                    else if (part.startsWith(".h")) {
                        var parts_2 = part.substring(2).trim().split("/");
                        var title = parts_2[0].trim();
                        var subtitle = (parts_2.length > 1 ? parts_2[1].trim() : undefined);
                        var heading = { kind: ChunkKind.heading, title: title, subtitle: subtitle };
                        parsed.push(heading);
                    }
                    else if (part.startsWith(".m")) {
                        var minigame = { kind: ChunkKind.minigame };
                        var parts_3 = part.substring(2).trim().split("/");
                        minigame.text = parts_3[0].trim();
                        minigame.url = parts_3[1].trim();
                        var parts2 = parts_3[2].split("=>");
                        minigame.winText = parts2[0].trim();
                        minigame.winCommand = parts2[1].trim();
                        parts2 = parts_3[3].split("=>");
                        minigame.loseText = parts2[0].trim();
                        minigame.loseCommand = parts2[1].trim();
                        parsed.push(minigame);
                    }
                    else if (part.startsWith(".w")) {
                        var pause = { kind: ChunkKind.waitclick };
                        parsed.push(pause);
                    }
                    else if (part.startsWith(".")) {
                    }
                    else {
                        if (fsm == "DIALOG") {
                            var lines = part.split("/");
                            dialog.lines = Array();
                            for (var _b = 0, lines_3 = lines; _b < lines_3.length; _b++) {
                                var line = lines_3[_b];
                                dialog.lines.push(line);
                            }
                            parsed.push(dialog);
                            fsm = "";
                        }
                        else {
                            var lines = part.split("/");
                            var text = { kind: ChunkKind.text };
                            text.lines = Array();
                            for (var _c = 0, lines_4 = lines; _c < lines_4.length; _c++) {
                                var line = lines_4[_c];
                                text.lines.push(line);
                            }
                            parsed.push(text);
                        }
                    }
                }
            }
            return parsed;
        };
        this.executeMoment = function (moment) {
            var inComment = false;
            var canRepeat = false;
            var parts = moment.text.split("\n");
            for (var _i = 0, parts_4 = parts; _i < parts_4.length; _i++) {
                var part = parts_4[_i];
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
                            var parts_5 = rem.replace("=", ":").split(":");
                            var name_2 = parts_5[0].trim();
                            var value = (parts_5.length == 2 ? parts_5[1].trim() : "true");
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
                            var del = flags_1[_b];
                            var flag = del.trim();
                            if (flag == "can-repeat")
                                canRepeat = true;
                            if (flag == "must-leave-scene") {
                                var scene = _this.getSceneOf(moment);
                                if (scene != undefined /*e.g.message*/)
                                    _this.forbiddenSceneId = scene.id;
                            }
                        }
                    }
                    else if (part.startsWith(".x ")) {
                        var dels = part.substring(2).split(",");
                        var state = _this.gdata.state;
                        for (var _c = 0, dels_1 = dels; _c < dels_1.length; _c++) {
                            var del = dels_1[_c];
                            var pattern = del.trim();
                            if (pattern == "*") {
                                for (var property in state) {
                                    if (property.indexOf(".") == -1)
                                        delete state[property];
                                }
                            }
                            else if (pattern.endsWith(".*")) {
                                var prefix = pattern.split(".")[0].trim();
                                for (var property in state) {
                                    if (property.startsWith(prefix + "."))
                                        delete state[property];
                                }
                            }
                            else {
                                delete state[pattern];
                            }
                        }
                        _this.gdata.state = state;
                    }
                }
            }
            if (canRepeat == false && moment.id != -1 /*minigame*/) {
                var history_1 = _this.gdata.history;
                history_1.push(moment.id);
                _this.gdata.history = history_1;
            }
        };
        this.parseScene = function (scene) {
            var data = {};
            data.title = scene.name;
            data.image = scene.text;
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
                        state[name + "/" + countdown] = value;
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
        window.GameInstance = this;
        this.gdata = new GameData();
        this.ui = ui;
    }
    Object.defineProperty(Game.prototype, "gameMan", {
        get: function () {
            return window.parent.GameManInstance;
        },
        enumerable: true,
        configurable: true
    });
    return Game;
}());
//# sourceMappingURL=app.js.map