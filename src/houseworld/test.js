const Beliefset =  require('../bdi/Beliefset')
const Observable =  require('../utils/Observable')

var o = new Observable({field:'value'})

var promise1 = o.notifyChange('field');
var promise2 = o.notifyChange('field');

promise1.then( v => console.log(v) )
promise2.then( v => console.log(v) )

o.field = 'value_changed'
