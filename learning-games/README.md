# Brain Dojo

Free math and writing practice for grades 3–7. Kids earn karate belts (White → Yellow → Orange → Green → Blue → Purple → Brown → Red → Black) for the work they do. You don't need an account, a subscription or the internet, and there are no ads.

## Look and characters

The game uses the Engage brand (midnight navy, the green-teal-blue streak, gold for rewards, Montserrat and Cabin) and the cartoon cast from the Engage Higgsfield workspace:
- **Zumi** is the host.
- **Master CD** coaches Math Dojo, **Ms. Bridgette** coaches Fix-It Sentences and **Ms. Kyra** coaches Story Scrolls.
- **Ms. Michele** gives Sensei's plan.
- Kids choose a fighter: Kimmy, Billy, Tommy, Mackenzie, Rylan, Zumi, or an instructor (Master CD, Ms. Michele, Ms. Bridgette, Ms. Kyra, Miss Lauryn). They can change it by tapping their character on the home screen.

- **Build your own fighter:** in "Change fighter", kids can design a character. They choose height, build, skin tone, hairstyle, hair color, eye color, face extras (freckles, glasses, rosy cheeks), smile, and uniform (black gi, white gi, or shorts with an Engage shirt). The belt it wears is always the belt they've earned.

The character images are in `img/` (cut-out WebP files, about 600 KB in total).

## The two games

**Math Dojo** (flashcards)
- Pick the skills: addition, subtraction, multiplication, division, or any mix.
- **Practice Kata**: 20 cards, no clock. A missed card comes back a few cards later so they can get it right.
- **Speed Sparring**: 60 seconds to answer as many as they can. Each grade keeps a personal best.
- Facts they miss are saved as "tricky facts" and come back in later rounds until they get them right.
- Streaks earn bonus XP. A perfect round earns +25.

| Grade | What's in it |
|---|---|
| 3 | Facts to 10, two-digit adding and subtracting, times tables to 10×10 |
| 4 | Numbers up to 1,000, times tables to 12×12 |
| 5 | Four-digit adding, 2-digit × 1-digit, division with 2-digit answers |
| 6 | Multi-digit problems, 2-digit × 2-digit, 2-digit divisors |
| 7 | Integers: positive and negative numbers with all four operations |

**Fix-It Sentences**
- Your child sees a sentence with mistakes and types the corrected version.
- It tells them how many mistakes there are and what kinds: capital letters, punctuation, spelling or grammar.
- **Hint** gives a nudge for one mistake and costs 5 XP.
- A wrong answer marks the words that still need work. They get 3 tries.
- When the sentence is done, it explains each rule.
- Each round has 8 sentences. Recently seen sentences are skipped.

When a round goes well (90% or better in math, or most sentences right on the first try), the results screen offers to **move up a grade**.

**Story Scrolls** (reading comprehension)
- Each round is two short passages (stories and nonfiction), with three questions each. Question types: the main idea or theme, a detail from the text, reading between the lines, and word meaning.
- Your child types the answer **in their own words**.
- **Sensei reads the answer** and replies with specific feedback: "Got it!", "Partly there" or "Not yet", plus what they did well and where to reread, without giving the answer away. They get a second try, then see a strong sample answer.
- Without Claude, a built-in checker looks for the key ideas and gives a hint instead.
- **Reading tips** explains how to tackle each kind of question. **Ask Sensei** works here too.
- It follows the same rules as the other games: grades 3–7, the 70% redo rule, extra practice on the question types they miss, and new passages written by Claude when the bank runs low. There are 15 built-in passages in `data/reading-bank.js`, and you can add your own there.

## It never runs out, and it adapts

- **Math** problems are made fresh every time, so there's no end.
- **Sentences** come from three places:
  1. the hand-written bank in `data/sentence-bank.js`
  2. a built-in generator that builds new correct sentences from thousands of combinations of names, places, days, animals and activities, then plants mistakes on purpose (works offline, forever)
  3. new sentences Claude writes when the game is opened through the shared Claude link. Each sentence is checked before it's used, and the good ones are added to your account's sentence bank, which keeps growing.
- **The game adapts to each child:**
  - Math operations they miss come up more often.
  - Sentence mistakes are aimed at the kinds they miss most (capitals, punctuation, spelling or grammar).
  - When they catch almost everything on the first try, sentences get an extra mistake. When they struggle, they get one fewer.
- **Sensei's plan** on the home screen always suggests the next best step:
  - a level they need to redo
  - a focused round on their weakest skill
  - moving up a grade when they're ready

## Share image and app icon

- `img/share-card.jpg` (1200×630) is a "Brain Dojo by Engage" card to post alongside the link.
- `img/app-icon.png`, `img/apple-touch-icon.png` and `img/favicon.png` are the app icon (used for "Add to Home Screen" when hosted on your own site).

## Sharing without a Claude login

Share the Claude link as a **public link** (Share → anyone with the link). Anyone can then play without signing in:
- Progress saves on their own device.
- The math, sentence and reading games, belts, lessons, step-by-step help and the endless sentence generator all work.
- Signing in adds three extras: Ask Sensei, Sensei's written feedback on reading answers (otherwise a built-in checker gives hints), and new Claude-written sentences and stories.

## Same progress on every device

Open the game from the shared Claude link while signed in to Claude. Each student's belts, XP, stats and the sentence bank are then saved to that Claude account, and they show up on any phone, tablet or computer signed in to the same account. The dot at the bottom of the screen shows the status:

- **Synced to your account**: everything is saved to the account.
- **Saved on this device**: opened from a file or signed out.
- **Needs Contributor access**: the person who shared the link needs to give that account Contributor (or Editor) access so it can save.

Each Claude account keeps its own private set of students, so the person sharing the link can't see the other family's data, and vice versa.

## Grade levels and the Back button

- **Each game has its own grade level.** A child can do Grade 3 math, Grade 5 sentences and Grade 4 reading. Set each one on its game card on the home screen.
- **Change the grade inside a game:** the grade drop-down next to Back starts a fresh round at the new grade right away. Use it when a level is too hard (or too easy) right now.
- **Lowering is always allowed**, even during a redo (it ends the redo for that game). Raising waits until the redo is passed, or until you unlock it in the Parent corner.
- **Back** returns to the previous screen. Leaving a round in the middle doesn't award XP for it.

## Learning as they go

- **Step-by-step help:** when a math card is answered wrong in Practice Kata, the game shows how to solve *that exact problem* (make-a-ten, borrowing, the nines trick, long division, negative-number sign rules and more). The card comes back a few cards later so they can try again.
- **Rule book:** in Fix-It Sentences, the Rule book button explains the rules for the kinds of mistakes in the current sentence, with examples.
- **The 70% rule:** a score under 70% means the level has to be **redone**. The results screen shows Sensei's lesson (strategy tips plus worked examples of what they missed). That grade and skill set stays locked in until they pass it with 70% or better. Parents can unlock it early from the Parent corner.
- **Ask Sensei (AI tutor):** kids can type a question ("why is my answer wrong?", "give me a hint") and get a short, kid-friendly answer. Before a problem is solved, Sensei gives hints but doesn't hand over the answer. This needs the game to be opened through the shared Claude link, and it uses the Claude account of whoever is signed in. Everywhere else the button is hidden and the built-in help still works.

The pass mark is `PASS` near the top of `js/math-game.js` and `js/sentence-game.js`.

## How to open it

**Easiest, for sharing with another parent:** open the Claude link to the game, tap **Share**, and send it to them. On their phone, they open the link and choose **Add to Home Screen** from the browser's share menu so it opens like an app.

**On a computer:** open the `learning-games` folder and double-click `index.html`. It opens in your web browser and works offline.

**On a tablet or phone, or from any device (free):** host it with GitHub Pages:
1. On GitHub, go to the repository's **Settings → Pages**.
2. Under "Build and deployment", choose **Deploy from a branch**, pick the branch and the `/ (root)` folder, then click **Save**.
3. After a minute the games are at `https://<your-site>/learning-games/`. On an iPad, use **Share → Add to Home Screen** to get an app-style icon.

> Heads-up: if this repository already hosts a public website, the games will be public at that address too. That's harmless because nothing personal leaves the device, but you may want a separate repository if you'd rather keep it private.

## Parent corner

The **Parents** button (top right) shows, for each child:
- belt, XP and the number of days they've practiced
- accuracy for each operation and each grade, plus Fix-It Sentences
- their current tricky math facts
- their recent rounds

You can also reset a child's progress or remove a child there.

Progress is stored in the browser on that device (localStorage). Each device and browser keeps its own progress, and clearing the browser's site data erases it.

## Adding your own sentences

Open `data/sentence-bank.js` in any text editor. Copy an existing entry, paste it, and change the words:

```js
{ id: "my-01", grade: 4,
  text: "my brother play soccer on tuesday",
  answer: "My brother plays soccer on Tuesday.",
  fixes: [
    { type: "cap", hint: "Look at the very first word.", explain: "Sentences start with a capital letter." },
    { type: "grammar", hint: "One brother. Play or plays?", explain: "With he/she/it, add -s: he plays." },
    { type: "cap", hint: "Days of the week are names.", explain: "Days of the week are capitalized." },
    { type: "punct", hint: "How does it end?", explain: "A telling sentence ends with a period." }
  ] },
```

- `type` must be `cap`, `punct`, `spell` or `grammar`.
- If more than one corrected version is fine, list them: `answer: ["Version one.", "Version two."]`.
- Spaces and curly vs. straight quotes are ignored when checking. Capitals and punctuation count.

## Changing the math

All the number ranges are in the `LEVELS` table near the top of `js/math-game.js`. Each grade has an `add` rule and a `mul` rule. Subtraction and division are built as their reverse, so answers always come out whole.

## Files

```
learning-games/
  index.html             all the screens
  css/style.css          look and feel
  data/sentence-bank.js  Fix-It sentences (edit me!)
  js/storage.js          students, belts, saved progress
  js/math-game.js        Math Dojo
  js/sentence-game.js    Fix-It Sentences
  js/explain.js          step-by-step math help, tips, rule book
  js/coach.js            adapts practice to weak spots, Sensei's plan
  js/sentence-gen.js     endless sentence generator + growing bank
  js/reading-game.js     Story Scrolls (reading comprehension)
  data/reading-bank.js   reading passages (edit me!)
  js/sync.js             saves progress to your Claude account
  js/sensei.js           Ask Sensei AI tutor
  js/effects.js          sounds and confetti
  js/cast.js             Engage characters, coach lines, fighters
  js/builder.js          build-your-own fighter (drawn character)
  img/                   character art and Engage logo
  js/app.js              home, results and parent screens
```
