
PROGRAM _INIT
	(* Initialization for Heater module *)
END_PROGRAM

PROGRAM _CYCLIC
	(* Not used for module; logic in Function Block *)
END_PROGRAM

FUNCTION_BLOCK FB_Heater
	VAR
		Hmi : HeaterHmiData; (* Variables to expose on HMI *)
		up : BOOL := TRUE;
	END_VAR

	(* Simple simulation: oscillate temperature around setpoint and power percent *)
	IF Hmi.Setpoint = 0.0 THEN Hmi.Setpoint := 180.0; END_IF;
	IF up THEN
		Hmi.Temperature := Hmi.Temperature + 0.5;
		IF Hmi.Temperature >= Hmi.Setpoint + 5.0 THEN up := FALSE; END_IF;
	ELSE
		Hmi.Temperature := Hmi.Temperature - 0.5;
		IF Hmi.Temperature <= Hmi.Setpoint - 5.0 THEN up := TRUE; END_IF;
	END_IF;
	Hmi.Heating := Hmi.Temperature < Hmi.Setpoint;
	IF Hmi.Heating THEN
		Hmi.PowerPercent := 60.0;
	ELSE
		Hmi.PowerPercent := 10.0;
	END_IF;
	Hmi.Fault := FALSE;
	(* Reflect into global interface *)
	gHeater.Status.Heating := Hmi.Heating;
	gHeater.Status.Fault := Hmi.Fault;
	gHeater.Status.TemperatureC := Hmi.Temperature;
	gHeater.Status.Power_pct := Hmi.PowerPercent;
	IF Hmi.Setpoint <> 0.0 THEN gHeater.Par.Setpoint_C := Hmi.Setpoint; END_IF;
END_FUNCTION_BLOCK
