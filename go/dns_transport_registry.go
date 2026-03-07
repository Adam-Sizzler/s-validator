//go:build js && wasm && singbox_dns_transport_registry
// +build js,wasm,singbox_dns_transport_registry

package main

import (
	"context"

	C "github.com/sagernet/sing-box/constant"
	"github.com/sagernet/sing-box/option"
	"github.com/sagernet/sing/service"
)

type dnsTransportOptionsRegistry struct{}

func (dnsTransportOptionsRegistry) CreateOptions(transportType string) (any, bool) {
	switch transportType {
	case C.DNSTypeLocal:
		return new(option.LocalDNSServerOptions), true
	case C.DNSTypeHosts:
		return new(option.HostsDNSServerOptions), true
	case C.DNSTypeUDP, C.DNSTypeTCP:
		return new(option.RemoteDNSServerOptions), true
	case C.DNSTypeTLS, C.DNSTypeQUIC:
		return new(option.RemoteTLSDNSServerOptions), true
	case C.DNSTypeHTTPS, C.DNSTypeHTTP3:
		return new(option.RemoteHTTPSDNSServerOptions), true
	case C.DNSTypeFakeIP:
		return new(option.FakeIPDNSServerOptions), true
	case C.DNSTypeDHCP:
		return new(option.DHCPDNSServerOptions), true
	case C.DNSTypeTailscale:
		return new(option.TailscaleDNSServerOptions), true
	default:
		return nil, false
	}
}

func withDNSTransportRegistry(ctx context.Context) context.Context {
	return service.ContextWith[option.DNSTransportOptionsRegistry](ctx, dnsTransportOptionsRegistry{})
}
