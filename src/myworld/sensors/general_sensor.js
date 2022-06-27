const Goal = require('../../bdi/Goal');
const Intention = require('../../bdi/Intention');

class SensorGoal extends Goal{

    constructor (devices=[]){
        super()
        this.devices = devices
    }
}

class SensorIntention extends Intention{

    constructor (agent, goal) {
        super(agent, goal)

        this.devices = this.goal.devices
    }

    static applicable (goal){
        return goal instanceof SensorGoal
    }

    *exec () {
        var goals = []
        for (let device of this.devices) {
            let room_name = device.name.split("-").slice(1).join("-")
            let device_name = device.name.split("-").at(0)
            
            this.agent.beliefs.addObject(device.name)
            this.agent.beliefs.addObject(room_name)
            this.agent.beliefs.declare(`in ${device.name} ${room_name}`)
            this.agent.beliefs.declare(`is_${device_name} ${device.name}`)
            this.agent.beliefs.declare(`is_room ${room_name}`)
            let list_possible_status = device.get("possible")
            for (let possible_status of list_possible_status){
                var fact = `${possible_status} ${device.name}`
                let value = device.status == possible_status
                this.agent.beliefs.declare(fact, value)
            }

            let device_goal_promise = new Promise( async res => {
                while (true) {
                    let status = await device.notifyChange('status')
                    let list_possible_status = device.get("possible")
                    this.log(`[sense] ${status} ${device.name}`)
                    for (let possible_status of list_possible_status){
                        var fact = `${possible_status} ${device.name}`
                        let value = status == possible_status
                        this.agent.beliefs.declare(fact, value)
                    }
                }
            });

            goals.push(device_goal_promise)
        }
        yield Promise.all(goals)
    }
}

module.exports = {SensorGoal, SensorIntention}