
namespace TellerMan {
    declare var Framework7: any;


    if (document.title === "Teller Editor")
    {
        //console.log("t.e.l.l.e.r");
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
    else if (document.title === "Teller IDE")
    {
        //console.log("t.i.d.e");
        var ide = new Tide();
    }
    else {
        //console.log("g.a.m.e");
        var game = new Game();
    }
}
