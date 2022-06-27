const Beliefset =  require('../bdi/Beliefset')
const Observable =  require('../utils/Observable')
const Clock =  require('../utils/Clock')
const Agent = require('../bdi/Agent')
const Goal = require('../bdi/Goal')
const Intention = require('../bdi/Intention')



class House {

    constructor () {

        this.people = {
            bob: new Observable ( { name: 'bob', in_room: 'kitchen' } )
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
        
        this.people.bob.observe('name', (v, k)=>console.log('person ' + v) )
        
        this.people.bob.observe('in_room', (v, k)=>console.log('in_room bob ' + v) )

        Clock.startTimer()
        // Clock.wallClock()
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



// Daily schedule
Clock.global.observe('mm', (key, mm) => {
    var time = Clock.global
    if(time.hh==12 && time.mm==0)
        house.people.bob.in_room = 'kitchen'
    if(time.hh==13 && time.mm==30)
        house.people.bob.in_room = 'living_room'
    if(time.hh==19 && time.mm==0)
        house.people.bob.in_room = 'kitchen'
    if(time.hh==20 && time.mm==15)
        house.people.bob.in_room = 'living_room'
})



var a1 = new Agent('house_agent')

class SetupAlarm extends Goal {
    constructor(hh, mm) {
        super()
        this.hh = hh
        this.mm = mm
    }
}

class MyAlarm extends Intention {
    static applicable(goal) {
        return goal instanceof SetupAlarm
    }   
    *exec () {
        while(true) {
            yield Clock.global.notifyChange('mm')
            if (Clock.global.hh == this.goal.hh) {
                console.log('ALARM, it\'s 6am!')
                break;
            }
        }
    }
}

a1.intentions.push(MyAlarm)

a1.postSubGoal(new SetupAlarm({hh:6, mm:0}))