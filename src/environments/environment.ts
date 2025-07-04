// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  region: 'us-west-2',
  ddbConfig: {
    endpoint: 'http://127.0.0.1:8000',
    region: 'us-west-2',
    credentials: {
      accessKeyId: 'nope',
      secretAccessKey: 'nope'
    }
  },
  cognito: {
    clientId: '81sf9eo2hd7migok9r3hs96n3',
    userPoolId: 'us-west-2_djFbovgCe',
    identityPoolId: 'us-west-2:c8065941-de2b-4969-84d2-502b5407579a'
  },
  apiGatewayUrl: 'https://ua161d35m4.execute-api.us-west-2.amazonaws.com',
  backendUrl: 'http://localhost:4200/api'
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
