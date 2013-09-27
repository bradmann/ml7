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
    <link rel="stylesheet" href="css/themes/smoothness/jquery-ui-1.10.3.custom.min.css"/>
    <script src="js/lib/jquery-1.7.1.min.js"></script>
    <script src="js/lib/jquery-ui-1.10.3.custom.min.js"></script>
    <script src="js/lib/jquery.mousewheel.js"></script>
    <script src="js/compute.js"></script>
    <script src="js/main.js"></script>
    <script src="js/nev.js"></script>
    <title>US Code Demo</title> 
    <link rel='shortcut icon' href='public/images/favicon.ico' />
  </head>
  <body>
    <div id="banner" width="100%"><div id="ml"  width="1300" height="100"><img src="public/images/marklogic.png" /> <em>7</em></div></div>
    <input type="text" placeholder="search" id="search"></input><br/>
    <div id="message"  width="1300" height="100">Type a question and get an answer from the US Code.</div>
    <div id="container">
      <img id="logo" src="/images/ml_logo.png"/>
      <canvas id="canvas" width="1000" height="500"></canvas>
    </div>
    <div id="tabdata"  width="295" height="500">&nbsp;</div>
    <div id="result"><ul></ul></div>
    <!-- <iframe id="resultframe">&nbsp;</iframe> -->
  </body>
</html>