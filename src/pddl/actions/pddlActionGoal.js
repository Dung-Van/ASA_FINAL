const Goal =  require('../../bdi/Goal')



class pddlActionGoal extends Goal {

    // Example LightTurnedOn:
    // new LightTurnedOn({ args = {l: 'light1'} })

    toString() {
        return this.constructor.name + '#'+this.id + ' args:' + this.parameters.args
    }

}



module.exports = pddlActionGoal