const Intention =  require('../../bdi/Intention')



class pddlActionIntention extends Intention {

    // Example LightOn:
    // static parameters = ['l']
    // static precondition = [ ['switched-off', 'l'] ]
    // static effect = [ ['switched-on', 'l'], ['not switched-off', 'l'] ]
    //
    // static applicable (goal) {
    //     return ( goal instanceof PlanningGoal && goal.parameters.hasOwnProperty('l') )
    // }
    //
    // *exec () {
    //     yield applyEffect()
    // }

    toString() {
        // return this.constructor.name + '#'+this.id + ' effect:' + this.effect
        return '\n - Action: ' + this.constructor.name + '\n - Params: '+ Object.values(this.goal.parameters).join(' ') + ')' + '\n - Effect: ' + this.effect
    }



    get precondition () {
        return pddlActionIntention.ground(this.constructor.precondition, this.goal.parameters)
    }

    get parameters () {
        return pddlActionIntention.ground(this.constructor.parameters, this.goal.parameters)
    }

    checkPrecondition (debug=false) {
        return this.agent.beliefs.check(debug, ...this.precondition);
    }



    get effect () {
        return pddlActionIntention.ground(this.constructor.effect, this.goal.parameters)
    }

    checkEffect () {
        return this.agent.beliefs.check(...this.effect);
    }

    applyEffect () {
        for ( let b of this.effect )
            this.agent.beliefs.apply(b)
    }



    /**
     * 
     * @param {Array<String>} parametrizedLiterals Array of parametrized literals;
     * e.g. [['on, 'l'], ['in_room', 'p', 'r']
     * @param {Object} parametersMap Map of parameters key->value;
     * e.g. {l: light1, p: bob, room: kitchen}
     * @returns {Array<String>} Array of grounded literals;
     * e.g. ['on light1', 'in_room bob kitchen']
     */
    static ground (parametrizedLiterals, parametersMap) {
        return parametrizedLiterals.map( (literal) => {
            let possibly_negated_predicate = literal[0]
            let vars = literal.slice(1)
            let grounded = possibly_negated_predicate
            for (let v of vars)
                grounded = grounded + ' ' + parametersMap[v]
            return grounded
        })
    }
    
}



module.exports = pddlActionIntention