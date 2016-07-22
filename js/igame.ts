
interface IDialog {
    actor: string
    mood: string
    parenthetical: string
    lines: Array<string>
}

interface IText {
    lines: Array<string>
}

interface IBackground {
    asset: string
}

type IMomentData = IDialog | IText | IBackground;

enum Op {
    WAITING,
    MOMENT,
    BLURB,
    CHOICES,
    MENU_BOOT,
    MENU_INGAME,
    NEWGAME,
    CONTINUE_SAVEDGAME,
    CONTINUE_INGAME
}

interface IOptions {
    skipFileLoad: boolean,
    skipMenu: boolean,
    syncEditor: boolean
}

interface ISceneData {
    title: string,
    image: string
}

enum OpAction {
    SHOWING_CHOICES,
    GAME_START,
    SHOWING_MOMENT
}
