# Proxies calls to OpenWhisk actions behind a nginx server and enables CORS

## Overview

This sample app provides a simple solution to expose OpenWhisk actions.
Requests are received by the nginx server, passed to OpenWhisk and results are returned.
In addition, the nginx configuration takes care of passing the credentials to OpenWhisk and also enables CORS headers so that the API can be consumed by other domains.

Built using IBM Bluemix, the application uses:
* [IBM Bluemix OpenWhisk](https://new-console.ng.bluemix.net/openwhisk)
* [Cloud Foundry Static buildpack](https://github.com/cloudfoundry/staticfile-buildpack)
  
![Architecture](http://g.gravizo.com/g?
  digraph G {
    node [fontname = "helvetica"]
    rankdir=LR
    /* client makes a request */
    client -> nginx
    /* nginx forwards the request to openwhisk and returns the result */
    nginx -> openwhisk
    /* styling */
    client [label="Client"]
    nginx [shape=circle style=filled color="%234E96DB" fontcolor=white label="NGINX"]
    openwhisk [shape=circle style=filled color="%2324B643" fontcolor=white label="OpenWhisk"]
  }
)

## Deploy the application

1. Clone the app to your local environment from your terminal using the following command:

  ```
  git clone https://github.com/l2fprod/openwhisk-apiapp.git
  ```

1. Open the **manifest.yml** and update the *host* variable to something unique.

1. Push the application to Bluemix without starting it:

  ```
  cf push --no-start
  ```
  
1. Define the WHISK_AUTH environment variable:

  ```
  cf set-env openwhisk-apiapp WHISK_AUTH replace-me
  ```

  where ```replace-me``` is the base64-encoded version of your OpenWhisk credentials.
  You can find this value by running the command ```wsk -v list```. It will look like:

  ```"Authorization": "Basic MGU30e93kdfred903282ee24920392428xlkdFdlkeXsSdfrroeD="```
  
  In this case, the value we are looking for is ```MGU30e93kdfred903282ee24920392428xlkdFdlkeXsSdfrroeD=```.
    
1. Start the application:

  ```
  cf start openwhisk-apiapp
  ```

1. Access the application URL.

1. Type your name and click the button.

  This will call the */whisk.system/samples/greeting* default action.

## Code Structure

### Nginx configuration

[**nginx.conf**](nginx.conf) is based on the default nginx.conf coming with the build pack.
The interesting part starts with ```location /api/v1/```. This is where we start adding
the CORS headers and support for pre-flight OPTIONS requests.
This makes it possible to use the exposed API from another domain.

Then with ```proxy_set_header Authorization "Basic <%= ENV["WHISK_AUTH"] %>";```
we inject the OpenWhisk authentication before implementing our actual greeting API with

  ```
  location /api/v1/greeting {
    if ($request_method = 'OPTIONS') { return 204; }
    if ($request_method != 'POST') { return 403; }
    proxy_pass https://openwhisk.ng.bluemix.net/api/v1/namespaces/whisk.system/actions/samples/greeting?blocking=true;
  }
  ```

This simply passes the call to OpenWhisk, waiting for the action to complete ```blocking=true```.
The lines would need to be repeated for every API you want to expose.

### Calling the API

[**home.js**](home.js) shows how to call the API from JavaScript.

## License

See [License.txt](License.txt) for license information.