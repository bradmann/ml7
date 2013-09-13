xquery version "1.0-ml";

for $law-doc in cts:search(fn:doc(), cts:collection-query("us-code"))
return 
  xdmp:spawn(
    "/util/generate-usc-title-triples.xqy", 
    (xs:QName("law-doc"), $law-doc/element()), 
    <options xmlns="xdmp:eval">
      <modules>{xdmp:modules-database()}</modules>
      <database>{xdmp:database("ml7-content")}</database>
    </options>
  )
