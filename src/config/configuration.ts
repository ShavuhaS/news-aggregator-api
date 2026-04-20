export default () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT ?? '3000', 10),
  baseUrl: process.env.BASE_URL,
  frontendUrl: process.env.FRONTEND_URL,
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    privateKey: process.env.JWT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    publicKey: process.env.JWT_PUBLIC_KEY?.replace(/\\n/g, '\n'),
    accessTokenExpiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRES_IN || '1h',
    refreshTokenExpiresIn: process.env.JWT_REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  },
  kafka: {
    brokers: process.env.KAFKA_BROKERS?.split(','),
  },
  parserService: {
    url: process.env.PARSER_SERVICE_URL,
  },
});
