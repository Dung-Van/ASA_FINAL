const Goal = require('../../bdi/Goal');
const Intention = require('../../bdi/Intention');

class MaidSensorGoal extends Goal{

    constructor (house){
        super()
        this.house = house
    }
}

class MaidSensorIntention extends Intention{

    constructor (agent, goal) {
        super(agent, goal)

        this.house = this.goal.house
    }

    static applicable (goal){
        return goal instanceof MaidSensorGoal
    }

    // declare_facts(person, location){
    //     this.log(`[sense] ${person.name} in ${location}`)
    //     // update person location
    //     for (var room_name in  this.house.rooms){
    //         var fact  = `in ${person.name} ${room_name}`
    //         this.agent.beliefs.declare(fact, location == room_name)
    //     }
    //     this.log(`[sense] ${person.name} is ${person.status}`)
    //     for (let status of person.possible_status){
    //         this.agent.beliefs.declare(`${status} ${person.name}`, status==person.status)
    //     }
    // }


    declare_facts(person, person_location, agent_location){
        if (person_location == agent_location){
            this.log(`[sense] ${person.name} in ${person_location}`)
            // update person location
            for (var room_name in  this.house.rooms){
                var fact  = `in ${person.name} ${room_name}`
                this.agent.beliefs.declare(fact, person_location == room_name)
            }
            this.log(`[sense] ${person.name} is ${person.status}`)
            for (let status of person.possible_status){
                this.agent.beliefs.declare(`${status} ${person.name}`, status==person.status)
            }
        }
        else {
            this.agent.beliefs.declare(`in ${person.name} ${agent_location}`,false)
        }
    }


    *exec () {
        var goals = []
        for (var person_name in this.house.people) {
            let person = this.house.people[person_name]
            this.agent.beliefs.addObject(person.name)
            this.agent.beliefs.declare(`is_human ${person.name}`)
            // Init position
            for (var room_name in  this.house.rooms){
                var fact  = `in ${person.name} ${room_name}`
                this.agent.beliefs.declare(fact, person.in_room == room_name)
            }

            let people_location = new Promise( async res => {
                while (true) {
                    await person.notifyChange("in_room")
                    // let location = person.in_room
                    // if (location == this.agent.location.get("in_room")){
                    //     this.declare_facts(person, location)
                    // }
                    this.declare_facts(person, person.in_room, this.agent.location.get("in_room"))
                }        
            });
            goals.push(people_location)
        }
        let agent_location = new Promise( async res => {
            while (true) {
                let location_agent = await this.agent.location.notifyChange("in_room")
                for (var person_name in this.house.people) {
                    // let person = this.house.people[person_name]
                    // if (location == person.in_room){
                    //     this.declare_facts(person, location)
                    // }
                    this.declare_facts(this.house.people[person_name], this.house.people[person_name].in_room, location_agent)
                }
            }        
        });

        goals.push(agent_location)
        yield Promise.all(goals)
    }
}

module.exports = {MaidSensorGoal, MaidSensorIntention}