#define ICALL_TABLE_corlib 1

static int corlib_icall_indexes [] = {
191,
199,
200,
201,
202,
203,
204,
205,
207,
208,
255,
256,
257,
281,
282,
283,
294,
295,
296,
297,
414,
415,
416,
419,
450,
451,
453,
455,
457,
459,
464,
472,
473,
474,
475,
476,
477,
478,
479,
480,
560,
561,
613,
619,
622,
624,
629,
630,
632,
633,
637,
638,
640,
642,
643,
646,
647,
648,
651,
654,
656,
658,
667,
726,
728,
730,
740,
741,
742,
744,
750,
751,
752,
753,
754,
762,
763,
764,
768,
769,
771,
773,
959,
1110,
1111,
6646,
6647,
6649,
6650,
6651,
6652,
6653,
6655,
6657,
6659,
6667,
6669,
6674,
6676,
6678,
6680,
6731,
6732,
6734,
6735,
6736,
6737,
6738,
6740,
6742,
7611,
7615,
7617,
7618,
7619,
7620,
7814,
7815,
7816,
7817,
7833,
7834,
7835,
7837,
7878,
7937,
7939,
7948,
7949,
7950,
7951,
8326,
8330,
8331,
8357,
8374,
8381,
8388,
8399,
8402,
8422,
8493,
8495,
8504,
8506,
8507,
8514,
8528,
8548,
8549,
8557,
8559,
8566,
8567,
8570,
8572,
8577,
8583,
8584,
8591,
8593,
8605,
8608,
8609,
8610,
8621,
8630,
8636,
8637,
8638,
8640,
8641,
8658,
8660,
8674,
8691,
8718,
8743,
8744,
9161,
9244,
9245,
9389,
9390,
9394,
9397,
9459,
9815,
9816,
10032,
10042,
10590,
10611,
10613,
10615,
};
void ves_icall_System_Array_InternalCreate (int,int,int,int,int);
int ves_icall_System_Array_GetCorElementTypeOfElementTypeInternal (int);
int ves_icall_System_Array_CanChangePrimitive (int,int,int);
int ves_icall_System_Array_FastCopy (int,int,int,int,int);
int ves_icall_System_Array_GetLengthInternal_raw (int,int,int);
int ves_icall_System_Array_GetLowerBoundInternal_raw (int,int,int);
void ves_icall_System_Array_GetGenericValue_icall (int,int,int);
void ves_icall_System_Array_GetValueImpl_raw (int,int,int,int);
void ves_icall_System_Array_SetValueImpl_raw (int,int,int,int);
void ves_icall_System_Array_SetValueRelaxedImpl_raw (int,int,int,int);
void ves_icall_System_Runtime_RuntimeImports_ZeroMemory (int,int);
void ves_icall_System_Runtime_RuntimeImports_Memmove (int,int,int);
void ves_icall_System_Buffer_BulkMoveWithWriteBarrier (int,int,int,int);
int ves_icall_System_Delegate_AllocDelegateLike_internal_raw (int,int);
int ves_icall_System_Delegate_CreateDelegate_internal_raw (int,int,int,int,int);
int ves_icall_System_Delegate_GetVirtualMethod_internal_raw (int,int);
void ves_icall_System_Enum_GetEnumValuesAndNames_raw (int,int,int,int);
void ves_icall_System_Enum_InternalBoxEnum_raw (int,int,int64_t,int);
int ves_icall_System_Enum_InternalGetCorElementType (int);
void ves_icall_System_Enum_InternalGetUnderlyingType_raw (int,int,int);
int ves_icall_System_Environment_get_ProcessorCount ();
int ves_icall_System_Environment_get_TickCount ();
int64_t ves_icall_System_Environment_get_TickCount64 ();
void ves_icall_System_Environment_FailFast_raw (int,int,int,int);
void ves_icall_System_GC_register_ephemeron_array_raw (int,int);
int ves_icall_System_GC_get_ephemeron_tombstone_raw (int);
void ves_icall_System_GC_SuppressFinalize_raw (int,int);
void ves_icall_System_GC_ReRegisterForFinalize_raw (int,int);
void ves_icall_System_GC_GetGCMemoryInfo (int,int,int,int,int,int);
int ves_icall_System_GC_AllocPinnedArray_raw (int,int,int);
int ves_icall_System_Object_MemberwiseClone_raw (int,int);
double ves_icall_System_Math_Ceiling (double);
double ves_icall_System_Math_Cos (double);
double ves_icall_System_Math_Floor (double);
double ves_icall_System_Math_Log10 (double);
double ves_icall_System_Math_Pow (double,double);
double ves_icall_System_Math_Sin (double);
double ves_icall_System_Math_Sqrt (double);
double ves_icall_System_Math_Tan (double);
double ves_icall_System_Math_ModF (double,int);
void ves_icall_RuntimeMethodHandle_ReboxFromNullable_raw (int,int,int);
void ves_icall_RuntimeMethodHandle_ReboxToNullable_raw (int,int,int,int);
int ves_icall_RuntimeType_GetCorrespondingInflatedMethod_raw (int,int,int);
void ves_icall_RuntimeType_make_array_type_raw (int,int,int,int);
void ves_icall_RuntimeType_make_byref_type_raw (int,int,int);
void ves_icall_RuntimeType_make_pointer_type_raw (int,int,int);
void ves_icall_RuntimeType_MakeGenericType_raw (int,int,int,int);
int ves_icall_RuntimeType_GetMethodsByName_native_raw (int,int,int,int,int);
int ves_icall_RuntimeType_GetPropertiesByName_native_raw (int,int,int,int,int);
int ves_icall_RuntimeType_GetConstructors_native_raw (int,int,int);
int ves_icall_System_RuntimeType_CreateInstanceInternal_raw (int,int);
void ves_icall_System_RuntimeType_AllocateValueType_raw (int,int,int,int);
void ves_icall_RuntimeType_GetDeclaringMethod_raw (int,int,int);
void ves_icall_System_RuntimeType_getFullName_raw (int,int,int,int,int);
void ves_icall_RuntimeType_GetGenericArgumentsInternal_raw (int,int,int,int);
int ves_icall_RuntimeType_GetGenericParameterPosition (int);
int ves_icall_RuntimeType_GetEvents_native_raw (int,int,int,int);
int ves_icall_RuntimeType_GetFields_native_raw (int,int,int,int,int);
void ves_icall_RuntimeType_GetInterfaces_raw (int,int,int);
void ves_icall_RuntimeType_GetDeclaringType_raw (int,int,int);
void ves_icall_RuntimeType_GetName_raw (int,int,int);
void ves_icall_RuntimeType_GetNamespace_raw (int,int,int);
int ves_icall_RuntimeType_FunctionPointerReturnAndParameterTypes_raw (int,int);
int ves_icall_RuntimeTypeHandle_GetAttributes (int);
int ves_icall_RuntimeTypeHandle_GetMetadataToken_raw (int,int);
void ves_icall_RuntimeTypeHandle_GetGenericTypeDefinition_impl_raw (int,int,int);
int ves_icall_RuntimeTypeHandle_GetCorElementType (int);
int ves_icall_RuntimeTypeHandle_HasInstantiation (int);
int ves_icall_RuntimeTypeHandle_IsInstanceOfType_raw (int,int,int);
int ves_icall_RuntimeTypeHandle_HasReferences_raw (int,int);
int ves_icall_RuntimeTypeHandle_GetArrayRank_raw (int,int);
void ves_icall_RuntimeTypeHandle_GetAssembly_raw (int,int,int);
void ves_icall_RuntimeTypeHandle_GetElementType_raw (int,int,int);
void ves_icall_RuntimeTypeHandle_GetModule_raw (int,int,int);
void ves_icall_RuntimeTypeHandle_GetBaseType_raw (int,int,int);
int ves_icall_RuntimeTypeHandle_type_is_assignable_from_raw (int,int,int);
int ves_icall_RuntimeTypeHandle_IsGenericTypeDefinition (int);
int ves_icall_RuntimeTypeHandle_GetGenericParameterInfo_raw (int,int);
int ves_icall_RuntimeTypeHandle_is_subclass_of_raw (int,int,int);
int ves_icall_RuntimeTypeHandle_IsByRefLike_raw (int,int);
void ves_icall_System_RuntimeTypeHandle_internal_from_name_raw (int,int,int,int,int,int);
int ves_icall_System_String_FastAllocateString_raw (int,int);
int ves_icall_System_Type_internal_from_handle_raw (int,int);
int ves_icall_System_ValueType_InternalGetHashCode_raw (int,int,int);
int ves_icall_System_ValueType_Equals_raw (int,int,int,int);
int ves_icall_System_Threading_Interlocked_CompareExchange_Int (int,int,int);
void ves_icall_System_Threading_Interlocked_CompareExchange_Object (int,int,int,int);
int ves_icall_System_Threading_Interlocked_Decrement_Int (int);
int ves_icall_System_Threading_Interlocked_Increment_Int (int);
int64_t ves_icall_System_Threading_Interlocked_Increment_Long (int);
int ves_icall_System_Threading_Interlocked_Exchange_Int (int,int);
void ves_icall_System_Threading_Interlocked_Exchange_Object (int,int,int);
int64_t ves_icall_System_Threading_Interlocked_CompareExchange_Long (int,int64_t,int64_t);
int64_t ves_icall_System_Threading_Interlocked_Exchange_Long (int,int64_t);
int ves_icall_System_Threading_Interlocked_Add_Int (int,int);
void ves_icall_System_Threading_Monitor_Monitor_Enter_raw (int,int);
void mono_monitor_exit_icall_raw (int,int);
void ves_icall_System_Threading_Monitor_Monitor_pulse_raw (int,int);
void ves_icall_System_Threading_Monitor_Monitor_pulse_all_raw (int,int);
int ves_icall_System_Threading_Monitor_Monitor_wait_raw (int,int,int,int);
void ves_icall_System_Threading_Monitor_Monitor_try_enter_with_atomic_var_raw (int,int,int,int,int);
void ves_icall_System_Threading_Thread_InitInternal_raw (int,int);
int ves_icall_System_Threading_Thread_GetCurrentThread ();
void ves_icall_System_Threading_InternalThread_Thread_free_internal_raw (int,int);
int ves_icall_System_Threading_Thread_GetState_raw (int,int);
void ves_icall_System_Threading_Thread_SetState_raw (int,int,int);
void ves_icall_System_Threading_Thread_ClrState_raw (int,int,int);
void ves_icall_System_Threading_Thread_SetName_icall_raw (int,int,int,int);
int ves_icall_System_Threading_Thread_YieldInternal ();
void ves_icall_System_Threading_Thread_SetPriority_raw (int,int,int);
void ves_icall_System_Runtime_Loader_AssemblyLoadContext_PrepareForAssemblyLoadContextRelease_raw (int,int,int);
int ves_icall_System_Runtime_Loader_AssemblyLoadContext_GetLoadContextForAssembly_raw (int,int);
int ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalLoadFile_raw (int,int,int,int);
int ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalInitializeNativeALC_raw (int,int,int,int,int);
int ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalLoadFromStream_raw (int,int,int,int,int,int);
int ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalGetLoadedAssemblies_raw (int);
int ves_icall_System_GCHandle_InternalAlloc_raw (int,int,int);
void ves_icall_System_GCHandle_InternalFree_raw (int,int);
int ves_icall_System_GCHandle_InternalGet_raw (int,int);
void ves_icall_System_GCHandle_InternalSet_raw (int,int,int);
int ves_icall_System_Runtime_InteropServices_Marshal_GetLastPInvokeError ();
void ves_icall_System_Runtime_InteropServices_Marshal_SetLastPInvokeError (int);
void ves_icall_System_Runtime_InteropServices_Marshal_StructureToPtr_raw (int,int,int,int);
int ves_icall_System_Runtime_InteropServices_Marshal_SizeOfHelper_raw (int,int,int);
int ves_icall_System_Runtime_InteropServices_NativeLibrary_LoadByName_raw (int,int,int,int,int,int);
int ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_InternalGetHashCode_raw (int,int);
int ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_InternalTryGetHashCode_raw (int,int);
int ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_GetUninitializedObjectInternal_raw (int,int);
void ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_InitializeArray_raw (int,int,int);
int ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_GetSpanDataFrom_raw (int,int,int,int);
int ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_SufficientExecutionStack ();
int ves_icall_System_Reflection_Assembly_GetEntryAssembly_raw (int);
int ves_icall_System_Reflection_Assembly_InternalLoad_raw (int,int,int,int);
int ves_icall_System_Reflection_Assembly_InternalGetType_raw (int,int,int,int,int,int);
int ves_icall_System_Reflection_AssemblyName_GetNativeName (int);
int ves_icall_MonoCustomAttrs_GetCustomAttributesInternal_raw (int,int,int,int);
int ves_icall_MonoCustomAttrs_GetCustomAttributesDataInternal_raw (int,int);
int ves_icall_MonoCustomAttrs_IsDefinedInternal_raw (int,int,int);
int ves_icall_System_Reflection_FieldInfo_internal_from_handle_type_raw (int,int,int);
int ves_icall_System_Reflection_FieldInfo_get_marshal_info_raw (int,int);
int ves_icall_System_Reflection_LoaderAllocatorScout_Destroy (int);
void ves_icall_System_Reflection_RuntimeAssembly_GetManifestResourceNames_raw (int,int,int);
void ves_icall_System_Reflection_RuntimeAssembly_GetExportedTypes_raw (int,int,int);
void ves_icall_System_Reflection_RuntimeAssembly_GetInfo_raw (int,int,int,int);
int ves_icall_System_Reflection_RuntimeAssembly_GetManifestResourceInternal_raw (int,int,int,int,int);
void ves_icall_System_Reflection_Assembly_GetManifestModuleInternal_raw (int,int,int);
void ves_icall_System_Reflection_RuntimeCustomAttributeData_ResolveArgumentsInternal_raw (int,int,int,int,int,int,int);
void ves_icall_RuntimeEventInfo_get_event_info_raw (int,int,int);
int ves_icall_reflection_get_token_raw (int,int);
int ves_icall_System_Reflection_EventInfo_internal_from_handle_type_raw (int,int,int);
int ves_icall_RuntimeFieldInfo_ResolveType_raw (int,int);
int ves_icall_RuntimeFieldInfo_GetParentType_raw (int,int,int);
int ves_icall_RuntimeFieldInfo_GetFieldOffset_raw (int,int);
int ves_icall_RuntimeFieldInfo_GetValueInternal_raw (int,int,int);
void ves_icall_RuntimeFieldInfo_SetValueInternal_raw (int,int,int,int);
int ves_icall_RuntimeFieldInfo_GetRawConstantValue_raw (int,int);
int ves_icall_reflection_get_token_raw (int,int);
void ves_icall_get_method_info_raw (int,int,int);
int ves_icall_get_method_attributes (int);
int ves_icall_System_Reflection_MonoMethodInfo_get_parameter_info_raw (int,int,int);
int ves_icall_System_MonoMethodInfo_get_retval_marshal_raw (int,int);
int ves_icall_System_Reflection_RuntimeMethodInfo_GetMethodFromHandleInternalType_native_raw (int,int,int,int);
int ves_icall_RuntimeMethodInfo_get_name_raw (int,int);
int ves_icall_RuntimeMethodInfo_get_base_method_raw (int,int,int);
int ves_icall_reflection_get_token_raw (int,int);
int ves_icall_InternalInvoke_raw (int,int,int,int,int);
void ves_icall_RuntimeMethodInfo_GetPInvoke_raw (int,int,int,int,int);
int ves_icall_RuntimeMethodInfo_MakeGenericMethod_impl_raw (int,int,int);
int ves_icall_RuntimeMethodInfo_GetGenericArguments_raw (int,int);
int ves_icall_RuntimeMethodInfo_GetGenericMethodDefinition_raw (int,int);
int ves_icall_RuntimeMethodInfo_get_IsGenericMethodDefinition_raw (int,int);
int ves_icall_RuntimeMethodInfo_get_IsGenericMethod_raw (int,int);
void ves_icall_InvokeClassConstructor_raw (int,int);
int ves_icall_InternalInvoke_raw (int,int,int,int,int);
int ves_icall_reflection_get_token_raw (int,int);
int ves_icall_System_Reflection_RuntimeModule_ResolveMethodToken_raw (int,int,int,int,int,int);
void ves_icall_RuntimePropertyInfo_get_property_info_raw (int,int,int,int);
int ves_icall_reflection_get_token_raw (int,int);
int ves_icall_System_Reflection_RuntimePropertyInfo_internal_from_handle_type_raw (int,int,int);
void ves_icall_DynamicMethod_create_dynamic_method_raw (int,int,int,int,int);
void ves_icall_AssemblyBuilder_basic_init_raw (int,int);
void ves_icall_AssemblyBuilder_UpdateNativeCustomAttributes_raw (int,int);
void ves_icall_ModuleBuilder_basic_init_raw (int,int);
void ves_icall_ModuleBuilder_set_wrappers_type_raw (int,int,int);
int ves_icall_ModuleBuilder_getToken_raw (int,int,int,int);
void ves_icall_ModuleBuilder_RegisterToken_raw (int,int,int,int);
int ves_icall_TypeBuilder_create_runtime_class_raw (int,int);
int ves_icall_System_IO_Stream_HasOverriddenBeginEndRead_raw (int,int);
int ves_icall_System_IO_Stream_HasOverriddenBeginEndWrite_raw (int,int);
int ves_icall_System_Diagnostics_StackFrame_GetFrameInfo (int,int,int,int,int,int,int,int);
void ves_icall_System_Diagnostics_StackTrace_GetTrace (int,int,int,int);
int ves_icall_Mono_RuntimeClassHandle_GetTypeFromClass (int);
void ves_icall_Mono_RuntimeGPtrArrayHandle_GPtrArrayFree (int);
int ves_icall_Mono_SafeStringMarshal_StringToUtf8 (int);
void ves_icall_Mono_SafeStringMarshal_GFree (int);
static void *corlib_icall_funcs [] = {
// token 191,
ves_icall_System_Array_InternalCreate,
// token 199,
ves_icall_System_Array_GetCorElementTypeOfElementTypeInternal,
// token 200,
ves_icall_System_Array_CanChangePrimitive,
// token 201,
ves_icall_System_Array_FastCopy,
// token 202,
ves_icall_System_Array_GetLengthInternal_raw,
// token 203,
ves_icall_System_Array_GetLowerBoundInternal_raw,
// token 204,
ves_icall_System_Array_GetGenericValue_icall,
// token 205,
ves_icall_System_Array_GetValueImpl_raw,
// token 207,
ves_icall_System_Array_SetValueImpl_raw,
// token 208,
ves_icall_System_Array_SetValueRelaxedImpl_raw,
// token 255,
ves_icall_System_Runtime_RuntimeImports_ZeroMemory,
// token 256,
ves_icall_System_Runtime_RuntimeImports_Memmove,
// token 257,
ves_icall_System_Buffer_BulkMoveWithWriteBarrier,
// token 281,
ves_icall_System_Delegate_AllocDelegateLike_internal_raw,
// token 282,
ves_icall_System_Delegate_CreateDelegate_internal_raw,
// token 283,
ves_icall_System_Delegate_GetVirtualMethod_internal_raw,
// token 294,
ves_icall_System_Enum_GetEnumValuesAndNames_raw,
// token 295,
ves_icall_System_Enum_InternalBoxEnum_raw,
// token 296,
ves_icall_System_Enum_InternalGetCorElementType,
// token 297,
ves_icall_System_Enum_InternalGetUnderlyingType_raw,
// token 414,
ves_icall_System_Environment_get_ProcessorCount,
// token 415,
ves_icall_System_Environment_get_TickCount,
// token 416,
ves_icall_System_Environment_get_TickCount64,
// token 419,
ves_icall_System_Environment_FailFast_raw,
// token 450,
ves_icall_System_GC_register_ephemeron_array_raw,
// token 451,
ves_icall_System_GC_get_ephemeron_tombstone_raw,
// token 453,
ves_icall_System_GC_SuppressFinalize_raw,
// token 455,
ves_icall_System_GC_ReRegisterForFinalize_raw,
// token 457,
ves_icall_System_GC_GetGCMemoryInfo,
// token 459,
ves_icall_System_GC_AllocPinnedArray_raw,
// token 464,
ves_icall_System_Object_MemberwiseClone_raw,
// token 472,
ves_icall_System_Math_Ceiling,
// token 473,
ves_icall_System_Math_Cos,
// token 474,
ves_icall_System_Math_Floor,
// token 475,
ves_icall_System_Math_Log10,
// token 476,
ves_icall_System_Math_Pow,
// token 477,
ves_icall_System_Math_Sin,
// token 478,
ves_icall_System_Math_Sqrt,
// token 479,
ves_icall_System_Math_Tan,
// token 480,
ves_icall_System_Math_ModF,
// token 560,
ves_icall_RuntimeMethodHandle_ReboxFromNullable_raw,
// token 561,
ves_icall_RuntimeMethodHandle_ReboxToNullable_raw,
// token 613,
ves_icall_RuntimeType_GetCorrespondingInflatedMethod_raw,
// token 619,
ves_icall_RuntimeType_make_array_type_raw,
// token 622,
ves_icall_RuntimeType_make_byref_type_raw,
// token 624,
ves_icall_RuntimeType_make_pointer_type_raw,
// token 629,
ves_icall_RuntimeType_MakeGenericType_raw,
// token 630,
ves_icall_RuntimeType_GetMethodsByName_native_raw,
// token 632,
ves_icall_RuntimeType_GetPropertiesByName_native_raw,
// token 633,
ves_icall_RuntimeType_GetConstructors_native_raw,
// token 637,
ves_icall_System_RuntimeType_CreateInstanceInternal_raw,
// token 638,
ves_icall_System_RuntimeType_AllocateValueType_raw,
// token 640,
ves_icall_RuntimeType_GetDeclaringMethod_raw,
// token 642,
ves_icall_System_RuntimeType_getFullName_raw,
// token 643,
ves_icall_RuntimeType_GetGenericArgumentsInternal_raw,
// token 646,
ves_icall_RuntimeType_GetGenericParameterPosition,
// token 647,
ves_icall_RuntimeType_GetEvents_native_raw,
// token 648,
ves_icall_RuntimeType_GetFields_native_raw,
// token 651,
ves_icall_RuntimeType_GetInterfaces_raw,
// token 654,
ves_icall_RuntimeType_GetDeclaringType_raw,
// token 656,
ves_icall_RuntimeType_GetName_raw,
// token 658,
ves_icall_RuntimeType_GetNamespace_raw,
// token 667,
ves_icall_RuntimeType_FunctionPointerReturnAndParameterTypes_raw,
// token 726,
ves_icall_RuntimeTypeHandle_GetAttributes,
// token 728,
ves_icall_RuntimeTypeHandle_GetMetadataToken_raw,
// token 730,
ves_icall_RuntimeTypeHandle_GetGenericTypeDefinition_impl_raw,
// token 740,
ves_icall_RuntimeTypeHandle_GetCorElementType,
// token 741,
ves_icall_RuntimeTypeHandle_HasInstantiation,
// token 742,
ves_icall_RuntimeTypeHandle_IsInstanceOfType_raw,
// token 744,
ves_icall_RuntimeTypeHandle_HasReferences_raw,
// token 750,
ves_icall_RuntimeTypeHandle_GetArrayRank_raw,
// token 751,
ves_icall_RuntimeTypeHandle_GetAssembly_raw,
// token 752,
ves_icall_RuntimeTypeHandle_GetElementType_raw,
// token 753,
ves_icall_RuntimeTypeHandle_GetModule_raw,
// token 754,
ves_icall_RuntimeTypeHandle_GetBaseType_raw,
// token 762,
ves_icall_RuntimeTypeHandle_type_is_assignable_from_raw,
// token 763,
ves_icall_RuntimeTypeHandle_IsGenericTypeDefinition,
// token 764,
ves_icall_RuntimeTypeHandle_GetGenericParameterInfo_raw,
// token 768,
ves_icall_RuntimeTypeHandle_is_subclass_of_raw,
// token 769,
ves_icall_RuntimeTypeHandle_IsByRefLike_raw,
// token 771,
ves_icall_System_RuntimeTypeHandle_internal_from_name_raw,
// token 773,
ves_icall_System_String_FastAllocateString_raw,
// token 959,
ves_icall_System_Type_internal_from_handle_raw,
// token 1110,
ves_icall_System_ValueType_InternalGetHashCode_raw,
// token 1111,
ves_icall_System_ValueType_Equals_raw,
// token 6646,
ves_icall_System_Threading_Interlocked_CompareExchange_Int,
// token 6647,
ves_icall_System_Threading_Interlocked_CompareExchange_Object,
// token 6649,
ves_icall_System_Threading_Interlocked_Decrement_Int,
// token 6650,
ves_icall_System_Threading_Interlocked_Increment_Int,
// token 6651,
ves_icall_System_Threading_Interlocked_Increment_Long,
// token 6652,
ves_icall_System_Threading_Interlocked_Exchange_Int,
// token 6653,
ves_icall_System_Threading_Interlocked_Exchange_Object,
// token 6655,
ves_icall_System_Threading_Interlocked_CompareExchange_Long,
// token 6657,
ves_icall_System_Threading_Interlocked_Exchange_Long,
// token 6659,
ves_icall_System_Threading_Interlocked_Add_Int,
// token 6667,
ves_icall_System_Threading_Monitor_Monitor_Enter_raw,
// token 6669,
mono_monitor_exit_icall_raw,
// token 6674,
ves_icall_System_Threading_Monitor_Monitor_pulse_raw,
// token 6676,
ves_icall_System_Threading_Monitor_Monitor_pulse_all_raw,
// token 6678,
ves_icall_System_Threading_Monitor_Monitor_wait_raw,
// token 6680,
ves_icall_System_Threading_Monitor_Monitor_try_enter_with_atomic_var_raw,
// token 6731,
ves_icall_System_Threading_Thread_InitInternal_raw,
// token 6732,
ves_icall_System_Threading_Thread_GetCurrentThread,
// token 6734,
ves_icall_System_Threading_InternalThread_Thread_free_internal_raw,
// token 6735,
ves_icall_System_Threading_Thread_GetState_raw,
// token 6736,
ves_icall_System_Threading_Thread_SetState_raw,
// token 6737,
ves_icall_System_Threading_Thread_ClrState_raw,
// token 6738,
ves_icall_System_Threading_Thread_SetName_icall_raw,
// token 6740,
ves_icall_System_Threading_Thread_YieldInternal,
// token 6742,
ves_icall_System_Threading_Thread_SetPriority_raw,
// token 7611,
ves_icall_System_Runtime_Loader_AssemblyLoadContext_PrepareForAssemblyLoadContextRelease_raw,
// token 7615,
ves_icall_System_Runtime_Loader_AssemblyLoadContext_GetLoadContextForAssembly_raw,
// token 7617,
ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalLoadFile_raw,
// token 7618,
ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalInitializeNativeALC_raw,
// token 7619,
ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalLoadFromStream_raw,
// token 7620,
ves_icall_System_Runtime_Loader_AssemblyLoadContext_InternalGetLoadedAssemblies_raw,
// token 7814,
ves_icall_System_GCHandle_InternalAlloc_raw,
// token 7815,
ves_icall_System_GCHandle_InternalFree_raw,
// token 7816,
ves_icall_System_GCHandle_InternalGet_raw,
// token 7817,
ves_icall_System_GCHandle_InternalSet_raw,
// token 7833,
ves_icall_System_Runtime_InteropServices_Marshal_GetLastPInvokeError,
// token 7834,
ves_icall_System_Runtime_InteropServices_Marshal_SetLastPInvokeError,
// token 7835,
ves_icall_System_Runtime_InteropServices_Marshal_StructureToPtr_raw,
// token 7837,
ves_icall_System_Runtime_InteropServices_Marshal_SizeOfHelper_raw,
// token 7878,
ves_icall_System_Runtime_InteropServices_NativeLibrary_LoadByName_raw,
// token 7937,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_InternalGetHashCode_raw,
// token 7939,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_InternalTryGetHashCode_raw,
// token 7948,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_GetUninitializedObjectInternal_raw,
// token 7949,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_InitializeArray_raw,
// token 7950,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_GetSpanDataFrom_raw,
// token 7951,
ves_icall_System_Runtime_CompilerServices_RuntimeHelpers_SufficientExecutionStack,
// token 8326,
ves_icall_System_Reflection_Assembly_GetEntryAssembly_raw,
// token 8330,
ves_icall_System_Reflection_Assembly_InternalLoad_raw,
// token 8331,
ves_icall_System_Reflection_Assembly_InternalGetType_raw,
// token 8357,
ves_icall_System_Reflection_AssemblyName_GetNativeName,
// token 8374,
ves_icall_MonoCustomAttrs_GetCustomAttributesInternal_raw,
// token 8381,
ves_icall_MonoCustomAttrs_GetCustomAttributesDataInternal_raw,
// token 8388,
ves_icall_MonoCustomAttrs_IsDefinedInternal_raw,
// token 8399,
ves_icall_System_Reflection_FieldInfo_internal_from_handle_type_raw,
// token 8402,
ves_icall_System_Reflection_FieldInfo_get_marshal_info_raw,
// token 8422,
ves_icall_System_Reflection_LoaderAllocatorScout_Destroy,
// token 8493,
ves_icall_System_Reflection_RuntimeAssembly_GetManifestResourceNames_raw,
// token 8495,
ves_icall_System_Reflection_RuntimeAssembly_GetExportedTypes_raw,
// token 8504,
ves_icall_System_Reflection_RuntimeAssembly_GetInfo_raw,
// token 8506,
ves_icall_System_Reflection_RuntimeAssembly_GetManifestResourceInternal_raw,
// token 8507,
ves_icall_System_Reflection_Assembly_GetManifestModuleInternal_raw,
// token 8514,
ves_icall_System_Reflection_RuntimeCustomAttributeData_ResolveArgumentsInternal_raw,
// token 8528,
ves_icall_RuntimeEventInfo_get_event_info_raw,
// token 8548,
ves_icall_reflection_get_token_raw,
// token 8549,
ves_icall_System_Reflection_EventInfo_internal_from_handle_type_raw,
// token 8557,
ves_icall_RuntimeFieldInfo_ResolveType_raw,
// token 8559,
ves_icall_RuntimeFieldInfo_GetParentType_raw,
// token 8566,
ves_icall_RuntimeFieldInfo_GetFieldOffset_raw,
// token 8567,
ves_icall_RuntimeFieldInfo_GetValueInternal_raw,
// token 8570,
ves_icall_RuntimeFieldInfo_SetValueInternal_raw,
// token 8572,
ves_icall_RuntimeFieldInfo_GetRawConstantValue_raw,
// token 8577,
ves_icall_reflection_get_token_raw,
// token 8583,
ves_icall_get_method_info_raw,
// token 8584,
ves_icall_get_method_attributes,
// token 8591,
ves_icall_System_Reflection_MonoMethodInfo_get_parameter_info_raw,
// token 8593,
ves_icall_System_MonoMethodInfo_get_retval_marshal_raw,
// token 8605,
ves_icall_System_Reflection_RuntimeMethodInfo_GetMethodFromHandleInternalType_native_raw,
// token 8608,
ves_icall_RuntimeMethodInfo_get_name_raw,
// token 8609,
ves_icall_RuntimeMethodInfo_get_base_method_raw,
// token 8610,
ves_icall_reflection_get_token_raw,
// token 8621,
ves_icall_InternalInvoke_raw,
// token 8630,
ves_icall_RuntimeMethodInfo_GetPInvoke_raw,
// token 8636,
ves_icall_RuntimeMethodInfo_MakeGenericMethod_impl_raw,
// token 8637,
ves_icall_RuntimeMethodInfo_GetGenericArguments_raw,
// token 8638,
ves_icall_RuntimeMethodInfo_GetGenericMethodDefinition_raw,
// token 8640,
ves_icall_RuntimeMethodInfo_get_IsGenericMethodDefinition_raw,
// token 8641,
ves_icall_RuntimeMethodInfo_get_IsGenericMethod_raw,
// token 8658,
ves_icall_InvokeClassConstructor_raw,
// token 8660,
ves_icall_InternalInvoke_raw,
// token 8674,
ves_icall_reflection_get_token_raw,
// token 8691,
ves_icall_System_Reflection_RuntimeModule_ResolveMethodToken_raw,
// token 8718,
ves_icall_RuntimePropertyInfo_get_property_info_raw,
// token 8743,
ves_icall_reflection_get_token_raw,
// token 8744,
ves_icall_System_Reflection_RuntimePropertyInfo_internal_from_handle_type_raw,
// token 9161,
ves_icall_DynamicMethod_create_dynamic_method_raw,
// token 9244,
ves_icall_AssemblyBuilder_basic_init_raw,
// token 9245,
ves_icall_AssemblyBuilder_UpdateNativeCustomAttributes_raw,
// token 9389,
ves_icall_ModuleBuilder_basic_init_raw,
// token 9390,
ves_icall_ModuleBuilder_set_wrappers_type_raw,
// token 9394,
ves_icall_ModuleBuilder_getToken_raw,
// token 9397,
ves_icall_ModuleBuilder_RegisterToken_raw,
// token 9459,
ves_icall_TypeBuilder_create_runtime_class_raw,
// token 9815,
ves_icall_System_IO_Stream_HasOverriddenBeginEndRead_raw,
// token 9816,
ves_icall_System_IO_Stream_HasOverriddenBeginEndWrite_raw,
// token 10032,
ves_icall_System_Diagnostics_StackFrame_GetFrameInfo,
// token 10042,
ves_icall_System_Diagnostics_StackTrace_GetTrace,
// token 10590,
ves_icall_Mono_RuntimeClassHandle_GetTypeFromClass,
// token 10611,
ves_icall_Mono_RuntimeGPtrArrayHandle_GPtrArrayFree,
// token 10613,
ves_icall_Mono_SafeStringMarshal_StringToUtf8,
// token 10615,
ves_icall_Mono_SafeStringMarshal_GFree,
};
static uint8_t corlib_icall_flags [] = {
0,
0,
0,
0,
4,
4,
0,
4,
4,
4,
0,
0,
0,
4,
4,
4,
4,
4,
0,
4,
0,
0,
0,
4,
4,
4,
4,
4,
0,
4,
4,
0,
0,
0,
0,
0,
0,
0,
0,
0,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
0,
4,
4,
4,
4,
4,
4,
4,
0,
4,
4,
0,
0,
4,
4,
4,
4,
4,
4,
4,
4,
0,
4,
4,
4,
4,
4,
4,
4,
4,
0,
0,
0,
0,
0,
0,
0,
0,
0,
0,
4,
4,
4,
4,
4,
4,
4,
0,
4,
4,
4,
4,
4,
0,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
0,
0,
4,
4,
4,
4,
4,
4,
4,
4,
0,
4,
4,
4,
0,
4,
4,
4,
4,
4,
0,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
0,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
4,
0,
0,
0,
0,
0,
0,
};
