
interface IGameInstance {
    initialize: () => void
    startGame: () => void
    resumeGame: () => void
    clearAllGameData: () => void
}

interface IGameManInstance {
    raiseActionEvent: (op: any, param?: any) => void
    showMenu: () =>  void
}

interface IEditorInstance {
    initialize: () => void
    preprocess: (content: string, url: any, next: any) => void
    setup: (app: any, leftView: any, centerView: any, rightView: any) => void
    gotoMoment: (moment: IMoment) => void
}

