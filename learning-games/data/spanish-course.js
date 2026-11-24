/*
  SPANISH COURSE: Spanish Dojo, learn first, then practice (like Duolingo).
  ======================================================================
  Three bands by Spanish grade level: young (Pre-K to 2nd), mid (3rd to 5th),
  teen (6th to 8th). Each unit: about 8 words or phrases, taught 4 at a time.
  Word: [Spanish, English, picture]. Picture is an emoji, or "#hex" for a
  color swatch, or "" when a picture would not help (days, months, verbs).
  Phrases: [Spanish, English], built only from simple words, used for
  "fill the blank" and "build the phrase". Neutral Latin American Spanish.
  Word ids are "unit:spanish", so add new words at the end of a unit.
*/
window.BD = window.BD || {};

BD.SPANISH_COURSE = [
  /* ---------- Pre-K to 2nd grade ---------- */
  { id: "hola", band: "young", title: "Hello!", icon: "👋", words: [
    ["hola", "hello", "👋"], ["adiós", "goodbye", "🚪"], ["gracias", "thank you", "🙏"], ["por favor", "please", "🙂"],
    ["sí", "yes", "✅"], ["no", "no", "❌"], ["buenos días", "good morning", "🌅"], ["buenas noches", "good night", "🌙"]],
    phrases: [["sí, por favor", "yes, please"], ["no, gracias", "no, thank you"], ["hola y adiós", "hello and goodbye"]] },
  { id: "colores", band: "young", title: "Colors", icon: "🎨", words: [
    ["rojo", "red", "#E53935"], ["azul", "blue", "#1E63D6"], ["amarillo", "yellow", "#F5C518"], ["verde", "green", "#2FA866"],
    ["anaranjado", "orange", "#F08A24"], ["morado", "purple", "#7B4BC4"], ["negro", "black", "#17171C"], ["blanco", "white", "#FFFFFF"]],
    phrases: [["el sol es amarillo", "the sun is yellow"], ["el cielo es azul", "the sky is blue"], ["la rana es verde", "the frog is green"]] },
  { id: "numeros", band: "young", title: "Numbers 1 to 10", icon: "🔢", words: [
    ["uno", "one", "1️⃣"], ["dos", "two", "2️⃣"], ["tres", "three", "3️⃣"], ["cuatro", "four", "4️⃣"], ["cinco", "five", "5️⃣"],
    ["seis", "six", "6️⃣"], ["siete", "seven", "7️⃣"], ["ocho", "eight", "8️⃣"], ["nueve", "nine", "9️⃣"], ["diez", "ten", "🔟"]],
    phrases: [["uno, dos, tres", "one, two, three"], ["cuatro y cinco", "four and five"], ["tengo diez años", "I am ten years old"]] },
  { id: "familia", band: "young", title: "Family", icon: "👪", words: [
    ["mamá", "mom", "👩"], ["papá", "dad", "👨"], ["hermano", "brother", "👦"], ["hermana", "sister", "👧"],
    ["abuela", "grandma", "👵"], ["abuelo", "grandpa", "👴"], ["bebé", "baby", "👶"], ["familia", "family", "👪"]],
    phrases: [["mi mamá", "my mom"], ["mi familia", "my family"], ["hola, abuela", "hello, grandma"]] },
  { id: "animales", band: "young", title: "Animals", icon: "🐾", words: [
    ["perro", "dog", "🐶"], ["gato", "cat", "🐱"], ["pájaro", "bird", "🐦"], ["pez", "fish", "🐟"],
    ["caballo", "horse", "🐴"], ["vaca", "cow", "🐮"], ["conejo", "rabbit", "🐰"], ["oso", "bear", "🐻"]],
    phrases: [["el perro", "the dog"], ["el gato negro", "the black cat"], ["un pez rojo", "a red fish"]] },
  { id: "comida", band: "young", title: "Food", icon: "🍎", words: [
    ["manzana", "apple", "🍎"], ["plátano", "banana", "🍌"], ["uvas", "grapes", "🍇"], ["fresa", "strawberry", "🍓"],
    ["leche", "milk", "🥛"], ["agua", "water", "💧"], ["pan", "bread", "🍞"], ["queso", "cheese", "🧀"]],
    phrases: [["la manzana roja", "the red apple"], ["agua, por favor", "water, please"], ["me gusta el queso", "I like cheese"]] },
  { id: "cuerpo", band: "young", title: "My Body", icon: "🧍", words: [
    ["cabeza", "head", "👤"], ["ojos", "eyes", "👀"], ["nariz", "nose", "👃"], ["boca", "mouth", "👄"],
    ["orejas", "ears", "👂"], ["manos", "hands", "🙌"], ["pies", "feet", "🦶"], ["pelo", "hair", "💇"]],
    phrases: [["mis manos", "my hands"], ["mis ojos", "my eyes"], ["toca la nariz", "touch your nose"]] },
  { id: "clase", band: "young", title: "In Class", icon: "🎒", words: [
    ["libro", "book", "📖"], ["lápiz", "pencil", "✏️"], ["papel", "paper", "📄"], ["silla", "chair", "🪑"],
    ["mochila", "backpack", "🎒"], ["tijeras", "scissors", "✂️"], ["maestra", "teacher", "👩‍🏫"], ["escuela", "school", "🏫"]],
    phrases: [["mi libro", "my book"], ["la mochila azul", "the blue backpack"], ["hola, maestra", "hello, teacher"]] },

  /* ---------- 3rd to 5th grade ---------- */
  { id: "dias", band: "mid", title: "Days of the Week", icon: "📅", words: [
    ["lunes", "Monday", ""], ["martes", "Tuesday", ""], ["miércoles", "Wednesday", ""], ["jueves", "Thursday", ""],
    ["viernes", "Friday", ""], ["sábado", "Saturday", ""], ["domingo", "Sunday", ""], ["hoy", "today", ""], ["mañana", "tomorrow", ""]],
    phrases: [["hoy es lunes", "today is Monday"], ["mañana es martes", "tomorrow is Tuesday"], ["el sábado juego", "on Saturday I play"]] },
  { id: "meses", band: "mid", title: "Months", icon: "🗓️", words: [
    ["enero", "January", ""], ["febrero", "February", ""], ["marzo", "March", ""], ["abril", "April", ""],
    ["mayo", "May", ""], ["junio", "June", ""], ["julio", "July", ""], ["agosto", "August", ""],
    ["septiembre", "September", ""], ["octubre", "October", ""], ["noviembre", "November", ""], ["diciembre", "December", ""]],
    phrases: [["mi cumpleaños es en mayo", "my birthday is in May"], ["en julio hace calor", "in July it is hot"]] },
  { id: "tiempo", band: "mid", title: "Weather", icon: "⛅", words: [
    ["hace sol", "it's sunny", "☀️"], ["hace calor", "it's hot", "🥵"], ["hace frío", "it's cold", "🥶"], ["hace viento", "it's windy", "💨"],
    ["llueve", "it's raining", "🌧️"], ["nieva", "it's snowing", "❄️"], ["está nublado", "it's cloudy", "☁️"], ["el tiempo", "the weather", "⛅"]],
    phrases: [["hoy hace frío", "today it is cold"], ["¿qué tiempo hace?", "what is the weather like?"], ["mañana llueve", "tomorrow it rains"]] },
  { id: "escuela", band: "mid", title: "At School", icon: "🏫", words: [
    ["la clase", "the class", "👩‍🏫"], ["el estudiante", "the student", "🧑‍🎓"], ["la tarea", "homework", "📝"], ["el examen", "the test", "📋"],
    ["el pizarrón", "the board", "🟩"], ["leer", "to read", "📖"], ["escribir", "to write", "✍️"], ["aprender", "to learn", "🧠"]],
    phrases: [["me gusta leer", "I like to read"], ["tengo tarea", "I have homework"], ["vamos a aprender", "let's learn"]] },
  { id: "deportes", band: "mid", title: "Sports", icon: "⚽", words: [
    ["el fútbol", "soccer", "⚽"], ["el básquetbol", "basketball", "🏀"], ["el béisbol", "baseball", "⚾"], ["el karate", "karate", "🥋"],
    ["nadar", "to swim", "🏊"], ["correr", "to run", "🏃"], ["la pelota", "the ball", "🏐"], ["el equipo", "the team", "👥"]],
    phrases: [["me gusta el karate", "I like karate"], ["vamos a correr", "let's run"], ["mi equipo gana", "my team wins"]] },
  { id: "sentimientos", band: "mid", title: "Feelings", icon: "😊", words: [
    ["feliz", "happy", "😊"], ["triste", "sad", "😢"], ["cansado", "tired", "😴"], ["enojado", "angry", "😠"],
    ["nervioso", "nervous", "😬"], ["emocionado", "excited", "🤩"], ["tranquilo", "calm", "😌"], ["orgulloso", "proud", "🏅"]],
    phrases: [["estoy feliz", "I am happy"], ["estoy cansado", "I am tired"], ["estoy orgulloso de ti", "I am proud of you"]] },
  { id: "lugares", band: "mid", title: "Places", icon: "🗺️", words: [
    ["la casa", "the house", "🏠"], ["el parque", "the park", "🌳"], ["la tienda", "the store", "🏪"], ["la playa", "the beach", "🏖️"],
    ["el gimnasio", "the gym", "🏋️"], ["la biblioteca", "the library", "📚"], ["el restaurante", "the restaurant", "🍽️"], ["la ciudad", "the city", "🏙️"]],
    phrases: [["voy al parque", "I go to the park"], ["estoy en casa", "I am at home"], ["vamos a la playa", "let's go to the beach"]] },
  { id: "verbos", band: "mid", title: "I Like, I Want, I Have", icon: "💬", words: [
    ["yo", "I", "🙋"], ["tú", "you", "👉"], ["me gusta", "I like", "👍"], ["no me gusta", "I don't like", "👎"],
    ["quiero", "I want", "🤲"], ["tengo", "I have", "🎁"], ["necesito", "I need", "❗"], ["puedo", "I can", "💪"]],
    phrases: [["yo tengo un perro", "I have a dog"], ["me gusta la pizza", "I like pizza"], ["quiero agua", "I want water"], ["tú puedes", "you can"]] },

  /* ---------- 6th to 8th grade ---------- */
  { id: "rutina", band: "teen", title: "Daily Routine", icon: "⏰", words: [
    ["me despierto", "I wake up", "⏰"], ["me levanto", "I get up", "🛏️"], ["me ducho", "I shower", "🚿"], ["desayuno", "I eat breakfast", "🥣"],
    ["voy a la escuela", "I go to school", "🎒"], ["almuerzo", "I eat lunch", "🥪"], ["hago la tarea", "I do homework", "📝"], ["me acuesto", "I go to bed", "😴"]],
    phrases: [["me despierto a las siete", "I wake up at seven"], ["después, desayuno", "then, I eat breakfast"], ["me acuesto a las nueve", "I go to bed at nine"]] },
  { id: "viajes", band: "teen", title: "Travel", icon: "✈️", words: [
    ["el aeropuerto", "the airport", "✈️"], ["el boleto", "the ticket", "🎫"], ["la maleta", "the suitcase", "🧳"], ["el hotel", "the hotel", "🏨"],
    ["el tren", "the train", "🚆"], ["el autobús", "the bus", "🚌"], ["el mapa", "the map", "🗺️"], ["¿dónde está?", "where is it?", "📍"]],
    phrases: [["¿dónde está el hotel?", "where is the hotel?"], ["tengo mi boleto", "I have my ticket"], ["vamos en tren", "we go by train"]] },
  { id: "restaurante", band: "teen", title: "Ordering Food", icon: "🍽️", words: [
    ["el menú", "the menu", "📋"], ["la cuenta", "the check", "🧾"], ["quisiera", "I would like", "🙋"], ["para mí", "for me", "👈"],
    ["la bebida", "the drink", "🥤"], ["el plato principal", "the main dish", "🍛"], ["el postre", "the dessert", "🍮"], ["la ensalada", "the salad", "🥗"]],
    phrases: [["quisiera una ensalada", "I would like a salad"], ["la cuenta, por favor", "the check, please"], ["para mí, agua", "for me, water"]] },
  { id: "serestar", band: "teen", title: "Ser and Estar", icon: "🔁", words: [
    ["soy", "I am (who I am)", ""], ["estoy", "I am (how or where I am)", ""], ["es", "he or she is (what they are like)", ""], ["está", "he or she is (how or where they are)", ""],
    ["alto", "tall", "📏"], ["simpático", "friendly", "😄"], ["aburrido", "bored", "🥱"], ["listo", "ready", "✅"]],
    phrases: [["soy alto", "I am tall"], ["estoy aburrido", "I am bored"], ["ella es simpática", "she is friendly"], ["el libro está en la mesa", "the book is on the table"]] },
  { id: "verbos_ar", band: "teen", title: "Verbs That End in -ar", icon: "🗣️", words: [
    ["hablar", "to speak", "🗣️"], ["estudiar", "to study", "📚"], ["caminar", "to walk", "🚶"], ["escuchar", "to listen", "🎧"],
    ["hablo", "I speak", ""], ["hablas", "you speak", ""], ["habla", "he or she speaks", ""], ["estudio", "I study", ""]],
    phrases: [["yo hablo español", "I speak Spanish"], ["ella estudia mucho", "she studies a lot"], ["tú escuchas música", "you listen to music"]] },
  { id: "verbos_er", band: "teen", title: "Verbs That End in -er and -ir", icon: "✍️", words: [
    ["comer", "to eat", "🍽️"], ["beber", "to drink", "🥤"], ["leer", "to read", "📖"], ["vivir", "to live", "🏠"],
    ["como", "I eat", ""], ["bebo", "I drink", ""], ["vivo", "I live", ""], ["escribe", "he or she writes", ""]],
    phrases: [["yo como pan", "I eat bread"], ["ella lee un libro", "she reads a book"], ["vivimos aquí", "we live here"]] },
  { id: "preguntas", band: "teen", title: "Questions", icon: "❓", words: [
    ["¿qué?", "what?", ""], ["¿quién?", "who?", ""], ["¿dónde?", "where?", ""], ["¿cuándo?", "when?", ""],
    ["¿por qué?", "why?", ""], ["¿cómo?", "how?", ""], ["¿cuánto cuesta?", "how much does it cost?", "💲"], ["¿cómo te llamas?", "what is your name?", "📛"]],
    phrases: [["¿cómo estás?", "how are you?"], ["¿dónde vives?", "where do you live?"], ["¿qué hora es?", "what time is it?"]] },
  { id: "articulos", band: "teen", title: "The, A, and Plurals", icon: "📚", words: [
    ["el", "the (one, masculine)", ""], ["la", "the (one, feminine)", ""], ["los", "the (many, masculine)", ""], ["las", "the (many, feminine)", ""],
    ["un", "a (masculine)", ""], ["una", "a (feminine)", ""], ["los libros", "the books", "📚"], ["las casas", "the houses", "🏘️"]],
    phrases: [["el gato y la casa", "the cat and the house"], ["los perros", "the dogs"], ["una mesa", "a table"]] }
];
