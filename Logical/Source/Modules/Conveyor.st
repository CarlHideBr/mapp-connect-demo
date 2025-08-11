
PROGRAM _INIT
	(* Initialization for Conveyor module *)
END_PROGRAM

PROGRAM _CYCLIC
	(* Not used for module; logic in Function Block *)
END_PROGRAM

FUNCTION_BLOCK FB_Conveyor
	VAR
		Hmi : ConveyorHmiData; (* Variables to expose on HMI *)
		cnt : UDINT;
		up : BOOL := TRUE;
	END_VAR

	(* Simple simulation: ramp speed 0..2 m/s and load 0..100%, toggle running, increment parts *)
	IF up THEN
		Hmi.Speed := Hmi.Speed + 0.02;
		Hmi.Load := Hmi.Load + 1.0;
		IF Hmi.Speed >= 2.0 THEN up := FALSE; END_IF;
	ELSE
		Hmi.Speed := Hmi.Speed - 0.02;
		Hmi.Load := Hmi.Load - 1.0;
		IF Hmi.Speed <= 0.0 THEN up := TRUE; END_IF;
	END_IF;
	IF Hmi.Load < 0.0 THEN Hmi.Load := 0.0; END_IF;
	IF Hmi.Load > 100.0 THEN Hmi.Load := 100.0; END_IF;

	Hmi.Running := TRUE;
	Hmi.Mode := 'AUTO';
	cnt := cnt + 1;
	IF (cnt MOD 50) = 0 THEN
		Hmi.PartsCount := Hmi.PartsCount + 1;
	END_IF;
	Hmi.Fault := FALSE;
	(* Reflect into global interface *)
	gConveyor.Status.Running := Hmi.Running;
	gConveyor.Status.Fault := Hmi.Fault;
	gConveyor.Status.Speed_mps := Hmi.Speed;
	gConveyor.Status.Load_pct := Hmi.Load;
	gConveyor.Status.PartsCount := Hmi.PartsCount;
	gConveyor.Status.Mode := Hmi.Mode;
END_FUNCTION_BLOCK
