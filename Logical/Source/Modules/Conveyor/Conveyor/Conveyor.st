PROGRAM _INIT
	(* Initialize interface defaults if needed *)
	gConveyor.Status.Mode := 'AUTO';
END_PROGRAM

PROGRAM _CYCLIC
	(* Simple simulation: ramp speed 0..2 m/s and load 0..100%, toggle dir, increment parts *)
	IF convUp THEN
		gConveyor.Status.Speed_mps := gConveyor.Status.Speed_mps + 0.02;
		gConveyor.Status.Load_pct := gConveyor.Status.Load_pct + 1.0;
		IF gConveyor.Status.Speed_mps >= 2.0 THEN convUp := FALSE; END_IF;
	ELSE
		gConveyor.Status.Speed_mps := gConveyor.Status.Speed_mps - 0.02;
		gConveyor.Status.Load_pct := gConveyor.Status.Load_pct - 1.0;
		IF gConveyor.Status.Speed_mps <= 0.0 THEN convUp := TRUE; END_IF;
	END_IF;

	IF gConveyor.Status.Load_pct < 0.0 THEN gConveyor.Status.Load_pct := 0.0; END_IF;
	IF gConveyor.Status.Load_pct > 100.0 THEN gConveyor.Status.Load_pct := 100.0; END_IF;

	gConveyor.Status.Running := TRUE;
	convCnt := convCnt + 1;
	IF (convCnt MOD 50) = 0 THEN
		gConveyor.Status.PartsCount := gConveyor.Status.PartsCount + 1;
	END_IF;
	gConveyor.Status.Fault := FALSE;
END_PROGRAM

PROGRAM _EXIT
END_PROGRAM
