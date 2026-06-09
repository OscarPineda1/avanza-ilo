Avanza Ilo: Sistema de Predicción ETA (Software-Centric)
📌 Introducción
Este proyecto nace como una solución de ingeniería de computación para la asimetría de información en el transporte público de Ilo. A diferencia de las soluciones tradicionales que requieren sensores GPS (IoT) en cada vehículo, Avanza Ilo utiliza un modelo de inferencia basado en Teoría de Grafos y el algoritmo de Dijkstra, permitiendo calcular tiempos de arribo (ETA) predictivos mediante datos maestros de frecuencia y topología vial. Es una propuesta Software-Centric que garantiza escalabilidad, bajo costo de implementación y alta disponibilidad.

🚀 Guía de Ejecución y Despliegue
1. Requisitos Previos
Para evitar errores de compatibilidad, asegúrate de tener instalado:

Node.js: Versión LTS (se recomienda v18+).

Expo CLI: npm install -g expo-cli

Entorno: Se ha configurado específicamente para Expo SDK 54.

2. Pasos para Inicializar
Clonar el repositorio:

Intento
git clone [URL_DE_TU_REPO]
cd avanza-ilo
Instalación de Dependencias:
Ejecuta el siguiente comando para limpiar y asegurar que las librerías (React Navigation, Maps, etc.) se instalen correctamente:

Intento
npm install
Ejecutar el Proyecto:
Para evitar errores de caché en el bundler, inicia siempre con el limpiador de caché:

Intento
npx expo start -c
⚠️ Consideraciones Críticas (Lo que debes cuidar)
Como estamos trabajando con un proyecto modular y dependencias de navegación, ten cuidado con lo siguiente:

Rutas de Archivos (Windows): Si al intentar compilar recibes el error Unable to resolve module, es probable que se deba a la profundidad de carpetas en Windows.

Solución: Si persiste, instala react-is manualmente (npm install react-is) para forzar la resolución del paquete en node_modules.

Gestión de Caché: Si haces cambios en la estructura de navegación o instalas una nueva librería y la app no responde o se cierra, no reinstales todo. Primero haz:

Intento
watchman watch-del-all # (Si usas Mac/Linux)
npx expo start -c
Firebase / Cloud Functions: La lógica de Dijkstra reside en el backend. Asegúrate de que las credenciales de Firebase en tu archivo .env tengan los permisos correctos de lectura en la colección rutas_grafo. Si la app no muestra el ETA, verifica que el objeto JSON devuelto por la función cloud coincida con el formato de lista de adyacencia esperado por tu MapScreen.

🏗 Arquitectura del Proyecto (Estructura de Carpetas)
Para mantener el código limpio y escalable, sigue esta jerarquía:

Texto plano
src/
├── navigation/      # Configuración de AppNavigator (Stack/Tabs)
├── screens/         # Componentes de vista (HomeScreen, MapScreen, etc.)
├── services/        # Conexiones a Firebase y lógica de Dijkstra
├── styles/          # Estilos globales y constantes de diseño
└── utils/           # Funciones auxiliares y formateadores de datos
💡 Notas para el Evaluador
Enfoque Académico: Este código es la implementación práctica del Capítulo 4 de la investigación.

Validación: El algoritmo de Dijkstra se ha diseñado para correr en el servidor (Cloud Functions) para que el dispositivo móvil del usuario (pasajero) no agote su batería realizando cálculos matemáticos intensivos.