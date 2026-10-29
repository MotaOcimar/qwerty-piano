# QWERTY Piano

Play piano on your computer or phone keyboard. Notes fall down the screen Guitar Hero style, and you play the actual song: every key is a real note.

A just-for-fun project with no dependencies and no build step. Plain HTML, CSS and JavaScript.

> The interface is currently in Brazilian Portuguese. Internationalization (i18n) is planned.

## Running

Open `index.html` in a browser. To get every feature working, serve the folder locally:

```bash
npx serve .
# or
python3 -m http.server
```

### Deploying to GitHub Pages

1. Push the project to a GitHub repository.
2. Go to **Settings → Pages** and pick the `main` branch and the `/ (root)` folder.
3. After a few minutes the game is live at `https://motaocimar.github.io/qwerty-piano/`.

## Modes

| Mode (UI label) | What it does |
|---|---|
| **Free** (*Livre*) | Play anything. **Record** (*Gravar*) saves what you played as a new song. |
| **Listen** (*Ouvir*) | The song plays by itself and the keys light up. |
| **Learn** (*Aprender*) | The song pauses and waits for you to hit each note. |
| **Challenge** (*Desafio*) | Real time, with score, combo and a final S–D grade. |

## Key mapping

Keys are read by **physical position** (`KeyboardEvent.code`), so ABNT2 (Brazilian) and US keyboards behave the same. The layout selector only changes the labels shown on screen. Labels below are for ABNT2.

### Continuous (*Contínuo*, default)

| Row | White keys | Sharps |
|---|---|---|
| Q | `Q W E R T Y U I O P ´ [` = C5 to G6 | `2 3 5 6 7 9 0 =` |
| Z | `Z X C V B N M , . ; /` = C4 to F5 | `S D G H J L Ç` |

### Heartopia

| Octave | White keys | Sharps |
|---|---|---|
| High (C5) | `Q W E R T Y U`, and `I` = C6 | `2 3 5 6 7` |
| Middle (C4) | `Z X C V B N M` | `S D G H J` |
| Low (C3) | `, . ; O P ´ [` | `L Ç 0 - =` |

**Space** holds the sustain pedal and **Esc** stops the song.

On phones, the ⌨ button opens the native keyboard, and the on-screen piano supports multi-touch.

## Songs

The bundled songs are in the public domain. You can also open any `.mid` file: every track is read, and the **Melody only** (*Só melodia*) option keeps just the highest voice for practice.

Recordings are saved in the browser's `localStorage`.

### Adding songs

In `js/app.js`, songs are written with `mk(name, beatSeconds, melody, accompaniment?)`:

```js
mk('My Song', .5, 'C4:1 D4:1 E4:2 | E4:1 D4:1 C4:2')
```

Each note is `NOTE+OCTAVE:beats`. Use `C4+E4+G4:2` for chords, `R:1` for rests and `|` between bars (purely visual). Songs with a single note track go into the **Easy** (*Fáceis*) group.

## Project structure

```
index.html      page and controls
css/style.css   styling
js/app.js       key mapping, synth, MIDI parser and game logic
```

Sound is synthesized live with the Web Audio API; there are no audio files.

## License

[MIT](LICENSE)
