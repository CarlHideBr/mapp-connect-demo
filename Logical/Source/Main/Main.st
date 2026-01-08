
PROGRAM _INIT
	(* Insert code here *)
	(* Initialize defaults *)
	MachineHmi.LineRunning := FALSE;
	MachineHmi.State := 'Idle';
	MachineHmi.Substate := '';
	runRequest := FALSE;
	(* Initialize main interface status *)
	gMain.Status.State := 'Idle';
	gMain.Status.Substate := '';
	gMain.Status.LineRunning := FALSE;
	gMain.Status.AnyFault := FALSE;
END_PROGRAM

PROGRAM _CYCLIC
	(* Pull conveyor status from its program interface *)
	MachineHmi.Conveyor.Running := gConveyor.Status.Running;
	MachineHmi.Conveyor.Fault := gConveyor.Status.Fault;
	MachineHmi.Conveyor.Speed := gConveyor.Status.Speed_mps;
	MachineHmi.Conveyor.Load := gConveyor.Status.Load_pct;
	MachineHmi.Conveyor.PartsCount := gConveyor.Status.PartsCount;
	MachineHmi.Conveyor.Mode := gConveyor.Status.Mode;

	(* Heater status from module interface *)
	MachineHmi.Heater.Heating := gHeater.Status.Heating;
	MachineHmi.Heater.Fault := gHeater.Status.Fault;
	MachineHmi.Heater.Temperature := gHeater.Status.TemperatureC;
	MachineHmi.Heater.PowerPercent := gHeater.Status.Power_pct;
	IF gHeater.Par.Setpoint_C <> 0.0 THEN MachineHmi.Heater.Setpoint := gHeater.Par.Setpoint_C; END_IF;

	(* Robot status from module interface *)
	MachineHmi.Robot.Auto := gRobot.Status.Auto;
	MachineHmi.Robot.Fault := gRobot.Status.Fault;
	MachineHmi.Robot.X := gRobot.Status.X;
	MachineHmi.Robot.Y := gRobot.Status.Y;
	MachineHmi.Robot.Z := gRobot.Status.Z;
	MachineHmi.Robot.State := gRobot.Status.State;

	(* Aggregate HMI level flags *)
	MachineHmi.AnyFault := MachineHmi.Conveyor.Fault OR MachineHmi.Heater.Fault OR MachineHmi.Robot.Fault;
	MachineHmi.LineRunning := runRequest AND NOT MachineHmi.AnyFault;
	MachineHmi.RunRequest := runRequest;

	(* Interfaces already mapped above *)

	(* Determine State/Substate *)
	IF MachineHmi.AnyFault THEN
		MachineHmi.State := 'Fault';
		MachineHmi.Substate := 'Check modules';
	ELSIF runRequest THEN
		MachineHmi.State := 'Auto';
		IF NOT gConveyor.Status.Running THEN
			MachineHmi.Substate := 'Starting conveyor';
		ELSIF NOT gRobot.Status.Auto THEN
			MachineHmi.Substate := 'Starting robot';
		ELSE
			MachineHmi.Substate := 'Production';
		END_IF;
	ELSE
		MachineHmi.State := 'Idle';
		MachineHmi.Substate := 'Waiting for start';
	END_IF;

	(* Process Commands from HMI *)
	IF MachineHmi.Commands.Start THEN
		runRequest := TRUE;
	END_IF;
	IF MachineHmi.Commands.Stop THEN
		runRequest := FALSE;
	END_IF;
	(* auto-clear command bits to behave as pulses *)
	MachineHmi.Commands.Start := FALSE;
	MachineHmi.Commands.Stop := FALSE;

	(* Update global main interface *)
	gMain.Status.State := MachineHmi.State;
	gMain.Status.Substate := MachineHmi.Substate;
	gMain.Status.LineRunning := MachineHmi.LineRunning;
	gMain.Status.AnyFault := MachineHmi.AnyFault;

	(* Accept commands via gMain as well *)
	IF gMain.Cmd.Start THEN runRequest := TRUE; END_IF;
	IF gMain.Cmd.Stop THEN runRequest := FALSE; END_IF;
	gMain.Cmd.Start := FALSE;
	gMain.Cmd.Stop := FALSE;
END_PROGRAM

PROGRAM _EXIT
	(* Insert code here *)
	 
END_PROGRAM

