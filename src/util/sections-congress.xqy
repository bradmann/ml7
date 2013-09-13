xquery version "1.0-ml";

import module namespace search = "http://marklogic.com/appservices/search" at "/MarkLogic/appservices/search/search.xqy";
import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";

declare namespace house = "http://xml.house.gov/schemas/uslm/1.0";

declare variable $q as xs:string external;

let $sections := 
  cts:element-attribute-values(
    xs:QName("house:section"), 
    xs:QName("identifier"), 
    (), (), 
    cts:query(search:parse($q))
  )
let $sections :=
  for $section in $sections
  let $group := fn:tokenize($section, "/")
  let $title := $group[4]
  let $section := $group[5]
  let $ts := fn:replace(fn:replace(fn:replace($title || "_" || $section, "&#x2013;", "-"), " ", "_"), ",", "")
  return $ts
let $triples := 
  (
    sem:triple(
      sem:iri('query'),
      sem:iri('querytext'), 
      xs:string($q)
    ),
    for $section in $sections
    return
      sem:triple(
        sem:iri('query'), 
        sem:iri('returns'), 
        sem:iri(fn:concat("http://xml.house.gov/schemas/uslm/1.0/", $section))
      )
  )
let $_ :=
  sem:graph-insert(
    sem:iri('query123'), 
    $triples
  )
return ();

xquery version "1.0-ml";
import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";
sem:sparql("
  PREFIX house: <http://xml.house.gov/schemas/uslm/1.0/>
  PREFIX dc: <http://purl.org/dc/elements/1.1/>
  PREFIX dcterms: <http://purl.org/dc/terms/>
  PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
  PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
  PREFIX congress: <http://congress.gov/>
 
  SELECT DISTINCT ?amendment ?congress
  WHERE {
    <query> <returns> ?section .
    ?amendment house:amends <http://xml.house.gov/schemas/uslm/1.0/t16_s1445a> .
    ?amendment dcterms:creator ?congress
 } 
");

xquery version "1.0-ml";
import module namespace sem = "http://marklogic.com/semantics" at "/MarkLogic/semantics.xqy";
let $_ := sem:graph-delete(sem:iri("query123"))
return ()

