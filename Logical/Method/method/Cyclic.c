
#include <bur/plctypes.h>

#ifdef _DEFAULT_INCLUDES
	#include <AsDefault.h>
#endif

#include <string.h>

void _CYCLIC ProgramCyclic(void)
{
	switch(state)
	{
		case WaitForCall:
			UaSrv_MethodOperate_0.Action = UaMoa_CheckIsCalled;
			UaSrv_MethodOperate(&UaSrv_MethodOperate_0);
			UaSrv_MethodOperate_0.Execute = !UaSrv_MethodOperate_0.Busy;
			if (UaSrv_MethodOperate_0.Done && UaSrv_MethodOperate_0.IsCalled) 
			{
				state = ExecuteMethod;
			}
			if (UaSrv_MethodOperate_0.Error)
			{
				state = Error;
			}
			break;
		
		case ExecuteMethod:
			methodCalled = 1;
			output1 = input1 + input2;
			state = FinishMethod;
			UaSrv_MethodOperate_0.Execute = 1;
			break;
		
		case FinishMethod:
			UaSrv_MethodOperate_0.Action = UaMoa_Finished;
			UaSrv_MethodOperate(&UaSrv_MethodOperate_0);
			UaSrv_MethodOperate_0.Execute = !UaSrv_MethodOperate_0.Busy;
			if (UaSrv_MethodOperate_0.Done)
			{
				state = WaitForCall;
			}
			if (UaSrv_MethodOperate_0.Error)
			{
				state = Error;
			}
			break;
		
		case Error:
			break;
		
		default:
			state = Error;
	}
}
