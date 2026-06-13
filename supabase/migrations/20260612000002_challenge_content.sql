-- ADR-0006: contenido final de las 28 tareas del reto, reescrito para personas
-- con CERO conocimiento de IA (el día 1 es crear cuenta y saludar a una IA).
-- Reemplaza el borrador inicial de la migración 20260612000001 vía upsert
-- idempotente por day_number (no se edita la migración ya aplicada).

insert into public.challenge_tasks (day_number, title, prompt, tip) values
(1,  'Abre una IA por primera vez', 'Entra a chatgpt.com o claude.ai, crea una cuenta gratis y escribe tu primer mensaje: "Hola, cuéntame en qué me puedes ayudar". Lee lo que responde. Eso es todo por hoy.', 'Es gratis y no instalas nada: solo necesitas un navegador y un correo.'),
(2,  'Hazle una pregunta que tengas hoy', 'Piensa en una duda real (una receta, cómo se hace algo, qué significa una palabra) y escríbela como si le preguntaras a un amigo que sabe mucho.', 'No tienes que escribir bonito ni correcto. Escribe como hablas.'),
(3,  'Pídele que te lo explique como a un niño', 'Elige un tema que nunca entendiste (los impuestos, las criptomonedas, por qué el cielo es azul) y pídele: explícame esto como si tuviera 12 años.', 'Si aún no entiendes, dile "más fácil todavía". La IA no se cansa ni se molesta.'),
(4,  'Cuéntale para qué lo necesitas', 'Pídele ayuda con algo, pero ahora dándole contexto: quién eres y para qué lo quieres. Por ejemplo: soy maestro, ayúdame a explicar las fracciones a niños de primaria.', 'Mientras más le cuentes, mejor te ayuda. El contexto lo es casi todo.'),
(5,  'Pídele que te escriba algo', 'Un mensaje de felicitación, un texto para vender algo que ya no usas, o una nota difícil de mandar. Pídeselo y luego cámbiale lo que no suene a ti.', 'La IA hace el borrador, tú le pones tu voz. Nunca lo mandes sin leerlo.'),
(6,  'Pide tres opciones y elige', 'Para cualquier decisión chica (qué cocinar, cómo titular algo, qué regalar) pídele 3 opciones distintas y quédate con una.', 'Si ninguna te late, dile: dame 3 más, pero más simples (o más creativas, o más baratas).'),
(7,  'Tu primera semana con IA', 'Cuéntale para qué la usaste esta semana y pídele 3 ideas nuevas de cómo usarla en tu día a día.', 'Sé concreto sobre tu vida (trabajo, casa, estudios) para que las ideas te sirvan.'),
(8,  'Resume algo que no quieres leer', 'Toma un texto largo (un artículo, un mensaje, los términos de algo), pégalo en el chat y pídele: resume esto en 3 puntos y dime qué tengo que hacer.', 'Puedes pegar textos largos directo en el chat, no hay problema.'),
(9,  'Ordena tu desorden', 'Escríbele tus pendientes o ideas tal como salgan, en desorden, y pídele que los organice en una lista clara por prioridad.', 'Dile "hazme preguntas si te falta información" y deja que te entreviste.'),
(10, 'Aprende a hacer algo nuevo', 'Elige algo que quieras aprender (usar Excel, hacer un nudo, cocinar un platillo) y pídele un paso a paso para principiantes.', 'Pídele que no asuma que sabes nada y que vaya paso por paso.'),
(11, 'Ensaya una conversación difícil', 'Tienes que pedir algo, poner un límite o disculparte. Pídele que haga el papel de la otra persona y practica la conversación.', 'Dile "respóndeme como alguien molesto" para prepararte de verdad.'),
(12, 'Mejora algo que ya escribiste', 'Toma un mensaje o texto tuyo y pídele: mejóralo para que se entienda mejor, sin cambiar mi forma de ser.', 'Pídele que te diga qué cambió y por qué. Así tú también aprendes.'),
(13, 'Pregúntale antes de decidir', 'Antes de tu próxima compra o decisión, pídele pros y contras y qué preguntas deberías hacerte antes.', 'La IA no sabe todo ni tiene datos de hoy. Úsala para pensar mejor, no para creerle a ciegas.'),
(14, 'Guarda tus mejores trucos', 'Abre una nota en tu teléfono y escribe los 3 usos que más te sirvieron estas dos semanas. Esa nota es tu kit de IA.', 'Cada vez que descubras algo bueno, agrégalo. Es tu cuaderno personal.'),
(15, 'Aprende a pedir mejor', 'Repite una tarea de la semana pasada, pero ahora dile cuatro cosas: tu rol, qué quieres, para quién y en qué formato. Compara el resultado.', 'La fórmula: eres [rol], ayúdame a [tarea] para [quién], dámelo en [formato].'),
(16, 'Crea una imagen con palabras', 'Usa una IA que haga imágenes y descríbele una: por ejemplo, un gato astronauta pintado en acuarela. Mira qué sale y ajústala.', 'Mientras más describas (estilo, colores, ambiente), más se parece a lo que imaginas.'),
(17, 'Dale una foto o un documento', 'Súbele una foto (un recibo, una etiqueta, un apunte) o un archivo y pídele que te lo explique o saque lo importante.', 'En el chat hay un clip o un signo de más para subir fotos y archivos.'),
(18, 'Compara dos inteligencias artificiales', 'Hazle la misma pregunta a dos IA distintas (por ejemplo ChatGPT y Gemini) y fíjate cuál respuesta te gustó más y por qué.', 'Ninguna es la mejor en todo. Cada una sirve para cosas distintas; tú decides.'),
(19, 'Resuelve un problema real de hoy', 'Piensa en algo que te trae dando vueltas y trabájalo con la IA hasta tener un plan concreto de qué vas a hacer.', 'Termina pidiéndole: dame los primeros 3 pasos para empezar hoy mismo.'),
(20, 'Descubre qué se puede automatizar', 'Cuéntale 3 cosas repetitivas que haces cada semana y pregúntale cuáles se podrían hacer casi solas con tecnología.', 'Hoy no construyes nada. Solo abres los ojos a lo que se puede dejar de hacer a mano.'),
(21, 'Enséñale a alguien lo que sabes', 'Muéstrale a una persona (de tu familia, un amigo, un compañero) un truco de IA que aprendiste estas semanas.', 'Si lo puedes explicar simple, es que ya lo dominas.'),
(22, 'Resuélvele algo a alguien más', 'Pregúntale a alguien qué tarea lo trae batallando y ayúdale a resolverla con IA ahí mismo, enfrente de ti.', 'Aquí dejas de practicar y empiezas a ser útil de verdad. Se siente bien.'),
(23, 'Arma tu asistente para una tarea', 'Elige algo que hagas seguido y escribe un mensaje base que puedas copiar y pegar siempre que lo necesites. Guárdalo en tu nota.', 'Es como tener un ayudante ya entrenado: copias, pegas y listo.'),
(24, 'Cuenta cuánto tiempo ganaste', 'Calcula a ojo cuántas horas te ahorró la IA este mes. Ponle un número.', 'Ese tiempo es para lo que sí importa, o para hacer más. Ese número eres tú valiendo más.'),
(25, 'Pregúntale en qué puedes mejorar', 'Cuéntale cómo trabajas o estudias y pídele honestidad: dónde estoy perdiendo tiempo y cómo lo arreglo.', 'Pídele que sea franca, no que te eche porras. Estás aquí para crecer.'),
(26, 'Comparte lo que lograste', 'Cuéntale a tu gente, o publícalo, algo que ahora haces con IA y que antes no podías o te costaba.', 'No esperes a ser experto. Lo que aprendiste en estas semanas ya vale.'),
(27, 'Arma tu plan para no aflojar', 'Define 3 cosas de IA que vas a seguir haciendo después del reto y créalas como hábitos aquí en la app, en Mis hábitos.', 'El reto se acaba; la práctica no. Aquí enganchas con tus hábitos.'),
(28, 'Eres irreemplazable', 'Escribe en una hoja qué cambió este mes: qué sabes y haces ahora que no sabías hace 28 días. Guárdala.', 'Léela el día que dudes. Empezaste sin saber nada y lo lograste. Ya no eres el mismo.')
on conflict (day_number) do update
set title = excluded.title, prompt = excluded.prompt, tip = excluded.tip;
