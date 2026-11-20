# Brain Dojo

Free math and writing practice for grades 3–7. Kids earn karate belts (White → Yellow → Orange → Green → Blue → Purple → Brown → Red → Black) for the work they do. You don't need an account, a subscription or the internet, and there are no ads.

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
  js/sensei.js           Ask Sensei AI tutor
  js/effects.js          sounds and confetti
  js/app.js              home, results and parent screens
```
