# Test de conexion por audio utilizando el protocolo WebRTC

## Pasos

- Crear un archivo .env en la raíz del proyecto para la variable del websocket (ver el archivo _.env.example_)
- Llenar la variable con tu IP local usando el protocolo ws:// en el puerto 8080

En la raíz del proyecto ejecutar:

    npm install && cd server && npm install && cd ..

Abrir dos terminales en la raiz del proyecto, para el servidor signal y para el servidor de desarrollo

En la primera ejecutar

    cd server && npm run dev

En la segunda

    npm run dev
