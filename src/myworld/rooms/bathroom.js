const {BaseRoom, BaseDevice} = require('./base_rooms');

class bathroom extends BaseRoom {
    constructor (house, name) {
        super(house, name)
        this.devices = {
            heater: new BaseDevice({status:"off", possible: ["on", "off"], eletric_consume: [20,0]}),
            light: new BaseDevice({status:"off", possible: ["on", "off"], eletric_consume: [5,0]}),
            windows: new BaseDevice({status:"closed", possible: ["opened", "closed"]}),
        }
        this.update_device_name()
    }
}

module.exports = bathroom