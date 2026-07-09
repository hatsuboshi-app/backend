interface Config {
    port: number
    env: string
}

const config: Config = {
    port: Number(process.env.PORT) || 3001,
    env: process.env.API_ENV || 'local',
}

export default config
