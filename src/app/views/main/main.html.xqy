(:
Copyright 2012 MarkLogic Corporation

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
:)
xquery version "1.0-ml";

import module namespace c = "http://marklogic.com/roxy/config" at "/app/config/config.xqy";

import module namespace vh = "http://marklogic.com/roxy/view-helper" at "/roxy/lib/view-helper.xqy";

import module namespace facet = "http://marklogic.com/roxy/facet-lib" at "/app/views/helpers/facet-lib.xqy";

declare namespace search = "http://marklogic.com/appservices/search";

declare option xdmp:mapping "false";

'<!doctype html>',
<html xmlns="http://www.w3.org/1999/xhtml">
  <head>
    <link rel="stylesheet" href="css/main.css"/>
    <script src="js/lib/jquery-1.7.1.min.js"></script>
    <script src="js/lib/jquery.mousewheel.js"></script>
    <script src="js/compute.js"></script>
    <script src="js/main.js"></script>
    <script src="js/nev.js"></script>
  </head>
  <body>
    <input type="text" placeholder="search" id="search"></input><br/>
    <canvas id="canvas" width="1000" height="500"></canvas>
    <div id="tabdata"  width="295" height="500">&nbsp;</div>
    <div id="result">&nbsp;</div>
    <iframe id="resultframe">&nbsp;</iframe>
  </body>
</html>