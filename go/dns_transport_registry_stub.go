//go:build js && wasm && !singbox_dns_transport_registry
// +build js,wasm,!singbox_dns_transport_registry

package main

import "context"

func withDNSTransportRegistry(ctx context.Context) context.Context {
	return ctx
}
