(* Moved to Modules/Robot/Robot/Robot.st — not used. Keep for reference only. *)

PROGRAM _INIT
	(* Initialize to a known state *)
	gRobot.Status.State := 'Homing';
	gRobot.Status.Auto := FALSE;
	gRobot.Status.X := 0.0; gRobot.Status.Y := 0.0; gRobot.Status.Z := 0.0;
	robotStep := 1;
END_PROGRAM

PROGRAM _CYCLIC
	(* Simple motion pattern and state machine *)
	CASE robotStep OF
		1: gRobot.Status.State := 'Auto'; gRobot.Status.Auto := TRUE; gRobot.Status.X := gRobot.Status.X + 1.0; IF gRobot.Status.X >= 100.0 THEN robotStep := 2; END_IF;
		2: gRobot.Status.Y := gRobot.Status.Y + 1.0; IF gRobot.Status.Y >= 50.0 THEN robotStep := 3; END_IF;
		3: gRobot.Status.X := gRobot.Status.X - 1.0; IF gRobot.Status.X <= 0.0 THEN robotStep := 4; END_IF;
		4: gRobot.Status.Y := gRobot.Status.Y - 1.0; IF gRobot.Status.Y <= 0.0 THEN robotStep := 1; END_IF;
	END_CASE;
	gRobot.Status.Fault := FALSE;
END_PROGRAM

PROGRAM _EXIT
END_PROGRAM
