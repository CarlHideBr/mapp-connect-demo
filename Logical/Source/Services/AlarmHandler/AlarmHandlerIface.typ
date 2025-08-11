TYPE
    AlarmHandlerCmdIfaceType : STRUCT
        AckAll          : BOOL;
        ResetAll        : BOOL;
        SilenceHorn     : BOOL;
        ShelveSelected  : BOOL;
        UnshelveAll     : BOOL;
        SelectFirstUnacked : BOOL;
    END_STRUCT;

    AlarmHandlerParIfaceType : STRUCT
        EnableHistory   : BOOL := TRUE;
        MaxLocalLog     : UINT := 64;
    END_STRUCT;

    AlarmRecordType : STRUCT
        Code       : DINT;
        Severity   : USINT;
        Active     : BOOL;
        Acknowledged : BOOL;
        Timestamp  : UDINT;
    END_STRUCT;

    AlarmHandlerStatusIfaceType : STRUCT
        ActiveCount      : UINT;
        UnackedCount     : UINT;
        HighestSeverity  : USINT;
        AnyActive        : BOOL;
        AnyUnacked       : BOOL;
        Log              : ARRAY[0..63] OF AlarmRecordType;
        LogSize          : UINT;
    END_STRUCT;

    AlarmHandlerIfaceType : STRUCT
        Cmd    : AlarmHandlerCmdIfaceType;
        Par    : AlarmHandlerParIfaceType;
        Status : AlarmHandlerStatusIfaceType;
    END_STRUCT;
END_TYPE
