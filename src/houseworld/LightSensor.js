const Goal = require('../bdi/Goal');
const Intention = require('../bdi/Intention');
const Light = require('./Light');



class SenseLightsGoal extends Goal {

    constructor (lights = []) {
        super()

        /** @type {Array<Light>} lights */
        this.lights = lights

    }

}



class SenseLightsIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)
        
        /** @type {Array<Light>} lights */
        this.lights = this.goal.lights
    }
    
    static applicable (goal) {
        return goal instanceof SenseLightsGoal
    }

    /**
     * To run code in parallel use postSubGoal without wait or yield. For example:
     * 
     * for (let l of this.lights) {
     *      let lightGoalPromise = this.agent.postSubGoal( new SenseOneLightGoal(l) )
     *      lightsGoals.push(lightGoalPromise)
     * }
     * Or put paraller code in Promises callback and do not wait or yield for them neither. For example:
     * 
     * for (let l of this.lights) {
     *      let lightGoalPromise = new Promise( async res => {
     *          while (true) {
     *              let status = await l.notifyChange('status')
     *              this.log('sense: light ' + l.name + ' switched ' + status)
     *              this.agent.beliefs.declare('light_on '+l.name, status=='on')
     *              this.agent.beliefs.declare('light_off '+l.name, status=='off')
     *          }
     *      });
     * }
     */
    *exec () {
        var lightsGoals = []
        for (let l of this.lights) {
            // let lightGoalPromise = this.agent.postSubGoal( new SenseOneLightGoal(l) )
            // lightsGoals.push(lightGoalPromise)
            
            let lightGoalPromise = new Promise( async res => {
                while (true) {
                    let status = await l.notifyChange('status')
                    this.log('sense: light ' + l.name + ' switched ' + status)
                    this.agent.beliefs.declare('light_on '+l.name, status=='on')
                    this.agent.beliefs.declare('light_off '+l.name, status=='off')
                }
            });

            lightsGoals.push(lightGoalPromise)
        }
        yield Promise.all(lightsGoals)
    }

}



class SenseOneLightGoal extends Goal {

    constructor (light) {
        super()

        /** @type {Light} light */
        this.light = light

    }

}



class SenseOneLightIntention extends Intention {
    
    constructor (agent, goal) {
        super(agent, goal)

        /** @type {Light} light */
        this.light = this.goal.light
    }

    static applicable (goal) {
        return goal instanceof SenseOneLightGoal
    }

    *exec () {
        while (true) {
            let status = yield this.light.notifyChange('status')
            this.log('sense: light ' + this.light.name + ' switched ' + status)
            this.agent.beliefs.declare('light_on '+this.light.name, status=='on')
            this.agent.beliefs.declare('light_off '+this.light.name, status=='off')
        }
    }

}



module.exports = {SenseLightsGoal, SenseLightsIntention, SenseOneLightGoal, SenseOneLightIntention}