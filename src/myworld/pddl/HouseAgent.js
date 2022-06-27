const pddlActionIntention = require('../../pddl/actions/pddlActionIntention')

class HouseAgentAction extends pddlActionIntention {

    *exec (res) {
        // console.log(res)
        let env = this.agent.house
        env.timer.stopTimer()
        let action = this.constructor.name
        let params = this.goal.parameters

        // Take action in real world
        let is_success = null
        if (action =="CheckLocation") {
            is_success =  this.agent.beliefs.check(true, ...[this.effect.at(0)])
        }
        else{
            is_success = this.checkPrecondition(true)
        }

        if (is_success){
            for ( let effect of this.effect){
                if (action == "LightOff") env.rooms[params["room"]].light_off()
                else if (action == "HeaterSave") env.rooms[params["room"]].heater_off()
                else if (action == "MoveAgent"){
                    if (effect.substring(0,2) == "in") {
                        this.agent.maid.moveto(params["room_curr"])
                    }
                }
                else if (action == "ObserveRoomEmpty") this.agent.beliefs.apply(effect)
                else if (action == "ObserveRoomNotEmpty") this.agent.beliefs.apply(effect)
                // this.agent.beliefs.apply(effect);
            }
            this.log(`[SUCCESSED]`, this.effect)
        }
        else {
            // this.log(`[FAILED] not`, this.effect)
        }
        yield new Promise(res=>{setTimeout(res,100)})
    }
}

class LightOff extends HouseAgentAction {
    // if light on and room empty -> light off 
    static parameters = ['light', 'room']
    static precondition = [ ['on', 'light'], ['empty', 'room'], ['in', 'light', 'room'], ["is_light", "light"], ["is_room", "room"] ]
    static effect = [ ['off', 'light'] ]
}

class HeaterSave extends HouseAgentAction {
    // if light on and room empty -> light off 
    static parameters = ['heater', 'room']
    static precondition = [ ['on', 'heater'], ['empty', 'room'], ["is_heater", "heater"], ["is_room", "room"] ]
    static effect = [ ['off', 'heater'] ]
}

class ObserveRoomEmpty extends HouseAgentAction {
    static parameters = ['agent', 'room', "dad", "mom", "child"]
    static precondition = [ ['in', 'agent', 'room'], ["not in", "dad", "room"], ["not in", "mom", "room"], ["not in", "child", "room"],
    ["is_room", "room"], ["is_agent", "agent"], ["is_human", "dad"], ["is_human", "mom"], ["is_human", "child"]]
    static effect = [ ['empty', 'room'] ]
}

class CheckLocation extends HouseAgentAction{
    static parameters = ['agent', 'room', 'human']
    static precondition = [ ['in', 'agent', 'room'], ["in", "human", "room"], ["is_room", "room"], ["is_agent", "agent"], ["is_human", "human"]]
    static effect = [ ['not in', 'human', 'room'] ]
}

class MoveAgent extends HouseAgentAction {
    static parameters = ['agent', 'room_prev', 'room_curr']
    static precondition = [ ['not in', 'agent', 'room_curr'], ['in', 'agent', 'room_prev'],
    ["is_room", "room_prev"], ["is_room", "room_curr"], ["is_agent", "agent"]]
    static effect = [['in', "agent", 'room_curr'], ['not in', "agent", 'room_prev']]
}


class ObserveRoomNotEmpty extends HouseAgentAction {
    static parameters = ['agent', 'room', "human"]
    static precondition = [ ['in', 'agent', 'room'], ["in", "human", "room"], ["is_room", "room"], ["is_agent", "agent"], ["is_human", "human"]]
    static effect = [ ['not empty', 'room']]
}
module.exports = {LightOff, ObserveRoomEmpty, ObserveRoomNotEmpty, MoveAgent, HeaterSave, CheckLocation}