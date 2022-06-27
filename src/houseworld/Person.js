const Observable = require('../utils/Observable');



class Person extends Observable {
    constructor (house, name) {
        super()
        this.house = house;             // reference to the house
        this.name = name;               // non-observable
        this.set('in_room', 'kitchen')  // observable
        // this.observe( 'in_room', v => console.log(this.name, 'moved to', v) )    // observe
    }
    moveTo (to) {
        if ( this.house.rooms[this.in_room].doors_to.includes(to) ) { // for object: to in this.house.rooms[this.in_room].doors_to
            this.in_room = to
            console.log(this.name, '\t moved from', this.in_room, 'to', to)
            return true
        }
        else {
            console.log(this.name, '\t failed moving from', this.in_room, 'to', to)
            return false
        }
    }
}



module.exports = Person