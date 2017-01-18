# teller-man
A game engine, a live editor and a debugging environment (IDE) and for browser based text adventure games.

You can try out the IDE loaded with a dumb game at <https://gauchedroite.github.io/teller-man/index-ide.html>.

Everything is written in TypeScript and LESS.

Only npm scripts are used to build the app.

## Intro to the game engine
The game plays out by showing Moments - text chunks of narrative text and display instructions - and letting the player choose the next moment to play from a list of choices.

Each moment in the story has conditions that need to be met to get included in the list presented to the player.
Once played, a moment changes the game state and thus the list of valid Moments that can be played next.

There can be more than one story thread played at the same time.

### Moments
Moments have two parts: a condition and a body.
Conditions have to be met for a moment to be considered a valid choice, like:

```
silent, reveal=false
```

Both `silent` and `reveal` are state variables. Here `silent` needs to be true and `reveal` needs to be false for the condition to be true.

The body for Moments is simple markdown like text for narrative elements and commands (lines beginning with a period). For example:

```
This is text that will be showned as is.

This line too.

//This will markup Jack as an .a(ctor)
.a Jack
This is one dialog line said by Jack.

//This will .r(emember) the reveal state variable to be true
.r reveal:true
```

You can use commands to remember stuff, change the background, insert images in the text flow, fire a mini-game, etc.
Commands can be found HERE.

The game engine sports three types of Moments:
- Basic: Your workhorse narrative chunk, happening in some specific location
- Action: A narrative chunk not really linked to a location
- Message: Narrative chunk to/from an actor

The main difference between these moment types boils down to how they show up in the list of choices to the player.
Things like icons, text, sub-text. The game editor will also group them so they're kept together.

### Scenes
Scenes group Moments happening in the same location.
You can attach a default background image or web page to a scene,
but you're not stuck with it as it can be changed using Moment commands.

The usefulness of Scenes is more for organization in the game editor.
They're not entities the player will actually interact with.

### Player and Actors
Messages are Moments emited by Actors, without any reference to a scene location.
You can think of them as SMS between two parties.

### Situations
Situations are containers for Scenes and Actors.
Like Moments, they have conditions that need to be satisfied.
Only when a Situation condition is true can any of the contained Scenes or Actors be played.

## Intro to the game editor
The editor allow you to navigate and edit the live game objects.

More details can be found HERE.

## Intro to the IDE
The debugging environment displays/edits the game state and shows the conditions of the current
game moment as well as the commands that will modify the game state when the moment is completed.

It also links the editor with the game itself so the editor always navigates to the current game moment being played.

More details can be found HERE.
