
if (!String.prototype.startsWith) {
    (<any>String).prototype.startsWith = function (searchString: string, position: number) {
        position = position || 0;
        return this.substr(position, searchString.length) === searchString;
    };
}

if (!String.prototype.endsWith) {
    (<any>String).prototype.endsWith = function (searchString: string, position: number) {
        var subjectString = this.toString();
        if (typeof position !== 'number' || !isFinite(position) || Math.floor(position) !== position || position > subjectString.length) {
            position = subjectString.length;
        }
        position -= searchString.length;
        var lastIndex = subjectString.indexOf(searchString, position);
        return lastIndex !== -1 && lastIndex === position;
    };
}

namespace TellerMan {
    declare var Framework7: any;


    if (document.title == "Teller Editor")
    {
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
    else if (document.title == "Teller IDE")
    {
        var ide = new Tide();
    }
    else if (document.title == "Moon Limbo") {
        var gameman = new GameMan();
    }
    else {
        var game = new Game();
    }
}
