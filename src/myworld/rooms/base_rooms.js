const Observable = require('../../utils/Observable');
const assert = require("assert")
const green = '\x1b[32m%s\x1b[0m'
const dark = '\x1b[30m%s\x1b[0m'
const red = '\x1b[31m%s\x1b[0m'

class BaseRoom extends Observable {
    constructor (house, name) {
        super()
        this.house = house;
        this.name = name;
        assert(name in house.room_relation)
        this.doors_to = house.room_relation[name]["doors_to"];
        this.floor = house.room_relation[name]["floor"];
        this.devices = {}
    }

    update_effect(name, status){

    }

    update_device_name(){
        for (let name_device in this.devices) {
            this.devices[name_device].name = `${name_device}-${this.name}`
        }
    }
    
    change_device_stt(device, status_target){
        let tmp_device = this.devices[device]
        var status_current = tmp_device.get("status")
        let is_changed = false
        if (tmp_device.possible.includes(status_target)){
            if (status_current != status_target){
                tmp_device.set("status", status_target)
                // this.house.utilities.electricity.subcribe(tmp_device)
                console.log(green,`[device] ${tmp_device.name} (${status_target})`)
                // tmp_device.log(status_target, this.time())
            }
            else {
                // If device not change status
                console.log(dark,`[device] ${tmp_device.name} still (${status_target})`)
            }
        }
        else {
            // If device_status not in possible_status_list
            console.log(red,`[device] ${tmp_device.name} cant switch since no possible (${status_target}) in (${tmp_device.possible})`);
            console.log(dark,`[device] ${tmp_device.name} still (${status_current})`)
            
        }
        return is_changed
    }

    time(){
        return this.house.timer.current_minute()
    }

    device_action(name, status){
        if (name in this.devices){
            let result = this.change_device_stt(name, status)
            if (result) this.update_effect(name, status)
            return true
        }
        return false

    }

    light_on(){
        return this.device_action("light", "on")
    }

    light_off(){
        return this.device_action("light", "off")
    }

    heater_on(){
        return this.device_action("heater", "on")
    }

    heater_off(){
        return this.device_action("heater", "off")
    }

    windows_open(){
        return this.device_action("windows", "opened")
    }

    windows_close(){
        return this.device_action("windows", "closed")
    }
}

class BaseDevice extends Observable {
    constructor (cfg){
        super()
        this.set("status", cfg.status)
        this.possible = cfg.possible

        var eletric_consume = {}
        this.possible.forEach(function (status, index) {
            var value = 0
            if ("eletric_consume" in cfg) {
                value = cfg.eletric_consume[index]
                if (!value) value=0
            }
            eletric_consume[status] = value
        })
        this.eletric_consume = eletric_consume

        this._log_len = this.possible.length
        this._log = []
    }

    log(status, time){
        this._log.push({"status":status, "time":time})
        this._log = this._log.slice(-this._log_len)
    }

    read_log(){
        return this._log
    }

    get_consumption(){
        return this.eletric_consume[this.get('status')]
    }
}
module.exports = {BaseRoom, BaseDevice}