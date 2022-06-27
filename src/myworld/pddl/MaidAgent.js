const pddlActionIntention = require('../../pddl/actions/pddlActionIntention')

class MaidAgentAction extends pddlActionIntention {

    *exec (res) {
        let env = this.agent.house
        env.timer.stopTimer()
        let action = this.constructor.name
        let params = this.goal.parameters

        // Take action in real world
        let is_success = this.checkPrecondition(true)
        if (is_success){

            for ( let effect of this.effect){
                if (action == "IncreaseHeat") env.rooms[params["room"]].heater_on()
                else if (action == "StopHeat") env.rooms[params["room"]].heater_off()
                else if (action == "StopHeat") env.rooms[params["room"]].heater_off()
                else if (action == "Openwindows") env.rooms[params["room"]].windows_open()
                else if (action == "Closewindows") env.rooms[params["room"]].windows_close()
                else if (action == "ReduceCold") env.people[params["human"]].less_cold()
                else if (action == "ReduceHot") env.people[params["human"]].less_hot()
                else if (action == "IncreaseAir") env.people[params["human"]].more_air()
                else if (action == "GiveFood") env.people[params["human"]].eat()
            }
            this.log(`[SUCCESSED]`, this.effect)
        }
        else {
            // this.log(`[FAILED] not`, this.effect)
        }
        yield new Promise(res=>{setTimeout(res,100)})
    }
}


class IncreaseHeat extends MaidAgentAction {
    static parameters = ['heater', 'room', "windows"]
    static precondition = [ ['in', 'heater', 'room'], ['in', 'windows', 'room'], ["is_heater", "heater"], ["closed", "windows"], ["is_room", "room"]]
    static effect = [['on', 'heater']]
}

class StopHeat extends MaidAgentAction {
    static parameters = ['heater', 'room']
    static precondition = [ ['in', 'heater', 'room'], ["is_heater", "heater"], ["is_room", "room"]]
    static effect = [['off', 'heater']]
}

class Openwindows extends MaidAgentAction {
    static parameters = ['room',"windows"]
    static precondition = [ ['in', 'windows', 'room'], ["closed", "windows"], ["is_windows", "windows"], ["is_room", "room"]]
    static effect = [['opened', 'windows']]
}

class Closewindows extends MaidAgentAction {
    static parameters = ['room',"windows"]
    static precondition = [["is_room", "room"], ["is_windows", "windows"], ['opened', 'windows'] ]
    static effect = [["closed", "windows"]]
}

class ReduceCold extends MaidAgentAction{
    static parameters = ['room', 'human', 'heater']
    static precondition = [
        ['cold', 'human'], ['on', 'heater'],
        ['in', 'human', 'room'], ['in', 'heater', 'room'], 
        ["is_heater", "heater"], ["is_room", "room"], ["is_human", "human"] ]
    static effect = [['comfort', 'human']]
}

class ReduceHot extends MaidAgentAction{
    static parameters = ['room', 'human', 'heater']
    static precondition = [ ['in', 'human', 'room'], ['in', 'heater', 'room'], ['hot', 'human'], ['off', 'heater'],
    ["is_heater", "heater"], ["is_room", "room"], ["is_human", "human"] ]
    static effect = [['comfort', 'human']]
}

class IncreaseAir extends MaidAgentAction{
    static parameters = ['room', 'human', 'windows']
    static precondition = [ ['in', 'human', 'room'], ['in', 'windows', 'room'], ['need_air', 'human'], ['opened', 'windows'],
    ["is_windows", "windows"], ["is_room", "room"], ["is_human", "human"] ]
    static effect = [['comfort', 'human']]
}

class GiveFood extends MaidAgentAction{
    static parameters = ['room', 'human']
    static precondition = [ ['in', 'human', 'room'], ['hungry', 'human'],
    ["is_room", "room"], ["is_human", "human"] ]
    static effect = [['comfort', 'human']]
}

module.exports = {IncreaseHeat, StopHeat, Openwindows, Closewindows, ReduceCold, ReduceHot, IncreaseAir, GiveFood}