# Brain Dojo

Free math, writing, reading, spelling and Spanish practice from Pre-K through 8th grade. Kids earn karate belts (White → Yellow → Orange → Blue → Green → Purple → Brown → Red → Black) for the work they do. You don't need an account, a subscription or the internet, and there are no ads.

## Belts, stripes and graduation

- **Belts, per grade:** White → Yellow → Orange → Blue → Green → Purple → Brown → Red → Black. Every grade (Pre-K to 8th) has its own belt path. Choose the **Dojo grade** on the home screen to see the belt and stripes for that grade.
- **Stripes:** each belt needs 4 stripes: **Math** (Math Dojo), **Reading** (Fix-It Sentences), **Spelling** (Spelling Bee) and **Comprehension** (Story Scrolls). **Spanish** is bonus training only: practice earns extra XP (up to 100 per belt, refilled at each new belt) but there is no Spanish stripe or test.
- **Stripe tests (4 parts):** each stripe test comes in **4 parts, each a different skill**, so a stripe takes real practice. Part 1 opens at **25** practice XP, Part 2 at **50**, Part 3 at **75**, Part 4 at **100**. Each part is short (Math 10 problems, Fix-It 5 sentences, Spelling 6 words, Story Scrolls 3 or 4 questions), has no hints, and needs **85%**. Passing all 4 parts earns the stripe; little dots on the belt and the stripe rows show which parts are done. An earned stripe's **Retest** is one mixed test.
  - Math: one part per operation the grade uses (Addition, Subtraction, Multiplication, Division); grades with only + and − use Addition, Subtraction, Mixed review and a Challenge mix from the next grade.
  - Reading (Fix-It): Capitals, Punctuation, Spelling, Grammar.
  - Comprehension (Story Scrolls): Main idea, Details, Reading between the lines, Word meaning.
  - Spelling: Short words, Medium words, Long words, Mixed review.
- **Pacing (so the journey lasts):** there's no daily cap, but easier work earns fewer points. Each subject has a **level**: the highest grade the Belt Assessment placed them at, automatic leveling moved them to, or a round of 70%+ (5+ items) at a higher grade. Clicking a lower grade never lowers it. Practice below the level still builds **that grade's belt** and gives XP, at **60%** points one grade below, **40%** two below and **25%** three or more below; the results screen says "Review practice: 60% points. Try Grade 4 for full points!"
- **Hints on every practice question, at every belt:** a big **Hint** button gives up to 2 hints, one per tap. Hint 1 lowers that question's points to 75%, hint 2 to 50%; they never block an answer, and they are read aloud when read-aloud is automatic. Stripe tests have no hints.
  - Spelling Bee: hint 1 is the word's meaning (from `data/spelling-hints.js`, 2nd grade up, about 65% of words) or, for younger kids and words without a meaning, a rhyme or sound clue plus the number of letters and syllables. Hint 2 is the first and last letter with blanks (`b _ _ _ _ e`, 6 letters); on pick-a-choice puzzles it rules out wrong choices instead. Unscramble always shows the first letter, so its hint 2 adds the last letter.
  - Fix-It Sentences: hint 1 says where to look for each mistake; hint 2 highlights the word(s) to fix and gives the rule.
  - Story Scrolls: hint 1 highlights the sentence in the story where the answer is; hint 2 gives a key word the answer should use.
  - Math Dojo: hint 1 is a strategy (count on, make a ten, skip count, think multiplication); hint 2 is a worked first step or a number line.
  - Spanish Dojo: hint 1 rules out a wrong choice (or shows the first letter when typing); hint 2 rules out another (or first and last letters).
  - Boss battles and tournaments: each hint rules out a wrong choice. The Belt Assessment has no hints, so it measures the right starting level.
- **A belt at every grade:** each grade has its own belt. The grade chips on the home cards and game setup show each grade's belt color (white if not trained yet), with a line like "Grade 4 · Blue Belt · 2 of 4 stripes" for the selected grade, and in-game grade menus list the belt too. While a game is played at a grade, the champion wears that grade's belt.
- **Practice:** each stripe has a **Practice** button set to the same level as its test. **Points come from doing the work:** practice earns up to **100 XP per stripe**, and stripe tests add **no XP** (practice to 56, pass the test, and it stays 56). They can keep practicing a stripe after earning it, until they move up a belt. Before a test, a note reminds them that practice, not the test, earns points.
- **Graduation:** the 4th required stripe graduates them to the next belt automatically, with a celebration and a **graduation bonus earned by practice**: a quarter of that belt's practice XP (all 400 practiced = **+100**, tests only = +0). That makes up to 500 XP per belt. Before the 4th test, a note shows the bonus they'd get now and the practice XP they'd leave behind. Earning all 4 stripes on the Black Belt masters the grade. A student who only takes tests can still earn belts, but won't climb the leaderboard.
- **Harder each belt:** White and Yellow tests mix in work from the grade below. Purple through Black lean harder, and Red and Black mix in the grade above. In Math, multiplication unlocks at Orange and division at Green.
- **Hints at every belt:** practice and free play always have hints, letter tiles, the rule book and Ask Sensei, at every belt. Only stripe tests (and the school word test) hide them.
- **Belt card:** tap the belt on the home screen to see its stripes, practice XP for each stripe, total Belt XP (out of 500), the next belt, the belt path and past graduations. Tabs along the top switch grades to see the belt for any grade, and **Train this grade** makes it the Dojo grade.
- **Free play:** the game cards still work for free practice at any grade, and their XP also counts toward that grade's stripes (up to the cap).

## Daily Flashcards (math bonus points)

In **Math Dojo**, the top of the screen has **⚡ Daily Flashcards**: big buttons for **+ Addition, − Subtraction, × Multiplication and ÷ Division**. Each one is a quick set of 10 cards of just that skill at the student's math grade. No missed-card repeats or explanations slow it down, so they build speed.
- **Bonus:** finishing a set with 70% or better earns **+2.5 bonus XP**, once per skill per day. All four skills = **+10 a day** (Pre-K to 1st grade have addition and subtraction, so up to +5).
- The buttons show ✓ once a skill's bonus is earned today. Extra sets still count as practice XP for the Math stripe (up to its 100 cap), just without another bonus. Everything resets at midnight.
- Bonus XP counts toward total XP and the weekly leaderboard. A low flashcard score never locks a level.

## The home screen

The home screen is kept simple. From top to bottom:
1. **Champion + Start training:** one big button that runs Sensei's best next step (school words first when there's a list, then stripe practice). Tap the champion to change them, or tap **Gear locker**.
2. **Today:** three tiles: ⭐ **Today's quest**, ⚡ **Daily Flashcards** (pick + − × ÷, with today's bonus shown) and 🗺️ **Adventure Map**.
3. **My belt:** one line with the belt, stripes and belt XP. Tap **Stripes & tests** to open the stripe rows with Practice and Stripe test buttons, and the Dojo grade picker. The app remembers whether it's open.
4. **Play:** one tile per game (coach, name, grade), plus a 📝 **School Words** tile when a parent has added a list. Tap a tile to play. Each game's grade is changed inside the game, from the grade menu at the top.
5. **Challenges:** the belt boss, Partner Challenge and the Dojo Challenge leaderboard.

## Start training, read aloud and certificates

- **Start training:** the big button on the home screen starts whatever Sensei suggests next (the stripe closest to done, a test they're ready for, or their weakest skill). Underneath, a 🔥 streak counts the days in a row they've trained.
- **Read it to me:** every game card has a speaker button that reads the instructions aloud (never the answer). Pre-K to 1st grade hear them automatically. Quiet mode or Sound off turns that off.
- **Certificates:** graduation offers **Get my certificate**, an Engage-branded certificate with the student's name, champion, new belt, grade and date, to save, print or share. Past graduations in the belt card have a Certificate button too.

## Badges, gear and growing up

- **Badges unlock real Engage gear,** in the same order as at Engage:

| Gear | How it's earned |
|---|---|
| Mouthguard | Signing up |
| Engage Black Training Shirt | Training on 3 different days |
| MMA Shorts | Training on 10 different days |
| MMA Gloves | The first stripe |
| Sparring Gear Bag | The first graduation |
| Sparring Gloves | Yellow Belt with 1 stripe |
| Sparring Boots | Yellow Belt with 2 stripes |
| Sparring Headgear | Yellow Belt with 3 stripes |
| Sparring Chest Gear | Yellow Belt with 4 stripes |
| **Full Sparring Gear outfit** | The Yellow → Orange Belt graduation, when sparring starts in class |
| Boxing Gloves | Green Belt |
| Nunchucks (for show) | Green Belt |
| **High Rank Uniform** | Green Belt: a black gi with the collar stripe and belt in the student's belt color (green, purple, brown, red); at **Black Belt** the collar stripe is **gold**. Built champions get it too. |
| **Judo Moves** (skill) | Green Belt: every 5 right in a row is a judo throw in boss battles (−3) and sparring (+2) |
| Kamas (for show) | Purple Belt |
| Bo Staff (for show) | Brown Belt |
| Wooden Sword (for show) | Red Belt |

  "Yellow Belt" counts in any grade, and a student past Yellow has all four. Gear earned under the earlier rules is kept, with no repeat celebration.
- **Weapons are for show only.** They're shown in the locker and performed in Weapons tournaments, and they're never used against anyone or any boss.
- **Works on phones, tablets and computers:** the layout adjusts for phone, iPad (portrait and landscape) and desktop browsers.
- **Champions grow up with the grade.** Kimmy, Billy, Tommy, Mackenzie and Rylan look about 5 in Pre-K/K, 7 in 1st–2nd, 10 in 3rd–5th and 13 in 6th–8th, based on the grade they're training. Built champions get younger proportions too. Instructors and Zumi stay the same.

## Engage Teams (character skills)

Three teams open as students climb the belts. Joining is the student's choice (an invitation card appears on the home screen).

| Team | Opens at | Focus | Uniform E | Team outfit |
| --- | --- | --- | --- | --- |
| Leadership Team | Orange Belt | Leadership character skills | Purple E | Black shirt and shorts, purple trim, LEADERSHIP |
| Athlete Team | Green Belt | Performance and bravery skills | Green E | Black shirt and shorts, green trim, ATHLETE |
| Black Belt Club | Brown Belt | Dedication and perseverance skills | Engage gradient E (brand Earthtone Gradient: #65D94A, #5CBFC1, #4F6CEE) | Black shirt and shorts, Engage gradient trim, BBC |

- **The E on the uniform:** everyone wears a white E. Team members get their team's E on every uniform (gi, High Rank, training, boxing, MMA); students on more than one team show their highest team, and a team shirt always shows its own team's E. **Gold is reserved for Engage instructors.** The sparring chest protector keeps its white E.
- **Weekly lesson** (one per team, rotating through 4 lessons, built on the 4 C's and the martial arts core values): a coach talk, one real moment written for the student's age group (Engage Ninjas: Pre-K to 1st, Core Kids: 2nd to 4th, Pre-Teen/Teens: 5th to 8th), then three questions: *What could you do? What's the right response? What should you say?* A wrong pick never costs anything; it gets a coaching line and another try. Then an optional last challenge: *How would YOU say it?* in their own words. **+5 XP** the first time each week. No parent sign-off is needed.
- **Talking points for parents:** the Parents area shows each team's latest lesson, the student's first choice on each question (and the best answer if they found it after), and their own words, plus a "try this together" idea.
- **Upkeep:** finishing the weekly lesson keeps the spot. Missing **3 weeks in a row**, or **more than 3 weeks in all**, ends the membership, with its team E and team outfit (the joining week doesn't count). Students can rejoin from Engage Teams and start fresh. The hub and the Parents area show missed weeks.
- Lesson text lives in `js/teams.js` (`LESSONS`), drafted in the "Brain Dojo Character Teams: Lesson Drafts" doc.

## Daily Flashcards (math and spelling)

The **⚡ Daily Flashcards** tile opens both. **Math:** 10 cards of one skill (+, −, ×, ÷). **Spelling:** 10 words of one puzzle type (Missing letters, Pick the spelling, Unscramble, Fix the spelling; Spelling check below 2nd grade). Each set finished at 70% or better earns **+2.5**, once per skill or type each day: up to **+10 a day for math and +10 for spelling**. Flashcard sets never lock a level.

**Unscramble puzzles** show a hint (the first letter), and each letter tile goes dark once it's used, by tapping or typing.

## Dojo Leaderboard and cheers

Tap the **🏆 Dojo Leaderboard** card. Three boards, each with a podium and every student's belt:

- **This week:** XP earned since Monday (resets every Monday).
- **All-time:** lifetime XP.
- **Streaks:** current training streak in days.

The student's own card shows their rank, belt, XP this week, all-time XP, streak and the cheers they got. A line under the tabs says how far they are from passing the next student ("Only 36 XP to pass Brave Tiger 12!").

**Cheers:** students on the board can give 🤜 fist bumps, 🙌 high-fives, 👏 applause and 👍 thumbs up to anyone else on it, as many as they like. When cheers come in, the student sees a burst of icons and a "Your dojo is cheering for you!" note (today and this week) the next time they open the app. **Supporter XP:** cheering friends on 3 different days in a week earns +5 XP, and 5 days earns +5 more (+10 a week at most). Only cheer counts and nicknames are stored; they reset every week.

The all-time and streak boards and cheers need the updated family script (see "Updating the family script"); until it's redeployed, the weekly board shows as before.

## Boss matches, Little Champions and the Sticker Book

- **Boss matches come alive:** each match opens with "Round 1… Begin!" as both step onto the mat. A right answer sends the champion dashing in for a strike (the boss flashes and gets knocked back, with a 💥 and the damage number); power punches are a jumping kick with a screen shake; a judo throw spins the boss. A wrong answer has the boss lunge in. The champion glows brighter with every right answer in a row. The finish: the boss tips over with spinning stars and the champion celebrates (or the champion sits down, dizzy, to try again).
- **Little Champions (Pre-K to 2nd grade):** shorter rounds (Math Dojo 10 cards, Spelling, Spanish and Fix-It Sentences 5); in Math Dojo, problems up to 10 show pictures (apples, stars, fish…) that bounce and count out loud when tapped, and answers are three big buttons instead of a keypad; every right answer gets a burst of stars and a cheer ("Hi-ya!", "Way to go!"), spoken for Pre-K to 1st. Stripe tests stay the same.
- **Sticker Book (everyone):** every finished round, boss match, tournament or team lesson earns a sticker, shown in a pop-up. 48 stickers on 6 pages (Dojo Animals, Champion Gear, Space and Sky, Brain Power, Snack Attack, Treasure); after the whole book, extras turn shiny. Open it from "📒 Sticker Book" on the home screen.

## Power Breaks (learning first)

After finished learning rounds, the results screen offers a **⚡ Power Break**: every round for Pre-K to 2nd grade, every 2nd round after that, at most 4 a day, never after a round that needs a redo. About 20 seconds, no XP, then **Back to training** starts the next round in Sensei's plan.

14 activities in two groups (the student picks one):

**Move your body** (real movement, counted out loud; fewer reps for the youngest): Jumping Jacks, Push-ups, Sit-ups, Front Kicks, Horse Stance Squats, High Knees, Crane Balance (stand on one leg, then the other) and Ninja Breathing (three slow breaths to refocus).

**Dojo brain games** (the brain keeps working):
- **Focus Pads:** hit the pad with the right answer to a quick math fact at their level.
- **Throwing Stars:** throw at the wooden target with the right letter (Pre-K to 1st) or the right spelling. Targets only, never a person.
- **Board Break:** strike when the power meter is in the green; 1, then 2, then 3 boards.
- **Sensei Says:** watch Sensei's combo (punch, kick, block, bow), then repeat it; it grows by one move each round.
- **Number Punch:** punch the numbers in order (1 to 8, or skip counting by 2s, 5s, 10s, 3s, 4s, 6s, 7s by grade).
- **Dojo Memory:** flip cards to find the matching pairs.

## Endless, adaptive content

Nothing should feel repeated, and practice leans toward what each child needs. It adapts within a session even when nothing is saved; when progress is saved it also remembers across sessions.

- **Fix-It Sentences** (`js/sentence-gen.js`): about 230 sentence patterns with large word lists; thousands of different sentences and 6,800 to 18,000+ different questions per grade. Each student's recent sentences are remembered (`p.sentSeen`) so they don't come back. Mistakes are planted by skill (capitals, end marks, 8 kinds of commas, apostrophes, sound-alikes, verb tense, pronouns, quotation marks, semicolons and colons...), and a skill under 70% gets about half the next round, with a "Training: commas in a list" line. Boss-match reading questions use the same generator.
- **Story Scrolls** (`js/story-gen.js`): hand-written passages first, then generated passages (realistic stories, dojo stories, animal facts for 82 animals, how-to steps, community helpers, "long ago" history), sized for each grade band; tens of thousands of possible passages per grade. No repeats for a student, no same genre twice in a row, and more questions of the type a child misses (main idea, details, reading between the lines, word meaning).
- **Spelling Bee** (`data/spelling-bank.js`, `js/phonics.js`): 500+ words per grade, each with its own sentence, tagged by phonics pattern (short and long vowels, vowel teams, r-controlled, digraphs, blends, soft c/g, prefixes, suffixes, roots, homophones...). Words don't repeat until a grade's list is used up, except when the app sees a weak pattern: then missed words come back in the next round or two and again later (spaced repetition) alongside new words of that pattern, with a "Training: long a (ai, ay, a_e)" line. The parent report shows "Spelling focus" when a pattern needs practice.

## Tournaments

Tap **🏆 Tournaments** on the home screen. Each one is a single-elimination bracket of **6 to 12** competitors (computer opponents with nicknames). Byes go into round 2 when the numbers are uneven, and you can enter as many as you like.

| Type | Opens at | How you compete |
|---|---|---|
| **Kata** | Yellow Belt with 2 stripes | The opponent performs first; then you get answers right in a row, up to 15. The longer your run, the higher the judges' score (5.0 to 10.0). Beat their run to win. A tie goes to one sudden-death question. |
| **Sparring** | Orange Belt | Head to head, first to 5 points. Answer before your opponent's clock runs out. A wrong answer freezes you for a moment, like Partner Challenge. With Judo Moves, every 5 in a row is a judo throw (+2). The final plays the Iron Tower music. |
| **Weapons** | Green Belt | A kata performed with a weapon you've earned. The questions lean a little harder. |

- **Medals and XP:** Gold **+10 XP**, Silver **+7.5**, Bronze **+5** (both semifinal losers get bronze). **Double XP on Saturdays and Sundays.** Medals are counted on the home card and in the tournament hub.
- Opponents get a little tougher each round. Questions mix every subject at the dojo grade and belt.
- **To spar a friend instead,** use **Partner Challenge** (two players, one screen); there's a button for it in the tournament hub.
- Computer tournaments are open every day.

### Weekend friend challenges (from the leaderboard)

On the website, a student who is on the Dojo leaderboard can tap **⚔️ Challenge** next to another student and pick Kata, Sparring or Weapons (only the types the challenger has opened).
- **When:** challenges can be sent any day. They're **played Saturday 12:00 am through Sunday 11:59 pm** (the device's local time), then they end. Before Saturday the challenge shows "Opens Saturday".
- **Accepting:** the challenged student sees "⚔️ friend challenge!" on the Tournaments card on the home screen and **Accept** / **Not this time** at the top of the Tournaments screen. If that tournament type isn't open for them yet, they're told kindly which belt opens it.
- **Playing:** each student plays **one round on their own device at their own grade**. Kata and Weapons: right answers in a row (up to 15). Sparring: points scored in a 60-second round (a miss freezes you for a moment; judo throws count +2). Leaving in the middle keeps the score so far. Neither student sees the other's score until they've played.
- **Medals:** higher score wins **🥇 Gold +20 XP**; the other gets **🥈 Silver +15 XP**; a tie is silver for both (weekend double XP). If the other student never plays, the one who did gets silver after Sunday.
- **Fair play:** one challenge per pair of students per weekend, up to 5 sent and **3 scored challenges per student per weekend**, and no challenging your own family.
- **Privacy:** only nicknames (or initials) and belts are shown. The script stores nickname, belt, type and scores under anonymous numbers, and clears challenges a few days after the weekend.
- It needs the updated `tools/family-sync.gs` (see "Updating the family script" below). Until it's redeployed, the Challenge buttons stay hidden. On the Claude link, the board says friend challenges are available at brain.engagelma.com.

## Boss Battles, Partner Challenge and the champion in every game

- **Boss Battles:** every belt in every grade has a boss to beat. Right answers are kicks that knock down the boss's health; a wrong answer lets the boss strike back and costs a heart. Questions mix math, spelling, reading (pick the correctly written sentence) and Spanish at the student's grade and belt. The ladder: Rascal the Raccoon Ninja (White), Professor Hoot (Yellow), Blaze the Fire Fox (Orange), Glacier the Polar Bear (Blue), Bamboo the Panda Master (Green), Shadow the Ninja Cat (Purple), then the Engage instructors: **Agent Bridgette** (Brown), **Star Force Mrs. Young** (Red) and the final boss, **Iron Master Young** (Black). Beat him and he transforms into **Final Boss Master Young** for one last fight (+100 XP and the Final Boss trophy). Beating a boss the first time earns a trophy and +50 XP. Gear helps (based on the outfit worn): headgear and chest gear add a heart each, and gloves turn every 3rd hit in a row into a 2-damage power punch.
- **Partner Challenge:** two players on one phone or tablet. The screen splits (the top half flips to face the player across the table), each player gets questions at their own grade, and the first to the goal wins. A wrong answer freezes that player for 1.5 seconds. Students who win get +20 XP. Guests can play too.
- **Champion in every game:** a small version of the student's champion, in their belt and gear, sits beside every game. It kicks on a right answer, shakes it off on a miss and bows at the end of a round.

## Parent corner

- **PIN:** the first visit asks for a 4-digit parent PIN, so kids can't reset or remove progress. Forgot it? A grown-up math question lets you set a new one.
- **Dashboard:** for each child: this week (days, rounds, questions, streak), belt progress, what they're strong at and what to work on, a tip to try at home, last week's recap (highlighted on Mondays) and badges. The detailed tables are under **See details** and only show grades they've played.
- **Share this week:** makes a progress card picture to text to family or an Engage instructor.
- **Dojo Challenge and leaderboard:** a weekly team goal (3,000 right answers) and a **leaderboard ranked by XP earned this week** (practice, graduation bonuses, Daily Flashcards, bosses, Partner Challenges and daily chests). Stripe tests alone give no points, so doing the practice is how to climb it. **Anyone can see the board; no names are ever shown.** Each student appears as a **nickname** they build from kid-safe word lists (Word 1 + Word 2 + a number, like "Swift Panda 27", with a 🎲 Surprise me button) or as a first initial. Words that match, contain, start like or nearly spell the student's real name are grayed out and refused (a student named Wolfgang can't be "Swift Wolf"). Students pick or change it from the board (tap the Dojo Challenge card). A parent puts each child on the board in the Parent corner. On your own website that requires signing in with a parent's email; the board runs through `tools/family-sync.gs` and stores only nickname or initial, belt and weekly points. On the Claude link it needs Contributor access.

## School Words (from your child's teacher)

In **Parents**, tap **Add this week's words** and type or paste the spelling list from school (up to 25 words). On the Claude link you can also **📷 read a photo of the list**. The words become:
- **Practice** in Spelling Bee (every challenge style; quiet mode works). The shakiest words come first. Each word gets a real sentence: from the built-in word bank, written by Sensei on the Claude link, or a simple one otherwise.
- **A word test:** every word once, no second tries or hints. Listen-and-spell when sound is on; silent styles in quiet mode.
- A **School words** button on the Spelling Bee card, and Sensei's plan puts them first until they're mastered.

Parents see each word color-coded (mastered, practicing, missed last time) and the last test score. A word counts as mastered after 2 right answers with the latest one right. Typing a new list starts a new week (stats for repeated words carry over).

## Adventure Map, daily quest and streak shields

- **Adventure Map:** one region per belt at the dojo grade: Rascal's Forest, Hoot's Library, Blaze Canyon, Glacier Peaks, Bamboo Grove, Shadow Village, Agent Bridgette's HQ, Star Force Station and the Iron Tower. The champion (in their outfit) stands in the current region, stripes light the path, cleared regions show ✓, beaten bosses show 🏆, and the regions ahead stay hidden.
- **Daily quest:** one short goal each day (about 5 minutes), such as finish 2 rounds, answer 25 questions, score 90% in a round, play a certain game, fight the belt boss or practice school words. The same quest stays all day.
- **Mystery chest:** finishing the quest opens a chest with 20 to 50 bonus XP plus a sticker for the **sticker book** (24 to collect) or a **🛡️ streak shield**.
- **Streak shields** (hold up to 2): if a day is missed, a shield fills it in so the streak doesn't break. The home screen says when a shield saved the streak.

## Parent Progress Report sign-up (GoHighLevel leads)

**Students always play free, with no sign-up.** In the Parent corner (behind the parent PIN), a grown-up unlocks the free **Parent Progress Report** once per device with their first and last name and email. The report includes the weekly dashboard, School Words, the progress card and details. Signing up automatically adds them to Engage's free **Parent Handbook** email series in GoHighLevel. Optional extras, each its own unchecked box:
- free trial class offers, events and specials
- text messages (the mobile number field only appears when this is checked)

Until the report is unlocked, the Parent corner still shows **Back up progress** for each student, so progress is never held hostage. A "Parents: unlock your free Parent Progress Report" link on the welcome screen opens the PIN-protected Parent corner.

**Terms and consent:** the form requires a "parent or guardian 18+ and I agree to the Terms & Privacy" box, and shows the disclosure next to the button: emails including the Parent Handbook series, unsubscribe any time, texts only by opt-in with STOP/HELP wording, never sold, nothing collected from children. **Terms & Privacy** opens the full terms. Each sign-up records the consent wording and the terms version. Kid-safe (COPPA): it's behind the parent PIN, adult-confirmed, and it collects **only the parent's** first and last name, email, member yes/no and (only with text opt-in) mobile number. Nothing about the child is sent to GoHighLevel. Have your own attorney review the terms wording.

**Connecting GoHighLevel:**
1. In GoHighLevel, create a Workflow with the trigger **Inbound Webhook**. Copy its URL.
2. Paste the URL into the `leadEndpoints` list in `js/config.js` (in quotes).
3. Open Brain Dojo, unlock the report once as a test, then in the workflow trigger click **Fetch sample request** and map the fields: `first_name`, `last_name`, `email`, `phone`, `tags`, `member`, `offers`, `sms_consent`, `consent`, `terms_version`.
4. Add actions: **Create/Update Contact**, **Add Tags** (from `tags`: Brain Dojo, Parent Progress Report, Parent Handbook, plus Free Class Offers / SMS Opt-In / Engage Member / Prospect), then **Add to Workflow:** your Parent Handbook email series. Only send texts to contacts tagged SMS Opt-In.

You can also add a Google Sheet backup (steps in `tools/lead-sheet.gs`) as a second URL in the same list. The report is only locked where a sign-up can actually be delivered: with `leadEndpoints` empty (and on the Claude link for visitors who can't save there), the report stays open, so parents are never locked out. On the Claude link, the owner is never locked out and sees **Download sign-ups (CSV)**. If a parent is offline, the sign-up is sent the next time Brain Dojo opens.

## Music and sound

Brain Dojo has its own soundtrack, composed for it and played by small synthesizers in code. There are no audio files, so it loads instantly and works offline.

| Piece | Where it plays |
|---|---|
| **Morning Bow** | Welcome, home and parent screens: an upbeat koto and flute tune with a light beat |
| **Path of Belts** | The Adventure Map: a bright flute adventure |
| **Quiet Mind** | While answering questions: very soft, no melody, so it doesn't distract |
| **Rival Stance** | Boss battles and Partner Challenge: taiko drums and a driving bass |
| **Iron Tower** | The Black Belt boss and Final Boss Master Young: faster and heavier |
| **Victory fanfare** | Wins, stripes and graduations |

- Music starts at **15% volume** after the first tap (browsers require a tap first). It gets softer while a voice reads aloud, and pauses when the app is in the background.
- The top-bar **🔊 Sound** button opens the Sound menu, which has **Music on/off**, **Music volume**, and **Sound effects & voice on/off** (dings, cheers and read-aloud). Settings are remembered on each device.

## Offline play

On your own website, Brain Dojo keeps itself on the device after the first visit, so it opens and plays with **no internet**.
- The app's core files are saved right away, and the character pictures download quietly in the background a few seconds later. Fonts are kept too.
- Offline, kids can play every game, the map, bosses and flashcards, and everything saves on the device. The footer shows "Offline · playing and saving on this device."
- When the internet comes back, family sync and sign-ups send automatically. Ask Sensei and other AI extras are only available on the Claude link anyway.
- **Updates and browser caching:** engagelma.com tells browsers to keep scripts and styles for 4 hours, so `index.html` loads them with a version stamp (`?v=...`). After changing any app file, run `python3 tools/build-sw.py`. It re-stamps every script and style link with a fingerprint of the files, so families get the update right away instead of a mix of old and new files. It also refreshes `sw.js` with a new version, so devices with the offline copy pick up the update on their next visit.
- On iPhone and iPad, Share → **Add to Home Screen** opens it full screen like an app. The top bar stays clear of the clock and battery icons.

## Scratch paper

In Math Dojo, **Scratch paper** opens a sheet of graph paper to work a problem out with a finger, stylus or mouse. The problem stays pinned at the top and the keypad sits underneath, so they can type the answer without closing it; Check closes the paper and shows the result. Three pen colors, eraser, undo and clear. A fresh page starts with each new problem. It's allowed on stripe tests too (it's paper, not a hint). Nothing drawn is saved or sent anywhere.

## Safety and security

- **Only the owner can change the app.** The shared link is view-only: visitors can use the games but can't edit the page. Updates come only from the owner's Claude account (and this repository).
- **Shared data is locked down.** Database rules allow writing in just three places: each signed-in family's own private folder, their own single Dojo Challenge entry, and their own Parent report sign-up (readable only by the owner). Everything else is owner-only. Dojo entries from other families are checked before they're shown: first initials only, letters only, a rude-word filter (anything flagged shows as "Champion"), real belt names and colors only, and weekly counts capped at 1,500.
- **No code can be slipped in.** Everything typed by kids, written by AI or loaded from a save code is escaped before it's shown, and every student record (loaded, synced or restored) is checked field by field. A doctored save code can't run anything.
- **Kid-safe AI.** Sensei only helps with schoolwork, never asks for personal details or shares links, refuses unsafe topics, sends a child who says they're hurt or unsafe to a trusted grown-up, and ignores attempts to change its rules.
- **Hidden from search engines and AI crawlers.** The pages carry noindex/nofollow/noarchive tags (link previews in texts still work), and the Claude link has a long random address that is only found if someone shares it.
- **No secrets** (API keys, passwords) are stored in the app or this repository.

## Hosting it on your own website

The game is a plain website: everything in this `learning-games` folder (index.html, css, js, data, img, manifest.webmanifest). Put the folder on any web host (your website's file manager, GitHub Pages, Cloudflare Pages, Netlify) and it opens in a normal browser with no Claude banner or sign-in. "Add to Home Screen" opens it full screen like an app, with the Brain Dojo icon.

Hosted on its own, these Claude-only extras are turned off automatically: Ask Sensei, Sensei's written feedback on Story Scrolls (the built-in checker is used instead), new AI-written sentences and stories (the built-in banks keep going), saving to a Claude account, and the Dojo Challenge board. Progress stays in each browser; use **Back up progress** save codes to move a student between devices.

## Family accounts: progress on every device (sign in with a parent's email)

On your own website, families can link every device with a parent's email instead of copying save codes:
1. On any device, the welcome screen shows **"Already training on another device? Sign in with a parent's email."** The Parent corner also has a **Use Brain Dojo on every device** card.
2. The parent types their email and checks the consent box (which explains that profiles are encrypted on the device first), and a **6-digit code** arrives by email. They type it in, and the device is linked. Students on the account appear right away.
3. From then on, **every save syncs automatically** (a couple of seconds after each answer, when the app is closed or hidden, and every 2 minutes while open). Any device signed in with the same email shows the same students, belts, stripes and points. Adding or removing a student carries over too. The footer says "Synced to p•••@example.com".
4. In the Parent corner, parents can **Sign out this device**, **Sign out all devices**, or **Delete family data**.

**Privacy by design (no personal data on file):** each device **encrypts every student profile before it's sent** (AES-256-GCM). The key is made on the device from the parent's email plus a random per-family salt (PBKDF2, 310,000 rounds). The server never receives the key and **never stores an email address**: the email is used once to send the sign-in code. Each family file in your Drive holds only:
- an anonymous family number (made with a secret only the script knows, so it can't be matched to an email)
- scrambled student data
- fingerprints of the linked devices' keys

The script refuses any readable student data. Kids' first names exist in readable form only on the family's own devices. Someone would need both your Drive file and the parent's exact email to unscramble a family.

**How it's built (free, in your Google account):** `tools/family-sync.gs` is a small Google Apps Script web app. Each family is one private JSON file in a "Brain Dojo Family Data" folder in your Google Drive, and the sign-in codes are sent from your Gmail, from the address in `FROM_EMAIL` (set to info@engagelma.com). That address must be listed under Gmail Settings → Accounts → **Send mail as** for the Google account that deploys the script.

**Setup (about 5 minutes):**
1. Go to script.google.com and create a new project.
2. Paste in `family-sync.gs` and save.
3. Deploy it as a web app: Execute as **Me**, Who has access **Anyone**.
4. Allow the permissions it asks for (the Drive files it creates, and sending email from your Gmail).
5. Paste the `/exec` URL into `js/config.js` as `accountEndpoint`.

Until that's set, the sign-in options stay hidden.

**Updating the family script (after a new version of `tools/family-sync.gs`, such as friend challenges):** keep the same URL so nothing else changes.
1. Open script.google.com and the **Brain Dojo Family Sync** project.
2. Select all of the code in the editor, delete it, paste in the whole new `tools/family-sync.gs`, and click **Save**.
3. Click **Deploy → Manage deployments**.
4. Click the pencil (**Edit**) on the existing web app deployment.
5. Under **Version**, choose **New version**, then click **Deploy**. (If Google asks for permissions again, allow them.)
6. The `/exec` URL stays the same, so `js/config.js` doesn't change. Don't use "New deployment": that makes a new URL.

**Safety:**
- Codes expire in 10 minutes, allow 5 tries, and are limited to 5 per email per hour.
- Each linked device gets its own long random key. Only a fingerprint of it is stored, and signing out deletes it.
- The email code isn't marketing and doesn't join any list.
- Everything coming back from the account is checked field by field before it's shown, like save codes.
- If two devices change the same student while offline, the most recent copy of that student wins.

**Limits:**
- Gmail sends about 100 code emails a day on a regular Google account (about 1,500 on Google Workspace).
- Each family holds up to 10 students.

On the Claude link, the Claude-account sync described below is used instead.

## Saving progress

- Progress saves automatically after every answer that earns XP. If a child taps Back, switches apps or closes the page in the middle of a round, the XP they've earned so far is kept.
- **Signed in to Claude through the shared link:** each student is saved to that Claude account and shows up on any device signed in to the same account.
- **Not signed in (for example, a student at home):** progress stays in that browser and never touches anyone's Claude account. In **Parents**, tap **Back up progress** to get a short save code (or a save file). On any device, tap **Restore a student** on the "Who's training today?" screen and paste the code to bring the student back. This is also the way to recover if a browser clears its storage.

## Spelling Bee and Spanish Dojo

**Spelling Bee** (coach: Ms. Lauryn)
- Every round mixes six kinds of challenges, each with a sentence clue:
  - **Listen and spell:** hear the word, then type it.
  - **Missing letter:** a letter (or two, in older grades) is missing, as in `fr?end`. Pick the right one.
  - **Pick the right spelling:** choose the correct spelling out of four.
  - **Spelling check:** a word in the sentence is underlined. Is it spelled correctly or misspelled?
  - **Fix the spelling:** the underlined word is misspelled. Type it the right way.
  - **Unscramble:** put the letter tiles in order (Pre-K to 4th grade).
- The wrong spellings are believable ones ("beleive", "nesessary"), and they're never a real word, so "cat" never turns into "cut".
- **No sound needed:** on a listening challenge, **Can't listen? Swap it** swaps in a silent challenge for the same word. **Quiet mode** turns off listening challenges for that student until it's turned off again. Listening challenges are also skipped automatically when the sound is off or the device can't speak.
- Letter tiles: Pre-K to 1st grade see them right away on listening challenges. Older grades can turn them on as a hint, for 5 XP (not on Brown, Red or Black Belt).
- A wrong typed answer shows which letters were right and wrong. Missed words come back a few turns later as a different kind of challenge.
- The lists are in `data/spelling-bank.js`: 24 words per grade, from cat and dog up to onomatopoeia.

**Spanish Dojo** (coach: Ms. Bridgette)
- Topics open as the grade goes up: greetings, colors, numbers and animals for the youngest; family, food, school, days, weather, clothes and months in the middle grades; places, action words, phrases, question words and "I" verbs for the oldest.
- Kids choose the meaning, choose the Spanish word, and (from 4th grade) type it. Accents are optional when typing, with a gentle reminder.
- **Hear it** speaks the Spanish word using the device's built-in voice. No login is needed.
- Words are in `data/spanish-bank.js`.

## Grades

Every game runs from **Pre-K through 8th grade**:
- **Pre-K and Kindergarten math** uses numbers up to 5 and 10, with dots to count. Multiplication and division start in 2nd grade, and negative numbers in 7th.
- **Pre-K and Kindergarten sentences** are tiny ones, with only capital letters and end marks to fix.
- **Pre-K to 1st grade stories** are short, and **Read it to me** reads them aloud.

## Look and characters

The game uses the Engage brand (midnight navy, the green-teal-blue streak, gold for rewards, Montserrat and Cabin) and the cartoon cast from the Engage Higgsfield workspace:
- **Zumi** is the host.
- **Master Young** coaches Math Dojo, **Master Mrs. Young** coaches Fix-It Sentences and **Ms. Kyra** coaches Story Scrolls.
- **Master Mrs. Young** gives Sensei's plan.
- Kids choose a champion: Kimmy, Billy, Tommy, Mackenzie, Rylan, Zumi, or an instructor (Master Young, Master Mrs. Young, Ms. Bridgette, Ms. Kyra, Ms. Lauryn). They can change it by tapping their character on the home screen. Every champion, instructors included, starts in a White Belt and wears whatever belt the student has earned at the current Dojo grade, so they earn their way up again.

- **Build your own champion:** in "Change champion", kids can design a character. They choose boy or girl, height, build, skin tone, hairstyle, hair color, eye color, face extras (freckles, glasses, rosy cheeks), smile, and uniform (black gi, white gi, or shorts with an Engage shirt). The belt it wears is always the belt they've earned.

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
  js/rank.js             belts, stripes, stripe tests, graduation
  js/coach.js            adapts practice to weak spots, Sensei's plan
  js/sentence-gen.js     endless sentence generator + growing bank
  js/reading-game.js     Story Scrolls (reading comprehension)
  js/word-quiz.js        Spelling Bee and Spanish Dojo
  data/spelling-bank.js  spelling words by grade (edit me!)
  data/spanish-bank.js   Spanish topics and words (edit me!)
  data/reading-bank.js   reading passages (edit me!)
  js/sync.js             saves progress to your Claude account
  js/sensei.js           Ask Sensei AI tutor
  js/effects.js          sounds and confetti
  js/cast.js             Engage characters, coach lines, fighters
  js/builder.js          build-your-own champion (drawn character)
  img/                   character art and Engage logo
  js/backup.js           save codes: back up and restore a student
  js/certificate.js      graduation certificates
  js/badges.js           badges and the gear locker
  js/parent.js           parent dashboard, PIN and weekly share card
  js/dojo.js             weekly Dojo Challenge
  js/tournament.js       tournaments: kata, sparring and weapons brackets, medals
  js/challenge.js        weekend friend challenges from the leaderboard
  js/school.js           School Words (parents' weekly spelling list)
  js/quest.js            Adventure Map, daily quest, chests, stickers, streak shields
  js/leads.js            parent newsletter / free-class sign-up
  js/config.js           studio settings (sign-up and family account URLs)
  js/music.js            the soundtrack (synthesized in code) and music settings
  sw.js                  offline support (built by tools/build-sw.py)
  js/family.js           family accounts: email sign-in and sync across devices
  tools/family-sync.gs   Google Apps Script backend for family accounts
  tools/lead-sheet.gs    Google Sheet script that collects sign-ups
  js/scratch.js          scratch paper for math
  js/quick.js            quick tap-to-answer questions from every subject
  js/boss.js             boss battles
  js/duel.js             two-player Partner Challenge
  js/mini.js             the champion beside every game
  js/app.js              home, results and parent screens
```


## Credits

Spelling hint meanings are adapted from WordNet 3.1, Copyright 2011 by Princeton University, used under the WordNet license (https://wordnet.princeton.edu/license-and-commercial-use).
