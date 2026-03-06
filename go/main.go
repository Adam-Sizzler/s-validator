//go:build js && wasm
// +build js,wasm

package main

import (
	"context"
	"syscall/js"

	C "github.com/sagernet/sing-box/constant"
	"github.com/sagernet/sing-box/option"
	sjson "github.com/sagernet/sing/common/json"
	"github.com/sagernet/sing/service"
)

const fallbackVersion = "v1.11.13"

type inboundOptionsRegistry struct{}

func (inboundOptionsRegistry) CreateOptions(inboundType string) (any, bool) {
	switch inboundType {
	case C.TypeTun:
		return new(option.TunInboundOptions), true
	case C.TypeRedirect:
		return new(option.RedirectInboundOptions), true
	case C.TypeTProxy:
		return new(option.TProxyInboundOptions), true
	case C.TypeDirect:
		return new(option.DirectInboundOptions), true
	case C.TypeSOCKS:
		return new(option.SocksInboundOptions), true
	case C.TypeHTTP, C.TypeMixed:
		return new(option.HTTPMixedInboundOptions), true
	case C.TypeShadowsocks, C.TypeShadowsocksR:
		return new(option.ShadowsocksInboundOptions), true
	case C.TypeVMess:
		return new(option.VMessInboundOptions), true
	case C.TypeTrojan:
		return new(option.TrojanInboundOptions), true
	case C.TypeNaive:
		return new(option.NaiveInboundOptions), true
	case C.TypeShadowTLS:
		return new(option.ShadowTLSInboundOptions), true
	case C.TypeVLESS:
		return new(option.VLESSInboundOptions), true
	case C.TypeHysteria:
		return new(option.HysteriaInboundOptions), true
	case C.TypeTUIC:
		return new(option.TUICInboundOptions), true
	case C.TypeHysteria2:
		return new(option.Hysteria2InboundOptions), true
	default:
		return nil, false
	}
}

type outboundOptionsRegistry struct{}

func (outboundOptionsRegistry) CreateOptions(outboundType string) (any, bool) {
	switch outboundType {
	case C.TypeDirect:
		return new(option.DirectOutboundOptions), true
	case C.TypeBlock, C.TypeDNS:
		return new(option.StubOptions), true
	case C.TypeSelector:
		return new(option.SelectorOutboundOptions), true
	case C.TypeURLTest:
		return new(option.URLTestOutboundOptions), true
	case C.TypeSOCKS:
		return new(option.SOCKSOutboundOptions), true
	case C.TypeHTTP:
		return new(option.HTTPOutboundOptions), true
	case C.TypeShadowsocks:
		return new(option.ShadowsocksOutboundOptions), true
	case C.TypeVMess:
		return new(option.VMessOutboundOptions), true
	case C.TypeTrojan:
		return new(option.TrojanOutboundOptions), true
	case C.TypeTor:
		return new(option.TorOutboundOptions), true
	case C.TypeSSH:
		return new(option.SSHOutboundOptions), true
	case C.TypeShadowTLS:
		return new(option.ShadowTLSOutboundOptions), true
	case C.TypeShadowsocksR:
		return new(option.ShadowsocksROutboundOptions), true
	case C.TypeVLESS:
		return new(option.VLESSOutboundOptions), true
	case C.TypeWireGuard:
		return new(option.StubOptions), true
	case C.TypeHysteria:
		return new(option.HysteriaOutboundOptions), true
	case C.TypeTUIC:
		return new(option.TUICOutboundOptions), true
	case C.TypeHysteria2:
		return new(option.Hysteria2OutboundOptions), true
	default:
		return nil, false
	}
}

type endpointOptionsRegistry struct{}

func (endpointOptionsRegistry) CreateOptions(endpointType string) (any, bool) {
	switch endpointType {
	case C.TypeWireGuard:
		return new(option.WireGuardEndpointOptions), true
	default:
		return nil, false
	}
}

func newParserContext() context.Context {
	ctx := context.Background()
	ctx = service.ContextWith[option.InboundOptionsRegistry](ctx, inboundOptionsRegistry{})
	ctx = service.ContextWith[option.OutboundOptionsRegistry](ctx, outboundOptionsRegistry{})
	ctx = service.ContextWith[option.EndpointOptionsRegistry](ctx, endpointOptionsRegistry{})
	return ctx
}

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

		options, err := sjson.UnmarshalExtendedContext[option.Options](newParserContext(), []byte(arg.String()))
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
