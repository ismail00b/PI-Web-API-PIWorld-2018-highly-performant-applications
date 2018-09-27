# PI World 2018 - Live Coding: Writing Highly Performant PI Web API Applications
## Important Note
The application housed in this repository was designed specifically to demonstrate various PI Web
API queries. **It should be used as a learning tool - not a definitive example of how a PI Web API
client application is to be designed.** Some liberties were taken in the design and implementation
in the interest of providing the simplest possible data query implementations.

## Synopsis
This repository contains the sample PI Web API client application used during the live-coding
portions of the _Writing Highly Performant PI Web API Applications_ talk, given at PI World San
Francisco 2018 and PI World EMEA 2018. The application is browser-based, and written in vanilla
JavaScript. The application is designed to act as a performance showcase, with various
implementations of PI Web API queries used to retrieve PI System data. Compatibility has been
tested with Mozilla Firefox 59 and Google Chrome 66, but will likely work in other browsers. The
application is provided as a Visual Studio solution for ease-of-use.

## Getting Started
The application consists entirely of static resources, and so can be opened in a web browser
directly from the [index.html](UC2018TalkClient/Client/index.html) once the repository is cloned.
Some information such as the server address, Web IDs of invariants (such as the AF Database, root
element, various template names, etc.) are hard-coded in the
[configuration object](UC2018TalkClient/Client/js/implementations/sharedData.js): these must be
replaced with information applicable to your PI System. A full installation of the PI Web API 2018
release is needed for full support of the features demonstrated by the application: On older
versions, some features (such as the new AFSearch functionality, Stream Updates, and Channels) may
not be available.

## Notes
* The [implementations](UC2018TalkClient/Client/js/implementations) folder contains the files
related directly to interacting with the PI Web API.
* The [attributeSearch](UC2018TalkClient/Client/js/implementations/attributeSearch) folder contains
PI Web API queries related to performing attribute searches.
* The [data](UC2018TalkClient/Client/js/implementations/data) folder contains PI Web API queries
related to requesting time-series data.
  - The contents of this folder are primarily the topic of the talk.
* The [elementSearch](UC2018TalkClient/Client/js/implementations/elementSearch) folder contains PI
Web API queries related to performing element searches.
* The [eventframeSearch](UC2018TalkClient/Client/js/implementations/eventframeSearch) folder
contains PI Web API queries related to performing event frame searches.
* For the Channels and Stream Updates examples to work correctly, the _Automatic Updates_ button
(top-right of the application) must be enabled.

## Licensing
Copyright 2018-2018 OSIsoft, LLC.

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.

Please see the file named [LICENSE](LICENSE).
