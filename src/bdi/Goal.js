const Observable = require("../utils/Observable")

var nextId = 0

/**
 * @class Goal
 */
class Goal extends Observable {

    constructor (parameters = {}) {
        super({achieved: false})
        
        this.id = nextId++

        /** @type {*} parameters */
        this.parameters = parameters
        
        // // [x, y] given parameters=['x','y']
        // if (Array.isArray(parameters))
        //     for (let i = 0; i < parameters.length; i++) {
        //         const element = parameters[i];
        //         this.parameters[this.constructor.parameters[i]] = parameters[i]
        //     }
        // // {'x': x, 'y': y}
        // else
        //     this.parameters = parameters
    }

    toJSON () {
        // return [this.constructor.name + '#'+this.id, this.parameters]
        let j = {}
        j[this.constructor.name + '#'+this.id] = this.parameters
        return j
    }
      
    toString () {
        function replacer(key, mayBeGoal) {
            // Filtering out properties
            if (mayBeGoal instanceof Goal) {
                let j = {}
                j[mayBeGoal.constructor.name + '#'+mayBeGoal.id] = mayBeGoal.parameters
                return j
            }
            return mayBeGoal;
        }
        return JSON.stringify(this).replace(/\"([^(\")"]+)\":/g,"$1:")
    }

    // get precondition () {
    //     return BeliefSet.ground(this.constructor.precondition, this.parameters)
    // }

    // checkPrecondition (beliefSet) {
    //     return beliefSet.check(this.precondition);
    // }

    // get effect () {
    //     return BeliefSet.ground(this.constructor.effect, this.parameters)
    // }

    // checkEffect (beliefSet) {
    //     return beliefSet.check(this.effect);
    // }

    // applyEffect (beliefSet) {
    //     for ( let b of this.effect )
    //         beliefSet.apply(b)
    // }
}



module.exports = Goal