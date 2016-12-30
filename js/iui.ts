/// <reference path="game-ui.ts" />
/// <reference path="game-ui2.ts" />
/// <reference path="game-ui9.ts" />

enum ChoiceKind {
    scene,
    action,
    messageTo,
    messageFrom
}

interface IChoice {
    kind: ChoiceKind
    id: number
    text: string
    subtext?: string
}

interface IUI {
    initialize: (onmenu: () => void) => void,
    alert: (text: string, canclose: () => boolean, onalert: () => void) => void,
    showChoices: (sceneChoices: Array<IChoice>, onchoice: (chosen: IChoice) => void) => void,
    hideChoices: (callback: () => void) => void,
    initScene: (data: ISceneData, callback: () => void) => void,
    addBlurb: (chunk: IMomentData, callback: (result?: any) => void) => void,
    addBlurbFast: (chunk: IMomentData, callback: () => void) => void,
    clearBlurb: () => void
    addChildWindow: (value: string, callback: (game: IGameInstance) => void) => void
}
