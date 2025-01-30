// ... existing code ...
    const oidcProvider = new iam.OpenIdConnectProvider(this, 'OIDCProvider', {
      url: 'https://your-oidc-provider',
      clientIds: ['your-client-id'],
      thumbprints: ['your-thumbprint'],
    });

    // Add proper conditions and restrictions
    const role = new iam.Role(this, 'OIDCRole', {
      assumedBy: new iam.WebIdentityPrincipal(oidcProvider.openIdConnectProviderArn, {
        'StringEquals': {
          [`${oidcProvider.openIdConnectProviderArn}:aud`]: 'your-client-id',
        },
      }),
    });
// ... existing code ...