module.exports = {
    auth_wellknown: 'https://banno.com/a/oidc-provider/api/v0/.well-known/openid-configuration',
    client: {
        client_id: '', // Your Client ID
        client_secret: '', // Your Client Secret
        response_types: ['code'],
        redirect_uris: ['https://localhost:8080/auth/cb']
    }
  }