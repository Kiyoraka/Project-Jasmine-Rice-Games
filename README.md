# Jasmine Rice Game

Software Version: 1.0

## Description

A portrait touch game for the Jasmine rice 2026 activation. The player picks a rice type,
then picks the correct amount of water for 1 cawan of it. A right answer shows TAHNIAH, a
wrong answer shows SILA CUBA LAGI and sends them back to try the water question again.

Built for a vertical TV / kiosk display at **1080x1920, 9:16 portrait**, touch input,
running unattended.

## The game rule

The correct water measure depends on which rice was chosen:

| Rice | Product | Correct answer |
|---|---|---|
| Beras Wangi | Jasmine Sunwhite | **1 1/2 cawan air** |
| Beras Basmathi | Jasmine Pusa Cream | **1 cawan air** |

1/2 cawan is never correct for either.

This rule lives in exactly one place — `ANSWER_KEY` in `script/js/game.js`. If the ratios
are ever revised, that object is the only thing to change.

## Screen flow

```
(1) PILIH JENIS BERAS
      |  tap Beras Wangi or Beras Basmathi
      v
(2) PILIH SUKATAN AIR
      |  tap 1 1/2 / 1 / 1/2 cawan
      +-- wrong --> (3) SALAH  --[CUBA LAGI]--> back to (2), rice choice KEPT
      +-- right --> (4) BETUL  --[TERUSKAN]--> back to (1), full reset
```

CUBA LAGI keeps the rice choice on purpose — the player only re-answers the question they
actually got wrong. TERUSKAN clears everything for the next player.

Any screen other than the first returns to the start after **30 seconds** untouched, so an
abandoned session never strands the next person mid-question.

## Running it

```
start index.html
```

No build step, no dev server, no dependencies. Every path is relative, so it runs straight
from disk over `file://`. Deployment is a copied folder on the kiosk machine.

For browser-automation checks during development, serve it instead — Chrome extensions
cannot script `file://` pages:

```
python -m http.server 8123
```

## Structure

```
index.html            four sibling <div class="screen"> inside #app
img/                  sprite set (backgrounds, option cards, measure bars)
sound/                SFX
script/js/            utils -> game -> ui -> master   (load order matters)
style/css/            master.css @imports base, layout, components, animations
Project Resources/    designer source files, gitignored, never shipped
```

Screens 1 and 2 are composed from layered sprites: an empty stage background with the
option cards / measure bars as separate elements on top. Screens 3 and 4 are single scene
sprites with their buttons painted in, so those two use a positioned hotspot instead.

All layer geometry is expressed as a percentage of the 1081x1921 design board, so the
layers track the frame at any display height.

## Notes for the next session

- **Sound is placeholder.** Jasmine supplied no audio. `Success.mp3`, `Fail.mp3` and
  `Tap.mp3` are borrowed from Project Pocky Lucky Draw and need client-approved
  replacements before delivery.
- **The answer key was confirmed by Kiyo, not by Jasmine.** Worth one check against the
  pack instructions before the client sees it — it is the only factual claim the game makes.
- Viewports narrower than 9:16 clip the bottom of the board. This is inherited from the
  Pocky letterbox and cannot occur on the 9:16 kiosk this ships to.
