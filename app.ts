
namespace TellerMan {

    declare var Framework7: any;

    var game = new Game();

    var app = new Framework7({
        cache: false,
        preprocess: game.preprocess.bind(game)
    });

    var leftView = app.addView(".view-left", { dynamicNavbar: true });
    var centerView = app.addView(".view-center", { dynamicNavbar: true });
    var rightView = app.addView(".view-right", { dynamicNavbar: true });

    game.init(app, leftView, centerView, rightView);
}
