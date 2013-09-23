xquery version "1.0-ml";

import module namespace h-lib = "house.gov/lib" at "/util/house-lib.xqy";
import module namespace sem   = "http://marklogic.com/semantics"             at "/MarkLogic/semantics.xqy";
import module namespace t-lib = "http://marklogic.com/semantics/triples-lib" at "/lib/triples-lib.xqy";

declare namespace house = "http://xml.house.gov/schemas/uslm/1.0";
let $_ := xdmp:set-request-time-limit(3600)

let $triples :=
  for $law-doc in fn:collection("us-code")/element()
  let $title := $law-doc//house:title 
  let $house-ns := fn:namespace-uri($title)
  let $subject := fn:concat($house-ns, "/", h-lib:identifier($title/@identifier))
  return 
  ( 
    for $meta in $law-doc//house:meta/element()
    return t-lib:triple-from-element($subject, $meta),
    t-lib:triple-from-element($subject, $title/house:heading),
    let $enactedBy := $title/house:note[@topic = "enacting"]
    return
    if (fn:string($enactedBy) ne "") then
      for $ref in $enactedBy//house:ref
      return
        sem:triple(sem:iri($subject), sem:iri(fn:concat($house-ns, "/", "enactedBy")), xs:string($ref/text()))
    else (),
    for $section in $title//house:section
    return 
    (
      h-lib:section-triples(sem:iri($subject), $section)
    )
  )
return 
  let $display-only := fn:false()
  return
    if ($display-only) then
      $triples
    else
      for $triple in $triples
      return sem:rdf-insert($triple)


