export const config = {
  clientid: 'example.com-auth',
  issuer: 'https://example.com:5556',
  DEBUG: true,
  TESTING: true,
  // required HTTP attribute, disable TLS by turning it off
  HTTPS: true,
  /*
    if using tls/https, the hostname must match certs or you'll fight
    with browser cert acceptance
  */
  BACKEND_HOST: 'example.com',
  BACKEND_PORT: '12345',
};
