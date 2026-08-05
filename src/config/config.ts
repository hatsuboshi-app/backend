interface Config {
    port: number
    env: string
    defaults: {
        pageSize: number
    }
}

const config: Config = {
    port: Number(process.env.PORT) || 3001,
    env: process.env.API_ENV || 'local',
    defaults: {
        pageSize: 20
    }
}

export default config
