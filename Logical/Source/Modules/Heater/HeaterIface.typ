TYPE
    HeaterCmdIfaceType : STRUCT
        Enable : BOOL;
    END_STRUCT;

    HeaterParIfaceType : STRUCT
        Setpoint_C : REAL := 180.0;
    END_STRUCT;

    HeaterStatusIfaceType : STRUCT
        Heating      : BOOL;
        Fault        : BOOL;
        TemperatureC : REAL;
        Power_pct    : REAL;
    END_STRUCT;

    HeaterIfaceType : STRUCT
        Cmd    : HeaterCmdIfaceType;
        Par    : HeaterParIfaceType;
        Status : HeaterStatusIfaceType;
    END_STRUCT;
END_TYPE
