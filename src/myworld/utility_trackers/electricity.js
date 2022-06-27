const Observable = require('../../utils/Observable');

class tracker_electricity extends Observable {
    constructor (house, name="electric") {
        super()
        this.house = house;
        this.name = name;
        this.set('consumption', 0)
        this.set('date', 0)
        this.subscribe_device = {}
        this.set_power(0)
        // console.log(this.power_log)

    }

    set_power(hh=0,free_value=20){
        this.power_log = {"hour":hh, "free_power":free_value}
    }

    subcribe(device){
        this.subscribe_device[device.name] = device
    }

    unsubcribe(device){
        this.subscribe_device[device.name] = 0
    }

    // parallel calculate based on time
    update(mm, time_step=30) {
        // update step
        if (mm % time_step == 0){
            var time = this.house.timer.global
            if (this.get("date") != time.dd){
                console.log(`[Utilities] Date ${this.get('date')} consumed ${this.get('consumption')}W`)
                this.set("date", time.dd)
                this.set("consumption",0)
            }

            // Reset free power for each hour
            if (this.power_log.hour != time.hh){
                if (time.hh >= 6 & time.hh<=18) this.set_power(time.hh)
                else this.set_power(time.hh, 0)
            }

            var consumed = 0
            for (let val of Object.values(this.subscribe_device)) {  
                consumed += (val.get_consumption()/60*time_step)
            }

            this.power_log.free_power -= consumed
            if (this.power_log.free_power <= 0){
                consumed = -this.power_log.free_power
                this.power_log.free_power = 0
            }
            else consumed = 0
            this.set('consumption',consumed + this.get('consumption'))
        }
    }

}

module.exports = tracker_electricity