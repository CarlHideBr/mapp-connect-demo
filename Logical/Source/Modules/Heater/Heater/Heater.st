PROGRAM _INIT
	IF gHeater.Par.Setpoint_C = 0.0 THEN gHeater.Par.Setpoint_C := 180.0; END_IF;
END_PROGRAM

PROGRAM _CYCLIC
	(* Oscillate temperature around setpoint and compute power *)
	IF heaterUp THEN
		gHeater.Status.TemperatureC := gHeater.Status.TemperatureC + 0.5;
		IF gHeater.Status.TemperatureC >= gHeater.Par.Setpoint_C + 5.0 THEN heaterUp := FALSE; END_IF;
	ELSE
		gHeater.Status.TemperatureC := gHeater.Status.TemperatureC - 0.5;
		IF gHeater.Status.TemperatureC <= gHeater.Par.Setpoint_C - 5.0 THEN heaterUp := TRUE; END_IF;
	END_IF;
	gHeater.Status.Heating := gHeater.Status.TemperatureC < gHeater.Par.Setpoint_C;
	IF gHeater.Status.Heating THEN
		gHeater.Status.Power_pct := 60.0;
	ELSE
		gHeater.Status.Power_pct := 10.0;
	END_IF;
	gHeater.Status.Fault := FALSE;
END_PROGRAM

PROGRAM _EXIT
END_PROGRAM
