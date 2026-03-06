export const DEFAULT_CONFIG = {
    log: {
        level: 'info'
    },
    dns: {
        servers: [
            {
                tag: 'dns-remote',
                address: 'https://1.1.1.1/dns-query',
                detour: 'direct'
            }
        ]
    },
    inbounds: [
        {
            type: 'mixed',
            tag: 'mixed-in',
            listen: '127.0.0.1',
            listen_port: 2080
        }
    ],
    outbounds: [
        {
            type: 'direct',
            tag: 'direct'
        },
        {
            type: 'block',
            tag: 'block'
        },
        {
            type: 'dns',
            tag: 'dns-out'
        }
    ],
    route: {
        final: 'direct',
        rules: [
            {
                protocol: 'dns',
                outbound: 'dns-out'
            }
        ]
    }
}
