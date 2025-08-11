<?xml version="1.0" encoding="utf-8"?>
<?AutomationStudio FileVersion="4.9"?>
<SwConfiguration CpuAddress="" xmlns="http://br-automation.co.at/AS/SwConfiguration">
  <TaskClass Name="Cyclic#1">
    <Task Name="method" Source="Method.method.prg" Memory="UserROM" Language="ANSIC" Debugging="true" />
  </TaskClass>
  <TaskClass Name="Cyclic#2" />
  <TaskClass Name="Cyclic#3" />
  <TaskClass Name="Cyclic#4">
    <Task Name="mco" Source="mco.prg" Memory="UserROM" Language="ANSIC" Debugging="true" />
    <Task Name="Main" Source="Source.Main.prg" Memory="UserROM" Language="IEC" Debugging="true" />
  <Task Name="Conveyor" Source="Source.Modules.Conveyor.Conveyor.prg" Memory="UserROM" Language="IEC" Debugging="true" />
  <Task Name="Heater" Source="Source.Modules.Heater.Heater.prg" Memory="UserROM" Language="IEC" Debugging="true" />
  <Task Name="Robot" Source="Source.Modules.Robot.Robot.prg" Memory="UserROM" Language="IEC" Debugging="true" />
    <Task Name="AlarmHandl" Source="Source.Services.AlarmHandler.AlarmHandler.prg" Memory="UserROM" Language="IEC" Debugging="true" />
  </TaskClass>
  <Libraries>
    <LibraryObject Name="CoTrace" Source="Libraries.CoTrace.lby" Memory="UserROM" Language="Binary" Debugging="true" />
    <LibraryObject Name="runtime" Source="Libraries.runtime.lby" Memory="UserROM" Language="Binary" Debugging="true" />
    <LibraryObject Name="AsZip" Source="Libraries.AsZip.lby" Memory="UserROM" Language="Binary" Debugging="true" />
    <LibraryObject Name="FileIO" Source="Libraries.FileIO.lby" Memory="UserROM" Language="Binary" Debugging="true" />
    <LibraryObject Name="AsOpcUac" Source="Libraries.AsOpcUac.lby" Memory="UserROM" Language="Binary" Debugging="true" />
    <LibraryObject Name="AsOpcUas" Source="Libraries.AsOpcUas.lby" Memory="UserROM" Language="Binary" Debugging="true" />
  </Libraries>
</SwConfiguration>