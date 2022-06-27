const Agent = require('../bdi/Agent')
const setup = require('../pddl/Blackbox')
const Goal = require('../pddl/PlanningGoal')
const House = require("./house")

const keypress = require('../utils/keypress')
const { white } = require('chalk')
const { format } = require('../utils/Clock')

const {SensorGoal, SensorIntention} = require('./sensors/general_sensor')
const {MaidSensorGoal, MaidSensorIntention} = require('./sensors/maid_sensor')

const {LightOff, ObserveRoomEmpty, ObserveRoomNotEmpty, MoveAgent, HeaterSave, CheckLocation} = require('./pddl/HouseAgent')
const {IncreaseHeat, StopHeat, Openwindows, Closewindows, ReduceCold, ReduceHot, IncreaseAir, GiveFood} = require('./pddl/MaidAgent')


// House
var house = new House()
var light_devices = house.devices_list("light")
var heater_devices = house.devices_list("light")
var consumed_devices = light_devices.concat(heater_devices)

// HouseAgent
var houseAgent = new Agent('houseagent', house) // Input house for taking actions in realword only "myworld/pddl/HouseAgent.json"
houseAgent.intentions.push(SensorIntention) // Sensor any electronic devices
houseAgent.postSubGoal( new SensorGoal(house.devices_list()))
houseAgent.intentions.push(setup([LightOff, ObserveRoomEmpty, ObserveRoomNotEmpty, MoveAgent, HeaterSave, CheckLocation])) // Save power 

// MaidAgent
var MaidAgent = new Agent('maidagent', house, "bathroom") // Input house for generate beliefs in people and agent location
MaidAgent.intentions.push(MaidSensorIntention)
MaidAgent.postSubGoal(new MaidSensorGoal(house))
MaidAgent.intentions.push(setup([IncreaseHeat, StopHeat, Openwindows, Closewindows, ReduceCold, ReduceHot, IncreaseAir, GiveFood])) // Make people comfort

// Communication between Maid Agent and House Agent
houseAgent.addAgent(MaidAgent)
MaidAgent.refObjects(houseAgent)


// possible_rooms: [livingroom, kitchen, bathroom, bedroom, stair]
// possible_person reaction (shows): [hungry, need_air, hot, cold, comfort]

// Daily schedule
house.timer.global.observe('mm', (key, mm) => {    
    let time = house.timer.global
    if(time.hh==6 && time.mm==0){
        house.people.child.move_to("livingroom")
        house.people.child.shows('hot')

        house.people.dad.move_to("bathroom")
        house.people.dad.shows('hot')

        house.people.mom.move_to("livingroom")
        house.people.mom.shows('need_air')

        houseAgent.subGoal_savepower(consumed_devices)
        MaidAgent.subGoal_comfort()
    }

    if(time.hh==12 && time.mm==0){
        house.people.child.move_to("kitchen")
        house.people.child.shows('hungry')

        house.people.dad.move_to("livingroom")
        house.people.dad.shows('hungry')

        house.people.mom.move_to("bathroom")
        house.people.mom.shows('hungry')

        houseAgent.subGoal_savepower(consumed_devices)
        MaidAgent.subGoal_comfort()
    }


    if(time.hh==17 && time.mm==0){
        house.people.child.move_to("stair")
        house.people.child.shows('cold')

        house.people.dad.move_to("bedroom")
        house.people.dad.shows('cold')

        house.people.mom.move_to("livingroom")
        house.people.mom.shows('hungry')

        houseAgent.subGoal_savepower(consumed_devices)
        MaidAgent.subGoal_comfort()
    }

    if (time.dd==1) house.timer.stopTimer()
})
house.timer.startTimer()