const Observable =  require('../utils/Observable')
const Clock =  require('../utils/Clock')
const Person = require('./person/person')

let room_relation = require('./cfg_rooms.json');
const bedroom = require("./rooms/bedroom")
const room = require("./rooms/light")
const bathroom = require("./rooms/bathroom")
const kitchen = require("./rooms/kitchen")
const living_room = require("./rooms/living_room")

const tracker_electricity = require("./utility_trackers/electricity")
const tracker_comfort = require("./utility_trackers/comfort")

const keypress = require('../utils/keypress')
const { white } = require('chalk')
const { format } = require('../utils/Clock')

class House {
    constructor () {
        this.people = {
            dad: new Person(this, "dad", "bedroom"),
            mom: new Person(this, "mom", "bedroom"),
            child: new Person(this, "child", "bedroom")
        }

        this.room_relation = room_relation
        this.rooms = {
            livingroom: new living_room(this, "livingroom"),
            bathroom: new bathroom(this, "bathroom"),
            kitchen: new kitchen(this, "kitchen"),
            stair: new room(this, "stair"),
            bedroom: new bedroom(this, "bedroom"),
        }

        this.utilities = {
            electricity: new tracker_electricity(this),
            comfort: new tracker_comfort(this)
        }
        
        // Subcribe utility tracker
        for (let device of this.devices_list()) this.utilities.electricity.subcribe(device)
        for (let name in this.people) this.utilities.comfort.subcribe(this.people[name])


        this.timer = Clock
        this.timer.global.observe("mm", (value, key) => {
            this.utilities.electricity.update(value)
            this.utilities.comfort.update(value)
        })
    }

    devices_list(condition=""){
        var devices = []
        for (let room_name in this.rooms){
            for (let device_name in this.rooms[room_name].devices){
                    let tmp_device = this.rooms[room_name].devices[device_name]
                    if (tmp_device.name.includes(condition)) devices.push(tmp_device)
                }
            }
        return devices
    }
}

module.exports = House
