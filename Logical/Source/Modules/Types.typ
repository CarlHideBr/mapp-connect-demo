
TYPE
	ConveyorHmiData : STRUCT
		Running : BOOL;
		Fault : BOOL;
		Speed : REAL; (* m/s *)
		Load : REAL;  (* % *)
		PartsCount : DINT;
		Mode : STRING[32];
	END_STRUCT;

	HeaterHmiData : STRUCT
		Heating : BOOL;
		Fault : BOOL;
		Temperature : REAL; (* °C *)
		Setpoint : REAL;    (* °C *)
		PowerPercent : REAL; (* % *)
	END_STRUCT;

	RobotHmiData : STRUCT
		Auto : BOOL;
		Fault : BOOL;
		X : REAL;
		Y : REAL;
		Z : REAL;
		State : STRING[32];
	END_STRUCT;

	MachineHmiData : STRUCT
		Conveyor : ConveyorHmiData;
		Heater : HeaterHmiData;
		Robot : RobotHmiData;
		LineRunning : BOOL;
		AnyFault : BOOL;
		State : STRING[32];
		Substate : STRING[32];
		Commands : STRUCT
			Start : BOOL;
			Stop : BOOL;
		END_STRUCT;
	END_STRUCT;
END_TYPE
