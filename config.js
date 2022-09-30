module.exports = {
    auth_wellknown: 'https://banno.com/a/oidc-provider/api/v0/.well-known/openid-configuration',
    client: {
        client_id: '55b16c7f-256b-4a1b-8511-c35b2a96226a',
        client_secret: '9da683b1-7070-4e14-981c-45a14259ec95',
        response_types: ['code'],
        redirect_uris: ['https://localhost:8080/auth/cb']
    }
  }