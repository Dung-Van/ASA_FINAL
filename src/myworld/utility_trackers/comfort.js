const Observable = require('../../utils/Observable');

class tracker_comfort extends Observable {
    constructor (house, name="comfort") {
        super()
        this.house = house;
        this.name = name;
        this.set('comfort_events', 0)
        this.set('uncomfort_events', 0)
        this.set('date', 0)
        this.subscribe_person = {}

    }

    subcribe(person){
        this.subscribe_person[person.name] = person
    }

    unsubcribe(person){
        delete this.subscribe_person[person.name]
    }

    // parallel calculate based on time
    update(mm, time_step=30) {
        // update step
        if (mm % time_step == 0){
            var time = this.house.timer.global
            if (this.get("date") != time.dd){
                console.log(`[Comfort] Date ${this.get('date')}, comfortevents: ${this.get('comfort_events')}, uncomfortevents: ${this.get('uncomfort_events')}`)
                this.set("date", time.dd)
                this.set("comfort_events",0)
                this.set("uncomfort_events",0)
            }

            var tmp_comp    = 0
            var tmp_uncomp  = 0 
            for (let person of Object.values(this.subscribe_person)) { 
                if (person.status == "comfort") tmp_comp += 1
                else tmp_uncomp+=1
            }

            this.set('comfort_events',tmp_comp + this.get('comfort_events'))
            this.set('uncomfort_events',tmp_uncomp + this.get('uncomfort_events'))
        }
    }

}

module.exports = tracker_comfort