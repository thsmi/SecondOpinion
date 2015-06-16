#VirusTotal public API 2.0 in JavaScript

As it is free and open software you may reuse the JavaScript implementation accessing VirusTotal'spublic API.

The basic implementation is split and named the same way as the VirusTotal public API:

 * virustotal.file.js 
 * virustotal.url.js 
 * virustotal.domain.js 	

In addition to those files above you also need the common.request.js it is used to track and control pending ajax request. 
You may also replace these files function calls with a stub.

For the settings you need to implement two stub methods which return the settings: 

    net.tschmid.secondopinion.settings.isNameObfuscated();
    net.tschmid.secondopinion.settings.getApiKey();

Refer to ui.response.js for an example how to parse the response.

All JavaScript files are namespaced, so that they do pollute the global name space as little as possible. Don't be confused about that.

Currently the code is not very portable, it contains Mozilla specific and non standardized JavaScript commands. Feel free to submit a patch which improves the porability.

 
