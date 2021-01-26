class Log{
    constructor(out=console){
        this.output = out;
        this.log = function(salida){
            if(this.output === console){
                console.log(salida);
            }else{
                output.log(salida);
            }
        };
    }
} 