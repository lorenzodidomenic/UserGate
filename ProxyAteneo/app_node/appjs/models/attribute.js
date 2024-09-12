class Attribute{
    type;
    value;
    local;
    constructor(type,value){
        this.type = type;
        this.value = value;
        this.local = false;
    }
}

module.exports = Attribute;