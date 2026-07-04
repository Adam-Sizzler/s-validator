export const DEFAULT_CONFIG = {
    log: {
        level: 'info'
    },
    dns: {
        servers: [
            {
                tag: 'dns-remote',
                type: 'udp',
                server: '1.1.1.1',
                detour: 'direct'
            }
        ]
    },
    inbounds: [
        {
            type: 'shadowsocks',
            tag: 'ss-in',
            listen: '127.0.0.1',
            listen_port: 2080,
            method: 'chacha20-ietf-poly1305',
            password: 's-validator-test'
        },
        {
            type: 'trojan',
            tag: 'trojan-in',
            listen: '127.0.0.1',
            listen_port: 2443,
            users: [
                {
                    name: 'sekai',
                    password: 's-validator-test'
                }
            ]
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
        }
    ],
    route: {
        final: 'direct'
    }
}
