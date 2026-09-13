import { registerRootComponent } from 'expo';

import App from './App';
import { initializeAppCheckProtection } from './src/services/app-check';

// App Check se inicia al arrancar el binario nativo. Si el proveedor aún no
// está disponible, el cliente ETA falla de forma cerrada y la cartografía sigue operativa.
void initializeAppCheckProtection()
  .then((status) => console.log(`[AVANZA_APP_CHECK] ${status}`))
  .catch(() => console.warn('[AVANZA_APP_CHECK] initialization_failed'));

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
