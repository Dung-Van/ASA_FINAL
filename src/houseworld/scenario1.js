const Beliefset =  require('../bdi/Beliefset')

class Environment extends Beliefset {
    
    

}



class House extends Environment {

    constructor () {
        super ()
        this.declare('person marco')
        this.declare('person_in marco kitchen')
        this.declare('room kitchen')
        this.declare('room living_room')
        this.declare('door kitchen living_room')
        this.declare('room garage')
        this.declare('switched-off main_light')
    }

    moveFromKitchenToLivingRoom (person) {
        if ( this.check(`person_in ${person} kitchen`) ) {
            this.undeclare(`person_in ${person} kitchen`)
            this.declare(`person_in ${person} living_room`)
            return true
        }
        else
            return false
    }

    moveTo (person, from, to) {
        if ( this.check(`person_in ${person} ${from}`) && this.check(`door ${from} ${to}`) || this.check(`door ${to} ${from}`) ) {
            this.undeclare(`person_in ${person} ${from}`)
            this.declare(`person_in ${person} ${to}`)
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
var obs1 = function (fact, value) {console.log(fact,value)}
house.observe(obs1, 'switched-on light1')
house.declare('switched-on light1')
console.log(house.facts)
house.unobserve(obs1, 'switched-on light1')
house.declare('switched-on light1')

house.facts