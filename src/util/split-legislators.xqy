xquery version "1.0-ml";

declare namespace leg = "http://congress.gov/members";

for $el in fn:doc("/legislators/legislators-current.xml")/element()/element()
let $doc := 
  element leg:member {
    $el/element()
  }  
return xdmp:document-insert($doc//thomas/text(), $doc, (), ("legislators"));

xdmp:document-delete("/legislators/legislators-current.xml")

