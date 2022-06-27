const {BaseRoom, BaseDevice} = require('./base_rooms');

class living_room extends BaseRoom{
    constructor (house, name) {
        super(house, name)
        this.devices = {
            light: new BaseDevice({status: "off", possible: ["off", "on"], eletric_consume: [0,5]}),
            heater: new BaseDevice({status:"off", possible: ["on", "off"], eletric_consume: [20,0]}),
            windows: new BaseDevice({status:"closed", possible: ["opened", "closed"]}),
        }
        this.update_device_name()
    }
}

module.exports = living_room