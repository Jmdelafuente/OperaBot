class Menu {
    /**
     *Creates an instance of Menu.
     * @param {*} nombre nombre que indica en que menu se encuentra situado
     * @param {*} botones botones que aparecen en el menu, que indican submenus 
     * @param {*} informacion informacion que acompaña al menu en forma de mensaje
     * @memberof Chat
     */
    constructor(
        nombre,
        botones = [],
        informacion
    ) {
        this.nombre = nombre;
        this.botones = botones;
        this.informacion = informacion;
    }


}