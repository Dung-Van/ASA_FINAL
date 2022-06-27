;; domain file: domain-maidagent.pddl
(define (domain maidagent)
    (:requirements :strips)
    (:predicates
        (in ?heater ?room)
        (is_heater ?heater)
        (closed ?windows)
        (is_room ?room)
        (on ?heater)
        (off ?heater)
        (is_windows ?windows)
        (opened ?windows)
        (cold ?human)
        (is_human ?human)
        (comfort ?human)
        (hot ?human)
        (need_air ?human)
        (hungry ?human)              
    )
    
        (:action IncreaseHeat
            :parameters (?heater ?room ?windows)
            :precondition (and
                (in ?heater ?room)
                (in ?windows ?room)
                (is_heater ?heater)
                (closed ?windows)
                (is_room ?room)
            )
            :effect (and
                (on ?heater)
            )
        )
        
        (:action StopHeat
            :parameters (?heater ?room)
            :precondition (and
                (in ?heater ?room)
                (is_heater ?heater)
                (is_room ?room)
            )
            :effect (and
                (off ?heater)
            )
        )
        
        (:action Openwindows
            :parameters (?room ?windows)
            :precondition (and
                (in ?windows ?room)
                (closed ?windows)
                (is_windows ?windows)
                (is_room ?room)
            )
            :effect (and
                (opened ?windows)
            )
        )
        
        (:action Closewindows
            :parameters (?room ?windows)
            :precondition (and
                (is_room ?room)
                (is_windows ?windows)
                (opened ?windows)
            )
            :effect (and
                (closed ?windows)
            )
        )
        
        (:action ReduceCold
            :parameters (?room ?human ?heater)
            :precondition (and
                (cold ?human)
                (on ?heater)
                (in ?human ?room)
                (in ?heater ?room)
                (is_heater ?heater)
                (is_room ?room)
                (is_human ?human)
            )
            :effect (and
                (comfort ?human)
            )
        )
        
        (:action ReduceHot
            :parameters (?room ?human ?heater)
            :precondition (and
                (in ?human ?room)
                (in ?heater ?room)
                (hot ?human)
                (off ?heater)
                (is_heater ?heater)
                (is_room ?room)
                (is_human ?human)
            )
            :effect (and
                (comfort ?human)
            )
        )
        
        (:action IncreaseAir
            :parameters (?room ?human ?windows)
            :precondition (and
                (in ?human ?room)
                (in ?windows ?room)
                (need_air ?human)
                (opened ?windows)
                (is_windows ?windows)
                (is_room ?room)
                (is_human ?human)
            )
            :effect (and
                (comfort ?human)
            )
        )
        
        (:action GiveFood
            :parameters (?room ?human)
            :precondition (and
                (in ?human ?room)
                (hungry ?human)
                (is_room ?room)
                (is_human ?human)
            )
            :effect (and
                (comfort ?human)
            )
        )
)