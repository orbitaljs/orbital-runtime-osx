#include <node.h>
#include <v8.h>
#include <dlfcn.h>
#include <string.h>
#include <stdlib.h>
#include "darwin/jni.h"

using namespace v8;

static JavaVM* jvm = NULL;
static JNIEnv* env = NULL;

void LoadJvm(const v8::FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);
  String::Utf8Value value(args[0]->ToString());
  dlopen(*value, RTLD_LAZY);
}

void InitJvm(const v8::FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  JavaVMInitArgs vm_args = { 0, 0, 0, 0 };
  vm_args.version = JNI_VERSION_1_8;
  vm_args.nOptions = args.Length();
  JavaVMOption options[vm_args.nOptions];
  vm_args.options = &options[0];

  for (int i = 0; i < vm_args.nOptions; i++) {
  	options[i].extraInfo = NULL;
    String::Utf8Value value(args[i]->ToString());
    options[i].optionString = strdup(*value);
  }

  JNI_CreateJavaVM(&jvm, (void**)&env, &vm_args);

  for (int i = 0; i < vm_args.nOptions; i++) {
  	free(options[i].optionString);
  }

  args.GetReturnValue().Set(Number::New(isolate, vm_args.version));
}

void RunMain(const v8::FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = Isolate::GetCurrent();
  HandleScope scope(isolate);

  if (args.Length() != 1) {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Invalid number of arguments")));
    return;  	
  }

  String::Utf8Value value(args[0]->ToString());
  jclass cls = env->FindClass("com/codano/hybridapp/HybridAppMain");
  if (!cls) {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Class not found: com.codano.hybridapp.HybridAppMain")));  
    return;
  }

  jmethodID mid = env->GetStaticMethodID(cls, "main", "([Ljava/lang/String;)V");
  if (!mid) {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Main not found")));  	
    return;
  }

  env->CallStaticVoidMethod(cls, mid, *value);
  args.GetReturnValue().Set(Number::New(isolate, 0));
}

void Init(Handle<Object> exports) {
  Isolate* isolate = Isolate::GetCurrent();
  exports->Set(String::NewFromUtf8(isolate, "load"),
      FunctionTemplate::New(isolate, LoadJvm)->GetFunction());
  exports->Set(String::NewFromUtf8(isolate, "init"),
      FunctionTemplate::New(isolate, InitJvm)->GetFunction());
  exports->Set(String::NewFromUtf8(isolate, "run"),
      FunctionTemplate::New(isolate, RunMain)->GetFunction());
}

NODE_MODULE(hello, Init)
