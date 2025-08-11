PROGRAM _INIT
	// Initialize counters
	gAlarmHandler.Status.ActiveCount := 0;
	gAlarmHandler.Status.UnackedCount := 0;
	gAlarmHandler.Status.HighestSeverity := 0;
	gAlarmHandler.Status.AnyActive := FALSE;
	gAlarmHandler.Status.AnyUnacked := FALSE;
	gAlarmHandler.Status.LogSize := 0;
END_PROGRAM

PROGRAM _CYCLIC
	// Demo-only core
	// In a real build, you would call mapp AlarmX FBs (MpAlarmXCore, MpAlarmXHistory) here.
	// We keep a small local ring buffer for HMI quick summaries.

	// Handle commands (edge tolerant simple reset)
	IF gAlarmHandler.Cmd.AckAll THEN
		// TODO: MpAlarmXAckAll() via appropriate FB call
		gAlarmHandler.Cmd.AckAll := FALSE;
	END_IF;
	IF gAlarmHandler.Cmd.ResetAll THEN
		// TODO: MpAlarmXResetAll()
		gAlarmHandler.Cmd.ResetAll := FALSE;
	END_IF;
	IF gAlarmHandler.Cmd.SilenceHorn THEN
		gAlarmHandler.Cmd.SilenceHorn := FALSE;
	END_IF;
	IF gAlarmHandler.Cmd.ShelveSelected THEN
		gAlarmHandler.Cmd.ShelveSelected := FALSE;
	END_IF;
	IF gAlarmHandler.Cmd.UnshelveAll THEN
		gAlarmHandler.Cmd.UnshelveAll := FALSE;
	END_IF;

	// Example: simulate a trivial status rollup (replace with MpAlarmXCore statistics)
	// Keep values as-is; HMI can still bind. Real counts come from mapp in production.

	// Optional: local log maintenance bounded by Par.MaxLocalLog
	IF gAlarmHandler.Par.EnableHistory THEN
		IF gAlarmHandler.Status.LogSize > gAlarmHandler.Par.MaxLocalLog THEN
			gAlarmHandler.Status.LogSize := gAlarmHandler.Par.MaxLocalLog;
		END_IF;
	END_IF;
END_PROGRAM

PROGRAM _EXIT
END_PROGRAM

