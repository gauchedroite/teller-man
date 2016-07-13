
interface IDialog {
    actor: string
    mood: string
    parenthetical: string
    lines: Array<string>
}

interface IText {
    lines: Array<string>
}

type IMomentData = IDialog | IText;

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
    skipMenu: boolean
}

interface ISceneData {
    title: string,
    image: string
}