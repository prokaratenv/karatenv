/*
  SENTENCE BANK — Fix-It Sentences
  ================================
  Add your own sentences here. Each entry needs:

    id      a unique short name (any text)
    grade   3, 4, 5, 6 or 7
    text    the sentence WITH mistakes (what your child sees)
    answer  the corrected sentence. If more than one version is correct,
            use a list: ["Version one.", "Version two."]
    fixes   one line per mistake:
              type     "cap" (capital letters), "punct" (punctuation),
                       "spell" (spelling / wrong word that sounds alike),
                       "grammar" (verb, pronoun or sentence structure)
              hint     a nudge shown when your child taps Hint
              explain  the rule, shown after the sentence is finished

  Tip: copy an existing entry, paste it below, and change the words.
*/
window.BD = window.BD || {};

BD.SENTENCES = [
  /* ---------------- GRADE 3 ---------------- */
  { id: "g3-01", grade: 3,
    text: "my dog likes to play fetch",
    answer: "My dog likes to play fetch.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence always starts with a capital letter: My." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g3-02", grade: 3,
    text: "sam and i went to the park.",
    answer: "Sam and I went to the park.",
    fixes: [
      { type: "cap", hint: "Sam is a person's name.", explain: "Names of people start with a capital letter: Sam." },
      { type: "cap", hint: "Look at the word that means you.", explain: "The word I is always a capital letter." }
    ] },
  { id: "g3-03", grade: 3,
    text: "Were is my red hat.",
    answer: "Where is my red hat?",
    fixes: [
      { type: "spell", hint: "The first word asks about a place.", explain: "Where asks about a place. Were is a different word (we were)." },
      { type: "punct", hint: "Is this sentence telling or asking?", explain: "A question ends with a question mark." }
    ] },
  { id: "g3-04", grade: 3,
    text: "the cat are sleeping on the bed.",
    answer: "The cat is sleeping on the bed.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: The." },
      { type: "grammar", hint: "There is only ONE cat.", explain: "One cat IS sleeping. Use are for more than one: the cats are." }
    ] },
  { id: "g3-05", grade: 3,
    text: "We went to the beech on saturday.",
    answer: "We went to the beach on Saturday.",
    fixes: [
      { type: "spell", hint: "Where do you find sand and waves?", explain: "Beach is the sandy place. A beech is a kind of tree." },
      { type: "cap", hint: "Days of the week are special names.", explain: "Days of the week start with a capital letter: Saturday." }
    ] },
  { id: "g3-06", grade: 3,
    text: "she have two little brothers.",
    answer: "She has two little brothers.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: She." },
      { type: "grammar", hint: "Say it out loud: she have or she has?", explain: "With he, she or it, we say has, not have." }
    ] },
  { id: "g3-07", grade: 3,
    text: "I cant wait for my berthday party.",
    answer: ["I can't wait for my birthday party.", "I can't wait for my birthday party!"],
    fixes: [
      { type: "punct", hint: "Cant is short for can not.", explain: "A contraction needs an apostrophe where letters are missing: can't." },
      { type: "spell", hint: "The day you were born.", explain: "Birthday is spelled b-i-r-t-h-d-a-y." }
    ] },
  { id: "g3-08", grade: 3,
    text: "my friend lives in texas.",
    answer: "My friend lives in Texas.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: My." },
      { type: "cap", hint: "States are special names.", explain: "Names of places like states start with a capital letter: Texas." }
    ] },
  { id: "g3-09", grade: 3,
    text: "the birds is singing in the tree.",
    answer: "The birds are singing in the tree.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: The." },
      { type: "grammar", hint: "There is more than one bird.", explain: "More than one bird ARE singing. Use is for just one." }
    ] },
  { id: "g3-10", grade: 3,
    text: "Can you help me with my homwork.",
    answer: "Can you help me with my homework?",
    fixes: [
      { type: "spell", hint: "Work you do at home.", explain: "Homework is home + work." },
      { type: "punct", hint: "Is this sentence asking something?", explain: "A question ends with a question mark." }
    ] },
  { id: "g3-11", grade: 3,
    text: "we ate pizza for diner.",
    answer: "We ate pizza for dinner.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: We." },
      { type: "spell", hint: "The evening meal has a double letter.", explain: "Dinner (the meal) has two n's. A diner is a restaurant." }
    ] },
  { id: "g3-12", grade: 3,
    text: "Dad goed to the store yesterday",
    answer: "Dad went to the store yesterday.",
    fixes: [
      { type: "grammar", hint: "Go, ___, gone. What's the past of go?", explain: "The past tense of go is went, not goed." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g3-13", grade: 3,
    text: "my mom maked cookies for us.",
    answer: "My mom made cookies for us.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: My." },
      { type: "grammar", hint: "What is the past of make?", explain: "The past tense of make is made, not maked." }
    ] },
  { id: "g3-14", grade: 3,
    text: "Look out for the big dog",
    answer: ["Look out for the big dog!", "Look out for the big dog."],
    fixes: [
      { type: "punct", hint: "Every sentence needs an ending mark.", explain: "This is a warning, so an exclamation point fits. A period also works." }
    ] },

  /* ---------------- GRADE 4 ---------------- */
  { id: "g4-01", grade: 4,
    text: "we bought apples oranges and grapes at the store.",
    answer: ["We bought apples, oranges, and grapes at the store.", "We bought apples, oranges and grapes at the store."],
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: We." },
      { type: "punct", hint: "This sentence has a list of three things.", explain: "Use commas to separate things in a list: apples, oranges, and grapes." }
    ] },
  { id: "g4-02", grade: 4,
    text: "Their going to the zoo on friday.",
    answer: "They're going to the zoo on Friday.",
    fixes: [
      { type: "spell", hint: "The first word should mean 'they are'.", explain: "They're = they are. Their = belongs to them. There = a place." },
      { type: "cap", hint: "Days of the week are special names.", explain: "Days of the week start with a capital letter: Friday." }
    ] },
  { id: "g4-03", grade: 4,
    text: "the dogs bone is under the couch.",
    answer: "The dog's bone is under the couch.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: The." },
      { type: "punct", hint: "The bone belongs to the dog.", explain: "To show something belongs to one owner, add 's: the dog's bone." }
    ] },
  { id: "g4-04", grade: 4,
    text: "My sister and me walked to scool.",
    answer: "My sister and I walked to school.",
    fixes: [
      { type: "grammar", hint: "Take out 'my sister and'. Would you say 'me walked'?", explain: "You would say 'I walked', so it's 'my sister and I walked'." },
      { type: "spell", hint: "Where you learn has a silent h.", explain: "School is spelled s-c-h-o-o-l." }
    ] },
  { id: "g4-05", grade: 4,
    text: "On july 4 2025, we watched fireworks.",
    answer: "On July 4, 2025, we watched fireworks.",
    fixes: [
      { type: "cap", hint: "Months are special names.", explain: "Months start with a capital letter: July." },
      { type: "punct", hint: "Dates need a comma between the day and the year.", explain: "Put a comma between the day and the year: July 4, 2025." }
    ] },
  { id: "g4-06", grade: 4,
    text: "The teacher said that we was doing a grate job.",
    answer: "The teacher said that we were doing a great job.",
    fixes: [
      { type: "grammar", hint: "We was or we were?", explain: "With we, use were: we were doing." },
      { type: "spell", hint: "This word means 'very good'.", explain: "Great means very good. A grate is a metal cover." }
    ] },
  { id: "g4-07", grade: 4,
    text: "Yesterday I runned three miles with my dad",
    answer: ["Yesterday I ran three miles with my dad.", "Yesterday, I ran three miles with my dad."],
    fixes: [
      { type: "grammar", hint: "Run, ___, run. What's the past of run?", explain: "The past tense of run is ran, not runned." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g4-08", grade: 4,
    text: "there are to many toys on the floor.",
    answer: "There are too many toys on the floor.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: There." },
      { type: "spell", hint: "To, too, or two? This one means 'more than enough'.", explain: "Too means 'also' or 'more than enough'. To shows direction. Two is the number." }
    ] },
  { id: "g4-09", grade: 4,
    text: "Did you finish you're science project.",
    answer: "Did you finish your science project?",
    fixes: [
      { type: "spell", hint: "The project belongs to you.", explain: "Your = belongs to you. You're = you are." },
      { type: "punct", hint: "Is this sentence asking something?", explain: "A question ends with a question mark." }
    ] },
  { id: "g4-10", grade: 4,
    text: "Mr. lee is our new piano teacher",
    answer: "Mr. Lee is our new piano teacher.",
    fixes: [
      { type: "cap", hint: "Lee is a person's name.", explain: "Names start with a capital letter: Mr. Lee." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g4-11", grade: 4,
    text: "The childrens played tag at reces.",
    answer: "The children played tag at recess.",
    fixes: [
      { type: "grammar", hint: "Children already means more than one child.", explain: "Children is already plural. There is no word 'childrens' unless it shows ownership." },
      { type: "spell", hint: "Break time has a double s at the end.", explain: "Recess is spelled r-e-c-e-s-s." }
    ] },
  { id: "g4-12", grade: 4,
    text: "wow, that was the most best movie ever!",
    answer: ["Wow, that was the best movie ever!", "Wow, that was the best movie ever."],
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: Wow." },
      { type: "grammar", hint: "Best already means 'the most good'.", explain: "Don't use most with best. Best already means the most good." }
    ] },
  { id: "g4-13", grade: 4,
    text: "Grandpa and me goes fishing every summer.",
    answer: "Grandpa and I go fishing every summer.",
    fixes: [
      { type: "grammar", hint: "Take out 'Grandpa and'. Would you say 'me goes'?", explain: "You would say 'I go', so it's 'Grandpa and I'." },
      { type: "grammar", hint: "Two people are doing this.", explain: "Two people go, not goes: Grandpa and I go." }
    ] },
  { id: "g4-14", grade: 4,
    text: "We red three books about sharks last weak.",
    answer: "We read three books about sharks last week.",
    fixes: [
      { type: "spell", hint: "Red is a color. What did you do with the books?", explain: "Read (sounds like red) is what you do with a book." },
      { type: "spell", hint: "Weak means not strong. This means seven days.", explain: "A week is seven days. Weak means not strong." }
    ] },

  /* ---------------- GRADE 5 ---------------- */
  { id: "g5-01", grade: 5,
    text: "after the game ended we went to the libary.",
    answer: "After the game ended, we went to the library.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: After." },
      { type: "punct", hint: "The sentence starts with an 'after...' part. Where does it end?", explain: "Put a comma after an opening clause: After the game ended, we..." },
      { type: "spell", hint: "Say it slowly: li-BRAR-y.", explain: "Library has two r's: l-i-b-r-a-r-y." }
    ] },
  { id: "g5-02", grade: 5,
    text: "\"can I have a snack\" asked maria.",
    answer: "\"Can I have a snack?\" asked Maria.",
    fixes: [
      { type: "cap", hint: "What someone says starts with a capital.", explain: "A quote starts with a capital letter: \"Can...\"" },
      { type: "punct", hint: "Maria is asking a question. Where does the ? go?", explain: "The question mark goes inside the quotation marks." },
      { type: "cap", hint: "Maria is a name.", explain: "Names start with a capital letter: Maria." }
    ] },
  { id: "g5-03", grade: 5,
    text: "each of the students have a pensil.",
    answer: "Each of the students has a pencil.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: Each." },
      { type: "grammar", hint: "The subject is 'each', which means one at a time.", explain: "Each is singular, so it takes has, not have." },
      { type: "spell", hint: "This word has a soft c.", explain: "Pencil is spelled p-e-n-c-i-l." }
    ] },
  { id: "g5-04", grade: 5,
    text: "We should of left earlier because the trafic was bad",
    answer: "We should have left earlier because the traffic was bad.",
    fixes: [
      { type: "grammar", hint: "'Should of' sounds right but isn't. What's the real word?", explain: "It's should have (should've). 'Should of' is never correct." },
      { type: "spell", hint: "Cars on the road. Double letter!", explain: "Traffic has two f's." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g5-05", grade: 5,
    text: "Its going to rain so bring you're umbrella.",
    answer: "It's going to rain, so bring your umbrella.",
    fixes: [
      { type: "punct", hint: "The first word means 'it is'.", explain: "It's = it is. Its (no apostrophe) means belonging to it." },
      { type: "punct", hint: "Two complete thoughts joined by 'so'.", explain: "Put a comma before so when it joins two complete sentences." },
      { type: "spell", hint: "The umbrella belongs to you.", explain: "Your = belongs to you. You're = you are." }
    ] },
  { id: "g5-06", grade: 5,
    text: "Him and my brother bilt a fort in the backyard",
    answer: "He and my brother built a fort in the backyard.",
    fixes: [
      { type: "grammar", hint: "Take out 'and my brother'. Would you say 'him built'?", explain: "You'd say 'he built', so it's 'He and my brother built'." },
      { type: "spell", hint: "Build, ___. There's a u in it.", explain: "The past of build is built: b-u-i-l-t." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g5-07", grade: 5,
    text: "Have you ever read charlotte's web",
    answer: "Have you ever read Charlotte's Web?",
    fixes: [
      { type: "cap", hint: "This is a book title.", explain: "Important words in a title get capitals: Charlotte's Web." },
      { type: "cap", hint: "Both important words in the title need it.", explain: "Web is part of the title, so it's capitalized too." },
      { type: "punct", hint: "Is this sentence asking something?", explain: "A question ends with a question mark." }
    ] },
  { id: "g5-08", grade: 5,
    text: "the team practiced hard, they won the champianship.",
    answer: ["The team practiced hard, and they won the championship.", "The team practiced hard, so they won the championship.", "The team practiced hard. They won the championship.", "The team practiced hard; they won the championship."],
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: The." },
      { type: "grammar", hint: "Two whole sentences are glued with only a comma.", explain: "A comma alone can't join two sentences. Add 'and' or 'so', or use a period." },
      { type: "spell", hint: "Champ-ee-on-ship.", explain: "Championship is spelled c-h-a-m-p-i-o-n-s-h-i-p." }
    ] },
  { id: "g5-09", grade: 5,
    text: "between you and I, this is the best piza in town.",
    answer: "Between you and me, this is the best pizza in town.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: Between." },
      { type: "grammar", hint: "After 'between', use the object pronoun.", explain: "After words like between, use me, not I: between you and me." },
      { type: "spell", hint: "Double letter in the middle.", explain: "Pizza has two z's." }
    ] },
  { id: "g5-10", grade: 5,
    text: "i seen a deer in our yard this mornin.",
    answer: "I saw a deer in our yard this morning.",
    fixes: [
      { type: "cap", hint: "The word that means you.", explain: "I is always capitalized." },
      { type: "grammar", hint: "I seen or I saw?", explain: "Use saw by itself. Seen needs a helper: I have seen." },
      { type: "spell", hint: "The last word is missing a letter.", explain: "Morning ends in -ing." }
    ] },
  { id: "g5-11", grade: 5,
    text: "Their are three resons why we need recess",
    answer: "There are three reasons why we need recess.",
    fixes: [
      { type: "spell", hint: "Their, there or they're?", explain: "Use there with 'there are' or 'there is'." },
      { type: "spell", hint: "Re-a-sons.", explain: "Reasons is spelled r-e-a-s-o-n-s." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g5-12", grade: 5,
    text: "Grandma lives in denver colorado.",
    answer: "Grandma lives in Denver, Colorado.",
    fixes: [
      { type: "cap", hint: "Cities are special names.", explain: "City names start with a capital letter: Denver." },
      { type: "cap", hint: "States are special names too.", explain: "State names start with a capital letter: Colorado." },
      { type: "punct", hint: "City and state need something between them.", explain: "Put a comma between a city and its state: Denver, Colorado." }
    ] },

  /* ---------------- GRADE 6 ---------------- */
  { id: "g6-01", grade: 6,
    text: "The girls soccer team won it's first game on saturday.",
    answer: "The girls' soccer team won its first game on Saturday.",
    fixes: [
      { type: "punct", hint: "The team belongs to many girls.", explain: "For a plural ending in s, put the apostrophe after the s: girls'." },
      { type: "punct", hint: "It's always means 'it is'.", explain: "Its (no apostrophe) shows ownership. It's means it is." },
      { type: "cap", hint: "Days of the week are names.", explain: "Days of the week are capitalized: Saturday." }
    ] },
  { id: "g6-02", grade: 6,
    text: "Yesterday we go to the museum and see a real dinosaur skeletin.",
    answer: ["Yesterday we went to the museum and saw a real dinosaur skeleton.", "Yesterday, we went to the museum and saw a real dinosaur skeleton."],
    fixes: [
      { type: "grammar", hint: "It happened yesterday.", explain: "Keep tenses consistent. Yesterday = past tense: went." },
      { type: "grammar", hint: "There's a second verb in the past too.", explain: "See becomes saw in the past tense." },
      { type: "spell", hint: "Skel-e-TON.", explain: "Skeleton ends in -ton." }
    ] },
  { id: "g6-03", grade: 6,
    text: "The loud music effected my ability to consentrate",
    answer: "The loud music affected my ability to concentrate.",
    fixes: [
      { type: "spell", hint: "Affect or effect? This is the action (verb).", explain: "Affect is usually the verb (to change). Effect is usually the noun (the result)." },
      { type: "spell", hint: "Con-CEN-trate uses a c.", explain: "Concentrate is spelled c-o-n-c-e-n-t-r-a-t-e." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g6-04", grade: 6,
    text: "my cuzin is taller then me",
    answer: ["My cousin is taller than me.", "My cousin is taller than I.", "My cousin is taller than I am."],
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: My." },
      { type: "spell", hint: "A relative. It starts like 'cou'.", explain: "Cousin is spelled c-o-u-s-i-n." },
      { type: "spell", hint: "Than or then? This one compares.", explain: "Than compares things. Then is about time (first this, then that)." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g6-05", grade: 6,
    text: "i have three favrite foods tacos, sushi, and pancakes.",
    answer: ["I have three favorite foods: tacos, sushi, and pancakes.", "I have three favourite foods: tacos, sushi, and pancakes."],
    fixes: [
      { type: "cap", hint: "The word that means you.", explain: "I is always capitalized." },
      { type: "spell", hint: "Fav-OR-ite.", explain: "Favorite is spelled f-a-v-o-r-i-t-e." },
      { type: "punct", hint: "Something should introduce the list.", explain: "Use a colon after a complete sentence to introduce a list: foods: tacos..." }
    ] },
  { id: "g6-06", grade: 6,
    text: "The sientist made a discuvery, it changed everything.",
    answer: ["The scientist made a discovery; it changed everything.", "The scientist made a discovery. It changed everything.", "The scientist made a discovery, and it changed everything.", "The scientist made a discovery that changed everything."],
    fixes: [
      { type: "spell", hint: "Sci-en-tist has a silent c.", explain: "Scientist starts with s-c-i." },
      { type: "spell", hint: "Dis-COV-er-y.", explain: "Discovery comes from discover: d-i-s-c-o-v-e-r-y." },
      { type: "grammar", hint: "Two sentences are joined with only a comma.", explain: "Fix a comma splice with a semicolon, a period, or a comma + and." }
    ] },
  { id: "g6-07", grade: 6,
    text: "neither the teacher nor the students was ready for the fire drill",
    answer: "Neither the teacher nor the students were ready for the fire drill.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: Neither." },
      { type: "grammar", hint: "With neither/nor, the verb matches the closer subject.", explain: "The verb agrees with the nearer subject, students, so use were." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g6-08", grade: 6,
    text: "The Johnsons dog barks at everybody who walk by",
    answer: "The Johnsons' dog barks at everybody who walks by.",
    fixes: [
      { type: "punct", hint: "The dog belongs to the whole Johnson family.", explain: "Plural owners ending in s get the apostrophe after the s: Johnsons'." },
      { type: "grammar", hint: "Who walk or who walks? 'Everybody' is singular.", explain: "Everybody is singular, so it's everybody who walks." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g6-09", grade: 6,
    text: "We visited the grand canyon, it was more beautiful than we imagined.",
    answer: ["We visited the Grand Canyon; it was more beautiful than we imagined.", "We visited the Grand Canyon. It was more beautiful than we imagined.", "We visited the Grand Canyon, and it was more beautiful than we imagined."],
    fixes: [
      { type: "cap", hint: "This is the name of a famous place.", explain: "Named places are capitalized: Grand Canyon." },
      { type: "cap", hint: "Both words of the name.", explain: "Canyon is part of the name, so it's capitalized too." },
      { type: "grammar", hint: "Two sentences joined with only a comma.", explain: "Fix a comma splice with a semicolon, a period, or a comma + and." }
    ] },
  { id: "g6-10", grade: 6,
    text: "Who's backpack is laying on the flor?",
    answer: "Whose backpack is lying on the floor?",
    fixes: [
      { type: "spell", hint: "Who's means 'who is'. This asks who owns it.", explain: "Whose asks who owns something. Who's = who is." },
      { type: "grammar", hint: "Lay needs an object. A thing resting just ___.", explain: "Something resting is lying. You lay something down." },
      { type: "spell", hint: "The ground in a room. Double o.", explain: "Floor is spelled f-l-o-o-r." }
    ] },
  { id: "g6-11", grade: 6,
    text: "Me and Jordan is going to the libary after lunch.",
    answer: "Jordan and I are going to the library after lunch.",
    fixes: [
      { type: "grammar", hint: "Would you say 'me is going'? Also, put the other person first.", explain: "Use I as a subject, and name the other person first: Jordan and I." },
      { type: "grammar", hint: "Two people are going.", explain: "Two people are going, not is going." },
      { type: "spell", hint: "Li-BRAR-y.", explain: "Library has two r's: l-i-b-r-a-r-y." }
    ] },
  { id: "g6-12", grade: 6,
    text: "the dog wagged it's tail when it seen us coming.",
    answer: "The dog wagged its tail when it saw us coming.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: The." },
      { type: "punct", hint: "The tail belongs to the dog.", explain: "Its (no apostrophe) shows ownership. It's means it is." },
      { type: "grammar", hint: "It seen or it saw?", explain: "Use saw by itself. Seen needs a helper: has seen." }
    ] },

  /* ---------------- GRADE 7 ---------------- */
  { id: "g7-01", grade: 7,
    text: "there was less people at the concert then we expected",
    answer: "There were fewer people at the concert than we expected.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: There." },
      { type: "grammar", hint: "People is plural. There was or there were?", explain: "Plural subject (people), so use were." },
      { type: "grammar", hint: "Can you count people? Less or fewer?", explain: "Use fewer for things you can count, less for amounts (less water)." },
      { type: "spell", hint: "Then or than? This compares.", explain: "Than compares. Then is about time." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g7-02", grade: 7,
    text: "my grandmother who lives in ohio sends us leters every month.",
    answer: "My grandmother, who lives in Ohio, sends us letters every month.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: My." },
      { type: "punct", hint: "'who lives in ohio' is extra info. What goes around extra info?", explain: "Put commas around a nonessential clause: grandmother, who lives in Ohio, sends..." },
      { type: "cap", hint: "States are names.", explain: "State names are capitalized: Ohio." },
      { type: "spell", hint: "Double letter in the middle.", explain: "Letters has two t's." }
    ] },
  { id: "g7-03", grade: 7,
    text: "I wanted to go to the movies however I had to much homework.",
    answer: ["I wanted to go to the movies; however, I had too much homework.", "I wanted to go to the movies. However, I had too much homework."],
    fixes: [
      { type: "punct", hint: "'However' joins two full sentences. What goes before it?", explain: "Use a semicolon (or period) before however when it joins two sentences." },
      { type: "punct", hint: "What goes right after 'however'?", explain: "Put a comma after however: ; however, I had..." },
      { type: "spell", hint: "To, too or two? This means 'more than enough'.", explain: "Too means more than enough or also." }
    ] },
  { id: "g7-04", grade: 7,
    text: "she likes hiking, to swim, and riding her bike",
    answer: ["She likes hiking, swimming, and riding her bike.", "She likes hiking, swimming and riding her bike."],
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: She." },
      { type: "grammar", hint: "Two items end in -ing. Does the middle one match?", explain: "Items in a list should match (parallel structure): hiking, swimming, riding." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g7-05", grade: 7,
    text: "\"i cant believe we won\", shouted alex.",
    answer: ["\"I can't believe we won!\" shouted Alex.", "\"I can't believe we won,\" shouted Alex."],
    fixes: [
      { type: "cap", hint: "The word that means you.", explain: "I is always capitalized." },
      { type: "punct", hint: "Cant is short for can not.", explain: "Contractions need an apostrophe: can't." },
      { type: "punct", hint: "Look at where the comma is. Should it be inside or outside the quote?", explain: "The punctuation goes inside the quotation marks. Since Alex shouted, ! fits best." },
      { type: "cap", hint: "Alex is a name.", explain: "Names are capitalized: Alex." }
    ] },
  { id: "g7-06", grade: 7,
    text: "Whom is going to bring the snaks to practice.",
    answer: "Who is going to bring the snacks to practice?",
    fixes: [
      { type: "grammar", hint: "Who does the action. Whom receives it.", explain: "Use who for the subject (who is going). Use whom for objects (to whom)." },
      { type: "spell", hint: "There's a c before the k.", explain: "Snacks is spelled s-n-a-c-k-s." },
      { type: "punct", hint: "Is this sentence asking something?", explain: "A question ends with a question mark." }
    ] },
  { id: "g7-07", grade: 7,
    text: "The principle gave awards to Maya and I at the asembly.",
    answer: "The principal gave awards to Maya and me at the assembly.",
    fixes: [
      { type: "spell", hint: "The school leader is your 'pal'.", explain: "Principal = school leader. Principle = a rule or belief." },
      { type: "grammar", hint: "Take out 'Maya and'. Gave awards to I?", explain: "After to, use me: gave awards to Maya and me." },
      { type: "spell", hint: "Double s.", explain: "Assembly is spelled a-s-s-e-m-b-l-y." }
    ] },
  { id: "g7-08", grade: 7,
    text: "if I would have studyed, I would have passed the test",
    answer: "If I had studied, I would have passed the test.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: If." },
      { type: "grammar", hint: "In the 'if' part, don't use 'would have'.", explain: "In an if-clause about the past, use had: If I had studied..." },
      { type: "spell", hint: "Study ends in y. What happens before -ed?", explain: "Change y to i and add -ed: studied." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g7-09", grade: 7,
    text: "The team lost it's final game but the players was proud of their effort",
    answer: "The team lost its final game, but the players were proud of their effort.",
    fixes: [
      { type: "punct", hint: "The game belongs to the team.", explain: "Its (no apostrophe) shows ownership." },
      { type: "punct", hint: "Two complete sentences are joined by 'but'.", explain: "Put a comma before but when it joins two complete sentences." },
      { type: "grammar", hint: "Players is plural.", explain: "Plural subject, so use were." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g7-10", grade: 7,
    text: "its important to acept the affects of your choices",
    answer: "It's important to accept the effects of your choices.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter." },
      { type: "punct", hint: "The first word means 'it is'.", explain: "It's = it is." },
      { type: "spell", hint: "Ac-CEPT has two c's.", explain: "Accept is spelled a-c-c-e-p-t. (Except means 'leaving out'.)" },
      { type: "spell", hint: "Affect or effect? This one is a noun (the results).", explain: "Effects are results (noun). Affect is usually the verb." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g7-11", grade: 7,
    text: "Me and her have been best friends since we was in kindergarden",
    answer: "She and I have been best friends since we were in kindergarten.",
    fixes: [
      { type: "grammar", hint: "These are subjects. Would you say 'me have been' or 'her has been'?", explain: "Use subject pronouns: She and I have been..." },
      { type: "grammar", hint: "We was or we were?", explain: "With we, use were." },
      { type: "spell", hint: "It's a German word that ends in -garten.", explain: "Kindergarten ends in -garten, not -garden." },
      { type: "punct", hint: "How does a telling sentence end?", explain: "A telling sentence ends with a period." }
    ] },
  { id: "g7-12", grade: 7,
    text: "the musuem which opened in 1925 is the oldest in the state.",
    answer: "The museum, which opened in 1925, is the oldest in the state.",
    fixes: [
      { type: "cap", hint: "Look at the very first word.", explain: "A sentence starts with a capital letter: The." },
      { type: "spell", hint: "Mu-SE-um.", explain: "Museum is spelled m-u-s-e-u-m." },
      { type: "punct", hint: "'which opened in 1925' is extra info.", explain: "Put commas around a nonessential 'which' clause." }
    ] }
];

BD.FIX_TYPES = {
  cap: { label: "Capital letters", short: "Caps" },
  punct: { label: "Punctuation", short: "Punctuation" },
  spell: { label: "Spelling / word choice", short: "Spelling" },
  grammar: { label: "Grammar", short: "Grammar" }
};
