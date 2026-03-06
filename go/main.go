//go:build js && wasm
// +build js,wasm

package main

import (
	"context"
	"syscall/js"

	C "github.com/sagernet/sing-box/constant"
	"github.com/sagernet/sing-box/option"
	sjson "github.com/sagernet/sing/common/json"
)

const fallbackVersion = "v1.11.13"

func main() {
	js.Global().Set("SingboxGetVersion", js.FuncOf(func(this js.Value, args []js.Value) any {
		if C.Version == "" || C.Version == "unknown" {
			return fallbackVersion
		}
		return C.Version
	}))

	js.Global().Set("SingboxParseConfig", js.FuncOf(func(this js.Value, args []js.Value) any {
		if len(args) < 1 {
			return "invalid number of args"
		}
		arg := args[0]
		if arg.Type() != js.TypeString {
			return "the argument should be a string"
		}

		options, err := sjson.UnmarshalExtendedContext[option.Options](context.Background(), []byte(arg.String()))
		if err != nil {
			return err.Error()
		}
		_ = options

		return nil
	}))

	onInit := js.Global().Get("onWasmInitialized")
	if onInit.Type() == js.TypeFunction {
		onInit.Invoke()
	}

	select {}
}
