const Observable = require('../../utils/Observable');
const blue = '\x1b[34m%s\x1b[0m'
const dark = '\x1b[30m%s\x1b[0m'
const yellow = '\x1b[33m%s\x1b[0m'

const assert = require("assert");

class Person extends Observable {
    constructor (house, name, current_room="outside") {
        super()
        this.house = house;
        this.name = name;
        this.possible_status = ["cold", "hot", "need_air", "hungry" , "comfort"]

        this.shows('comfort')
        this.observe('status', (status) => console.log(yellow,"[status] " + this.name +" is "+status))
        
        this.set('in_room', current_room)
        this.observe('in_room', (room_name) => console.log(yellow,"[move] " + this.name +" -> "+ room_name))
    }
    
    shows(target){
        if (!this.possible_status.includes(target)) target = "comfort" 
        this.set('status', target)
    }

    eat(){
        if (this.status == "hungry") this.shows("comfort")
    }

    less_cold(){
        if (this.status == "cold") this.shows("comfort")
    }

    less_hot(){
        if (this.status == "hot") this.shows("comfort")
    }

    more_air(){
        if (this.status == "need_air") this.shows("comfort")
    }

    // DFS
    find_path(from, to, prev_room=""){
        if (from.name == to.name) return {"status":true, "paths":[from.name]}
        for (let next_rooms of from.doors_to){
            if (next_rooms != prev_room){
                var result = this.find_path(this.house.rooms[next_rooms], to, from.name)
                if (result["status"]) {
                    result["paths"].unshift(from.name)
                    return {"status":true, "paths": result["paths"]}
                }
            }
        }
        return {"status":false}
    }
    
    move_to (to) {
        let room_strp = this.house.rooms[this.get('in_room')]
        assert (to in this.house.rooms)
        let room_endp = this.house.rooms[to]

        // console.log(room_strp.name, room_endp.name)
        if (room_strp.name != room_endp.name){
            console.log(blue,`[person] (${this.name}) move from (${room_strp.name}) to (${room_endp.name})`)

            var paths = this.find_path(room_strp, room_endp)["paths"]
            for (let room of paths){

                if ("door" in this.house.rooms[room].devices){
                    this.house.rooms[room].door_open()
                }

                this.set('in_room', room)
                // turn_on_light
                this.house.rooms[room].light_on()
            }
        }
        else console.log(dark,`[person] (${this.name}) stays in (${room_endp.name})`)
    }
}

module.exports = Person