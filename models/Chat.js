class Chat{
    constructor (id, origen, timestamp, pendingMessage, name){
        this.id = id;
        this.origin = origen;
        this.timestamp = timestamp;
        this.pendingMessage = pendingMessage;
        this.name = name;
    }
}

module.exports = Chat;