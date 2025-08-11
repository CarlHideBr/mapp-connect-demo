TYPE
    RobotCmdIfaceType : STRUCT
        Auto : BOOL;
    END_STRUCT;

    RobotParIfaceType : STRUCT
        Speed_pct : REAL := 50.0;
    END_STRUCT;

    RobotStatusIfaceType : STRUCT
        Auto   : BOOL;
        Fault  : BOOL;
        X      : REAL;
        Y      : REAL;
        Z      : REAL;
        State  : STRING[32];
    END_STRUCT;

    RobotIfaceType : STRUCT
        Cmd    : RobotCmdIfaceType;
        Par    : RobotParIfaceType;
        Status : RobotStatusIfaceType;
    END_STRUCT;
END_TYPE
