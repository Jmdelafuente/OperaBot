class Menu {
    /**
     *Creates an instance of Menu.
     * @param {*} nombre nombre que indica en que menu se encuentra situado
     * @param {*} botones botones que aparecen en el menu, que indican submenus 
     * @param {*} informacion informacion que acompaña al menu en forma de mensaje
     * @param {*} link si el mensaje en informacion tiene un link, debe estar en esta lista
     * @memberof Menu
     */
    constructor(
        nombre,
        botones = [],
        informacion = "",
        link = []
    ) {
        this.nombre = nombre;
        this.botones = botones;
        this.informacion = informacion;
        this.link = link;
        this.remplazarLink();
    }

    getNombre() {
        return nombre;
    }

    getBotones() {
        return botones;
    }

    getInformacion() {
        return informacion;
    }

    getLink() {
        return link;
    }

    remplazarLink() {
        link.forEach(element => {
            if (informacion.includes(element)) {
                var inicio = informacion.indexOf(element);
                var fin = inicio + element.length;
                var nuevo = informacion.substring(inicio, fin);
                var link = nuevo.link(element);
                var nueva_info = string.replace(nuevo, link);
                this.informacion = nueva_info;
            }
        });
    }

     setNombre(nuevoNombre) {
         this.nombre = nuevoNombre;
     }

     setBotones(nuevosBotones) {
         this.botones = nuevosBotones;
     }

     setInformacion(nuevaInfo) {
         this.informacion = nuevaInfo;
     }

     setLink(nuevoLink) {
         this.link  = nuevoLink;
     }


}