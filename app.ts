
namespace TellerMan {

    declare var Framework7: any;
    declare var Dom7: any;

    var app = new Framework7({
        cache: false,
        preprocess: Game.preprocess
    });
    var $ = Dom7;

    var leftView = app.addView(".view-left", { dynamicNavbar: true });
    var centerView = app.addView(".view-center", { dynamicNavbar: true });
    var rightView = app.addView(".view-right", { dynamicNavbar: true });


    var game = new Game(app, $, leftView, centerView, rightView);
    //Game.mockData();
}
