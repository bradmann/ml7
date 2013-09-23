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

module namespace c = "http://marklogic.com/roxy/controller/main";

(: the controller helper library provides methods to control which view and template get rendered :)
import module namespace ch = "http://marklogic.com/roxy/controller-helper" at "/roxy/lib/controller-helper.xqy";

(: The request library provides awesome helper methods to abstract get-request-field :)
import module namespace req = "http://marklogic.com/roxy/request" at "/roxy/lib/request.xqy";

import module namespace s = "http://marklogic.com/roxy/models/search" at "/app/models/search-lib.xqy";

import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";
import module namespace search = "http://marklogic.com/appservices/search" at "/MarkLogic/appservices/search/search.xqy";

declare namespace house = "http://xml.house.gov/schemas/uslm/1.0";
declare namespace xhtml = "http://www.w3.org/1999/xhtml";

declare option xdmp:mapping "false";


declare function c:main() as item()*
{
  ch:use-layout(())
};

declare function c:search() as item()*
{
  let $q := req:get("q", (), "type=xs:string")
  return xdmp:to-json(xdmp:invoke("/util/sections-congress.xqy", (xs:QName("q"), $q)))
};

declare function c:content() as item()*
{
  let $type := req:get('type', (), 'type=xs:string')
  let $id := req:get('id', (), 'type=xs:string')
  let $q := req:get('q', (), 'type=xs:string')

  let $data :=
    if ($type = 'section') then
      let $id := fn:tokenize($id, '_')
      let $id := '/us/usc/' || $id[1] || '/' || $id[2]
      let $section := cts:search(//house:section, cts:element-attribute-value-query(xs:QName('house:section'), xs:QName('identifier'), $id))
      let $heading := <h4 xmlns="http://www.w3.org/1999/xhtml">{$section/*:num || cts:highlight(<p xmlns="http://www.w3.org/1999/xhtml">{fn:string($section/*:heading)}</p>, cts:query(search:parse($q)), <span class="highlight" xmlns="http://www.w3.org/1999/xhtml">{$cts:text}</span>)}</h4>
      let $content :=
        for $subsection in $section/(*:subsection|*:paragraph|*:content|*:notes)
        let $heading := if ($subsection/*:heading) then <h4 xmlns="http://www.w3.org/1999.xhtml">{$subsection/*:heading}</h4> else ()
        return ($heading, cts:highlight(<p xmlns="http://www.w3.org/1999/xhtml">{fn:string($subsection)}</p>, cts:query(search:parse($q)), <span class="highlight">{$cts:text}</span>))
      return <section xmlns="http://www.w3.org/1999/xhtml">{$heading, $content}</section>
    else
      ()
  let $response := map:map()
  let $_ := map:put($response, "message", xdmp:quote($data))
  return (
    xdmp:to-json($response),
    ch:use-layout(()),
    ch:use-view(())
  )
};