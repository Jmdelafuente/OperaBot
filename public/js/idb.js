var db;
window.onload = function () {
    const db_debug = true;

    let request = window.indexedDB.open("operabot_db", 1);
    // un controlador de error significa que la base de datos no se abrió correctamente
    request.onerror = function () {
        console.log("No se pudo abrir la base de datos");
    };

    // controlador onsuccess significa que la base de datos se abrió correctamente
    request.onsuccess = function () {
        if (db_debug) console.log("Base de datos abierta con éxito");

        // Almacena el objeto de base de datos abierto en la variable db. Esto se usa mucho a continuación
        db = request.result;

        // Ejecute la función displayData() para mostrar los mensajes que ya están en la IDB
        // displayData();
    };

    // Configura las tablas de la base de datos si esto aún no se ha hecho
    request.onupgradeneeded = function(e) {
        // Toma una referencia a la base de datos abierta
        let db = e.target.result;

        // Crea un objectStore para almacenar nuestras notas (básicamente como una sola tabla)
        // incluyendo una clave de incremento automático
        let objectStore = db.createObjectStore('messages_os', {keyPath: 'id', autoIncrement: true});

        // Define qué elementos de datos contendrá el objectStore
        objectStore.createIndex('from', 'from', { unique: false });
        objectStore.createIndex('body', 'body', { unique: false });
        objectStore.createIndex("timestamp", "timestamp", { unique: false });

        if (db_debug) console.log('Configuración de la base de datos completa');
    };


    // Define la función addData()
    function addData(e) {
        // evitar el predeterminado: no queremos que el formulario se envíe de la forma convencional
        e.preventDefault();

        // toma los valores ingresados en los campos del formulario y los almacenar en un objeto listo para ser insertado en la base de datos
        let newItem = { from: titleInput.value, body: bodyInput.value, timestamp: bodyInput.timestamp };

        // abre una transacción de base de datos de lectura/escritura, lista para agregar los datos
        let transaction = db.transaction(["messages_os"], "readwrite");

        // llama a un almacén de objetos que ya se ha agregado a la base de datos
        let objectStore = transaction.objectStore("messages_os");

        // Hacer una solicitud para agregar nuestro objeto newItem al almacén de objetos
        let request = objectStore.add(newItem);
        request.onsuccess = function() {
            // Limpiar el formulario, listo para agregar la siguiente entrada
            
        };

        // Informa sobre el éxito de la transacción completada, cuando todo esté hecho
        transaction.oncomplete = function() {
            if (db_debug) console.log('Transacción completada: modificación de la base de datos finalizada.');

            // actualiza la visualización de datos para mostrar el elemento recién agregado, ejecutando displayData() nuevamente.
            // displayData();
        };

        transaction.onerror = function() {
            if (db_debug) console.log('Transacción no abierta debido a error');
        };
    }

};
