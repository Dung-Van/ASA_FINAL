const Goal =  require('../bdi/Goal')



class PddlGoal extends Goal {

    // Example LightTurnedOn:
    // new LightTurnedOn({goal = [ ['switched-on l1'], ['not switched-off l1'] ]})
    
    // toString() {
    //     return this.constructor.name + '#'+this.id + ' goal:' + this.parameters.goal //+ this.effect.map(e=>'('+e+')').join('')
    // }

}



module.exports = PddlGoal