/*
  SPANISH BANK — Spanish Dojo
  ===========================
  Each topic opens at a grade (g: -1 = Pre-K, 0 = Kindergarten, 1–8 = grades).
  Each word: [Spanish, English, optional picture]
  Add your own topics or words by copying a line.
*/
window.BD = window.BD || {};

BD.SPANISH = [
  { topic: "Greetings", g: -1, words: [["hola", "hello"], ["adiós", "goodbye"], ["gracias", "thank you"], ["por favor", "please"], ["sí", "yes"], ["buenos días", "good morning"], ["buenas noches", "good night"], ["amigo", "friend"]] },
  { topic: "Colors", g: -1, color: true, words: [["rojo", "red", "#E53935"], ["azul", "blue", "#1E63D6"], ["amarillo", "yellow", "#F5C518"], ["verde", "green", "#2FA866"], ["negro", "black", "#17171C"], ["blanco", "white", "#FFFFFF"], ["anaranjado", "orange", "#F08A24"], ["morado", "purple", "#7B4BC4"], ["rosado", "pink", "#F38BB5"], ["café", "brown", "#8A5A3B"]] },
  { topic: "Numbers 1–10", g: -1, words: [["uno", "one", "1"], ["dos", "two", "2"], ["tres", "three", "3"], ["cuatro", "four", "4"], ["cinco", "five", "5"], ["seis", "six", "6"], ["siete", "seven", "7"], ["ocho", "eight", "8"], ["nueve", "nine", "9"], ["diez", "ten", "10"]] },
  { topic: "Animals", g: 0, words: [["perro", "dog", "🐶"], ["gato", "cat", "🐱"], ["pájaro", "bird", "🐦"], ["pez", "fish", "🐟"], ["caballo", "horse", "🐴"], ["vaca", "cow", "🐮"], ["cerdo", "pig", "🐷"], ["oso", "bear", "🐻"], ["conejo", "rabbit", "🐰"], ["mono", "monkey", "🐵"]] },
  { topic: "Family", g: 1, words: [["mamá", "mom"], ["papá", "dad"], ["hermano", "brother"], ["hermana", "sister"], ["abuelo", "grandpa"], ["abuela", "grandma"], ["bebé", "baby"], ["familia", "family"]] },
  { topic: "Body", g: 1, words: [["cabeza", "head"], ["mano", "hand"], ["pie", "foot"], ["ojo", "eye"], ["boca", "mouth"], ["nariz", "nose"], ["oreja", "ear"], ["brazo", "arm"]] },
  { topic: "Food", g: 2, words: [["manzana", "apple", "🍎"], ["leche", "milk", "🥛"], ["pan", "bread", "🍞"], ["agua", "water", "💧"], ["queso", "cheese", "🧀"], ["huevo", "egg", "🥚"], ["pollo", "chicken", "🍗"], ["plátano", "banana", "🍌"]] },
  { topic: "School", g: 2, words: [["libro", "book"], ["lápiz", "pencil"], ["mesa", "table"], ["silla", "chair"], ["maestra", "teacher"], ["escuela", "school"], ["papel", "paper"], ["mochila", "backpack"]] },
  { topic: "Dojo words", g: 2, words: [["cinturón", "belt"], ["patada", "kick"], ["respeto", "respect"], ["fuerza", "strength"], ["equilibrio", "balance"], ["campeón", "champion"]] },
  { topic: "Days", g: 3, words: [["lunes", "Monday"], ["martes", "Tuesday"], ["miércoles", "Wednesday"], ["jueves", "Thursday"], ["viernes", "Friday"], ["sábado", "Saturday"], ["domingo", "Sunday"]] },
  { topic: "Weather", g: 3, words: [["hace sol", "it's sunny"], ["hace frío", "it's cold"], ["hace calor", "it's hot"], ["llueve", "it's raining"], ["nieva", "it's snowing"], ["hace viento", "it's windy"]] },
  { topic: "Numbers 11–20", g: 4, words: [["once", "eleven", "11"], ["doce", "twelve", "12"], ["trece", "thirteen", "13"], ["catorce", "fourteen", "14"], ["quince", "fifteen", "15"], ["dieciséis", "sixteen", "16"], ["diecisiete", "seventeen", "17"], ["dieciocho", "eighteen", "18"], ["diecinueve", "nineteen", "19"], ["veinte", "twenty", "20"]] },
  { topic: "Clothes", g: 4, words: [["camisa", "shirt"], ["pantalones", "pants"], ["zapatos", "shoes"], ["sombrero", "hat"], ["chaqueta", "jacket"], ["calcetines", "socks"], ["vestido", "dress"]] },
  { topic: "Months", g: 4, words: [["enero", "January"], ["febrero", "February"], ["marzo", "March"], ["abril", "April"], ["mayo", "May"], ["junio", "June"], ["julio", "July"], ["agosto", "August"], ["septiembre", "September"], ["octubre", "October"], ["noviembre", "November"], ["diciembre", "December"]] },
  { topic: "Places", g: 5, words: [["casa", "house"], ["parque", "park"], ["tienda", "store"], ["playa", "beach"], ["ciudad", "city"], ["biblioteca", "library"], ["hospital", "hospital"], ["restaurante", "restaurant"]] },
  { topic: "Action words", g: 5, words: [["correr", "to run"], ["comer", "to eat"], ["beber", "to drink"], ["leer", "to read"], ["escribir", "to write"], ["hablar", "to speak"], ["jugar", "to play"], ["dormir", "to sleep"], ["saltar", "to jump"], ["nadar", "to swim"]] },
  { topic: "Phrases", g: 6, phrase: true, words: [["¿Cómo estás?", "How are you?"], ["Estoy bien.", "I am fine."], ["¿Cómo te llamas?", "What is your name?"], ["Me llamo Zumi.", "My name is Zumi."], ["Mucho gusto.", "Nice to meet you."], ["¿Dónde está el baño?", "Where is the bathroom?"], ["No entiendo.", "I don't understand."], ["¿Cuántos años tienes?", "How old are you?"]] },
  { topic: "Question words", g: 7, words: [["qué", "what"], ["quién", "who"], ["dónde", "where"], ["cuándo", "when"], ["por qué", "why"], ["cómo", "how"], ["cuánto", "how much"]] },
  { topic: "I can say…", g: 7, phrase: true, words: [["yo hablo", "I speak"], ["yo como", "I eat"], ["yo vivo", "I live"], ["yo tengo", "I have"], ["yo quiero", "I want"], ["yo puedo", "I can"], ["yo voy", "I go"], ["yo juego", "I play"]] }
];
