var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments)).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t;
    return { next: verb(0), "throw": verb(1), "return": verb(2) };
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var WebglRunner = (function () {
    function WebglRunner(vsid, fsid) {
        var _this = this;
        this.vsid = vsid;
        this.fsid = fsid;
        this._pause = false;
        this.pause = function () {
            _this._pause = true;
        };
        this.resume = function () {
            _this._pause = false;
        };
        this.run = function () {
            // Get context
            var canvas = document.getElementById("canvas");
            var gl = canvas.getContext("experimental-webgl");
            if (!gl)
                return alert("Your web browser does not support WebGL");
            // Create the program
            var prog = gl.createProgram();
            // Attach the vertex shader
            var vstext = document.getElementById(_this.vsid).text;
            var vs = gl.createShader(gl.VERTEX_SHADER);
            gl.shaderSource(vs, vstext);
            gl.compileShader(vs);
            if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS))
                return console.log("Could not compile vertex shader: " + gl.getShaderInfoLog(vs));
            gl.attachShader(prog, vs);
            // Attach the fragment shader
            var fstext = document.getElementById(_this.fsid).text;
            var fs = gl.createShader(gl.FRAGMENT_SHADER);
            gl.shaderSource(fs, fstext);
            gl.compileShader(fs);
            if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS))
                return console.log("Could not compile fragment shader: " + gl.getShaderInfoLog(fs));
            gl.attachShader(prog, fs);
            // Link and then use the program
            gl.linkProgram(prog);
            if (!gl.getProgramParameter(prog, gl.LINK_STATUS))
                return console.log("Could not link the shader program");
            gl.useProgram(prog);
            // Lookup uniforms
            var u_resolution = gl.getUniformLocation(prog, "resolution");
            var u_time = gl.getUniformLocation(prog, "time");
            // Populate the geometry in the buffer
            var arr = [
                -1, 1, 0,
                1, 1, 0,
                -1, -1, 0,
                1, -1, 0
            ];
            gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW);
            // Map the "a_square" attribute to the buffer
            var a_square = gl.getAttribLocation(prog, "a_square");
            gl.enableVertexAttribArray(a_square);
            gl.vertexAttribPointer(a_square, 3, gl.FLOAT, false, 0, 0);
            // Start the draw loop
            var me = _this;
            requestAnimationFrame(drawScene);
            // Draw scene
            function drawScene(now) {
                if (me._pause) {
                    requestAnimationFrame(drawScene);
                    return;
                }
                now *= 0.001;
                // Resize canvas
                var canvas = gl.canvas;
                var displayWidth = canvas.clientWidth;
                var displayHeight = canvas.clientHeight;
                // Make canvas the same size and set the viewport to match
                if (canvas.width != displayWidth || canvas.height != displayHeight) {
                    canvas.width = displayWidth;
                    canvas.height = displayHeight;
                    gl.viewport(0, 0, canvas.width, canvas.height);
                }
                // Clear canvas
                gl.clearColor(0, 0, 0, 0.2);
                gl.clear(gl.COLOR_BUFFER_BIT);
                // Set the resolution and time uniforms
                gl.uniform2f(u_resolution, gl.canvas.width, gl.canvas.height);
                gl.uniform1f(u_time, now);
                // Draw the geometry
                gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
                requestAnimationFrame(drawScene);
            }
            ;
        };
    }
    return WebglRunner;
}());
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
/// <reference path="webgl-runner.ts" />
/// <reference path="igame-data.ts" />
/// <reference path="iinstance.ts" />
var GameMan = (function () {
    function GameMan() {
        var _this = this;
        this.initialize = function (frameSrc) {
            var me = _this;
            var game;
            var confirming = false;
            _this.runner = new WebglRunner("vertex-shader", "fragment-shader");
            _this.runner.run();
            // Set main game url
            document.querySelector(".primo-limbo").classList.remove("hidden");
            var gameFrame = document.getElementById("game-frame");
            gameFrame.setAttribute("src", frameSrc);
            // START button
            document.querySelector(".start").addEventListener("click", function () {
                me.runner.pause();
                document.querySelector(".menu").classList.remove("hidden");
                document.querySelector(".primo-limbo").classList.add("hidden");
                var gameFrame = document.getElementById("game-frame");
                game = gameFrame.contentWindow.GameInstance;
                game.startGame();
            });
            // PLAY button
            document.querySelector(".play").addEventListener("click", function () {
                me.runner.pause();
                document.querySelector(".menu").classList.remove("zoome");
                game.resumeGame();
            });
            // NEW GAME button
            document.querySelector(".new-game div").addEventListener("click", function (e) {
                if (confirming) {
                    me.runner.pause();
                    game.clearAllGameData();
                    location.reload(true);
                }
                else {
                    var div = document.querySelector(".new-game div");
                    div.classList.add("confirm");
                    div.querySelector("h3").innerText = "Votre progrès sera effacé. OK?";
                    confirming = true;
                }
                e.stopPropagation();
            });
            // Whole screen
            document.querySelector(".menu-wrap").addEventListener("click", function () {
                var div = document.querySelector(".new-game div");
                div.classList.remove("confirm");
                div.querySelector("h3").innerText = "Nouvelle partie";
                confirming = false;
            });
            var autoStart = true;
            if (autoStart) {
                setTimeout(function () {
                    me.runner.pause();
                    document.querySelector(".menu").classList.remove("hidden");
                    document.querySelector(".primo-limbo").classList.add("hidden");
                    var gameFrame = document.getElementById("game-frame");
                    game = gameFrame.contentWindow.GameInstance;
                    game.startGame();
                }, 500);
            }
        };
        // Proxy this call from the game frame to the IDE (if there's one)
        this.raiseActionEvent = function (op, param) {
            if (window != window.top)
                window.parent.onAction(op, param);
        };
        // Called from the game frame
        this.showMenu = function () {
            _this.runner.resume();
            document.querySelector(".menu").classList.add("zoome");
        };
        this.christian = function () {
            _this.christian_async();
        };
        this.delay = function (ms) {
            return new Promise(function (resolve) { return setTimeout(function () { resolve("yo"); }, ms); });
        };
        this.christian_trad = function () {
            console.log("TRAD");
            (function looper(i, callback) {
                setTimeout(function loop() {
                    console.log(i);
                    i--;
                    if (i > 0)
                        setTimeout(loop, 500);
                    else
                        callback();
                }, 500);
            })(3, function () {
                console.log("world");
            });
        };
        this.christian_promises = function () {
            console.log("PROMISE");
            var me = _this;
            (function loop(i) {
                if (i < 3) {
                    me.delay(500).then(function () {
                        console.log(i + 1);
                        loop(i + 1);
                    });
                }
                else {
                    console.log("World!");
                }
            })(0);
        };
        window.GameManInstance = this;
    }
    GameMan.prototype.christian_async = function () {
        return __awaiter(this, void 0, void 0, function () {
            var i, yo;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("ASYNC");
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < 3))
                            return [3 /*break*/, 4];
                        return [4 /*yield*/, this.delay(500)];
                    case 2:
                        yo = _a.sent();
                        console.log(yo + " " + i);
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4:
                        console.log("world!");
                        return [2 /*return*/];
                }
            });
        });
    };
    ;
    return GameMan;
}());
//# sourceMappingURL=app-man.js.map