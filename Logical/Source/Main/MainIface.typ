TYPE
    MainCmdIfaceType : STRUCT
        Start : BOOL;
        Stop  : BOOL;
    END_STRUCT;

    MainParIfaceType : STRUCT
        Reserved : BOOL;
    END_STRUCT;

    MainStatusIfaceType : STRUCT
        State     : STRING[32];
        Substate  : STRING[32];
        LineRunning : BOOL;
        AnyFault    : BOOL;
    END_STRUCT;

    MainIfaceType : STRUCT
        Cmd    : MainCmdIfaceType;
        Par    : MainParIfaceType;
        Status : MainStatusIfaceType;
    END_STRUCT;
END_TYPE
