TYPE
    ConveyorCmdIfaceType : STRUCT
        Start : BOOL;
        Stop  : BOOL;
    END_STRUCT;

    ConveyorParIfaceType : STRUCT
        MaxSpeed_mps : REAL := 2.0;
    END_STRUCT;

    ConveyorStatusIfaceType : STRUCT
        Running    : BOOL;
        Fault      : BOOL;
        Speed_mps  : REAL;
        Load_pct   : REAL;
        PartsCount : DINT;
        Mode       : STRING[32];
    END_STRUCT;

    ConveyorIfaceType : STRUCT
        Cmd    : ConveyorCmdIfaceType;
        Par    : ConveyorParIfaceType;
        Status : ConveyorStatusIfaceType;
    END_STRUCT;
END_TYPE
