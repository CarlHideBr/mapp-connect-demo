
TYPE
	(* HMI data transfer objects for Main aggregate *)

	ConveyorHmiData : STRUCT
		Running    : BOOL;
		Fault      : BOOL;
		Speed      : REAL;      (* m/s *)
		Load       : REAL;      (* % *)
		PartsCount : UDINT;
		Mode       : STRING[16];
	END_STRUCT;

	HeaterHmiData : STRUCT
		Heating      : BOOL;
		Fault        : BOOL;
		Temperature  : REAL;     (* °C *)
		PowerPercent : REAL;     (* % *)
		Setpoint     : REAL;     (* °C *)
	END_STRUCT;

	RobotHmiData : STRUCT
		Auto  : BOOL;
		Fault : BOOL;
		X     : REAL;
		Y     : REAL;
		Z     : REAL;
		State : STRING[32];
	END_STRUCT;

	MachineCommandsType : STRUCT
		Start : BOOL;
		Stop  : BOOL;
	END_STRUCT;

	MachineHmiData : STRUCT
		State       : STRING[32];
		Substate    : STRING[64];
		LineRunning : BOOL;
		AnyFault    : BOOL;
		Conveyor    : ConveyorHmiData;
		Heater      : HeaterHmiData;
		Robot       : RobotHmiData;
		Commands    : MachineCommandsType;
	END_STRUCT;

END_TYPE
