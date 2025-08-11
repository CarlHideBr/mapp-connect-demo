
PROGRAM _INIT
	(* Initialization for Robot module *)
END_PROGRAM

PROGRAM _CYCLIC
	(* Not used for module; logic in Function Block *)
END_PROGRAM

FUNCTION_BLOCK FB_Robot
	VAR
		Hmi : RobotHmiData; (* Variables to expose on HMI *)
		step : INT;
	END_VAR

	(* Simple simulation: move in a square path and cycle through states *)
	CASE step OF
		0: Hmi.State := 'Homing'; Hmi.Auto := FALSE; Hmi.X := 0.0; Hmi.Y := 0.0; Hmi.Z := 0.0; step := 1;
		1: Hmi.State := 'Auto'; Hmi.Auto := TRUE; Hmi.X := Hmi.X + 1.0; IF Hmi.X >= 100.0 THEN step := 2; END_IF;
		2: Hmi.Y := Hmi.Y + 1.0; IF Hmi.Y >= 50.0 THEN step := 3; END_IF;
		3: Hmi.X := Hmi.X - 1.0; IF Hmi.X <= 0.0 THEN step := 4; END_IF;
		4: Hmi.Y := Hmi.Y - 1.0; IF Hmi.Y <= 0.0 THEN step := 1; END_IF;
	END_CASE;
	Hmi.Fault := FALSE;
	(* Reflect into global interface *)
	gRobot.Status.Auto := Hmi.Auto;
	gRobot.Status.Fault := Hmi.Fault;
	gRobot.Status.X := Hmi.X;
	gRobot.Status.Y := Hmi.Y;
	gRobot.Status.Z := Hmi.Z;
	gRobot.Status.State := Hmi.State;
END_FUNCTION_BLOCK
