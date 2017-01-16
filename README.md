# teller-man
An editor, debugging environment (IDE) and game engine for browser based text adventure games.

You can try out the IDE loaded with a dumb game at `https://gauchedroite.github.io/teller-man/index-ide.html`.

Everything is written in TypeScript and LESS.

Only npm scripts are used to build the app.

## Intro to the game engine
The game plays out by showing Moments - text chunks with text and display instructions - and letting the player choose the next moment to play from a list of choices.

Each moment has conditions that need to be met to get included in the list presented to the player.
Once played, a moment changes the game state and thus the list of valid Moments that can be played next.

### Moments
As mentioned, Moments define conditions that have to be met to be considered a valid choice, like:

```
silent, reveal=false
```

Both `silent` and `reveal` are state variables. Here `silent` needs to be true and `reveal` needs to be false for the condition to be true.

The body of Moments is just simple markdown text plus commands (lines beginning with a period). For example:

```
This is text that will be showned as is.

This line too.

//This will markup Jack as an .a(ctor)
.a Jack
This is one dialog line said by Jack.

//This will .r(emember) the reveal state variable to be true
.r reveal=true
```

The list of commands can be found HERE.

### Scenes
Scenes are a mean to group Moments.

### Situations

### Player and Actors

## The game editor

## The IDE
