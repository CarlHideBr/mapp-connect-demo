
TYPE
	AlarmHandlerCmdIfaceType : STRUCT
		AckAll          : BOOL;  (* Acknowledge all acknowledgeable alarms *)
		ResetAll        : BOOL;  (* Reset all resettable alarms *)
		SilenceHorn     : BOOL;  (* Example: mute buzzer *)
		ShelveSelected  : BOOL;  (* Shelve current selection (if supported) *)
		UnshelveAll     : BOOL;
		SelectFirstUnacked : BOOL; (* UI helper: request selection of first unacked *)
	END_STRUCT;

	AlarmHandlerParIfaceType : STRUCT
		EnableHistory   : BOOL := TRUE;  (* if TRUE, collect a ring buffer locally *)
		MaxLocalLog     : UINT := 64;    (* local circular buffer size *)
	END_STRUCT;

	AlarmRecordType : STRUCT
		Code       : DINT;
		Severity   : USINT;   (* 0..255 mapping to Info..Critical *)
		Active     : BOOL;
		Acknowledged : BOOL;
		Timestamp  : UDINT;   (* ms since boot; for demo *)
	END_STRUCT;

	AlarmHandlerStatusIfaceType : STRUCT
		ActiveCount      : UINT;
		UnackedCount     : UINT;
		HighestSeverity  : USINT;
		AnyActive        : BOOL;
		AnyUnacked       : BOOL;
		(* Local buffer for HMI quick view *)
		Log              : ARRAY[0..63] OF AlarmRecordType; (* truncated by MaxLocalLog *)
		LogSize          : UINT;
	END_STRUCT;

	AlarmHandlerIfaceType : STRUCT
		Cmd    : AlarmHandlerCmdIfaceType;
		Par    : AlarmHandlerParIfaceType;
		Status : AlarmHandlerStatusIfaceType;
	END_STRUCT;
END_TYPE