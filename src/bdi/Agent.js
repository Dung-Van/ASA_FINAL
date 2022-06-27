const Beliefset =  require('./Beliefset')
const Intention = require('./Intention');
const Observable = require('../utils/Observable');
const chalk = require('chalk');
const Goal = require('../pddl/PlanningGoal')
const assert = require("assert");
const { time } = require('console');
const { readSync } = require('fs');

var nextId = 0
const colors = ['red', 'blue', 'green', 'yellow', 'magenta', 'cyan', 'redBright', 'greenBright', 'yellowBright', 'blueBright', 'magentaBright', 'cyanBright', 'whiteBright']

/**
 * @class Agent
 */
class Agent {

    constructor (name, house=null, location=null) {
        this.name = name
        this.id = nextId++
        
        // Adding house to get fact EX: (is_room kitchen, in light-kitchen kitchen) or list of person, devices and taking actions
        // Observed literals mainly obtained from sensors: src/myworld/sensors
        this.house = house
        this.device_list = this.house.devices_list()

        /** @type {Beliefset} beliefs */
        this.beliefs = new Beliefset()
        this.tmp = {true:'    ', false:'NOT '}
        this.beliefs.observeAny( (v,fact) => this.log( `Belief changed: ${this.tmp[v]} ${fact}`))

        /** @type {Array<Intention>} intentions */
        this.intentions = []
        this.location = new Observable()
        this.moveto(location)

    }

    // Only for House Agent
    subGoal_savepower(device_list){
        assert(this.name=="houseagent")
        var goals = []
        for (let device of device_list){
            let goal_str = "off " + device.name
            goals.push(goal_str)
        }
        this.postSubGoal(new Goal({goal: goals}))
    }

    // Only for House Agent
    addAgent(agent){
        assert(this.name=="houseagent")
        this.beliefs.addObject(agent.name)
        this.beliefs.declare(`is_agent ${agent.name}`)
        this.maid = agent
        this.maid.beliefs.observeAny( (v,fact) => {this.beliefs.declare(fact, v), this.log( `Maid saw: ${this.tmp[v]} ${fact}`)})
        for (let ob of this.maid.beliefs.objects) this.beliefs.addObject(ob)
    }

    // Only for Maid Agent
    moveto(room_name){
        if (!room_name) return;
        assert(this.name=="maidagent")
        this.location.set("in_room",room_name)
        for (let name in this.house.rooms){
            this.beliefs.declare(`in ${this.name} ${name}`, name == room_name)
        }
        this.log(`[move] ${this.name} -> ${room_name}`)
        return true
    }

    // Only for Maid Agent
    refObjects(agent){
        assert(this.name=="maidagent")
        this.master = agent
        this.beliefs.addObject(agent.name)
        this.beliefs.declare(`is_master ${agent.name}`)
        this.beliefs.addObject(this.name)
        this.beliefs.declare(`is_agent ${this.name}`)
        for (let ob of agent.beliefs.objects) this.beliefs.addObject(ob)
        this.master.beliefs.observeAny( (v, fact) => { this.ref_devices_list(v, fact) }) //, this.log( `Master saw: ${this.tmp[v]} ${fact}`)})

        for (let lit of agent.beliefs.literals){
            if (["is",'in'].includes(lit.substring(0, 2))){
                this.beliefs.declare(lit)
            }
        }
    }

    
    ref_devices_list(v, fact){
        assert(this.name=="maidagent")
        for (let device of this.device_list){
            if (fact.includes(device.name)) {
                this.beliefs.declare(fact, v)
                break;
            }
        } 
        return
    }

    // Only for Maid Agent, test function
    reset_observation(){
        assert(this.name=="maidagent")
        for (let person_name in this.house.people) {
            let person = this.house.people[person_name]
            for (var room_name in  this.house.rooms){
                var fact  = `in ${person.name} ${room_name}`
                this.beliefs.declare(fact, person.in_room == room_name)
            }
            for (let status of person.possible_status){
                this.beliefs.declare(`${status} ${person.name}`, status==person.status)
            }
        }
    }

    // Only for Maid Agent
    subGoal_comfort(){
        assert(this.name=="maidagent")
        this.reset_observation()
        this.postSubGoal(new Goal({goal: ["comfort mom", "comfort dad", "comfort child"]}))
    }


    headerError (header = '', ...args) {
        header += ' '.repeat(Math.max(30-header.length,0))
        console.error(chalk.bold.italic[colors[this.id%colors.length]](header, ...args))
    }

    error (...args) {
        this.headerError(this.name, ...args)
    }



    headerLog (header = '', ...args) {
        header += ' '.repeat(Math.max(30-header.length,0))
        console.log(chalk[colors[this.id%colors.length]](header, ...args))
    }

    log (...args) {
        this.headerLog(this.name, ...args)
    }



    async postSubGoal (subGoal) {
        
        // if (!this.beliefs.check(subGoal.precondition)) { //!subGoal.checkPrecondition()
        //     this.log('Goal cannot be taken, preconditions are not valid', subGoal)
        //     console.log(subGoal.precondition)
        //     console.log(this.beliefs)
        //     return
        // }

        for (let intentionClass of Object.values(this.intentions)) {
            
            if (!intentionClass.applicable(subGoal)) // By default applicable(goal) returns true (see class Intention)
                continue; // if not applicable try next
            
            this.log('Trying to use intention', intentionClass.name, 'to achieve goal', subGoal.toString())
    
            var intention = new intentionClass(this, subGoal)
            var success = await intention.run().catch( err => {
                console.error("agent err", err)
                // this.error('Failed to use intention', intentionClass.name, 'to achieve goal', subGoal.toString() + ':', err.message || err || 'undefined error')
                // this.error( err.stack || err || 'undefined error');
            } )

            if ( success ) {
                this.log('Succesfully used intention', intentionClass.name, 'to achieve goal', subGoal.toString())
                subGoal.achieved = true;
                this.house.timer.startTimer()
                return Promise.resolve(true) // same as: return true;
            }
            else {
                continue // retrying
            }

        }
        
        this.log('No success in achieving goal', subGoal.toString())
        this.house.timer.startTimer()
        return Promise.resolve(false) // different from: return false; which would reject the promise!!!
        // throw new Error('No success in achieving goal'); // Promise rejection with explicit error. This should always be catched outside!
    
    }

}



// const {LightOn} = require('./bdi/Goal')
// const intentions =  require('./bdi/Intention')

// postSubGoal(new LightOn({l: 'light1'}))


// var kitchenAgent = new Agent('kitchen')
// kitchenAgent.intentions.push(...Object.values(intentions))
// kitchenAgent.postSubGoal(new LightOn({l: 'light0'}))

// environment.facts.push('in-room kitchen Marco')
// environment.facts.push('light-on light1')


module.exports = Agent