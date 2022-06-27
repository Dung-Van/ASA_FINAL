const Beliefset =  require('../bdi/Beliefset')
const Observable =  require('../utils/Observable')



class House {

    constructor () {
        this.people = {
            marco: new Observable ( { name: 'marco', in_room: 'kitchen' } )
        }
        this.rooms = {
            kitchen: { name: 'kitchen', doors_to: ['living_room'] },
            living_room: { name: 'living_room' },
            garage: { name: 'garage' }
        }
        this.devices = {
            main_light: { on: false },
            car: { charging: true }
        }
        this.global = new Observable( {clock: {dd: 0, hh: 0, mm: 0}} )
    }

    moveFromKitchenToLivingRoom (name) {
        var person = this.people[name]
        if ( person.in_room == 'kitchen') {
            person.in_room = 'living_room'
            return true
        }
        else
            return false
    }

    moveTo (person, from, to) {
        if ( person.in_room == from.name && ( to.name in from.doors_to || from.name in to.doors_to ) ) {
            person.in_room = 'living_room'
            return true
        }
        else
            return false
    }

    switchOnLight (l) {
        this.declare('switched-on '+l)
        this.undeclare('switched-off '+l)
    }

    switchOffLight (l) {
        this.undeclare('switched-on '+l)
        this.declare('switched-off '+l)
    }

}



var house = new House()

async function init() {
    Promise.resolve().then( v => console.log('after') )

    house.people.marco.observe('name', (v)=>console.log('person ' + v) )
    house.people.marco.observe('in_room', (v)=>console.log('in_room marco ' + v) )
    
    house.people.marco.in_room = 'garage'
    console.log('marco is in room ' + house.people.marco.in_room)

    house.people.marco.name = 'marco'
    console.log('marco name is ' + house.people.marco)

    console.log(house.global)

    house.people.marco.surname = 'do not do this'
    console.log(house.people.marco)

    house.people.marco.observe('surname', (v)=>{} )
    house.people.marco.surname = 'now here this works'

    house.people.marco.defineProperty('comment', 'do this!')
    
    console.log(house.people.marco)
}
init();



async function day() {
    while(true) {
        await new Promise( res => setTimeout(res, 50))

        var dd = house.global.clock.dd
        var hh = house.global.clock.hh
        var mm = house.global.clock.mm

        if(mm<60)
            house.global.clock = {dd: dd, hh: hh, mm: mm+15}
        else {
            if(hh<24)
                house.global.clock = {dd: dd, hh: hh+1, mm: 0}
            else
                house.global.clock = {dd: dd+1, hh: 0, mm: 0}
        }
    }
}
day()



// Wall clock
house.global.observe('clock', (clock) => {
    process.stdout.clearLine(0);
    process.stdout.cursorTo(0);
    process.stdout.write( clock.dd + ':' + (clock.hh<10?'0':'')+clock.hh + ':' + (clock.mm==0?'00':clock.mm) + '\t');
})



// Daily schedule
house.global.observe('clock', (key, clock) => {
    if(clock.hh==12 && clock.mm==0)
        house.people.marco.in_room = 'kitchen'
    if(clock.hh==13 && clock.mm==30)
        house.people.marco.in_room = 'living_room'
    if(clock.hh==19 && clock.mm==0)
        house.people.marco.in_room = 'kitchen'
    if(clock.hh==20 && clock.mm==15)
        house.people.marco.in_room = 'living_room'
})