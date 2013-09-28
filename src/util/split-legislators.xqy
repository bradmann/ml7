xquery version "1.0-ml";

declare namespace dcterms = "http://purl.org/dc/terms/";
declare namespace leg = "http://congress.gov/members/";

for $el in fn:doc("/legislators/legislators-current.xml")/element()/element()
let $doc := 
  element member {
    attribute xmlns { "http://congress.gov/members/" }, 
    $el/element()
  }  
return xdmp:document-insert($doc//govtrack/text(), $doc, (), ("legislators"));

xdmp:document-delete("/legislators/legislators-current.xml");

xquery version "1.0-ml";

import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";

declare namespace rdfs = "http://www.w3.org/2000/01/rdf-schema#";
declare namespace leg = "http://congress.gov/members/";

for $legislator in fn:collection("legislators")
let $id := $legislator//id/govtrack/text()
let $subject := sem:iri(fn:concat("http://congress.gov/members/", $id))
let $triples :=
 (
  sem:triple($subject, sem:iri("http://purl.org/dc/terms/identifier"), $id),
  sem:triple($subject, sem:iri("http://www.w3.org/2000/01/rdf-schema#label"), xs:string($legislator//name/official_full/text()))
 )
return sem:rdf-insert($triples)


